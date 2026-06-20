import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Mascot from "@/components/Mascot";
import SpeechBubble from "@/components/SpeechBubble";
import Button from "@/components/Button";
import { useAppTheme } from "@/constants/app-theme";
import { COLORS, FONTS } from "@/constants/calculo-theme";
import { useLanguage } from "@/i18n/language";

export default function Welcome() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { copy } = useLanguage();

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
            {copy.welcome.greeting}
          </Text>
        </SpeechBubble>
        <View style={{ height: 12 }} />
        <Mascot size={135} variant="smile" />
      </View>

      <View style={styles.buttons}>
        <Button
          label={copy.common.continue}
          onPress={() => router.push("/onboarding-questions-intro")}
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
  bubbleText: { fontFamily: FONTS.bold, fontSize: 17 },
  buttons: { paddingBottom: 16 },
});
