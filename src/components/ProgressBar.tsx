import { Pressable, StyleSheet, Text, View } from "react-native";
import { COLORS } from "@/constants/calculo-theme";
import { useAppTheme } from "@/constants/app-theme";

export default function ProgressBar({
  progress,
  onBack,
}: {
  progress: number; // 0..1
  onBack?: () => void;
}) {
  const { colors } = useAppTheme();
  const pct = Math.max(0, Math.min(1, progress)) * 100;
  return (
    <View style={styles.row}>
      <Pressable onPress={onBack} hitSlop={12}>
        <Text style={[styles.back, { color: colors.gray }]}>←</Text>
      </Pressable>
      <View style={[styles.track, { backgroundColor: colors.grayBorder }]}>
        <View
          style={[
            styles.fill,
            { backgroundColor: colors.green, width: `${pct}%` },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 8 },
  back: { fontSize: 26, color: COLORS.gray },
  track: {
    flex: 1,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.grayBorder,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 8,
  },
});
