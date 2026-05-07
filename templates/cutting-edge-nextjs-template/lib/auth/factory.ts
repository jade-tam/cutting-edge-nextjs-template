import type { AuthProvider } from "./contracts";
import { createFirebaseAuthProvider } from "./adapters/firebase";
import { createRestAuthProvider } from "./adapters/rest";
import { serverEnv } from "../env/server";

export function createAuthProvider(): AuthProvider {
  return serverEnv.DATA_PROVIDER === "firebase"
    ? createFirebaseAuthProvider()
    : createRestAuthProvider();
}
