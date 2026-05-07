import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  updateProfile,
  type AuthError as FirebaseAuthError,
} from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";

import type { AuthProvider } from "../contracts";
import { AUTH_ERROR, AuthError } from "../errors";
import type { UserProfile, UserProfileUpdateInput, UserRole } from "../types";

type AuthMode = "login" | "register" | "forgot" | "session";

type UserProfileRecord = Omit<UserProfile, "metadata"> & {
  metadata: Record<string, unknown> | null;
};

function isFirebaseAuthError(error: unknown): error is FirebaseAuthError {
  return typeof error === "object" && error !== null && "code" in error;
}

function mapFirebaseAuthError(error: unknown, mode: AuthMode) {
  if (!isFirebaseAuthError(error)) {
    return mode === "session"
      ? AUTH_ERROR.UPSTREAM_SERVICE_ERROR
      : AUTH_ERROR.AUTH_CLIENT_ERROR;
  }

  if (mode === "forgot") {
    switch (error.code) {
      case "auth/network-request-failed":
      case "auth/too-many-requests":
        return AUTH_ERROR.UPSTREAM_SERVICE_ERROR;
      default:
        return AUTH_ERROR.FORGOT_PASSWORD_FAILED;
    }
  }

  switch (error.code) {
    case "auth/invalid-credential":
    case "auth/invalid-login-credentials":
    case "auth/user-not-found":
    case "auth/wrong-password":
      return AUTH_ERROR.INVALID_CREDENTIALS;
    case "auth/email-already-in-use":
      return AUTH_ERROR.EMAIL_ALREADY_TAKEN;
    case "auth/weak-password":
      return AUTH_ERROR.REGISTER_FAILED;
    case "auth/network-request-failed":
    case "auth/too-many-requests":
      return AUTH_ERROR.UPSTREAM_SERVICE_ERROR;
    default:
      if (mode === "login") {
        return AUTH_ERROR.INVALID_CREDENTIALS;
      }

      if (mode === "register") {
        return AUTH_ERROR.REGISTER_FAILED;
      }

      return AUTH_ERROR.AUTH_CLIENT_ERROR;
  }
}

async function loadFirebaseAuth() {
  const firebaseServerModulePath = "@/lib/firebase" + "/server";
  const { getFirebaseAuthServer } = await import(firebaseServerModulePath);

  return getFirebaseAuthServer();
}

async function loadFirebaseFirestore() {
  const firebaseServerModulePath = "@/lib/firebase" + "/server";
  const { getFirebaseFirestoreServer } = await import(firebaseServerModulePath);

  return getFirebaseFirestoreServer();
}

function isUserRole(value: unknown): value is UserRole {
  return value === "admin" || value === "manager" || value === "user";
}

function toIsoDateString(value: unknown): string | null {
  if (typeof value === "string") {
    return value;
  }

  if (
    typeof value === "object" &&
    value !== null &&
    "toDate" in value &&
    typeof (value as { toDate: () => Date }).toDate === "function"
  ) {
    return (value as { toDate: () => Date }).toDate().toISOString();
  }

  return null;
}

function normalizeProfile(raw: Record<string, unknown>): UserProfile {
  const roleValue = raw.role;

  if (!isUserRole(roleValue)) {
    throw new AuthError(AUTH_ERROR.USER_PROFILE_NOT_FOUND);
  }

  const userId = typeof raw.userId === "string" ? raw.userId : null;
  const email = typeof raw.email === "string" ? raw.email : null;
  const fullName = typeof raw.fullName === "string" ? raw.fullName : null;
  const createdAt = toIsoDateString(raw.createdAt);
  const updatedAt = toIsoDateString(raw.updatedAt);

  if (!userId || !email || !fullName || !createdAt || !updatedAt) {
    throw new AuthError(AUTH_ERROR.USER_PROFILE_NOT_FOUND);
  }

  return {
    userId,
    email,
    role: roleValue,
    fullName,
    displayName: typeof raw.displayName === "string" ? raw.displayName : null,
    username: typeof raw.username === "string" ? raw.username : null,
    avatarUrl: typeof raw.avatarUrl === "string" ? raw.avatarUrl : null,
    pronouns: typeof raw.pronouns === "string" ? raw.pronouns : null,
    bio: typeof raw.bio === "string" ? raw.bio : null,
    lastLoginAt: toIsoDateString(raw.lastLoginAt),
    isActive: raw.isActive === true,
    createdAt,
    updatedAt,
    metadata:
      raw.metadata && typeof raw.metadata === "object"
        ? (raw.metadata as Record<string, unknown>)
        : null,
  };
}

