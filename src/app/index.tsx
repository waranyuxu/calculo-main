import Button from "@/components/Button";
import Mascot from "@/components/Mascot";
import { useAppTheme } from "@/constants/app-theme";
import { COLORS, FONTS } from "@/constants/calculo-theme";
import { useLanguage } from "@/i18n/language";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const router = useRouter();
  const { colors, isDark, toggleTheme } = useAppTheme();
  const { copy } = useLanguage();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.surface }]}
      edges={["top", "bottom"]}
    >
      <View style={styles.topBar}>
        <Pressable
          accessibilityLabel={
            isDark ? copy.landing.switchToLight : copy.landing.switchToDark
          }
          accessibilityRole="button"
          onPress={toggleTheme}
          style={[
            styles.themeToggle,
            {
              backgroundColor: isDark ? colors.blueLight : colors.card,
              borderColor: colors.grayBorder,
            },
          ]}
        >
          <Text style={[styles.themeIcon, { color: colors.blue }]}>
            {isDark ? "☀" : "☾"}
          </Text>
          <Text style={[styles.themeText, { color: colors.text }]}>
            {isDark ? copy.landing.light : copy.landing.dark}
          </Text>
        </Pressable>
      </View>
      <View style={styles.center}>
        <Mascot size={230} variant="float" />
        <Text style={[styles.logo, { color: colors.blue }]}>Calculo</Text>
        <Text style={[styles.subtitle, { color: colors.textSoft }]}>
          {copy.landing.subtitle}
        </Text>
      </View>

      <View style={styles.buttons}>
        <Button label={copy.landing.start} onPress={() => router.push("/welcome")} />
        <Button
          label={copy.landing.haveAccount}
          variant="secondary"
          onPress={() => router.push("/login")}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white, paddingHorizontal: 20 },
  topBar: { alignItems: "flex-end", paddingTop: 8 },
  themeToggle: {
    alignItems: "center",
    borderRadius: 18,
    borderWidth: 2,
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  themeIcon: { fontFamily: FONTS.extra, fontSize: 16 },
  themeText: { fontFamily: FONTS.extra, fontSize: 12, letterSpacing: 0.8 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  logo: {
    fontFamily: FONTS.extra,
    fontSize: 40,
    color: COLORS.green,
    letterSpacing: -1,
    marginTop: 10,
  },
  subtitle: {
    fontFamily: FONTS.bold,
    fontSize: 17,
    color: COLORS.gray,
    marginTop: 10,
  },
  buttons: { paddingBottom: 16, gap: 14 },
});
