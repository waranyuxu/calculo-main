import Button from "@/components/Button";
import { useAppTheme } from "@/constants/app-theme";
import { COLORS, FONTS } from "@/constants/calculo-theme";
import { useLanguage, type Language } from "@/i18n/language";
import {
  getAuthErrorMessage,
  sendPasswordResetForEmailAccount,
} from "@/services/auth-service";
import { isFirebaseAuthConfigured } from "@/services/firebase";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ForgotPassword() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { copy, format, language } = useLanguage();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sentEmail, setSentEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError("");
    setSentEmail("");
    setLoading(true);

    try {
      const normalizedEmail = email.trim().toLowerCase();
      await sendPasswordResetForEmailAccount(normalizedEmail);
      setSentEmail(normalizedEmail);
    } catch (resetError) {
      setError(getPasswordResetErrorMessage(resetError, language));
    } finally {
      setLoading(false);
    }
  };

  const disabled = loading || !email.trim() || !isFirebaseAuthConfigured();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.surface }]}
      edges={["top", "bottom"]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboard}
      >
        <View style={styles.topRow}>
          <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
            <Text style={[styles.back, { color: colors.gray }]}>←</Text>
          </Pressable>
        </View>

        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.text }]}>
            {copy.forgotPassword.title}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSoft }]}>
            {copy.forgotPassword.description}
          </Text>

          {!isFirebaseAuthConfigured() ? (
            <View
              style={[
                styles.warning,
                { backgroundColor: colors.blueLight, borderColor: colors.grayBorder },
              ]}
            >
              <Text style={[styles.warningText, { color: colors.text }]}>
                {copy.common.firebaseWarning}
              </Text>
            </View>
          ) : null}

          <TextInput
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            onChangeText={setEmail}
            placeholder={copy.common.emailPlaceholder}
            placeholderTextColor={colors.gray}
            style={[
              styles.input,
              {
                backgroundColor: colors.card,
                borderColor: colors.grayBorder,
                color: colors.text,
              },
            ]}
            value={email}
          />

          {sentEmail ? (
            <View
              style={[
                styles.successBox,
                { backgroundColor: colors.blueLight, borderColor: colors.blue },
              ]}
            >
              <Text style={[styles.successTitle, { color: colors.blueDark }]}>
                {copy.forgotPassword.sentTitle}
              </Text>
              <Text style={[styles.successText, { color: colors.text }]}>
                {format(copy.forgotPassword.sentDescription, { email: sentEmail })}
              </Text>
            </View>
          ) : null}

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Button
            disabled={disabled}
            label={
              loading ? copy.forgotPassword.submitting : copy.forgotPassword.submit
            }
            onPress={submit}
          />
          <Button
            label={copy.forgotPassword.backToLogin}
            variant="secondary"
            onPress={() => router.replace("/login")}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function getPasswordResetErrorMessage(error: unknown, language: Language) {
  const code =
    typeof error === "object" && error && "code" in error
      ? String((error as { code?: string }).code)
      : "";
  const copy = language === "en" ? "en" : "th";

  switch (code) {
    case "auth/user-not-found":
      return copy === "en"
        ? "We could not find that email."
        : "ไม่พบอีเมลนี้ในระบบ";
    case "auth/too-many-requests":
      return copy === "en"
        ? "Too many attempts. Please wait a moment and try again."
        : "ส่งหลายครั้งเกินไป รอสักครู่แล้วลองใหม่";
    default:
      return getAuthErrorMessage(error, language);
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white, paddingHorizontal: 20 },
  keyboard: { flex: 1 },
  topRow: { alignItems: "flex-start", paddingTop: 8 },
  backBtn: { paddingVertical: 8, width: 44 },
  back: { fontSize: 26 },
  content: { flex: 1, justifyContent: "center", gap: 16 },
  title: { fontFamily: FONTS.extra, fontSize: 30 },
  subtitle: { fontFamily: FONTS.bold, fontSize: 15, lineHeight: 22 },
  input: {
    borderRadius: 14,
    borderWidth: 2,
    fontFamily: FONTS.bold,
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  warning: {
    borderRadius: 12,
    borderWidth: 2,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  warningText: { fontFamily: FONTS.bold, fontSize: 13, lineHeight: 19 },
  successBox: {
    borderRadius: 14,
    borderWidth: 2,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  successTitle: { fontFamily: FONTS.extra, fontSize: 15 },
  successText: { fontFamily: FONTS.bold, fontSize: 13, lineHeight: 20, marginTop: 3 },
  errorText: { color: "#D23B2E", fontFamily: FONTS.bold, fontSize: 13 },
});
