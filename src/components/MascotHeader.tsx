import { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import Mascot, { type MascotVariant } from "./Mascot";
import SpeechBubble from "./SpeechBubble";

export default function MascotHeader({
  children,
  variant = "smile",
}: {
  children: ReactNode;
  variant?: MascotVariant;
}) {
  return (
    <View style={styles.row}>
      <Mascot size={72} variant={variant} />
      <View style={styles.bubble}>
        <SpeechBubble tail="left">{children}</SpeechBubble>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    marginBottom: 18,
  },
  bubble: { flex: 1, marginLeft: 4 },
});
