import BottomTabs from "@/components/BottomTabs";
import Button from "@/components/Button";
import ProfileAvatar from "@/components/ProfileAvatar";
import { useAppTheme } from "@/constants/app-theme";
import { COLORS, FONTS } from "@/constants/calculo-theme";
import {
  DEFAULT_PROFILE_AVATAR_ID,
  PROFILE_AVATAR_OPTIONS,
  type PlayerAvatarId,
} from "@/constants/profile-avatars";
import { useLanguage } from "@/i18n/language";
import {
  getDisplayNameFromUser,
  logout,
  watchAuthUser,
  type AuthUser,
} from "@/services/auth-service";
import {
  getCompetitionRank,
  watchPlayerLeaderboardEntry,
  type CompetitionLeaderboardEntry,
} from "@/services/competition-service";
import {
  savePlayerProfile,
  watchPlayerProfile,
  type PlayerProfile,
} from "@/services/profile-service";
import {
  getStudyReminderEnabled,
  isStudyReminderSupported,
  setStudyReminderEnabled,
  STUDY_REMINDER_MESSAGE,
} from "@/services/study-reminder-service";
import {
  DEFAULT_MATH_PROGRESS,
  loadMathProgress,
  watchMathProgress,
  type MathProgress,
} from "@/utils/math-progress-storage";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const PROFILE_COPY = {
  th: {
    avatarSaveError: "บันทึกโปรไฟล์ไม่สำเร็จ ลองใหม่อีกครั้ง",
    chooseAvatar: "เลือกโปรไฟล์",
    saveName: "บันทึกชื่อ",
    selectedAvatar: "เลือกแล้ว",
    choosePhoto: "เลือกรูปโปรไฟล์",
    editNamePlaceholder: "ชื่อผู้เล่น",
    imagePermission: "ต้องอนุญาตให้เข้าถึงรูปภาพก่อนเลือกรูปโปรไฟล์",
    notificationDescription: `แจ้งทุก 10 นาทีว่า "${STUDY_REMINDER_MESSAGE}"`,
    notificationOff: "ปิดอยู่",
    notificationOn: "เปิดอยู่",
    notificationPermission: "ต้องอนุญาตการแจ้งเตือนก่อนเปิดใช้งาน",
    notificationTitle: "แจ้งเตือนเรียนคณิต",
    notificationUnsupported: "การแจ้งเตือนใช้ได้บนแอปมือถือ",
    profileSide: "โปรไฟล์",
    rankSide: "แรงค์",
    saving: "กำลังบันทึก...",
    trophies: "ถ้วย",
    uploadError: "อัปโหลดรูปไม่สำเร็จ ตรวจ Firebase Storage rules แล้วลองใหม่",
    uploadPhoto: "อัปโหลดรูป",
    wins: "ชนะ",
  },
  en: {
    avatarSaveError: "Could not save this profile. Try again.",
    chooseAvatar: "Choose profile",
    saveName: "Save name",
    selectedAvatar: "Selected",
    choosePhoto: "Choose profile photo",
    editNamePlaceholder: "Player name",
    imagePermission: "Allow photo access before choosing a profile image.",
    notificationDescription: `Notify every 10 minutes: "${STUDY_REMINDER_MESSAGE}"`,
    notificationOff: "Off",
    notificationOn: "On",
    notificationPermission: "Allow notifications before turning this on.",
    notificationTitle: "Math study reminder",
    notificationUnsupported: "Notifications are available in the mobile app.",
    profileSide: "Profile",
    rankSide: "Rank",
    saving: "Saving...",
    trophies: "cups",
    uploadError: "Could not upload the photo. Check Firebase Storage rules.",
    uploadPhoto: "Upload photo",
    wins: "wins",
  },
} as const;

