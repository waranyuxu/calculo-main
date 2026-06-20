import { useCallback, useMemo, type ReactNode } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { COLORS, FONTS } from "@/constants/calculo-theme";
import { useAppTheme } from "@/constants/app-theme";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function Button({
  label,
  icon,
  onPress,
  disabled = false,
  variant = "primary",
}: {
  label: string;
  icon?: ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary";
}) {
  const isSecondary = variant === "secondary";
  const { colors } = useAppTheme();
  const pressProgress = useMemo(() => new Animated.Value(0), []);
  const animatedStyle = useMemo(
    () => ({
      transform: [
        {
          translateY: pressProgress.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 3],
          }),
        },
        {
          scale: pressProgress.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 0.975],
          }),
        },
      ],
    }),
    [pressProgress],
  );

  const animatePress = useCallback(
    (toValue: number) => {
      if (disabled) {
        return;
      }

      Animated.spring(pressProgress, {
        friction: 7,
        tension: 260,
        toValue,
        useNativeDriver: true,
      }).start();
    },
    [disabled, pressProgress],
  );

  return (
    <AnimatedPressable
      onPressIn={() => animatePress(1)}
      onPressOut={() => animatePress(0)}
      onPress={disabled ? undefined : onPress}
      style={[
        styles.btn,
        {
          backgroundColor: colors.green,
          borderBottomColor: colors.greenDark,
        },
        isSecondary && styles.secondary,
        isSecondary && {
          backgroundColor: colors.card,
          borderColor: colors.grayBorder,
          borderBottomColor: colors.grayBorder,
        },
        disabled && {
          backgroundColor: colors.grayBorder,
          borderBottomColor: colors.grayDisabled,
        },
        animatedStyle,
      ]}
    >
      {icon ? <View style={styles.icon}>{icon}</View> : null}
      <Text
        style={[
          styles.text,
          { color: colors.surface },
          isSecondary && { color: colors.green },
          disabled && { color: colors.gray },
        ]}
      >
        {label}
      </Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    alignItems: "center",
    backgroundColor: COLORS.green,
    borderRadius: 16,
    paddingVertical: 15,
    borderBottomWidth: 4,
    borderBottomColor: COLORS.greenDark,
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
  },
  icon: { alignItems: "center", justifyContent: "center" },
  secondary: {
    borderWidth: 2,
    borderBottomWidth: 4,
  },
  text: {
    fontFamily: FONTS.extra,
    fontSize: 15,
    letterSpacing: 0.8,
  },
});
