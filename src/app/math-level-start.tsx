import Button from "@/components/Button";
import MascotHeader from "@/components/MascotHeader";
import OptionRow from "@/components/OptionRow";
import ProgressBar from "@/components/ProgressBar";
import { useAppTheme } from "@/constants/app-theme";
import { COLORS, FONTS } from "@/constants/calculo-theme";
import { useAuthUserId } from "@/hooks/use-auth-user-id";
import { useLanguage } from "@/i18n/language";
import { saveOnboardingPreferences } from "@/services/learning-state-service";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MathLevelStart() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { copy } = useLanguage();
  const userId = useAuthUserId();
  const [selected, setSelected] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleContinue = async () => {
    if (!selected || saving) {
      return;
    }

    setSaving(true);

    try {
      await saveOnboardingPreferences({ levelStart: selected }, userId);
      router.push("/math-pretest-intro");
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
        progress={0.85}
        onBack={() => router.back()}
      />
      <MascotHeader variant="study">
        <Text style={[styles.bubbleText, { color: colors.text }]}>
          {copy.onboarding.levelStartPrompt}
        </Text>
      </MascotHeader>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 16, paddingTop: 8 }}
        showsVerticalScrollIndicator={false}
      >
        {copy.onboarding.levelOptions.map((option) => (
          <OptionRow
            badge={option.badge}
            icon={option.icon}
            key={option.id}
            label={option.label}
            sublabel={option.sublabel}
            selected={selected === option.id}
            onPress={() => setSelected(option.id)}
          />
        ))}
      </ScrollView>

      <View style={styles.buttons}>
        <Button
          label={copy.common.continue}
          disabled={!selected || saving}
          onPress={handleContinue}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white, paddingHorizontal: 20 },
  bubbleText: { fontFamily: FONTS.bold, fontSize: 15 },
  buttons: { paddingBottom: 16, paddingTop: 4 },
});