function createEmptyLeaderboardEntry(
  userId: string,
  playerName: string,
): CompetitionLeaderboardEntry {
  return {
    avatarId: DEFAULT_PROFILE_AVATAR_ID,
    id: userId,
    playerId: userId,
    playerName,
    photoURL: "",
    rank: getCompetitionRank(0),
    trophies: 0,
    wins: 0,
  };
}

export default function Profile() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { copy, language } = useLanguage();
  const localCopy = PROFILE_COPY[language];
  const [authUser, setAuthUser] = useState<AuthUser>(null);
  const [error, setError] = useState("");
  const [leaderboardEntry, setLeaderboardEntry] =
    useState<CompetitionLeaderboardEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [nameDraft, setNameDraft] = useState("");
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    isStudyReminderSupported(),
  );
  const [notificationsSaving, setNotificationsSaving] = useState(false);
  const [mathProgress, setMathProgress] =
    useState<MathProgress>(DEFAULT_MATH_PROGRESS);
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [savingAvatar, setSavingAvatar] = useState(false);
  const [savingName, setSavingName] = useState(false);
  const savingNameRef = useRef(false);

  useEffect(() => {
    let mounted = true;

    try {
      const unsubscribe = watchAuthUser((user) => {
        if (!mounted) {
          return;
        }

        setAuthUser(user);
        setLoading(false);
      });

      return () => {
        mounted = false;
        unsubscribe();
      };
    } catch {
      void Promise.resolve().then(() => {
        if (mounted) {
          setLoading(false);
        }
      });

      return () => {
        mounted = false;
      };
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    void getStudyReminderEnabled()
      .then((enabled) => {
        if (mounted) {
          setNotificationsEnabled(enabled && isStudyReminderSupported());
        }
      })
      .catch(() => {
        if (mounted) {
          setNotificationsEnabled(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    let unsubscribeProgress: (() => void) | undefined;

    if (!authUser) {
      void Promise.resolve().then(() => {
        setProfile(null);
        setLeaderboardEntry(null);
        setMathProgress(DEFAULT_MATH_PROGRESS);
        setNameDraft("");
      });
      return () => {
        active = false;
      };
    }

    const fallbackName =
      getDisplayNameFromUser(authUser) || copy.profile.defaultUser;
    const unsubscribeProfile = watchPlayerProfile(
      authUser,
      (nextProfile) => {
        setProfile(nextProfile);
        setNameDraft(nextProfile.displayName);
      },
      () => {
        setProfile({
          avatarId: DEFAULT_PROFILE_AVATAR_ID,
          displayName: fallbackName,
          photoURL: "",
          userId: authUser.uid,
        });
        setNameDraft(fallbackName);
      },
    );
    const unsubscribeRank = watchPlayerLeaderboardEntry(
      authUser.uid,
      (entry) => setLeaderboardEntry(entry),
      () => setLeaderboardEntry(createEmptyLeaderboardEntry(authUser.uid, fallbackName)),
    );
    void loadMathProgress(authUser.uid)
      .then((nextProgress) => {
        if (active) {
          setMathProgress(nextProgress);
        }
      })
      .catch(() => {
        if (active) {
          setMathProgress(DEFAULT_MATH_PROGRESS);
        }
      });
    try {
      unsubscribeProgress = watchMathProgress(
        authUser.uid,
        (nextProgress) => {
          if (active) {
            setMathProgress(nextProgress);
          }
        },
        () => {
          if (active) {
            void loadMathProgress(authUser.uid)
              .then(setMathProgress)
              .catch(() => setMathProgress(DEFAULT_MATH_PROGRESS));
          }
        },
      );
    } catch {
      unsubscribeProgress = undefined;
    }

    return () => {
      active = false;
      unsubscribeProfile();
      unsubscribeRank();
      unsubscribeProgress?.();
    };
  }, [authUser, copy.profile.defaultUser]);

  const displayName = useMemo(
    () =>
      profile?.displayName ||
      getDisplayNameFromUser(authUser) ||
      copy.profile.defaultUser,
    [authUser, copy.profile.defaultUser, profile?.displayName],
  );
  const selectedAvatarId = profile?.avatarId ?? DEFAULT_PROFILE_AVATAR_ID;
  const rankEntry =
    leaderboardEntry ??
    (authUser ? createEmptyLeaderboardEntry(authUser.uid, displayName) : null);
  const rank = rankEntry?.rank ?? getCompetitionRank(0);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/home" as never);
    }
  };

  const handleSaveName = async () => {
    if (!authUser || !nameDraft.trim()) {
      return;
    }

    const nextDisplayName = nameDraft.trim();
    if (nextDisplayName === profile?.displayName || savingNameRef.current) {
      return;
    }

    setError("");
    savingNameRef.current = true;
    setSavingName(true);

    try {
      const nextProfile = await savePlayerProfile(authUser, {
        displayName: nextDisplayName,
      });
      setProfile(nextProfile);
    } catch {
      setError(copy.common.genericError);
    } finally {
      savingNameRef.current = false;
      setSavingName(false);
    }
  };

  const handleSelectAvatar = async (avatarId: PlayerAvatarId) => {
    if (!authUser || savingAvatar || avatarId === selectedAvatarId) {
      return;
    }

    setError("");
    setSavingAvatar(true);

    try {
      const nextProfile = await savePlayerProfile(authUser, {
        avatarId,
        photoURL: "",
      });
      setProfile(nextProfile);
    } catch {
      setError(localCopy.avatarSaveError);
    } finally {
      setSavingAvatar(false);
    }
  };

  const handleReminderToggle = async (enabled: boolean) => {
    if (notificationsSaving || !isStudyReminderSupported()) {
      return;
    }

    setError("");
    setNotificationsSaving(true);
    setNotificationsEnabled(enabled);

    try {
      const scheduled = await setStudyReminderEnabled(enabled);
      setNotificationsEnabled(scheduled);

      if (enabled && !scheduled) {
        setError(localCopy.notificationPermission);
      }
    } catch {
      setNotificationsEnabled(!enabled);
      setError(copy.common.genericError);
    } finally {
      setNotificationsSaving(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.surface }]}
      edges={["top", "bottom"]}
    >
      <View style={styles.topRow}>
        <Pressable onPress={handleBack} hitSlop={12} style={styles.backBtn}>
          <Text style={[styles.back, { color: colors.gray }]}>←</Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentInner}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View
            style={[
              styles.loadingCard,
              { backgroundColor: colors.card, borderColor: colors.grayBorder },
            ]}
          >
            <ActivityIndicator color={colors.blue} />
            <Text style={[styles.subtitle, { color: colors.textSoft }]}>
              {copy.profile.loading}
            </Text>
          </View>
        ) : authUser ? (
          <View style={styles.profileGrid}>
            <View
              style={[
                styles.panel,
                styles.profilePanel,
                { backgroundColor: colors.card, borderColor: colors.grayBorder },
              ]}
            >
              <Text style={[styles.panelTitle, { color: colors.text }]}>
                {localCopy.profileSide}
              </Text>
              <ProfileAvatar
                avatarId={selectedAvatarId}
                name={displayName}
                photoURL={profile?.photoURL}
                size={124}
                style={styles.avatarPreview}
              />
              <Text style={[styles.avatarSectionTitle, { color: colors.text }]}>
                {localCopy.chooseAvatar}
              </Text>
              <View style={styles.avatarGrid}>
                {PROFILE_AVATAR_OPTIONS.map((avatar) => {
                  const selected = avatar.id === selectedAvatarId;

                  return (
                    <Pressable
                      accessibilityRole="button"
                      disabled={savingAvatar}
                      key={avatar.id}
                      onPress={() => {
                        void handleSelectAvatar(avatar.id);
                      }}
                      style={({ pressed }) => [
                        styles.avatarChoice,
                        {
                          backgroundColor: selected
                            ? colors.blueLight
                            : colors.surface,
                          borderColor: selected ? colors.blue : colors.grayBorder,
                        },
                        pressed && !savingAvatar && styles.pressed,
                      ]}
                    >
                      <ProfileAvatar
                        avatarId={avatar.id}
                        borderColor={selected ? colors.blue : avatar.border}
                        name={displayName}
                        size={54}
                      />
                      <Text
                        numberOfLines={1}
                        style={[
                          styles.avatarChoiceText,
                          { color: selected ? colors.blue : colors.text },
                        ]}
                      >
                        {avatar.label[language]}
                      </Text>
                      {selected ? (
                        <Text
                          numberOfLines={1}
                          style={[
                            styles.avatarSelectedText,
                            { color: colors.textSoft },
                          ]}
                        >
                          {localCopy.selectedAvatar}
                        </Text>
                      ) : null}
                    </Pressable>
                  );
                })}
              </View>
              {savingAvatar ? (
                <Text style={[styles.savingText, { color: colors.textSoft }]}>
                  {localCopy.saving}
                </Text>
              ) : null}
              <TextInput
                editable={!savingName}
                onChangeText={setNameDraft}
                onBlur={() => {
                  void handleSaveName();
                }}
                onSubmitEditing={() => {
                  void handleSaveName();
                }}
                placeholder={localCopy.editNamePlaceholder}
                placeholderTextColor={colors.gray}
                returnKeyType="done"
                style={[
                  styles.nameInput,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.grayBorder,
                    color: colors.text,
                  },
                ]}
                value={nameDraft}
              />
              <Pressable
                accessibilityRole="button"
                disabled={savingName || !nameDraft.trim()}
                onPress={() => {
                  void handleSaveName();
                }}
                style={({ pressed }) => [
                  styles.nameButton,
                  {
                    backgroundColor: nameDraft.trim()
                      ? colors.blue
                      : colors.grayDisabled,
                    borderBottomColor: nameDraft.trim()
                      ? colors.blueDark
                      : colors.grayBorder,
                  },
                  pressed && !savingName && nameDraft.trim() && styles.pressed,
                ]}
              >
                <Text style={[styles.nameButtonText, { color: colors.surface }]}>
                  {localCopy.saveName}
                </Text>
              </Pressable>
              {savingName ? (
                <Text style={[styles.savingText, { color: colors.textSoft }]}>
                  {localCopy.saving}
                </Text>
              ) : null}
              <View
                style={[
                  styles.notificationCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.grayBorder,
                  },
                ]}
              >
                <View style={styles.notificationTextBlock}>
                  <Text style={[styles.notificationTitle, { color: colors.text }]}>
                    {localCopy.notificationTitle}
                  </Text>
                  <Text
                    style={[
                      styles.notificationDescription,
                      { color: colors.textSoft },
                    ]}
                  >
                    {isStudyReminderSupported()
                      ? localCopy.notificationDescription
                      : localCopy.notificationUnsupported}
                  </Text>
                  <Text
                    style={[
                      styles.notificationState,
                      { color: notificationsEnabled ? colors.blue : colors.gray },
                    ]}
                  >
                    {notificationsEnabled
                      ? localCopy.notificationOn
                      : localCopy.notificationOff}
                  </Text>
                </View>
                {notificationsSaving ? (
                  <ActivityIndicator color={colors.blue} size="small" />
                ) : (
                  <Switch
                    disabled={!isStudyReminderSupported()}
                    onValueChange={(enabled) => {
                      void handleReminderToggle(enabled);
                    }}
                    thumbColor={
                      notificationsEnabled ? colors.blue : colors.grayDisabled
                    }
                    trackColor={{
                      false: colors.grayBorder,
                      true: colors.blueLight,
                    }}
                    value={notificationsEnabled}
                  />
                )}
              </View>
              {error ? (
                <Text style={[styles.errorText, { color: "#D83A3A" }]}>
                  {error}
                </Text>
              ) : null}
            </View>

            <View
              style={[
                styles.panel,
                styles.rankPanel,
                { backgroundColor: colors.card, borderColor: rank.color },
              ]}
            >
              <Text style={[styles.panelTitle, { color: colors.text }]}>
                {localCopy.rankSide}
              </Text>
              <View
                style={[styles.rankBadge, { backgroundColor: rank.color }]}
              >
                <Text style={styles.rankName}>{rank.name}</Text>
                <Text style={styles.rankRange}>{rank.displayRange}</Text>
              </View>
              <View style={styles.economyStatsRow}>
                <View
                  style={[
                    styles.economyStatBox,
                    { backgroundColor: colors.surface, borderColor: colors.blue },
                  ]}
                >
                  <Text style={[styles.economyStatNumber, { color: colors.blue }]}>
                    {mathProgress.xp}
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.textSoft }]}>
                    XP
                  </Text>
                </View>
                <View
                  style={[
                    styles.economyStatBox,
                    { backgroundColor: colors.surface, borderColor: colors.green },
                  ]}
                >
                  <Text style={[styles.economyStatNumber, { color: colors.green }]}>
                    {mathProgress.calcuCoin}
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.textSoft }]}>
                    CalcuCoin
                  </Text>
                </View>
              </View>
              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Text style={[styles.statNumber, { color: colors.blue }]}>
                    {rankEntry?.trophies ?? 0}
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.textSoft }]}>
                    {localCopy.trophies}
                  </Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={[styles.statNumber, { color: colors.purple }]}>
                    {rankEntry?.wins ?? 0}
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.textSoft }]}>
                    {localCopy.wins}
                  </Text>
                </View>
              </View>
              <Text style={[styles.subtitle, { color: colors.textSoft }]}>
                {copy.profile.loggedInDescription}
              </Text>
              <View style={styles.actions}>
                <Button
                  label={copy.profile.logout}
                  variant="secondary"
                  onPress={() => {
                    void logout().then(() => setAuthUser(null));
                  }}
                />
              </View>
            </View>
          </View>
        ) : (
          <View
            style={[
              styles.loadingCard,
              { backgroundColor: colors.card, borderColor: colors.grayBorder },
            ]}
          >
            <Text style={[styles.panelTitle, { color: colors.text }]}>
              {copy.profile.title}
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSoft }]}>
              {copy.profile.guestDescription}
            </Text>
            <View style={styles.actions}>
              <Button
                label={copy.auth.signupSubmit}
                onPress={() => router.push("/signup")}
              />
              <Button
                label={copy.auth.loginSubmit}
                variant="secondary"
                onPress={() => router.push("/login")}
              />
            </View>
          </View>
        )}
      </ScrollView>

      <BottomTabs />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  actions: { gap: 12, marginTop: 18, width: "100%" },
  avatarChoice: {
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 2,
    flexBasis: "30%",
    flexGrow: 1,
    gap: 6,
    minHeight: 106,
    minWidth: 86,
    paddingHorizontal: 8,
    paddingVertical: 10,
  },
  avatarChoiceText: {
    fontFamily: FONTS.extra,
    fontSize: 12,
    lineHeight: 16,
    textAlign: "center",
    width: "100%",
  },
  avatarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 10,
    width: "100%",
  },
  avatarPreview: {
    marginTop: 16,
  },
  avatarSectionTitle: {
    fontFamily: FONTS.extra,
    fontSize: 15,
    lineHeight: 20,
    marginTop: 14,
    textAlign: "center",
  },
  avatarSelectedText: {
    fontFamily: FONTS.bold,
    fontSize: 10,
    lineHeight: 13,
    minHeight: 13,
    textAlign: "center",
    width: "100%",
  },
  avatar: {
    alignItems: "center",
    borderRadius: 62,
    borderWidth: 3,
    height: 124,
    justifyContent: "center",
    marginTop: 16,
    overflow: "hidden",
    width: 124,
  },
  avatarImage: {
    height: "100%",
    width: "100%",
  },
  avatarInitial: {
    fontFamily: FONTS.extra,
    fontSize: 48,
  },
  back: { fontSize: 26 },
  backBtn: { paddingVertical: 8, width: 44 },
  container: { flex: 1, backgroundColor: COLORS.white },
  content: { flex: 1 },
  contentInner: {
    paddingBottom: 116,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  errorText: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 10,
    textAlign: "center",
  },
  economyStatBox: {
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 2,
    flex: 1,
    minWidth: 0,
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  economyStatNumber: {
    fontFamily: FONTS.extra,
    fontSize: 30,
    lineHeight: 36,
  },
  economyStatsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
    width: "100%",
  },
  loadingCard: {
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 2,
    paddingHorizontal: 18,
    paddingVertical: 24,
  },
  nameInput: {
    borderRadius: 12,
    borderWidth: 2,
    fontFamily: FONTS.extra,
    fontSize: 16,
    marginTop: 14,
    minHeight: 50,
    paddingHorizontal: 14,
    textAlign: "center",
    width: "100%",
  },
  nameButton: {
    alignItems: "center",
    borderBottomWidth: 4,
    borderRadius: 12,
    justifyContent: "center",
    marginTop: 10,
    minHeight: 44,
    paddingHorizontal: 14,
    width: "100%",
  },
  nameButtonText: {
    fontFamily: FONTS.extra,
    fontSize: 14,
  },
  notificationCard: {
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 2,
    flexDirection: "row",
    gap: 12,
    marginTop: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
    width: "100%",
  },
  notificationDescription: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
  },
  notificationState: {
    fontFamily: FONTS.extra,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 6,
  },
  notificationTextBlock: {
    flex: 1,
    minWidth: 0,
  },
  notificationTitle: {
    fontFamily: FONTS.extra,
    fontSize: 15,
    lineHeight: 20,
  },
  panel: {
    borderRadius: 16,
    borderWidth: 2,
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 280,
    paddingHorizontal: 16,
    paddingVertical: 18,
  },
  panelTitle: {
    fontFamily: FONTS.extra,
    fontSize: 22,
    textAlign: "center",
  },
  photoButton: {
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: "center",
    marginTop: 14,
    minHeight: 44,
    paddingHorizontal: 14,
    width: "100%",
  },
  photoButtonText: {
    fontFamily: FONTS.extra,
    fontSize: 14,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ translateY: 1 }],
  },
  profileGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },
  profilePanel: {
    alignItems: "center",
    flexBasis: "48%",
  },
  rankBadge: {
    alignItems: "center",
    borderRadius: 14,
    marginTop: 18,
    paddingHorizontal: 16,
    paddingVertical: 16,
    width: "100%",
  },
  rankName: {
    color: COLORS.white,
    fontFamily: FONTS.extra,
    fontSize: 24,
    textAlign: "center",
  },
  rankPanel: {
    alignItems: "center",
    flexBasis: "48%",
  },
  rankRange: {
    color: COLORS.white,
    fontFamily: FONTS.bold,
    fontSize: 13,
    marginTop: 3,
  },
  savingText: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    marginTop: 10,
    textAlign: "center",
  },
  statBox: {
    alignItems: "center",
    borderRadius: 12,
    flex: 1,
    paddingVertical: 12,
  },
  statLabel: {
    fontFamily: FONTS.bold,
    fontSize: 12,
  },
  statNumber: {
    fontFamily: FONTS.extra,
    fontSize: 32,
    lineHeight: 38,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 14,
    width: "100%",
  },
  subtitle: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 12,
    textAlign: "center",
  },
  topRow: {
    alignItems: "flex-start",
    paddingHorizontal: 16,
    paddingTop: 8,
  },
});
