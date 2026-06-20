import { Pressable, StyleSheet, Text, View } from "react-native";
import { COLORS, FONTS } from "@/constants/calculo-theme";
import { useAppTheme } from "@/constants/app-theme";

export default function OptionRow({
  icon,
  label,
  sublabel,
  rightText,
  badge,
  selected = false,
  checkbox = false,
  onPress,
}: {
  icon?: string;
  label: string;
  sublabel?: string;
  rightText?: string;
  badge?: string;
  selected?: boolean;
  checkbox?: boolean;
  onPress?: () => void;
}) {
  const { colors } = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.row,
        {
          backgroundColor: colors.card,
          borderColor: colors.grayBorder,
        },
        selected && {
          backgroundColor: colors.blueLight,
          borderColor: colors.blue,
        },
      ]}
    >
      {badge ? (
        <View style={[styles.badge, { backgroundColor: colors.blue }]}>
          <Text style={[styles.badgeText, { color: colors.surface }]}>
            {badge}
          </Text>
        </View>
      ) : null}

      {icon ? <Text style={styles.icon}>{icon}</Text> : null}

      <View style={styles.textWrap}>
        <Text
          style={[
            styles.label,
            { color: colors.text },
            selected && { color: colors.blue },
          ]}
        >
          {label}
        </Text>
        {sublabel ? (
          <Text style={[styles.sublabel, { color: colors.gray }]}>
            {sublabel}
          </Text>
        ) : null}
      </View>

      {rightText ? (
        <Text
          style={[
            styles.rightText,
            { color: colors.gray },
            selected && { color: colors.blue },
          ]}
        >
          {rightText}
        </Text>
      ) : null}

      {checkbox ? (
        <View
          style={[
            styles.checkbox,
            { borderColor: colors.grayBorder },
            selected && {
              backgroundColor: colors.blue,
              borderColor: colors.blue,
            },
          ]}
        >
          {selected ? (
            <Text style={[styles.check, { color: colors.surface }]}>✓</Text>
          ) : null}
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.grayBorder,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  icon: { fontSize: 22, marginRight: 12 },
  textWrap: { flex: 1 },
  label: { fontFamily: FONTS.bold, fontSize: 16 },
  sublabel: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    marginTop: 2,
  },
  rightText: { fontFamily: FONTS.bold, fontSize: 14 },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  check: { fontSize: 14, fontFamily: FONTS.extra },
  badge: {
    position: "absolute",
    top: -10,
    right: 12,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: { fontFamily: FONTS.extra, fontSize: 11 },
});
