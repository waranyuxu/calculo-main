import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInAnonymously,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { getAppFirebaseAuth, getFirebaseAuth } from "@/services/firebase";
import type { Language } from "@/i18n/language";

export type AuthUser = User | null;

const AUTH_ERROR_MESSAGES: Record<Language, Record<string, string>> = {
  th: {
    "auth/account-exists-with-different-credential":
      "อีเมลนี้มีบัญชีอยู่แล้ว กรุณาเข้าสู่ระบบด้วยวิธีเดิม",
    "auth/configuration-not-found":
      "ยังไม่ได้เปิดใช้งาน Firebase Authentication ในโปรเจกต์นี้",
    "auth/email-already-in-use": "อีเมลนี้ถูกใช้สมัครสมาชิกแล้ว",
    "auth/invalid-credential": "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
    "auth/invalid-email": "รูปแบบอีเมลไม่ถูกต้อง",
    "auth/missing-email": "กรุณากรอกอีเมลก่อน",
    "auth/network-request-failed": "เชื่อมต่อ Firebase ไม่สำเร็จ ลองใหม่อีกครั้ง",
    "auth/operation-not-allowed":
      "Firebase ตอบว่า Password login ถูกปิดอยู่ กรุณาเปิด Authentication > Sign-in method > Email/Password toggle แรก",
    "auth/password-mismatch": "รหัสผ่านกับยืนยันรหัสผ่านไม่ตรงกัน",
    "auth/too-many-requests": "ส่งหลายครั้งเกินไป รอสักครู่แล้วลองใหม่",
    "auth/user-not-found": "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
    "auth/weak-password": "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร",
    "auth/wrong-password": "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
    generic: "เกิดข้อผิดพลาด",
  },
  en: {
    "auth/account-exists-with-different-credential":
      "This email already has an account. Please log in with the original method.",
    "auth/configuration-not-found":
      "Firebase Authentication is not enabled for this project yet.",
    "auth/email-already-in-use": "This email is already registered.",
    "auth/invalid-credential": "The email or password is incorrect.",
    "auth/invalid-email": "The email format is invalid.",
    "auth/missing-email": "Please enter your email first.",
    "auth/network-request-failed": "Could not connect to Firebase. Try again.",
    "auth/operation-not-allowed":
      "Firebase says password login is disabled. Enable Authentication > Sign-in method > Email/Password.",
    "auth/password-mismatch": "Password and confirmation do not match.",
    "auth/too-many-requests": "Too many attempts. Please wait and try again.",
    "auth/user-not-found": "The email or password is incorrect.",
    "auth/weak-password": "Password must be at least 6 characters.",
    "auth/wrong-password": "The email or password is incorrect.",
    generic: "Something went wrong",
  },
};

function createAuthError(code: string) {
  const error = new Error(code) as Error & { code: string };
  error.code = code;
  return error;
}

function getAuthErrorCode(error: unknown) {
  return typeof error === "object" && error && "code" in error
    ? String((error as { code?: string }).code)
    : error instanceof Error && error.message.startsWith("auth/")
      ? error.message
      : "";
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function validateEmail(email: string) {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw createAuthError("auth/invalid-email");
  }
}

function getDisplayNameFromEmail(email: string) {
  return email.split("@")[0] || "Calculo";
}

export function getDisplayNameFromUser(user: User | null) {
  if (!user) {
    return "";
  }

  return user.displayName || user.email?.split("@")[0] || "";
}

export function watchAuthUser(callback: (user: AuthUser) => void) {
  return onAuthStateChanged(getFirebaseAuth(), callback);
}

export function watchAppAuthUser(callback: (user: AuthUser) => void) {
  return onAuthStateChanged(getAppFirebaseAuth(), callback);
}

export async function signUpWithEmail(
  email: string,
  password: string,
  confirmPassword: string,
) {
  const normalizedEmail = normalizeEmail(email);
  validateEmail(normalizedEmail);

  if (password !== confirmPassword) {
    throw createAuthError("auth/password-mismatch");
  }

  const credential = await createUserWithEmailAndPassword(
    getFirebaseAuth(),
    normalizedEmail,
    password,
  );

  await updateProfile(credential.user, {
    displayName: getDisplayNameFromEmail(normalizedEmail),
  });

  return credential.user;
}

export async function loginWithEmail(email: string, password: string) {
  const normalizedEmail = normalizeEmail(email);
  validateEmail(normalizedEmail);

  const credential = await signInWithEmailAndPassword(
    getFirebaseAuth(),
    normalizedEmail,
    password,
  );

  return credential.user;
}

export async function loginAnonymously() {
  const credential = await signInAnonymously(getFirebaseAuth());
  return credential.user;
}

export async function loginAppAnonymously() {
  const credential = await signInAnonymously(getAppFirebaseAuth());
  return credential.user;
}

export async function sendPasswordResetForEmailAccount(email: string) {
  const normalizedEmail = normalizeEmail(email);
  validateEmail(normalizedEmail);
  await sendPasswordResetEmail(getFirebaseAuth(), normalizedEmail);
}

export async function logout() {
  await signOut(getFirebaseAuth());
}

export function getAuthErrorMessage(error: unknown, language: Language = "th") {
  const code = getAuthErrorCode(error);
  const messages = AUTH_ERROR_MESSAGES[language];

  if (code && messages[code]) {
    return messages[code];
  }

  return error instanceof Error && !error.message.startsWith("auth/")
    ? error.message
    : messages.generic;
}
