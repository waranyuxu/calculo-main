const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const projectRoot = path.resolve(__dirname, "..");

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

const command = process.argv[2];
const commandArgs = process.argv.slice(3);

if (!command) {
  console.error("Usage: node scripts/with-anwa-env.js <command> [...args]");
  process.exit(1);
}

const firebaseEnvSuffixes = [
  "API_KEY",
  "AUTH_DOMAIN",
  "PROJECT_ID",
  "STORAGE_BUCKET",
  "MESSAGING_SENDER_ID",
  "APP_ID",
  "MEASUREMENT_ID",
];

function createScopedFirebaseEnv(sourceEnv, scope) {
  return firebaseEnvSuffixes.reduce((scopedEnv, suffix) => {
    const sourceKey = `EXPO_PUBLIC_FIREBASE_${suffix}`;
    const scopedKey = `EXPO_PUBLIC_${scope}_FIREBASE_${suffix}`;
    const value = sourceEnv[scopedKey] || sourceEnv[sourceKey];

    if (value) {
      scopedEnv[scopedKey] = value;
    }

    return scopedEnv;
  }, {});
}

function omitBaseFirebaseEnv(sourceEnv) {
  return Object.entries(sourceEnv).reduce((nextEnv, [key, value]) => {
    if (!key.startsWith("EXPO_PUBLIC_FIREBASE_")) {
      nextEnv[key] = value;
    }

    return nextEnv;
  }, {});
}

const defaultEnv = readEnvFile(".env");
const anwaEnv = readEnvFile(".env.anwa");
const loginEnv = Object.keys(anwaEnv).length ? anwaEnv : defaultEnv;

const env = {
  ...process.env,
  ...defaultEnv,
  ...omitBaseFirebaseEnv(anwaEnv),
  ...createScopedFirebaseEnv(anwaEnv, "APP"),
  ...createScopedFirebaseEnv(loginEnv, "LOGIN"),
  EXPO_NO_DOTENV: "1",
};

function getEnvValue(nextEnv, key) {
  const matchedKey = Object.keys(nextEnv).find(
    (envKey) => envKey.toLowerCase() === key.toLowerCase(),
  );

  return matchedKey ? nextEnv[matchedKey] : "";
}

function resolveWindowsCommand(commandName, nextEnv) {
  if (
    process.platform !== "win32" ||
    /[\\/]/.test(commandName) ||
    /\.[a-z0-9]+$/i.test(commandName)
  ) {
    return commandName;
  }

  const localBin = path.join(projectRoot, "node_modules", ".bin");
  const pathEntries = [localBin, ...String(getEnvValue(nextEnv, "PATH"))
    .split(path.delimiter)
    .filter(Boolean)];
  const pathExts = String(nextEnv.PATHEXT || ".COM;.EXE;.BAT;.CMD")
    .split(";")
    .filter(Boolean);

  for (const pathEntry of pathEntries) {
    for (const extension of pathExts) {
      const candidate = path.join(pathEntry, `${commandName}${extension}`);

      if (fs.existsSync(candidate)) {
        return candidate;
      }
    }
  }

  return commandName;
}

function resolveCommandInvocation(commandName, commandArgs, nextEnv) {
  if (commandName === "expo") {
    return {
      args: [require.resolve("expo/bin/cli", { paths: [projectRoot] }), ...commandArgs],
      command: process.execPath,
    };
  }

  return {
    args: commandArgs,
    command: resolveWindowsCommand(commandName, nextEnv),
  };
}

const invocation = resolveCommandInvocation(command, commandArgs, env);

const child = spawn(invocation.command, invocation.args, {
  cwd: projectRoot,
  env,
  stdio: "inherit",
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});

child.on("error", (error) => {
  console.error(error);
  process.exit(1);
});