function nowIso() {
  return new Date().toISOString();
}

function defaultProfile(input: {
  userId: string;
  email: string;
  fullName: string;
  username: string;
}): UserProfileRecord {
  const now = nowIso();

  return {
    userId: input.userId,
    email: input.email.toLowerCase(),
    role: "user",
    fullName: input.fullName,
    displayName: null,
    username: input.username,
    avatarUrl: null,
    pronouns: null,
    bio: null,
    lastLoginAt: null,
    isActive: true,
    createdAt: now,
    updatedAt: now,
    metadata: null,
  };
}

async function getUserDocRef(userId: string) {
  const firestore = await loadFirebaseFirestore();
  return doc(firestore, "users", userId);
}

async function getUserProfileById(userId: string): Promise<UserProfile | null> {
  const userDocRef = await getUserDocRef(userId);
  const userDocSnap = await getDoc(userDocRef);

  if (!userDocSnap.exists()) {
    return null;
  }

  return normalizeProfile(userDocSnap.data() as Record<string, unknown>);
}

async function verifyIdTokenWithLookup(idToken: string) {
  const serverEnvModulePath = "@/lib/env" + "/server";
  const { isProductionEnvironment, serverEnv } = await import(serverEnvModulePath);

  const identityToolkitBaseUrl =
    !isProductionEnvironment && serverEnv.USE_FIREBASE_EMULATOR !== "false"
      ? "http://127.0.0.1:9099/identitytoolkit.googleapis.com"
      : "https://identitytoolkit.googleapis.com";

  let response: Response;

  try {
    response = await fetch(
      `${identityToolkitBaseUrl}/v1/accounts:lookup?key=${serverEnv.FIREBASE_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      },
    );
  } catch {
    throw new AuthError(AUTH_ERROR.UPSTREAM_SERVICE_ERROR);
  }

  if (!response.ok) {
    if (response.status === 400 || response.status === 401) {
      const errorJson = (await response.json().catch(() => null)) as
        | { error?: { message?: string } }
        | null;

      const message = errorJson?.error?.message;

      if (
        message === "INVALID_ID_TOKEN" ||
        message === "TOKEN_EXPIRED" ||
        message === "INVALID_IDP_RESPONSE"
      ) {
        return null;
      }

      throw new AuthError(AUTH_ERROR.UPSTREAM_SERVICE_ERROR);
    }

    throw new AuthError(AUTH_ERROR.UPSTREAM_SERVICE_ERROR);
  }

  const json = (await response.json()) as {
    users?: Array<{ localId?: string; email?: string; displayName?: string }>;
  };

  const user = json.users?.[0];

  if (!user?.localId || !user.email) {
    return null;
  }

  return {
    userId: user.localId,
    email: user.email,
    fullName: user.displayName ?? user.email.split("@")[0] ?? "User",
  };
}

async function checkUsernameUnique(userId: string, username: string) {
  const firestore = await loadFirebaseFirestore();
  const usersRef = collection(firestore, "users");
  const usernameQuery = query(usersRef, where("username", "==", username));
  const usernameResult = await getDocs(usernameQuery);

  const hasDuplicate = usernameResult.docs.some((item) => item.id !== userId);

  if (hasDuplicate) {
    throw new AuthError(AUTH_ERROR.USERNAME_ALREADY_TAKEN);
  }
}

async function ensureUserProfile(input: {
  userId: string;
  email: string;
  fullName: string;
  username?: string;
}): Promise<UserProfile> {
  const existing = await getUserProfileById(input.userId);

  if (existing) {
    return existing;
  }

  const username = input.username ?? input.email.split("@")[0] ?? "user";
  await checkUsernameUnique(input.userId, username);

  const profile = defaultProfile({
    ...input,
    username,
  });
  const userDocRef = await getUserDocRef(input.userId);

  try {
    await setDoc(userDocRef, {
      ...profile,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch {
    throw new AuthError(AUTH_ERROR.USER_PROFILE_CREATE_FAILED);
  }

  const createdProfile = await getUserProfileById(input.userId);

  if (!createdProfile) {
    throw new AuthError(AUTH_ERROR.USER_PROFILE_CREATE_FAILED);
  }

  return createdProfile;
}

async function buildActiveSession(input: {
  userId: string;
  email: string;
  fullName: string;
}) {
  const profile = await ensureUserProfile(input);

  if (!profile.isActive) {
    throw new AuthError(AUTH_ERROR.ACCOUNT_DEACTIVATED);
  }

  return {
    session: {
      userId: profile.userId,
      email: profile.email,
      role: profile.role,
    },
    profile,
  };
}

export function createFirebaseAuthProvider(): AuthProvider {
  return {
    kind: "firebase",
    async createUserProfile(input) {
      const profile = await ensureUserProfile(input);

      return {
        userId: profile.userId,
        email: profile.email,
        role: profile.role,
      };
    },
    getUserProfile(userId) {
      return getUserProfileById(userId);
    },
    async updateUserProfile(userId, updates: UserProfileUpdateInput) {
      const existingProfile = await getUserProfileById(userId);

      if (!existingProfile) {
        throw new AuthError(AUTH_ERROR.USER_PROFILE_NOT_FOUND);
      }

      if (typeof updates.username === "string") {
        await checkUsernameUnique(userId, updates.username);
      }

      const userDocRef = await getUserDocRef(userId);

      try {
        await updateDoc(userDocRef, {
          ...updates,
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        if (error instanceof AuthError) {
          throw error;
        }

        throw new AuthError(AUTH_ERROR.USER_PROFILE_UPDATE_FAILED);
      }

      const updated = await getUserProfileById(userId);

      if (!updated) {
        throw new AuthError(AUTH_ERROR.USER_PROFILE_UPDATE_FAILED);
      }

      return updated;
    },
    async login(input) {
      try {
        const auth = await loadFirebaseAuth();

        const credential = await signInWithEmailAndPassword(
          auth,
          input.email,
          input.password,
        );

        const sessionToken = await credential.user.getIdToken();
        const email = credential.user.email;

        if (!email) {
          throw new AuthError(AUTH_ERROR.AUTH_CLIENT_ERROR);
        }

        const fullName = credential.user.displayName ?? email.split("@")[0] ?? "User";
        const { session } = await buildActiveSession({
          userId: credential.user.uid,
          email,
          fullName,
        });

        await this.updateUserProfile(session.userId, { lastLoginAt: nowIso() });

        return {
          sessionToken,
          session,
        };
      } catch (error) {
        if (error instanceof AuthError) {
          throw error;
        }

        throw new AuthError(mapFirebaseAuthError(error, "login"));
      }
    },
    async register(input) {
      try {
        const auth = await loadFirebaseAuth();

        const credential = await createUserWithEmailAndPassword(
          auth,
          input.email,
          input.password,
        );

        await updateProfile(credential.user, {
          displayName: input.fullName,
        });

        const sessionToken = await credential.user.getIdToken();
        const email = credential.user.email;

        if (!email) {
          throw new AuthError(AUTH_ERROR.AUTH_CLIENT_ERROR);
        }

        const session = await this.createUserProfile({
          userId: credential.user.uid,
          email,
          fullName: input.fullName,
          username: input.username,
        });

        return {
          sessionToken,
          session,
        };
      } catch (error) {
        if (error instanceof AuthError) {
          throw error;
        }

        throw new AuthError(mapFirebaseAuthError(error, "register"));
      }
    },
    async forgotPassword(input) {
      try {
        const auth = await loadFirebaseAuth();

        await sendPasswordResetEmail(auth, input.email);

        return { ok: true } as const;
      } catch (error) {
        throw new AuthError(mapFirebaseAuthError(error, "forgot"));
      }
    },
    async getSession(token) {
      try {
        const verified = await verifyIdTokenWithLookup(token);

        if (!verified) {
          return null;
        }

        const { session } = await buildActiveSession(verified);
        return session;
      } catch (error) {
        if (error instanceof AuthError) {
          throw error;
        }

        throw new AuthError(mapFirebaseAuthError(error, "session"));
      }
    },
  };
}
