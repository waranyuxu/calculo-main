import BottomTabs from "@/components/BottomTabs";
import { useAppTheme } from "@/constants/app-theme";
import { COLORS, FONTS } from "@/constants/calculo-theme";
import { LANGUAGE_OPTIONS, type Language, useLanguage } from "@/i18n/language";
import { useRouter } from "expo-router";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Settings() {
  const router = useRouter();
  const { colors, isDark, toggleTheme } = useAppTheme();
  const { copy, format, language, setLanguage } = useLanguage();
  const languageName =
    LANGUAGE_OPTIONS.find((option) => option.value === language)?.label ?? language;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.surface }]}
      edges={["top", "bottom"]}
    >
      <View style={styles.header}>
        <Pressable
          accessibilityLabel={copy.common.back}
          accessibilityRole="button"
          hitSlop={12}
          onPress={() => router.back()}
          style={styles.backBtn}
        >
          <Text style={[styles.back, { color: colors.gray }]}>←</Text>
        </Pressable>
        <Text style={[styles.title, { color: colors.text }]}>{copy.settings.title}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentInner}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.section,
            { backgroundColor: colors.card, borderColor: colors.grayBorder },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {copy.settings.languageTitle}
          </Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textSoft }]}>
            {copy.settings.languageSubtitle}
          </Text>
          <View
            style={[
              styles.segment,
              { backgroundColor: colors.surface, borderColor: colors.grayBorder },
            ]}
          >
            {LANGUAGE_OPTIONS.map((option) => {
              const selected = language === option.value;

              return (
                <Pressable
                  accessibilityRole="button"
                  key={option.value}
                  onPress={() => setLanguage(option.value as Language)}
                  style={[
                    styles.segmentOption,
                    selected && {
                      backgroundColor: colors.blue,
                      borderColor: colors.blueDark,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.segmentLabel,
                      { color: selected ? colors.surface : colors.text },
                    ]}
                  >
                    {option.label}
                  </Text>
                  <Text
                    style={[
                      styles.segmentSubLabel,
                      { color: selected ? colors.surface : colors.textSoft },
                    ]}
                  >
                    {option.nativeLabel}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <Text style={[styles.currentLanguage, { color: colors.textSoft }]}>
            {format(copy.settings.selectedLanguage, { language: languageName })}
          </Text>
        </View>

        <View
          style={[
            styles.section,
            { backgroundColor: colors.card, borderColor: colors.grayBorder },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {copy.settings.appearanceTitle}
          </Text>
          <View style={styles.settingRow}>
            <View style={styles.settingText}>
              <Text style={[styles.settingTitle, { color: colors.text }]}>
                {copy.settings.darkModeTitle}
              </Text>
              <Text style={[styles.sectionSubtitle, { color: colors.textSoft }]}>
                {copy.settings.darkModeSubtitle}
              </Text>
            </View>
            <Switch
              onValueChange={toggleTheme}
              thumbColor={COLORS.white}
              trackColor={{ false: colors.grayBorder, true: colors.blue }}
              value={isDark}
            />
          </View>
          <Text style={[styles.currentLanguage, { color: colors.textSoft }]}>
            {isDark ? copy.settings.enabled : copy.settings.disabled}
          </Text>
        </View>
      </ScrollView>

      <BottomTabs />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  back: { fontSize: 26 },
  backBtn: { paddingVertical: 8, width: 44 },
  container: { flex: 1, backgroundColor: COLORS.white },
  content: { flex: 1 },
  contentInner: {
    gap: 14,
    paddingBottom: 116,
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  currentLanguage: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    marginTop: 12,
  },
  header: {
    alignItems: "center",
    borderBottomColor: COLORS.grayBorder,
    borderBottomWidth: 1,
    flexDirection: "row",
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  headerSpacer: { width: 44 },
  section: {
    borderRadius: 14,
    borderWidth: 2,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sectionSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  sectionTitle: { fontFamily: FONTS.extra, fontSize: 19 },
  segment: {
    borderRadius: 14,
    borderWidth: 2,
    flexDirection: "row",
    gap: 8,
    marginTop: 14,
    padding: 6,
  },
  segmentLabel: { fontFamily: FONTS.extra, fontSize: 15 },
  segmentOption: {
    alignItems: "center",
    borderColor: "transparent",
    borderRadius: 10,
    borderWidth: 2,
    flex: 1,
    minHeight: 58,
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  segmentSubLabel: { fontFamily: FONTS.bold, fontSize: 12, marginTop: 2 },
  settingRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 14,
    marginTop: 12,
  },
  settingText: { flex: 1 },
  settingTitle: { fontFamily: FONTS.extra, fontSize: 16 },
  title: {
    flex: 1,
    fontFamily: FONTS.extra,
    fontSize: 22,
    textAlign: "center",
  },
});
