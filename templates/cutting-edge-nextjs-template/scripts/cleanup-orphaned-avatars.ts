import { initializeApp } from "firebase/app";
import {
  connectFirestoreEmulator,
  getDocs,
  collection,
  getFirestore,
} from "firebase/firestore";
import {
  connectStorageEmulator,
  deleteObject,
  getStorage,
  listAll,
  ref,
  type StorageReference,
} from "firebase/storage";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

type CleanupEnv = {
  FIREBASE_API_KEY: string;
  FIREBASE_AUTH_DOMAIN: string;
  FIREBASE_PROJECT_ID: string;
  FIREBASE_APP_ID: string;
  FIREBASE_STORAGE_BUCKET: string;
  USE_FIREBASE_EMULATOR: string;
};

function trimOptionalWrappingQuotes(value: string): string {
  const trimmed = value.trim();

  if (trimmed.length < 2) {
    return trimmed;
  }

  const firstChar = trimmed[0];
  const lastChar = trimmed[trimmed.length - 1];

  if ((firstChar === '"' || firstChar === "'") && firstChar === lastChar) {
    return trimmed.slice(1, -1);
  }

  return trimmed;
}

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

      const rawKey = line.slice(0, separatorIndex).trim();
      const key = rawKey.startsWith("export ")
        ? rawKey.slice("export ".length).trim()
        : rawKey;
      const rawValue = line.slice(separatorIndex + 1);
      acc[key] = trimOptionalWrappingQuotes(rawValue);
      return acc;
    }, {});
}

function loadEnv(): CleanupEnv {
  const envPath = join(process.cwd(), ".env.local");
  const localEnv = existsSync(envPath)
    ? parseDotEnv(readFileSync(envPath, "utf8"))
    : {};

  const env: CleanupEnv = {
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
    FIREBASE_STORAGE_BUCKET:
      process.env.FIREBASE_STORAGE_BUCKET ??
      localEnv.FIREBASE_STORAGE_BUCKET ??
      `${
        process.env.FIREBASE_PROJECT_ID ??
        localEnv.FIREBASE_PROJECT_ID ??
        ""
      }.firebasestorage.app`,
    USE_FIREBASE_EMULATOR:
      process.env.USE_FIREBASE_EMULATOR ?? localEnv.USE_FIREBASE_EMULATOR ?? "true",
  };

  if (
    !env.FIREBASE_API_KEY ||
    !env.FIREBASE_AUTH_DOMAIN ||
    !env.FIREBASE_PROJECT_ID ||
    !env.FIREBASE_APP_ID ||
    !env.FIREBASE_STORAGE_BUCKET
  ) {
    throw new Error("Missing Firebase env values for cleanup script.");
  }

  return env;
}

function extractStoragePathFromUrl(url: string): string | null {
  let decoded: string;

  try {
    decoded = decodeURIComponent(url);
  } catch {
    return null;
  }

  const marker = "/o/";
  const markerIndex = decoded.indexOf(marker);

  if (markerIndex === -1) {
    return null;
  }

  const pathWithQuery = decoded.slice(markerIndex + marker.length);
  const path = pathWithQuery.split("?")[0];

  return path || null;
}

async function listAllPaths(rootRef: StorageReference): Promise<string[]> {
  const listing = await listAll(rootRef);

  const currentPaths = listing.items.map((item) => item.fullPath);
  const nested = await Promise.all(listing.prefixes.map((prefix) => listAllPaths(prefix)));

  return [...currentPaths, ...nested.flat()];
}

function printPaths(title: string, paths: string[]) {
  process.stdout.write(`${title}: ${paths.length}\n`);

  if (paths.length === 0) {
    return;
  }

  for (const path of paths) {
    process.stdout.write(` - ${path}\n`);
  }
}

async function main() {
  const shouldExecute = process.argv.includes("--execute");
  const mode = shouldExecute ? "execute" : "dry-run";

  const env = loadEnv();
  const app = initializeApp({
    apiKey: env.FIREBASE_API_KEY,
    authDomain: env.FIREBASE_AUTH_DOMAIN,
    projectId: env.FIREBASE_PROJECT_ID,
    appId: env.FIREBASE_APP_ID,
    storageBucket: env.FIREBASE_STORAGE_BUCKET,
  });

  const firestore = getFirestore(app);
  const storage = getStorage(app);

  const useEmulator = env.USE_FIREBASE_EMULATOR !== "false";

  if (useEmulator) {
    connectFirestoreEmulator(firestore, "127.0.0.1", 8080);
    connectStorageEmulator(storage, "127.0.0.1", 9199);
  }

  process.stdout.write(`Avatar cleanup mode=${mode} emulator=${useEmulator ? "on" : "off"}\n`);

  const storagePaths = await listAllPaths(ref(storage, "uploads/avatars"));

  const userDocs = await getDocs(collection(firestore, "users"));
  const referencedPaths = new Set<string>();

  for (const userDoc of userDocs.docs) {
    const data = userDoc.data() as { avatarUrl?: unknown };
    const avatarUrl = typeof data.avatarUrl === "string" ? data.avatarUrl : null;

    if (!avatarUrl) {
      continue;
    }

    const path = extractStoragePathFromUrl(avatarUrl);

    if (path && path.startsWith("uploads/avatars/")) {
      referencedPaths.add(path);
    }
  }

  const orphanPaths = storagePaths.filter((path) => !referencedPaths.has(path));

  printPaths("Storage avatar files", storagePaths);
  printPaths("Referenced avatar paths", [...referencedPaths]);
  printPaths("Orphan avatar paths", orphanPaths);

  if (!shouldExecute) {
    process.stdout.write(
      `Summary: mode=dry-run total=${storagePaths.length} referenced=${referencedPaths.size} orphan=${orphanPaths.length} deleted=0\n`,
    );
    process.exit(0);
  }

  if (!useEmulator) {
    throw new Error("Refusing --execute while USE_FIREBASE_EMULATOR=false.");
  }

  let deletedCount = 0;
  let failedCount = 0;

  for (const orphanPath of orphanPaths) {
    try {
      await deleteObject(ref(storage, orphanPath));
      deletedCount += 1;
      process.stdout.write(`Deleted: ${orphanPath}\n`);
    } catch (error) {
      failedCount += 1;
      process.stderr.write(`Failed delete: ${orphanPath} error=${String(error)}\n`);
    }
  }

  process.stdout.write(
    `Summary: mode=execute total=${storagePaths.length} referenced=${referencedPaths.size} orphan=${orphanPaths.length} deleted=${deletedCount} failed=${failedCount}\n`,
  );

  if (failedCount > 0) {
    process.exit(1);
  }

  process.exit(0);
}

main().catch((error) => {
  process.stderr.write(`Avatar cleanup failed: ${String(error)}\n`);
  process.exit(1);
});
