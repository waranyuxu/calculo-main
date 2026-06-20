import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Mascot from "@/components/Mascot";
import SpeechBubble from "@/components/SpeechBubble";
import Button from "@/components/Button";
import { useAppTheme } from "@/constants/app-theme";
import { COLORS, FONTS } from "@/constants/calculo-theme";
import { useAuthUserId } from "@/hooks/use-auth-user-id";
import { useLanguage } from "@/i18n/language";
import { saveOnboardingPreferences } from "@/services/learning-state-service";
import { useState } from "react";

export default function MathPretestIntro() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { copy } = useLanguage();
  const userId = useAuthUserId();
  const [savingSkip, setSavingSkip] = useState(false);

  const handleSkip = async () => {
    if (savingSkip) {
      return;
    }

    setSavingSkip(true);

    try {
      await saveOnboardingPreferences(
        {
          completedAt: new Date().toISOString(),
          pretestSkipped: true,
        },
        userId,
      );
      router.replace("/home");
    } finally {
      setSavingSkip(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.surface }]}
      edges={["top", "bottom"]}
    >
      <View style={styles.topRow}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={[styles.back, { color: colors.gray }]}>←</Text>
        </Pressable>
      </View>

      <View style={styles.center}>
        <SpeechBubble>
          <Text style={[styles.bubbleText, { color: colors.text }]}>
            {copy.onboarding.pretestIntroPrefix}{" "}
            <Text style={styles.highlight}>
              {copy.onboarding.pretestIntroHighlight}
            </Text>{" "}
            {copy.onboarding.pretestIntroSuffix}
          </Text>
        </SpeechBubble>
        <View style={{ height: 12 }} />
        <Mascot size={140} variant="study" />
      </View>

      <View style={styles.buttons}>
        <Button
          label={copy.onboarding.startPretest}
          onPress={() => router.push("/math-pretest" as never)}
        />
        <Button
          label={copy.common.skipPretest}
          variant="secondary"
          disabled={savingSkip}
          onPress={handleSkip}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white, paddingHorizontal: 20 },
  topRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  backBtn: { paddingVertical: 8, width: 44 },
  back: { fontSize: 26 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  bubbleText: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    textAlign: "center",
    lineHeight: 23,
    maxWidth: 290,
  },
  highlight: { color: COLORS.purple, fontFamily: FONTS.extra },
  buttons: { gap: 12, paddingBottom: 16 },
});
