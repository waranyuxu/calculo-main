import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import ProgressBar from "@/components/ProgressBar";
import MascotHeader from "@/components/MascotHeader";
import Button from "@/components/Button";
import Mascot from "@/components/Mascot";
import { useAppTheme } from "@/constants/app-theme";
import { COLORS, FONTS } from "@/constants/calculo-theme";
import { useAuthUserId } from "@/hooks/use-auth-user-id";
import { useLanguage } from "@/i18n/language";
import { saveOnboardingPreferences } from "@/services/learning-state-service";
import { useState } from "react";

export default function MathHomeWidget() {
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
      await saveOnboardingPreferences({ homeWidgetSeen: true }, userId);
      router.push("/math-level-start");
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
        progress={0.75}
        onBack={() => router.back()}
      />
      <MascotHeader variant="float">
        <Text style={[styles.bubbleText, { color: colors.text }]}>
          {copy.onboarding.homeWidgetPrompt}
        </Text>
      </MascotHeader>

      <View style={styles.illustration}>
        <View
          style={[
            styles.phone,
            { backgroundColor: colors.card, borderColor: colors.grayBorder },
          ]}
        >
          <View style={[styles.speaker, { backgroundColor: colors.grayBorder }]} />
          <View style={[styles.widget, { backgroundColor: colors.blue }]}>
            <View style={styles.widgetCopy}>
              <Text style={[styles.widgetTitle, { color: colors.surface }]}>
                Calculo
              </Text>
              <Text style={[styles.widgetMath, { color: colors.surface }]}>
                {copy.onboarding.widgetMath}
              </Text>
            </View>
            <View style={styles.widgetMascot}>
              <Mascot size={64} variant="cheer" animated={false} />
            </View>
          </View>
          <View style={styles.appRow}>
            <View style={[styles.appDot, { backgroundColor: colors.grayBorder }]} />
            <View style={[styles.appDot, { backgroundColor: colors.grayBorder }]} />
            <View style={[styles.appDot, { backgroundColor: colors.grayBorder }]} />
          </View>
        </View>
      </View>

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
  illustration: { flex: 1, alignItems: "center", justifyContent: "center" },
  phone: {
    width: 214,
    height: 294,
    borderRadius: 28,
    borderWidth: 6,
    borderColor: "#D6E4EA",
    backgroundColor: "#F7FBFC",
    padding: 16,
    alignItems: "center",
  },
  speaker: {
    width: 54,
    height: 6,
    borderRadius: 999,
    marginBottom: 18,
  },
  widget: {
    width: 154,
    height: 132,
    borderRadius: 22,
    backgroundColor: COLORS.blue,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    padding: 14,
  },
  widgetCopy: { alignItems: "flex-start", alignSelf: "stretch" },
  widgetTitle: { fontFamily: FONTS.extra, fontSize: 16 },
  widgetMath: { fontFamily: FONTS.extra, fontSize: 23, marginTop: 2 },
  widgetMascot: {
    bottom: -4,
    position: "absolute",
    right: 8,
  },
  appRow: { flexDirection: "row", gap: 14, marginTop: 28 },
  appDot: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#E3EEF2",
  },
  buttons: { paddingBottom: 16 },
});
