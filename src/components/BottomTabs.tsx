import { useAppTheme } from "@/constants/app-theme";
import { COLORS, FONTS } from "@/constants/calculo-theme";
import { useLanguage } from "@/i18n/language";
import { usePathname, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function BottomTabs() {
  const router = useRouter();
  const pathname = usePathname();
  const { colors } = useAppTheme();
  const { copy, language } = useLanguage();
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 8);
  const tabs = [
    { href: "/home", icon: "⌂", label: copy.tabs.home },
    {
      href: "/competition",
      icon: "⚡",
      label: language === "th" ? "ข้อสอบ" : "Exam",
    },
    {
      href: "/math-adventure",
      icon: "∑",
      label: language === "th" ? "ผจญภัย" : "Quest",
    },
    {
      href: "/leaderboard",
      icon: "🏆",
      label: language === "th" ? "อันดับ" : "Board",
    },
    { href: "/settings", icon: "⚙", label: copy.tabs.settings },
    { href: "/profile", icon: "•••", label: copy.tabs.profile, dots: true },
  ];

  return (
    <View
      style={[
        styles.bottomTabs,
        {
          backgroundColor: colors.card,
          borderTopColor: colors.grayBorder,
          minHeight: 74 + bottomInset,
          paddingBottom: bottomInset,
        },
      ]}
    >
      {tabs.map((tab) => {
        const active = pathname === tab.href;

        return (
          <Pressable
            accessibilityLabel={tab.label}
            accessibilityRole="button"
            key={tab.href}
            onPress={() => {
              if (!active) {
                router.push(tab.href as never);
              }
            }}
            style={[
              styles.tabButton,
              active && styles.tabButtonActive,
              active && { borderColor: colors.blue },
            ]}
          >
            <Text
              style={[
                tab.dots ? styles.profileDots : styles.tabIcon,
                { color: active ? colors.blue : tab.dots ? colors.purple : colors.gray },
              ]}
            >
              {tab.icon}
            </Text>
            <Text
              style={[styles.tabText, { color: active ? colors.blue : colors.gray }]}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bottomTabs: {
    alignItems: "center",
    borderTopWidth: 1,
    bottom: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    left: 0,
    paddingHorizontal: 8,
    paddingTop: 8,
    position: "absolute",
    right: 0,
  },
  profileDots: { fontFamily: FONTS.extra, fontSize: 28, lineHeight: 30 },
  tabButton: {
    alignItems: "center",
    borderColor: "transparent",
    borderRadius: 10,
    borderWidth: 2,
    gap: 2,
    height: 58,
    justifyContent: "center",
    minWidth: 50,
    paddingHorizontal: 4,
  },
  tabButtonActive: { backgroundColor: COLORS.blueLight },
  tabIcon: { fontFamily: FONTS.extra, fontSize: 23, lineHeight: 27 },
  tabText: { fontFamily: FONTS.extra, fontSize: 10 },
});
