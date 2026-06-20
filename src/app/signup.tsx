import AuthForm from "@/components/AuthForm";
import {
  getDisplayNameFromUser,
  getAuthErrorMessage,
  loginAnonymously,
  signUpWithEmail,
} from "@/services/auth-service";
import { savePlayerProfile } from "@/services/profile-service";
import { useLanguage } from "@/i18n/language";
import { useRouter } from "expo-router";

export default function Signup() {
  const router = useRouter();
  const { copy, language } = useLanguage();
  const guestLabel =
    language === "th" ? "เล่นต่อแบบไม่ใช้บัญชี" : "Continue without an account";

  return (
    <AuthForm
      title={copy.auth.signupTitle}
      subtitle={copy.auth.signupSubtitle}
      submitLabel={copy.auth.signupSubmit}
      guestLabel={guestLabel}
      switchLabel={copy.auth.signupSwitch}
      switchActionLabel={copy.auth.loginSubmit}
      showConfirmPassword
      onBack={() => router.back()}
      onGuestSubmit={async () => {
        try {
          await loginAnonymously();
          router.replace("/home");
        } catch (error) {
          throw new Error(getAuthErrorMessage(error, language));
        }
      }}
      onSwitch={() => router.replace("/login")}
      onSubmit={async (email, password, confirmPassword) => {
        try {
          const user = await signUpWithEmail(
            email,
            password,
            confirmPassword,
          );
          try {
            await savePlayerProfile(user, {
              displayName: getDisplayNameFromUser(user),
            });
          } catch {
            // Auth is already created; profile economy fields will sync later.
          }
          router.replace("/home");
        } catch (error) {
          throw new Error(getAuthErrorMessage(error, language));
        }
      }}
    />
  );
}
