import Button from "@/components/Button";
import { useAppTheme } from "@/constants/app-theme";
import { COLORS, FONTS } from "@/constants/calculo-theme";
import { useLanguage } from "@/i18n/language";
import { isFirebaseAuthConfigured } from "@/services/firebase";
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

export default function AuthForm({
  title,
  subtitle,
  submitLabel,
  forgotPasswordLabel,
  guestLabel,
  switchLabel,
  switchActionLabel,
  showConfirmPassword = false,
  onBack,
  onForgotPassword,
  onGuestSubmit,
  onSubmit,
  onSwitch,
}: {
  title: string;
  subtitle: string;
  submitLabel: string;
  forgotPasswordLabel?: string;
  guestLabel?: string;
  switchLabel: string;
  switchActionLabel: string;
  showConfirmPassword?: boolean;
  onBack: () => void;
  onForgotPassword?: () => void;
  onGuestSubmit?: () => Promise<void>;
  onSubmit: (
    email: string,
    password: string,
    confirmPassword: string,
  ) => Promise<void>;
  onSwitch: () => void;
}) {
  const { colors } = useAppTheme();
  const { copy } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [guestLoading, setGuestLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError("");
    setLoading(true);

    try {
      await onSubmit(email, password, confirmPassword);
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : copy.common.genericError,
      );
    } finally {
      setLoading(false);
    }
  };

  const submitGuest = async () => {
    if (!onGuestSubmit) {
      return;
    }

    setError("");
    setGuestLoading(true);

    try {
      await onGuestSubmit();
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : copy.common.genericError,
      );
    } finally {
      setGuestLoading(false);
    }
  };

  const disabled =
    loading ||
    guestLoading ||
    !email.trim() ||
    password.length < 6 ||
    (showConfirmPassword && !confirmPassword) ||
    !isFirebaseAuthConfigured();
  const guestDisabled = loading || guestLoading || !isFirebaseAuthConfigured();

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
          <Pressable onPress={onBack} hitSlop={12} style={styles.backBtn}>
            <Text style={[styles.back, { color: colors.gray }]}>←</Text>
          </Pressable>
        </View>

        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.subtitle, { color: colors.textSoft }]}>
            {subtitle}
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

          <View style={styles.form}>
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
            <TextInput
              autoCapitalize="none"
              onChangeText={setPassword}
              placeholder={copy.common.passwordPlaceholder}
              placeholderTextColor={colors.gray}
              secureTextEntry
              style={[
                styles.input,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.grayBorder,
                  color: colors.text,
                },
              ]}
              value={password}
            />
            {onForgotPassword ? (
              <Pressable
                disabled={loading}
                hitSlop={8}
                onPress={onForgotPassword}
                style={styles.forgotPassword}
              >
                <Text
                  style={[
                    styles.forgotPasswordText,
                    { color: loading ? colors.gray : colors.blue },
                  ]}
                >
                  {forgotPasswordLabel}
                </Text>
              </Pressable>
            ) : null}
            {showConfirmPassword ? (
              <TextInput
                autoCapitalize="none"
                onChangeText={setConfirmPassword}
                placeholder={copy.common.confirmPasswordPlaceholder}
                placeholderTextColor={colors.gray}
                secureTextEntry
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.grayBorder,
                    color: colors.text,
                  },
                ]}
                value={confirmPassword}
              />
            ) : null}
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Button
            disabled={disabled}
            label={loading ? copy.common.loadingAction : submitLabel}
            onPress={submit}
          />

          {onGuestSubmit && guestLabel ? (
            <Button
              disabled={guestDisabled}
              label={guestLoading ? copy.common.loadingAction : guestLabel}
              onPress={submitGuest}
              variant="secondary"
            />
          ) : null}

          <View style={styles.switchRow}>
            <Text style={[styles.switchText, { color: colors.textSoft }]}>
              {switchLabel}
            </Text>
            <Pressable onPress={onSwitch} hitSlop={8}>
              <Text style={[styles.switchAction, { color: colors.blue }]}>
                {switchActionLabel}
              </Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
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
  form: { gap: 12 },
  input: {
    borderRadius: 14,
    borderWidth: 2,
    fontFamily: FONTS.bold,
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  errorText: { color: "#D23B2E", fontFamily: FONTS.bold, fontSize: 13 },
  forgotPassword: { alignSelf: "flex-end", marginTop: -4 },
  forgotPasswordText: { fontFamily: FONTS.extra, fontSize: 13 },
  switchRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
    justifyContent: "center",
    marginTop: 4,
  },
  switchText: { fontFamily: FONTS.bold, fontSize: 14 },
  switchAction: { fontFamily: FONTS.extra, fontSize: 14 },
  warning: {
    borderRadius: 12,
    borderWidth: 2,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  warningText: { fontFamily: FONTS.bold, fontSize: 13, lineHeight: 19 },
});
