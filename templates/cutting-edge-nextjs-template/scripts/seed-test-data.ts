import { initializeApp } from "firebase/app";
import {
  connectAuthEmulator,
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import {
  connectFirestoreEmulator,
  doc,
  getFirestore,
  setDoc,
} from "firebase/firestore";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

type SeedRecord = {
  email: string;
  password: string;
  role: "admin" | "manager" | "user";
  fullName: string;
  displayName: string;
  username: string;
  avatarUrl: null;
  pronouns: string | null;
  bio: string;
  isActive: boolean;
  metadata: Record<string, string>;
};

type ExampleEntitySeedRecord = {
  id: string;
  title: string;
  body: string;
  slug: string;
  summary: string;
  status: "draft" | "in_review" | "published" | "archived";
  category: "product" | "engineering" | "marketing" | "operations";
  tags: string[];
  priority: "low" | "medium" | "high" | "urgent";
  ownerName: string;
  dueDate: string | null;
  isFeatured: boolean;
  publishedAt: string | null;
  estimatedHours: number | null;
  progressPercent: number;
  attachmentsUrl: string[];
  externalLink: string | null;
  notes: string;
};

function createSeedExampleEntities(now: string): ExampleEntitySeedRecord[] {
  return [
    {
      id: "rich-launch-roadmap",
      title: "Q2 Launch Roadmap",
      body: "Detailed rollout checklist for the Q2 public beta launch.",
      slug: "q2-launch-roadmap",
      summary: "Cross-functional launch roadmap for Q2 beta.",
      status: "in_review",
      category: "product",
      tags: ["launch", "roadmap", "beta"],
      priority: "high",
      ownerName: "Jane Product",
      dueDate: now.slice(0, 10),
      isFeatured: true,
      publishedAt: null,
      estimatedHours: 48,
      progressPercent: 72,
      attachmentsUrl: [
        "https://example.com/docs/q2-launch-plan.pdf",
        "https://example.com/docs/qa-checklist.pdf",
      ],
      externalLink: "https://example.com/projects/q2-launch",
      notes: "Review legal and support readiness before publish.",
    },
    {
      id: "rich-ops-playbook",
      title: "Operations Incident Playbook",
      body: "Response procedures for tier-1 production incidents.",
      slug: "operations-incident-playbook",
      summary: "Incident response playbook with owners and escalation paths.",
      status: "published",
      category: "operations",
      tags: ["incident", "ops"],
      priority: "urgent",
      ownerName: "Marco Ops",
      dueDate: null,
      isFeatured: false,
      publishedAt: now,
      estimatedHours: null,
      progressPercent: 100,
      attachmentsUrl: [],
      externalLink: null,
      notes: "Nullable fields intentionally set for dueDate, estimatedHours, and externalLink.",
    },
    {
      id: "rich-marketing-refresh",
      title: "Homepage Messaging Refresh",
      body: "A/B messaging test plan for campaign landing pages.",
      slug: "homepage-messaging-refresh",
      summary: "Copy refresh effort for spring campaign conversion uplift.",
      status: "draft",
      category: "marketing",
      tags: ["copy", "campaign", "ab-test"],
      priority: "medium",
      ownerName: "Linh Marketing",
      dueDate: null,
      isFeatured: false,
      publishedAt: null,
      estimatedHours: 16,
      progressPercent: 18,
      attachmentsUrl: ["https://example.com/docs/messaging-matrix.xlsx"],
      externalLink: "https://example.com/experiments/homepage-copy",
      notes: "Waiting for analytics baseline before moving to review.",
    },
  ];
}

type FirebaseSeedEnv = {
  FIREBASE_API_KEY: string;
  FIREBASE_AUTH_DOMAIN: string;
  FIREBASE_PROJECT_ID: string;
  FIREBASE_APP_ID: string;
  USE_FIREBASE_EMULATOR: string;
};

function parseDotEnv(content: string): Record<string, string> {
  return content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith("#"))
    .reduce<Record<string, string>>((acc, line) => {
      const separatorIndex = line.indexOf("=");
      if (separatorIndex <= 0) {
        return acc;
      }

      const key = line.slice(0, separatorIndex).trim();
      const value = line.slice(separatorIndex + 1).trim();
      acc[key] = value;
      return acc;
    }, {});
}

function loadFirebaseSeedEnv(): FirebaseSeedEnv {
  const envPath = join(process.cwd(), ".env.local");
  const localEnv = existsSync(envPath)
    ? parseDotEnv(readFileSync(envPath, "utf8"))
    : {};

  const env: FirebaseSeedEnv = {
    FIREBASE_API_KEY:
      process.env.FIREBASE_API_KEY ??
      localEnv.FIREBASE_API_KEY ??
      "",
    FIREBASE_AUTH_DOMAIN:
      process.env.FIREBASE_AUTH_DOMAIN ??
      localEnv.FIREBASE_AUTH_DOMAIN ??
      "",
    FIREBASE_PROJECT_ID:
      process.env.FIREBASE_PROJECT_ID ??
      localEnv.FIREBASE_PROJECT_ID ??
      "",
    FIREBASE_APP_ID:
      process.env.FIREBASE_APP_ID ?? localEnv.FIREBASE_APP_ID ?? "",
    USE_FIREBASE_EMULATOR:
      process.env.USE_FIREBASE_EMULATOR ?? localEnv.USE_FIREBASE_EMULATOR ?? "true",
  };

  if (
    !env.FIREBASE_API_KEY ||
    !env.FIREBASE_AUTH_DOMAIN ||
    !env.FIREBASE_PROJECT_ID ||
    !env.FIREBASE_APP_ID
  ) {
    throw new Error("Missing Firebase env values for seed script.");
  }

  return env;
}

