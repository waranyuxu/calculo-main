import { FONTS } from "@/constants/calculo-theme";
import { getProfileAvatarOption } from "@/constants/profile-avatars";
import { Image } from "expo-image";
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";

type ProfileAvatarProps = {
  avatarId?: string;
  borderColor?: string;
  name: string;
  photoURL?: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
};

export default function ProfileAvatar({
  avatarId,
  borderColor,
  name,
  photoURL,
  size = 72,
  style,
}: ProfileAvatarProps) {
  const avatar = getProfileAvatarOption(avatarId);
  const initial = name.trim().slice(0, 1).toUpperCase() || avatar.symbol;
  const hasRemotePhoto =
    typeof photoURL === "string" &&
    photoURL.trim().length > 0 &&
    !photoURL.startsWith("preset:");

  return (
    <View
      style={[
        styles.avatar,
        {
          backgroundColor: avatar.background,
          borderColor: borderColor ?? avatar.border,
          borderRadius: size / 2,
          height: size,
          width: size,
        },
        style,
      ]}
    >
      {hasRemotePhoto ? (
        <Image
          contentFit="cover"
          source={{ uri: photoURL }}
          style={styles.image}
        />
      ) : (
        <>
          <View
            style={[
              styles.accent,
              {
                backgroundColor: avatar.accent,
                borderRadius: size * 0.22,
                height: size * 0.44,
                right: -size * 0.08,
                top: -size * 0.08,
                width: size * 0.44,
              },
            ]}
          />
          <Text
            adjustsFontSizeToFit
            numberOfLines={1}
            style={[
              styles.symbol,
              {
                color: avatar.foreground,
                fontSize: size * 0.43,
                lineHeight: size * 0.5,
              },
            ]}
          >
            {avatar.symbol || initial}
          </Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  accent: {
    opacity: 0.35,
    position: "absolute",
  },
  avatar: {
    alignItems: "center",
    borderWidth: 3,
    justifyContent: "center",
    overflow: "hidden",
  },
  image: {
    height: "100%",
    width: "100%",
  },
  symbol: {
    fontFamily: FONTS.extra,
    textAlign: "center",
  },
});
