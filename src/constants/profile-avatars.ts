export type PlayerAvatarId =
  | "calc-sigma"
  | "calc-pi"
  | "calc-root"
  | "calc-delta"
  | "calc-infinity";

export type ProfileAvatarOption = {
  accent: string;
  background: string;
  border: string;
  foreground: string;
  id: PlayerAvatarId;
  label: {
    en: string;
    th: string;
  };
  symbol: string;
};

export const PROFILE_AVATAR_OPTIONS: ProfileAvatarOption[] = [
  {
    accent: "#8BE9FF",
    background: "#06364C",
    border: "#2ED3FF",
    foreground: "#EAF9FF",
    id: "calc-sigma",
    label: { en: "Sigma", th: "ซิกม่า" },
    symbol: "Σ",
  },
  {
    accent: "#FFE08A",
    background: "#4B3413",
    border: "#D9A21B",
    foreground: "#FFF7DF",
    id: "calc-pi",
    label: { en: "Pi", th: "พาย" },
    symbol: "π",
  },
  {
    accent: "#8DFFB1",
    background: "#123E2A",
    border: "#42D77D",
    foreground: "#E9FFF0",
    id: "calc-root",
    label: { en: "Root", th: "รูท" },
    symbol: "√",
  },
  {
    accent: "#D9A3FF",
    background: "#35214D",
    border: "#A16BFF",
    foreground: "#F6ECFF",
    id: "calc-delta",
    label: { en: "Delta", th: "เดลต้า" },
    symbol: "Δ",
  },
  {
    accent: "#FF9FC5",
    background: "#4D1D31",
    border: "#F35DA3",
    foreground: "#FFF0F7",
    id: "calc-infinity",
    label: { en: "Infinity", th: "อินฟินิตี้" },
    symbol: "∞",
  },
];

export const DEFAULT_PROFILE_AVATAR_ID: PlayerAvatarId =
  PROFILE_AVATAR_OPTIONS[0].id;

const profileAvatarIds = new Set<PlayerAvatarId>(
  PROFILE_AVATAR_OPTIONS.map((avatar) => avatar.id),
);

export function isProfileAvatarId(value: unknown): value is PlayerAvatarId {
  return typeof value === "string" && profileAvatarIds.has(value as PlayerAvatarId);
}

export function getProfileAvatarOption(
  avatarId: string | undefined,
): ProfileAvatarOption {
  return (
    PROFILE_AVATAR_OPTIONS.find((avatar) => avatar.id === avatarId) ??
    PROFILE_AVATAR_OPTIONS[0]
  );
}
