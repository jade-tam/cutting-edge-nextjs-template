import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { connectAuthEmulator, getAuth, type Auth } from "firebase/auth";
import {
  connectFirestoreEmulator,
  getFirestore,
  type Firestore,
} from "firebase/firestore";
import {
  connectStorageEmulator,
  getStorage,
  type FirebaseStorage,
} from "firebase/storage";

import { isProductionEnvironment, serverEnv } from "@/lib/env/server";

const FIREBASE_EMULATOR_HOST = "127.0.0.1";
const FIRESTORE_EMULATOR_PORT = 8080;
const AUTH_EMULATOR_PORT = 9099;
const STORAGE_EMULATOR_PORT = 9199;

let cachedApp: FirebaseApp | null = null;
let cachedAuth: Auth | null = null;
let cachedFirestore: Firestore | null = null;
let cachedStorage: FirebaseStorage | null = null;
let didConnectAuthEmulator = false;
let didConnectFirestoreEmulator = false;
let didConnectStorageEmulator = false;

function shouldUseFirebaseEmulator() {
  if (isProductionEnvironment) {
    return false;
  }

  return serverEnv.USE_FIREBASE_EMULATOR !== "false";
}

function ensureAuthEmulatorConnected(auth: Auth) {
  if (!shouldUseFirebaseEmulator() || didConnectAuthEmulator) {
    return;
  }

  connectAuthEmulator(auth, `http://${FIREBASE_EMULATOR_HOST}:${AUTH_EMULATOR_PORT}`, {
    disableWarnings: true,
  });
  didConnectAuthEmulator = true;
}

function ensureFirestoreEmulatorConnected(firestore: Firestore) {
  if (!shouldUseFirebaseEmulator() || didConnectFirestoreEmulator) {
    return;
  }

  connectFirestoreEmulator(
    firestore,
    FIREBASE_EMULATOR_HOST,
    FIRESTORE_EMULATOR_PORT,
  );
  didConnectFirestoreEmulator = true;
}

function ensureStorageEmulatorConnected(storage: FirebaseStorage) {
  if (!shouldUseFirebaseEmulator() || didConnectStorageEmulator) {
    return;
  }

  connectStorageEmulator(
    storage,
    FIREBASE_EMULATOR_HOST,
    STORAGE_EMULATOR_PORT,
  );
  didConnectStorageEmulator = true;
}

function getFirebaseAppServer() {
  if (cachedApp) {
    return cachedApp;
  }

  const storageBucket =
    serverEnv.FIREBASE_STORAGE_BUCKET ||
    `${serverEnv.FIREBASE_PROJECT_ID}.firebasestorage.app`;

  cachedApp =
    getApps().length > 0
      ? getApp()
      : initializeApp({
          apiKey: serverEnv.FIREBASE_API_KEY,
          authDomain: serverEnv.FIREBASE_AUTH_DOMAIN,
          projectId: serverEnv.FIREBASE_PROJECT_ID,
          appId: serverEnv.FIREBASE_APP_ID,
          storageBucket,
        });

  return cachedApp;
}

export function getFirebaseAuthServer() {
  if (cachedAuth) {
    return cachedAuth;
  }

  cachedAuth = getAuth(getFirebaseAppServer());
  ensureAuthEmulatorConnected(cachedAuth);

  return cachedAuth;
}

export function getFirebaseFirestoreServer() {
  if (cachedFirestore) {
    return cachedFirestore;
  }

  cachedFirestore = getFirestore(getFirebaseAppServer());
  ensureFirestoreEmulatorConnected(cachedFirestore);

  return cachedFirestore;
}

export function getFirebaseStorageServer() {
  if (cachedStorage) {
    return cachedStorage;
  }

  cachedStorage = getStorage(getFirebaseAppServer());
  ensureStorageEmulatorConnected(cachedStorage);

  return cachedStorage;
}

export function __resetFirebaseServerForTests() {
  cachedApp = null;
  cachedAuth = null;
  cachedFirestore = null;
  cachedStorage = null;
  didConnectAuthEmulator = false;
  didConnectFirestoreEmulator = false;
  didConnectStorageEmulator = false;
}
