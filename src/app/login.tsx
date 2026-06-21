import AuthForm from "@/components/AuthForm";
import {
  getAuthErrorMessage,
  loginWithEmail,
} from "@/services/auth-service";
import { useLanguage } from "@/i18n/language";
import { useRouter } from "expo-router";

export default function Login() {
  const router = useRouter();
  const { copy, language } = useLanguage();
  const guestLabel =
    language === "th" ? "เล่นต่อแบบไม่ใช้บัญชี" : "Continue without an account";

  return (
    <AuthForm
      title={copy.auth.loginTitle}
      subtitle={copy.auth.loginSubtitle}
      submitLabel={copy.auth.loginSubmit}
      forgotPasswordLabel={copy.auth.forgotPassword}
      guestLabel={guestLabel}
      switchLabel={copy.auth.loginSwitch}
      switchActionLabel={copy.auth.signupSubmit}
      onBack={() => router.back()}
      onForgotPassword={() => router.push("/forgot-password")}
      onGuestSubmit={async () => {
        router.replace("/home");
      }}
      onSwitch={() => router.replace("/signup")}
      onSubmit={async (email, password) => {
        try {
          await loginWithEmail(email, password);
          router.replace("/home");
        } catch (error) {
          throw new Error(getAuthErrorMessage(error, language));
        }
      }}
    />
  );
}