function nowIso() {
  return new Date().toISOString();
}

async function ensureAuthUser(
  auth: ReturnType<typeof getAuth>,
  input: { email: string; password: string; displayName: string },
) {
  try {
    const created = await createUserWithEmailAndPassword(
      auth,
      input.email,
      input.password,
    );

    await updateProfile(created.user, { displayName: input.displayName });
    return created.user.uid;
  } catch (error) {
    const authError = error as { code?: string };

    if (authError.code !== "auth/email-already-in-use") {
      throw error;
    }

    const signedIn = await signInWithEmailAndPassword(
      auth,
      input.email,
      input.password,
    );

    if (signedIn.user.displayName !== input.displayName) {
      await updateProfile(signedIn.user, { displayName: input.displayName });
    }

    return signedIn.user.uid;
  }
}

async function seedUsers() {
  const env = loadFirebaseSeedEnv();

  const app = initializeApp({
    apiKey: env.FIREBASE_API_KEY,
    authDomain: env.FIREBASE_AUTH_DOMAIN,
    projectId: env.FIREBASE_PROJECT_ID,
    appId: env.FIREBASE_APP_ID,
  });

  const auth = getAuth(app);
  const firestore = getFirestore(app);

  if (env.USE_FIREBASE_EMULATOR !== "false") {
    connectAuthEmulator(auth, "http://127.0.0.1:9099", {
      disableWarnings: true,
    });
    connectFirestoreEmulator(firestore, "127.0.0.1", 8080);
  }

  const now = nowIso();

  const seedData: SeedRecord[] = [
    {
      email: "admin@example.com",
      password: "ValidPass123!",
      role: "admin",
      fullName: "Admin User",
      displayName: "Admin",
      username: "admin_user",
      avatarUrl: null,
      pronouns: "they/them",
      bio: "Seeded admin account for local and E2E testing",
      isActive: true,
      metadata: { source: "seed-script", team: "platform" },
    },
    {
      email: "manager@example.com",
      password: "ValidPass123!",
      role: "manager",
      fullName: "Manager User",
      displayName: "Manager",
      username: "manager_user",
      avatarUrl: null,
      pronouns: "she/her",
      bio: "Seeded manager account for local and E2E testing",
      isActive: true,
      metadata: { source: "seed-script", team: "operations" },
    },
    {
      email: "user@example.com",
      password: "ValidPass123!",
      role: "user",
      fullName: "Regular User",
      displayName: "User",
      username: "regular_user",
      avatarUrl: null,
      pronouns: "he/him",
      bio: "Seeded standard user account for local and E2E testing",
      isActive: true,
      metadata: { source: "seed-script", team: "member" },
    },
    {
      email: "deactivated@example.com",
      password: "ValidPass123!",
      role: "user",
      fullName: "Deactivated User",
      displayName: "Deactivated",
      username: "deactivated_user",
      avatarUrl: null,
      pronouns: null,
      bio: "Seeded deactivated account for auth enforcement tests",
      isActive: false,
      metadata: { source: "seed-script", deactivatedReason: "policy-test" },
    },
  ];

  const usersByEmail = new Map<string, string>();

  for (const record of seedData) {
    const uid = await ensureAuthUser(auth, {
      email: record.email,
      password: record.password,
      displayName: record.displayName,
    });
    usersByEmail.set(record.email, uid);
  }

  const adminUid = usersByEmail.get("admin@example.com");

  if (!adminUid) {
    throw new Error("Admin auth user was not created.");
  }

  const adminRecord = seedData.find((record) => record.email === "admin@example.com");

  if (!adminRecord) {
    throw new Error("Admin seed record is missing.");
  }

  for (const record of seedData) {
    const uid = usersByEmail.get(record.email);

    if (!uid) {
      throw new Error(`Missing uid for seeded email: ${record.email}`);
    }

    await signInWithEmailAndPassword(auth, record.email, record.password);

    const userRef = doc(firestore, "users", uid);
    await setDoc(userRef, {
      userId: uid,
      email: record.email,
      role: record.role,
      fullName: record.fullName,
      displayName: record.displayName,
      username: record.username,
      avatarUrl: record.avatarUrl,
      pronouns: record.pronouns,
      bio: record.bio,
      lastLoginAt: record.isActive ? now : null,
      isActive: record.isActive,
      createdAt: now,
      updatedAt: now,
      metadata: record.metadata,
    });
  }

  await signInWithEmailAndPassword(auth, adminRecord.email, adminRecord.password);

  const exampleEntities = createSeedExampleEntities(now);

  for (const entity of exampleEntities) {
    const entityRef = doc(firestore, "example-entities", entity.id);
    await setDoc(entityRef, {
      title: entity.title,
      body: entity.body,
      slug: entity.slug,
      summary: entity.summary,
      status: entity.status,
      category: entity.category,
      tags: entity.tags,
      priority: entity.priority,
      ownerName: entity.ownerName,
      dueDate: entity.dueDate,
      isFeatured: entity.isFeatured,
      publishedAt: entity.publishedAt,
      estimatedHours: entity.estimatedHours,
      progressPercent: entity.progressPercent,
      attachmentsUrl: entity.attachmentsUrl,
      externalLink: entity.externalLink,
      notes: entity.notes,
      createdAt: now,
      updatedAt: now,
    });
  }

  process.stdout.write(
    `Seed completed successfully. Users: ${seedData.length}. Example entities: ${exampleEntities.length}.\n`,
  );
  process.exit(0);
}

seedUsers().catch((error) => {
  process.stderr.write(`${String(error)}\n`);
  process.exit(1);
});
