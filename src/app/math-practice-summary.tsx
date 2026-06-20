import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import ProgressBar from "@/components/ProgressBar";
import MascotHeader from "@/components/MascotHeader";
import Button from "@/components/Button";
import { useAppTheme } from "@/constants/app-theme";
import { COLORS, FONTS } from "@/constants/calculo-theme";
import { useAuthUserId } from "@/hooks/use-auth-user-id";
import { useLanguage } from "@/i18n/language";
import { saveOnboardingPreferences } from "@/services/learning-state-service";
import { useState } from "react";

export default function MathPracticeSummary() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { copy, format } = useLanguage();
  const userId = useAuthUserId();
  const { dailyMinutes } = useLocalSearchParams<{ dailyMinutes?: string }>();
  const [saving, setSaving] = useState(false);
  const selectedMinutes = Number(dailyMinutes);
  const practiceQuestionCount =
    Number.isFinite(selectedMinutes) && selectedMinutes > 0
      ? selectedMinutes * 2
      : 20;

  const handleContinue = async () => {
    if (saving) {
      return;
    }

    setSaving(true);

    try {
      await saveOnboardingPreferences(
        {
          ...(Number.isFinite(selectedMinutes) && selectedMinutes > 0
            ? { dailyMinutes: selectedMinutes }
            : {}),
          practiceSummarySeen: true,
        },
        userId,
      );
      router.push("/math-home-widget");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.surface }]}
      edges={["top", "bottom"]}
    >
      <ProgressBar
        progress={0.65}
        onBack={() => router.back()}
      />
      <MascotHeader variant="study">
        <Text style={[styles.bubbleText, { color: colors.text }]}>
          {copy.onboarding.practiceSummaryPrefix}{" "}
          <Text style={styles.highlight}>
            {format(copy.onboarding.practiceSummaryHighlight, {
              count: practiceQuestionCount,
            })}
          </Text>{" "}
          {copy.onboarding.practiceSummarySuffix}
        </Text>
      </MascotHeader>

      <View style={{ flex: 1 }} />

      <View style={styles.buttons}>
        <Button
          label={copy.common.continue}
          disabled={saving}
          onPress={handleContinue}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white, paddingHorizontal: 20 },
  bubbleText: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    lineHeight: 22,
  },
  highlight: { color: COLORS.purple, fontFamily: FONTS.extra },
  buttons: { paddingBottom: 16 },
});
