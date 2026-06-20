import { useEffect } from "react";
import { Image, ImageSourcePropType, StyleSheet } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

export type MascotVariant = "smile" | "sad" | "study" | "cheer" | "float";

const MASCOTS: Record<MascotVariant, ImageSourcePropType> = {
  smile: require("../../assets/images/mascots/mascot-smile-transparent.png"),
  sad: require("../../assets/images/mascots/mascot-sad-transparent.png"),
  study: require("../../assets/images/mascots/mascot-study-transparent.png"),
  cheer: require("../../assets/images/mascots/mascot-cheer-transparent.png"),
  float: require("../../assets/images/mascots/mascot-float-transparent.png"),
};

export default function Mascot({
  size = 120,
  variant = "smile",
  animated = true,
}: {
  size?: number;
  variant?: MascotVariant;
  animated?: boolean;
}) {
  const motion = useSharedValue(0);

  useEffect(() => {
    if (!animated) {
      motion.value = 0;
      return;
    }

    motion.value = withRepeat(
      withSequence(
        withTiming(1, {
          duration: variant === "cheer" ? 520 : 900,
          easing: Easing.inOut(Easing.quad),
        }),
        withTiming(0, {
          duration: variant === "cheer" ? 520 : 900,
          easing: Easing.inOut(Easing.quad),
        }),
      ),
      -1,
      false,
    );
  }, [animated, motion, variant]);

  const animatedStyle = useAnimatedStyle(() => {
    const bounce = variant === "cheer" ? 8 : 5;
    const tilt = variant === "sad" ? -2 : 2.5;
    const scale = variant === "cheer" ? 0.035 : 0.018;

    return {
      transform: [
        { translateY: -bounce * motion.value },
        { rotate: `${(motion.value - 0.5) * tilt}deg` },
        { scale: 1 + scale * motion.value },
      ],
    };
  });

  return (
    <Animated.View style={[styles.wrap, { width: size, height: size }, animatedStyle]}>
      <Image source={MASCOTS[variant]} style={styles.image} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", justifyContent: "center" },
  image: { height: "100%", resizeMode: "contain", width: "100%" },
});
