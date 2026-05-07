import { serverEnv } from "@/lib/env/server";

import type { UserManagementProvider } from "./contracts";
import { createFirebaseUserManagementProvider } from "./adapters/firebase";
import { createRestUserManagementProvider } from "./adapters/rest";

export function createUserManagementProvider(): UserManagementProvider {
  return serverEnv.DATA_PROVIDER === "firebase"
    ? createFirebaseUserManagementProvider()
    : createRestUserManagementProvider();
}
