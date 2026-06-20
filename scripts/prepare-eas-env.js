const fs = require("fs");
const path = require("path");

const projectRoot = path.resolve(__dirname, "..");
const envFile = process.env.CALCULO_EAS_ENV_FILE;

const firebaseEnvSuffixes = [
  "API_KEY",
  "AUTH_DOMAIN",
  "PROJECT_ID",
  "STORAGE_BUCKET",
  "MESSAGING_SENDER_ID",
  "APP_ID",
  "MEASUREMENT_ID",
];

function stripQuotes(value) {
  const trimmed = value.trim();

  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }

  return trimmed;
}

function readEnvFile(filename) {
  const envPath = path.join(projectRoot, filename);

  if (!fs.existsSync(envPath)) {
    throw new Error(`Missing EAS env file: ${filename}`);
  }

  return fs
    .readFileSync(envPath, "utf8")
    .split(/\r?\n/)
    .reduce((env, line) => {
      const trimmed = line.trim();

      if (!trimmed || trimmed.startsWith("#")) {
        return env;
      }

      const separatorIndex = trimmed.indexOf("=");

      if (separatorIndex < 1) {
        return env;
      }

      const key = trimmed.slice(0, separatorIndex).trim();
      const value = stripQuotes(trimmed.slice(separatorIndex + 1));

      env[key] = value;
      return env;
    }, {});
}

function appendFirebaseScope(env, scope) {
  return firebaseEnvSuffixes.reduce((lines, suffix) => {
    const sourceKey = `EXPO_PUBLIC_FIREBASE_${suffix}`;
    const scopedKey = `EXPO_PUBLIC_${scope}_FIREBASE_${suffix}`;
    const value = env[scopedKey] || env[sourceKey];

    if (value) {
      lines.push(`${scopedKey}=${value}`);
    }

    return lines;
  }, []);
}

if (!envFile) {
  console.log("No CALCULO_EAS_ENV_FILE set; skipping EAS env preparation.");
  process.exit(0);
}

try {
  const env = readEnvFile(envFile);
  const projectId = env.EXPO_PUBLIC_FIREBASE_PROJECT_ID;

  if (!projectId) {
    throw new Error(`Missing EXPO_PUBLIC_FIREBASE_PROJECT_ID in ${envFile}`);
  }

  const baseLines = Object.entries(env).map(([key, value]) => `${key}=${value}`);
  const nextEnvLocal = [
    "# Generated during EAS Build. Do not edit by hand.",
    `# Source: ${envFile}`,
    ...baseLines,
    ...appendFirebaseScope(env, "APP"),
    ...appendFirebaseScope(env, "LOGIN"),
    "",
  ].join("\n");

  fs.writeFileSync(path.join(projectRoot, ".env.local"), nextEnvLocal);
  console.log(`Prepared EAS env from ${envFile} for project ${projectId}.`);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
