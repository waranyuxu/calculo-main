// สี + ฟอนต์ ใช้ร่วมทั้งแอป แก้ที่นี่ที่เดียว
export const COLORS = {
  green: "#12B8F6",
  greenDark: "#0784C3",
  blue: "#12B8F6",
  blueDark: "#086FA8",
  blueLight: "#DDF6FF",
  aqua: "#5DE1FF",
  gray: "#9AA9B5",
  grayBorder: "#DDEBF2",
  grayDisabled: "#C7D8E2",
  text: "#234052",
  textSoft: "#607684",
  purple: "#CE82FF",
  white: "#FFFFFF",
};

export const DARK_COLORS = {
  ...COLORS,
  green: "#2ED3FF",
  greenDark: "#0791D8",
  blue: "#2ED3FF",
  blueDark: "#8FE9FF",
  blueLight: "#073349",
  aqua: "#68E8FF",
  gray: "#8CA6B6",
  grayBorder: "#1D465B",
  grayDisabled: "#244456",
  text: "#EAF9FF",
  textSoft: "#A8C2D0",
  purple: "#D9A3FF",
  white: "#071B2A",
  surface: "#0B2435",
  card: "#102F43",
};

export const LIGHT_COLORS = {
  ...COLORS,
  surface: COLORS.white,
  card: COLORS.white,
};

export const FONTS = {
  regular: "Nunito_400Regular",
  bold: "Nunito_700Bold",
  extra: "Nunito_800ExtraBold",
};
