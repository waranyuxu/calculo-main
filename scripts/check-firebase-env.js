const requiredKeys = [
  "EXPO_PUBLIC_FIREBASE_API_KEY",
  "EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "EXPO_PUBLIC_FIREBASE_PROJECT_ID",
  "EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "EXPO_PUBLIC_FIREBASE_APP_ID",
];

const appRequiredKeys = requiredKeys.map((key) =>
  key.replace("EXPO_PUBLIC_FIREBASE_", "EXPO_PUBLIC_APP_FIREBASE_"),
);
const loginRequiredKeys = requiredKeys.map((key) =>
  key.replace("EXPO_PUBLIC_FIREBASE_", "EXPO_PUBLIC_LOGIN_FIREBASE_"),
);

const missingLoginKeys = loginRequiredKeys
  .map((key, index) => ({ fallbackKey: requiredKeys[index], loginKey: key }))
  .filter(({ fallbackKey, loginKey }) => !process.env[loginKey] && !process.env[fallbackKey])
  .map(({ fallbackKey, loginKey }) => `${loginKey} or ${fallbackKey}`);
const missingAppKeys = appRequiredKeys
  .map((key, index) => ({ appKey: key, fallbackKey: requiredKeys[index] }))
  .filter(({ appKey, fallbackKey }) => !process.env[appKey] && !process.env[fallbackKey])
  .map(({ appKey, fallbackKey }) => `${appKey} or ${fallbackKey}`);

if (missingLoginKeys.length || missingAppKeys.length) {
  if (missingLoginKeys.length) {
    console.error(`Missing login Firebase env: ${missingLoginKeys.join(", ")}`);
  }

  if (missingAppKeys.length) {
    console.error(`Missing app Firebase env: ${missingAppKeys.join(", ")}`);
  }

  process.exit(1);
}

function getAppEnvValue(key) {
  return process.env[key.replace("EXPO_PUBLIC_FIREBASE_", "EXPO_PUBLIC_APP_FIREBASE_")] || process.env[key];
}

function getLoginEnvValue(key) {
  return process.env[key.replace("EXPO_PUBLIC_FIREBASE_", "EXPO_PUBLIC_LOGIN_FIREBASE_")] || process.env[key];
}

console.log(
  JSON.stringify(
    {
      app: {
        authDomain: getAppEnvValue("EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN"),
        projectId: getAppEnvValue("EXPO_PUBLIC_FIREBASE_PROJECT_ID"),
        storageBucket: getAppEnvValue("EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET"),
      },
      competition: {
        authDomain: getLoginEnvValue("EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN"),
        projectId: getLoginEnvValue("EXPO_PUBLIC_FIREBASE_PROJECT_ID"),
        storageBucket: getLoginEnvValue("EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET"),
      },
      login: {
        authDomain: getLoginEnvValue("EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN"),
        projectId: getLoginEnvValue("EXPO_PUBLIC_FIREBASE_PROJECT_ID"),
        storageBucket: getLoginEnvValue("EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET"),
      },
    },
    null,
    2,
  ),
);
