import { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { COLORS } from "@/constants/calculo-theme";
import { useAppTheme } from "@/constants/app-theme";

export default function SpeechBubble({
  children,
  tail = "bottom",
}: {
  children: ReactNode;
  tail?: "bottom" | "left";
}) {
  const { colors } = useAppTheme();
  const bubbleStyle = {
    backgroundColor: colors.card,
    borderColor: colors.grayBorder,
  };

  if (tail === "left") {
    return (
      <View style={styles.rowWrap}>
        <View style={[styles.tailLeft, bubbleStyle]} />
        <View style={[styles.bubble, bubbleStyle, { flex: 1 }]}>
          {children}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.centerWrap}>
      <View style={[styles.bubble, bubbleStyle]}>{children}</View>
      <View style={[styles.tailBottom, bubbleStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  centerWrap: { alignItems: "center" },
  rowWrap: { flexDirection: "row", alignItems: "center" },
  bubble: {
    borderWidth: 2,
    borderColor: COLORS.grayBorder,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: COLORS.white,
  },
  tailBottom: {
    width: 16,
    height: 16,
    backgroundColor: COLORS.white,
    borderRightWidth: 2,
    borderBottomWidth: 2,
    borderColor: COLORS.grayBorder,
    transform: [{ rotate: "45deg" }],
    marginTop: -9,
  },
  tailLeft: {
    width: 16,
    height: 16,
    backgroundColor: COLORS.white,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: COLORS.grayBorder,
    transform: [{ rotate: "45deg" }],
    marginRight: -9,
    zIndex: 1,
  },
});
