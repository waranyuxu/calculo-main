import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import ProgressBar from "@/components/ProgressBar";
import MascotHeader from "@/components/MascotHeader";
import OptionRow from "@/components/OptionRow";
import Button from "@/components/Button";
import { useAppTheme } from "@/constants/app-theme";
import { COLORS, FONTS } from "@/constants/calculo-theme";
import { useAuthUserId } from "@/hooks/use-auth-user-id";
import { useLanguage } from "@/i18n/language";
import { saveOnboardingPreferences } from "@/services/learning-state-service";

export default function DailyMathGoal() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { copy } = useLanguage();
  const userId = useAuthUserId();
  const [selected, setSelected] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleContinue = async () => {
    const dailyMinutes = Number(selected);
    if (!selected || saving || !Number.isFinite(dailyMinutes)) {
      return;
    }

    setSaving(true);

    try {
      await saveOnboardingPreferences({ dailyMinutes }, userId);
      router.push({
        pathname: "/math-practice-summary",
        params: { dailyMinutes: selected },
      });
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
        progress={0.6}
        onBack={() => router.back()}
      />
      <MascotHeader variant="cheer">
        <Text style={[styles.bubbleText, { color: colors.text }]}>
          {copy.onboarding.dailyGoalQuestion}
        </Text>
      </MascotHeader>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {copy.onboarding.dailyGoals.map((g) => (
          <OptionRow
            key={g.id}
            label={g.label}
            rightText={g.right}
            selected={selected === g.id}
            onPress={() => setSelected(g.id)}
          />
        ))}
      </ScrollView>

      <View style={styles.buttons}>
        <Button
          label={
            selected === "30" ? copy.onboarding.intenseCommitment : copy.common.continue
          }
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
