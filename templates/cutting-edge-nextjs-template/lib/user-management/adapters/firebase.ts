import { collection, doc, getDoc, getDocs, updateDoc } from "firebase/firestore";

import { getFirebaseFirestoreServer } from "@/lib/firebase/server";

import type { UserManagementProvider } from "../contracts";
import { USER_MANAGEMENT_ERROR, UserManagementError } from "../errors";
import type { ManagedUserProfile, ManagedUserRole } from "../types";

function isUserRole(value: unknown): value is ManagedUserRole {
  return value === "admin" || value === "manager" || value === "user";
}

function normalizeProfile(raw: Record<string, unknown>): ManagedUserProfile {
  const roleValue = raw.role;

  if (!isUserRole(roleValue)) {
    throw new UserManagementError(USER_MANAGEMENT_ERROR.USER_PROFILE_NOT_FOUND);
  }

  const userId = typeof raw.userId === "string" ? raw.userId : null;
  const email = typeof raw.email === "string" ? raw.email : null;
  const fullName = typeof raw.fullName === "string" ? raw.fullName : null;

  if (!userId || !email || !fullName) {
    throw new UserManagementError(USER_MANAGEMENT_ERROR.USER_PROFILE_NOT_FOUND);
  }

  return {
    userId,
    email,
    role: roleValue,
    fullName,
    username: typeof raw.username === "string" ? raw.username : null,
    isActive: raw.isActive === true,
  };
}

async function getManagedUserById(userId: string): Promise<ManagedUserProfile | null> {
  const firestore = getFirebaseFirestoreServer();
  const userDocRef = doc(firestore, "users", userId);
  const userDocSnap = await getDoc(userDocRef);

  if (!userDocSnap.exists()) {
    return null;
  }

  return normalizeProfile(userDocSnap.data() as Record<string, unknown>);
}

export function createFirebaseUserManagementProvider(): UserManagementProvider {
  const firestore = getFirebaseFirestoreServer();

  return {
    kind: "firebase",
    async listUsers() {
      const usersRef = collection(firestore, "users");
      const usersSnapshot = await getDocs(usersRef);

      const users: ManagedUserProfile[] = [];

      for (const docSnapshot of usersSnapshot.docs) {
        try {
          users.push(normalizeProfile(docSnapshot.data() as Record<string, unknown>));
        } catch {
          continue;
        }
      }

      return {
        users: users.sort((left, right) => left.email.localeCompare(right.email)),
        total: users.length,
      };
    },
    async updateUserRole(input) {
      const userDocRef = doc(firestore, "users", input.userId);

      try {
        await updateDoc(userDocRef, { role: input.role });
      } catch {
        throw new UserManagementError(USER_MANAGEMENT_ERROR.USER_PROFILE_UPDATE_FAILED);
      }

      const updated = await getManagedUserById(input.userId);

      if (!updated) {
        throw new UserManagementError(USER_MANAGEMENT_ERROR.USER_PROFILE_UPDATE_FAILED);
      }

      return updated;
    },
    async updateUserStatus(input) {
      const userDocRef = doc(firestore, "users", input.userId);

      try {
        await updateDoc(userDocRef, { isActive: input.isActive });
      } catch {
        throw new UserManagementError(USER_MANAGEMENT_ERROR.USER_PROFILE_UPDATE_FAILED);
      }

      const updated = await getManagedUserById(input.userId);

      if (!updated) {
        throw new UserManagementError(USER_MANAGEMENT_ERROR.USER_PROFILE_UPDATE_FAILED);
      }

      return updated;
    },
    async bulkUpdateUserRole(input) {
      for (const userId of input.userIds) {
        await this.updateUserRole({ userId, role: input.role });
      }

      return {
        ok: true,
        updated: input.userIds.length,
      };
    },
    async bulkUpdateUserStatus(input) {
      for (const userId of input.userIds) {
        await this.updateUserStatus({ userId, isActive: input.isActive });
      }

      return {
        ok: true,
        updated: input.userIds.length,
      };
    },
  };
}
