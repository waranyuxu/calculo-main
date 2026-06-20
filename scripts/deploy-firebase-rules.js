const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const projectRoot = path.resolve(__dirname, "..");
const args = process.argv.slice(2);

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
    return {};
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

function getArgValue(name) {
  const inlineArg = args.find((arg) => arg.startsWith(`--${name}=`));

  if (inlineArg) {
    return inlineArg.slice(name.length + 3);
  }

  const index = args.indexOf(`--${name}`);

  return index >= 0 ? args[index + 1] : undefined;
}

function resolveEnvFile() {
  const envName = getArgValue("env");

  if (args.includes("--anwa")) {
    return ".env.anwa";
  }

  if (!envName || envName === "default") {
    return ".env";
  }

  if (envName === "anwa") {
    return ".env.anwa";
  }

  if (envName.startsWith(".env")) {
    return envName;
  }

  return `.env.${envName}`;
}

function resolveDeployTargets() {
  const targets = [
    args.includes("--firestore") ? "firestore:rules" : "",
    args.includes("--storage") ? "storage:rules" : "",
  ].filter(Boolean);

  return targets.length ? targets.join(",") : "firestore:rules,storage:rules";
}

if (process.argv.includes("--help") || process.argv.includes("-h")) {
  console.log(
    [
      "Deploy Firebase rules to the project configured in an env file.",
      "",
      "  npm run firebase:rules:deploy",
      "  npm run firebase:rules:deploy:anwa",
      "",
      "Options:",
      "  --env anwa       Use .env.anwa",
      "  --firestore      Deploy only Firestore rules",
      "  --storage        Deploy only Storage rules",
    ].join("\n"),
  );
  process.exit(0);
}

const envFile = resolveEnvFile();
const env = readEnvFile(envFile);
const projectId = env.EXPO_PUBLIC_FIREBASE_PROJECT_ID;
const deployTargets = resolveDeployTargets();

if (!projectId) {
  console.error(`Missing EXPO_PUBLIC_FIREBASE_PROJECT_ID in ${envFile}`);
  process.exit(1);
}

if (!/^[a-z0-9-]+$/i.test(projectId)) {
  console.error(`Invalid Firebase project id in ${envFile}: ${projectId}`);
  process.exit(1);
}

try {
  execSync(
    `npx -y firebase-tools@latest deploy --only ${deployTargets} --project ${projectId}`,
    {
      cwd: projectRoot,
      stdio: "inherit",
    },
  );
} catch (error) {
  process.exit(error.status ?? 1);
}
