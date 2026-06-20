import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import ProgressBar from "@/components/ProgressBar";
import MascotHeader from "@/components/MascotHeader";
import Button from "@/components/Button";
import { useAppTheme } from "@/constants/app-theme";
import { COLORS, FONTS } from "@/constants/calculo-theme";
import { useAuthUserId } from "@/hooks/use-auth-user-id";
import { useLanguage } from "@/i18n/language";
import { saveOnboardingPreferences } from "@/services/learning-state-service";
import { useState } from "react";

export default function MathStudyRoutine() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { copy } = useLanguage();
  const userId = useAuthUserId();
  const [saving, setSaving] = useState(false);

  const handleContinue = async () => {
    if (saving) {
      return;
    }

    setSaving(true);

    try {
      await saveOnboardingPreferences({ studyRoutineSeen: true }, userId);
      router.push("/daily-math-goal");
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
        progress={0.55}
        onBack={() => router.back()}
      />
      <MascotHeader variant="cheer">
        <Text style={[styles.bubbleText, { color: colors.text }]}>
          {copy.onboarding.studyRoutinePrompt}
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
  bubbleText: { fontFamily: FONTS.bold, fontSize: 15 },
  buttons: { paddingBottom: 16 },
});
