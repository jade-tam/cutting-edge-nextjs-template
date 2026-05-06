import { serverEnv } from "../env/server";

import type { ExampleEntityProvider } from "./contracts";
import { createFirebaseExampleEntityProvider } from "./adapters/firebase";
import { createRestExampleEntityProvider } from "./adapters/rest";

export function createExampleEntityProvider(): ExampleEntityProvider {
  return serverEnv.DATA_PROVIDER === "firebase"
    ? createFirebaseExampleEntityProvider()
    : createRestExampleEntityProvider();
}
