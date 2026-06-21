const https = require("https");

const LOGIN_API_KEY =
  process.env.EXPO_PUBLIC_LOGIN_FIREBASE_API_KEY ||
  process.env.EXPO_PUBLIC_FIREBASE_API_KEY;
const LOGIN_PROJECT_ID =
  process.env.EXPO_PUBLIC_LOGIN_FIREBASE_PROJECT_ID ||
  process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ||
  "unknown";

const ENABLED_EMAIL_PASSWORD_ERRORS = new Set([
  "EMAIL_NOT_FOUND",
  "INVALID_LOGIN_CREDENTIALS",
  "INVALID_PASSWORD",
  "USER_DISABLED",
]);

function postJson(hostname, path, body) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const request = https.request(
      {
        hostname,
        method: "POST",
        path,
        headers: {
          "Content-Length": Buffer.byteLength(payload),
          "Content-Type": "application/json",
        },
        timeout: 15000,
      },
      (response) => {
        let data = "";

        response.setEncoding("utf8");
        response.on("data", (chunk) => {
          data += chunk;
        });
        response.on("end", () => {
          try {
            resolve({
              body: data ? JSON.parse(data) : null,
              ok: response.statusCode >= 200 && response.statusCode < 300,
              statusCode: response.statusCode,
            });
          } catch (error) {
            reject(error);
          }
        });
      },
    );

    request.on("error", reject);
    request.on("timeout", () => {
      request.destroy(new Error("Firebase Auth provider check timed out."));
    });
    request.write(payload);
    request.end();
  });
}

function getFirebaseErrorCode(response) {
  const message = response?.body?.error?.message;

  if (typeof message !== "string") {
    return "";
  }

  return message.split(" : ")[0];
}

async function checkEmailPasswordProvider() {
  if (!LOGIN_API_KEY) {
    throw new Error(
      "Missing EXPO_PUBLIC_LOGIN_FIREBASE_API_KEY or EXPO_PUBLIC_FIREBASE_API_KEY.",
    );
  }

  const response = await postJson(
    "identitytoolkit.googleapis.com",
    `/v1/accounts:signInWithPassword?key=${encodeURIComponent(LOGIN_API_KEY)}`,
    {
      email: `calculo-auth-check-${Date.now()}@example.invalid`,
      password: "AuthCheck123!",
      returnSecureToken: true,
    },
  );
  const errorCode = getFirebaseErrorCode(response);

  if (response.ok || ENABLED_EMAIL_PASSWORD_ERRORS.has(errorCode)) {
    console.log(
      `Firebase Email/Password sign-in is enabled for ${LOGIN_PROJECT_ID}.`,
    );
    return;
  }

  if (
    errorCode === "OPERATION_NOT_ALLOWED" ||
    errorCode === "PASSWORD_LOGIN_DISABLED"
  ) {
    throw new Error(
      [
        `Firebase Email/Password sign-in is disabled for ${LOGIN_PROJECT_ID}.`,
        "Open Firebase Console > Authentication > Sign-in method > Email/Password, enable the first toggle, then Save.",
      ].join("\n"),
    );
  }

  throw new Error(
    [
      `Could not verify Firebase Email/Password sign-in for ${LOGIN_PROJECT_ID}.`,
      `Status: ${response.statusCode || "unknown"}`,
      `Firebase error: ${errorCode || "unknown"}`,
    ].join("\n"),
  );
}

if (process.env.CALCULO_SKIP_FIREBASE_AUTH_CHECK === "1") {
  console.log("Skipping Firebase Auth provider check.");
  process.exit(0);
}

checkEmailPasswordProvider().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
