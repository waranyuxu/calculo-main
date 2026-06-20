import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApps, initializeApp, type FirebaseApp } from "firebase/app";
import * as FirebaseAuth from "firebase/auth";
import type {
  Auth,
  Persistence,
  ReactNativeAsyncStorage,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { Platform } from "react-native";

const DEFAULT_FIREBASE_APP_NAME = "[DEFAULT]";
const LOGIN_FIREBASE_APP_NAME = "calculo-login";

let appAuthInstance: Auth | null = null;
let loginAuthInstance: Auth | null = null;

type ReactNativeFirebaseAuth = typeof FirebaseAuth & {
  getReactNativePersistence: (
    storage: ReactNativeAsyncStorage,
  ) => Persistence;
};

type FirebaseConfig = ReturnType<typeof getFirebaseConfig>;

const firebaseConfigEnvKeys: Record<keyof FirebaseConfig, string> = {
  apiKey: "EXPO_PUBLIC_APP_FIREBASE_API_KEY or EXPO_PUBLIC_FIREBASE_API_KEY",
  authDomain:
    "EXPO_PUBLIC_APP_FIREBASE_AUTH_DOMAIN or EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN",
  projectId:
    "EXPO_PUBLIC_APP_FIREBASE_PROJECT_ID or EXPO_PUBLIC_FIREBASE_PROJECT_ID",
  storageBucket:
    "EXPO_PUBLIC_APP_FIREBASE_STORAGE_BUCKET or EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET",
  messagingSenderId:
    "EXPO_PUBLIC_APP_FIREBASE_MESSAGING_SENDER_ID or EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  appId: "EXPO_PUBLIC_APP_FIREBASE_APP_ID or EXPO_PUBLIC_FIREBASE_APP_ID",
};

const loginFirebaseConfigEnvKeys: Record<keyof FirebaseConfig, string> = {
  apiKey: "EXPO_PUBLIC_LOGIN_FIREBASE_API_KEY or EXPO_PUBLIC_FIREBASE_API_KEY",
  authDomain:
    "EXPO_PUBLIC_LOGIN_FIREBASE_AUTH_DOMAIN or EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN",
  projectId:
    "EXPO_PUBLIC_LOGIN_FIREBASE_PROJECT_ID or EXPO_PUBLIC_FIREBASE_PROJECT_ID",
  storageBucket:
    "EXPO_PUBLIC_LOGIN_FIREBASE_STORAGE_BUCKET or EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET",
  messagingSenderId:
    "EXPO_PUBLIC_LOGIN_FIREBASE_MESSAGING_SENDER_ID or EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  appId: "EXPO_PUBLIC_LOGIN_FIREBASE_APP_ID or EXPO_PUBLIC_FIREBASE_APP_ID",
};

function cleanEnvValue(value: string | undefined) {
  return value?.trim().replace(/^["']|["'];?$|[;,]$/g, "");
}

function getFirebaseConfig() {
  return {
    apiKey:
      cleanEnvValue(process.env.EXPO_PUBLIC_APP_FIREBASE_API_KEY) ||
      cleanEnvValue(process.env.EXPO_PUBLIC_FIREBASE_API_KEY),
    authDomain:
      cleanEnvValue(process.env.EXPO_PUBLIC_APP_FIREBASE_AUTH_DOMAIN) ||
      cleanEnvValue(process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN),
    projectId:
      cleanEnvValue(process.env.EXPO_PUBLIC_APP_FIREBASE_PROJECT_ID) ||
      cleanEnvValue(process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID),
    storageBucket:
      cleanEnvValue(process.env.EXPO_PUBLIC_APP_FIREBASE_STORAGE_BUCKET) ||
      cleanEnvValue(process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET),
    messagingSenderId:
      cleanEnvValue(process.env.EXPO_PUBLIC_APP_FIREBASE_MESSAGING_SENDER_ID) ||
      cleanEnvValue(process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID),
    appId:
      cleanEnvValue(process.env.EXPO_PUBLIC_APP_FIREBASE_APP_ID) ||
      cleanEnvValue(process.env.EXPO_PUBLIC_FIREBASE_APP_ID),
  };
}

function getLoginFirebaseConfig() {
  return {
    apiKey:
      cleanEnvValue(process.env.EXPO_PUBLIC_LOGIN_FIREBASE_API_KEY) ||
      cleanEnvValue(process.env.EXPO_PUBLIC_FIREBASE_API_KEY),
    authDomain:
      cleanEnvValue(process.env.EXPO_PUBLIC_LOGIN_FIREBASE_AUTH_DOMAIN) ||
      cleanEnvValue(process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN),
    projectId:
      cleanEnvValue(process.env.EXPO_PUBLIC_LOGIN_FIREBASE_PROJECT_ID) ||
      cleanEnvValue(process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID),
    storageBucket:
      cleanEnvValue(process.env.EXPO_PUBLIC_LOGIN_FIREBASE_STORAGE_BUCKET) ||
      cleanEnvValue(process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET),
    messagingSenderId:
      cleanEnvValue(process.env.EXPO_PUBLIC_LOGIN_FIREBASE_MESSAGING_SENDER_ID) ||
      cleanEnvValue(process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID),
    appId:
      cleanEnvValue(process.env.EXPO_PUBLIC_LOGIN_FIREBASE_APP_ID) ||
      cleanEnvValue(process.env.EXPO_PUBLIC_FIREBASE_APP_ID),
  };
}

export function isFirebaseConfigured() {
  return Object.values(getFirebaseConfig()).every(Boolean);
}

export function isFirebaseAuthConfigured() {
  return Object.values(getLoginFirebaseConfig()).every(Boolean);
}

function getMissingFirebaseKeys(
  firebaseConfig: FirebaseConfig,
  envKeys: Record<keyof FirebaseConfig, string>,
) {
  return Object.entries(firebaseConfig)
    .filter(([, value]) => !value)
    .map(([key]) => envKeys[key as keyof FirebaseConfig]);
}

function configsMatch(a: FirebaseConfig, b: FirebaseConfig) {
  return Object.keys(a).every(
    (key) => a[key as keyof FirebaseConfig] === b[key as keyof FirebaseConfig],
  );
}

function getFirebaseApp(): FirebaseApp {
  const firebaseConfig = getFirebaseConfig();

  if (!isFirebaseConfigured()) {
    throw new Error(
      `Firebase config is missing: ${getMissingFirebaseKeys(
        firebaseConfig,
        firebaseConfigEnvKeys,
      ).join(", ")}`,
    );
  }

  const defaultApp = getApps().find(
    (app) => app.name === DEFAULT_FIREBASE_APP_NAME,
  );

  return defaultApp ?? initializeApp(firebaseConfig);
}

function getLoginFirebaseApp(): FirebaseApp {
  const loginFirebaseConfig = getLoginFirebaseConfig();

  if (!isFirebaseAuthConfigured()) {
    throw new Error(
      `Firebase auth config is missing: ${getMissingFirebaseKeys(
        loginFirebaseConfig,
        loginFirebaseConfigEnvKeys,
      ).join(", ")}`,
    );
  }

  if (
    isFirebaseConfigured() &&
    configsMatch(loginFirebaseConfig, getFirebaseConfig())
  ) {
    return getFirebaseApp();
  }

  const loginApp = getApps().find((app) => app.name === LOGIN_FIREBASE_APP_NAME);

  return loginApp ?? initializeApp(loginFirebaseConfig, LOGIN_FIREBASE_APP_NAME);
}

export function getFirebaseAuth() {
  if (loginAuthInstance) {
    return loginAuthInstance;
  }

  const app = getLoginFirebaseApp();

  loginAuthInstance = initializeFirebaseAuth(app);
  return loginAuthInstance;
}

export function getAppFirebaseAuth() {
  if (appAuthInstance) {
    return appAuthInstance;
  }

  appAuthInstance = initializeFirebaseAuth(getFirebaseApp());
  return appAuthInstance;
}

function initializeFirebaseAuth(app: FirebaseApp) {
  if (Platform.OS === "web") {
    return FirebaseAuth.getAuth(app);
  }

  try {
    const { getReactNativePersistence } =
      FirebaseAuth as ReactNativeFirebaseAuth;

    return FirebaseAuth.initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch {
    return FirebaseAuth.getAuth(app);
  }
}

export function getFirebaseDb() {
  return getFirestore(getFirebaseApp());
}

export function getLoginFirebaseDb() {
  return getFirestore(getLoginFirebaseApp());
}

export function getFirebaseStorage() {
  return getStorage(getFirebaseApp());
}
