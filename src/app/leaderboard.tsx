import BottomTabs from "@/components/BottomTabs";
import ProfileAvatar from "@/components/ProfileAvatar";
import { useAppTheme } from "@/constants/app-theme";
import { COLORS, FONTS } from "@/constants/calculo-theme";
import { useLanguage, type Language } from "@/i18n/language";
import {
  COMPETITION_RANKS,
  watchCompetitionLeaderboard,
  type CompetitionLeaderboardEntry,
} from "@/services/competition-service";
import { loginAnonymously, watchAuthUser } from "@/services/auth-service";
import { isFirebaseAuthConfigured } from "@/services/firebase";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const LEADERBOARD_COPY = {
  th: {
    authError: "ต้องเข้าสู่ระบบ หรือเปิด Anonymous Auth เพื่อดู Leaderboard",
    empty: "ยังไม่มีผู้เล่นที่ได้ถ้วยจากการแข่งขัน",
    firebaseMissing: "ยังไม่ได้ตั้งค่า Firebase ให้ครบ จึงยังโหลด Leaderboard ไม่ได้",
    loading: "กำลังโหลดอันดับ...",
    rankGuide: "แรงค์",
    subtitle: "แสดงเฉพาะถ้วยที่ได้จากการชนะการแข่งขัน",
    title: "Leaderboard",
    trophies: "ถ้วย",
    wins: "ชนะ",
  },
  en: {
    authError: "Log in or enable Anonymous Auth to view the leaderboard.",
    empty: "No player has earned competition trophies yet.",
    firebaseMissing:
      "Firebase is not fully configured, so the leaderboard cannot load.",
    loading: "Loading leaderboard...",
    rankGuide: "Ranks",
    subtitle: "Only trophies earned from competition wins are shown.",
    title: "Leaderboard",
    trophies: "cups",
    wins: "wins",
  },
} satisfies Record<Language, Record<string, string>>;

const TH_LEADERBOARD_COPY = {
  authError: "ต้องเข้าสู่ระบบ หรือเปิด Anonymous Auth เพื่อดู Leaderboard",
  empty: "ยังไม่มีผู้เล่นที่ได้ถ้วยจากการแข่งขัน",
  firebaseMissing: "ยังไม่ได้ตั้งค่า Firebase ให้ครบ จึงยังโหลด Leaderboard ไม่ได้",
  loading: "กำลังโหลดอันดับ...",
  rankGuide: "แรงค์",
  subtitle: "แสดงเฉพาะถ้วยที่ได้จากการชนะการแข่งขัน",
  title: "Leaderboard",
  trophies: "ถ้วย",
  wins: "ชนะ",
} satisfies Record<string, string>;

export default function Leaderboard() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { copy: globalCopy, language } = useLanguage();
  const copy = language === "th" ? TH_LEADERBOARD_COPY : LEADERBOARD_COPY.en;
  const firebaseReady = isFirebaseAuthConfigured();
  const [authUserId, setAuthUserId] = useState("");
  const [entries, setEntries] = useState<CompetitionLeaderboardEntry[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firebaseReady) {
      return undefined;
    }

    let disposed = false;
    let unsubscribeLeaderboard: (() => void) | null = null;

    const unsubscribeAuth = watchAuthUser((user) => {
      if (unsubscribeLeaderboard) {
        unsubscribeLeaderboard();
        unsubscribeLeaderboard = null;
      }

      if (!user) {
        void loginAnonymously().catch(() => {
          if (!disposed) {
            setError(copy.authError);
            setLoading(false);
          }
        });
        return;
      }

      setAuthUserId(user.uid);
      setError("");
      setLoading(true);
      unsubscribeLeaderboard = watchCompetitionLeaderboard(
        (nextEntries) => {
          if (!disposed) {
            setEntries(nextEntries);
            setLoading(false);
          }
        },
        () => {
          if (!disposed) {
            setError(copy.authError);
            setLoading(false);
          }
        },
      );
    });

    return () => {
      disposed = true;
      unsubscribeLeaderboard?.();
      unsubscribeAuth();
    };
  }, [copy.authError, firebaseReady]);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.surface }]}
      edges={["top", "bottom"]}
    >
      <View style={styles.header}>
        <Pressable
          accessibilityLabel={globalCopy.common.back}
          accessibilityRole="button"
          hitSlop={12}
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace("/competition" as never);
            }
          }}
          style={styles.backButton}
        >
          <Text style={[styles.backIcon, { color: colors.gray }]}>←</Text>
        </Pressable>
        <View style={styles.headerText}>
          <Text style={[styles.title, { color: colors.text }]}>{copy.title}</Text>
          <Text style={[styles.subtitle, { color: colors.textSoft }]}>
            {copy.subtitle}
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentInner}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.rankGuide,
            { backgroundColor: colors.card, borderColor: colors.grayBorder },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {copy.rankGuide}
          </Text>
          <View style={styles.rankGrid}>
            {COMPETITION_RANKS.map((rank) => (
              <View
                key={rank.name}
                style={[
                  styles.rankChip,
                  { backgroundColor: colors.surface, borderColor: rank.color },
                ]}
              >
                <Text style={[styles.rankChipName, { color: rank.color }]}>
                  {rank.name}
                </Text>
                <Text style={[styles.rankChipRange, { color: colors.textSoft }]}>
                  {rank.displayRange}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {!firebaseReady ? (
          <View style={[styles.notice, { borderColor: "#FF6B6B" }]}>
            <Text style={[styles.noticeText, { color: "#D83A3A" }]}>
              {copy.firebaseMissing}
            </Text>
          </View>
        ) : error ? (
          <View style={[styles.notice, { borderColor: "#FF6B6B" }]}>
            <Text style={[styles.noticeText, { color: "#D83A3A" }]}>
              {error}
            </Text>
          </View>
        ) : loading ? (
          <View
            style={[
              styles.loadingPanel,
              { backgroundColor: colors.card, borderColor: colors.grayBorder },
            ]}
          >
            <ActivityIndicator color={colors.blue} size="large" />
            <Text style={[styles.loadingText, { color: colors.text }]}>
              {copy.loading}
            </Text>
          </View>
        ) : entries.length === 0 ? (
          <View
            style={[
              styles.loadingPanel,
              { backgroundColor: colors.card, borderColor: colors.grayBorder },
            ]}
          >
            <Text style={[styles.loadingText, { color: colors.text }]}>
              {copy.empty}
            </Text>
          </View>
        ) : (
          <View style={styles.entryList}>
            {entries.map((entry, index) => {
              const currentUser = entry.playerId === authUserId;

              return (
                <View
                  key={entry.id}
                  style={[
                    styles.entryRow,
                    {
                      backgroundColor: colors.card,
                      borderColor: currentUser ? colors.blue : colors.grayBorder,
                    },
                  ]}
                >
                  <Text style={[styles.position, { color: colors.textSoft }]}>
                    #{index + 1}
                  </Text>
                  <ProfileAvatar
                    avatarId={entry.avatarId}
                    borderColor={entry.rank.color}
                    name={entry.playerName}
                    photoURL={entry.photoURL}
                    size={46}
                  />
                  <View style={styles.entryMain}>
                    <Text
                      numberOfLines={1}
                      style={[styles.playerName, { color: colors.text }]}
                    >
                      {entry.playerName}
                    </Text>
                    <Text style={[styles.entryMeta, { color: entry.rank.color }]}>
                      {entry.rank.name}
                    </Text>
                  </View>
                  <View style={styles.scoreBox}>
                    <Text style={[styles.trophies, { color: colors.blue }]}>
                      {entry.trophies}
                    </Text>
                    <Text style={[styles.trophyLabel, { color: colors.textSoft }]}>
                      {copy.trophies}
                    </Text>
                  </View>
                  <View style={styles.scoreBox}>
                    <Text style={[styles.trophies, { color: colors.purple }]}>
                      {entry.wins}
                    </Text>
                    <Text style={[styles.trophyLabel, { color: colors.textSoft }]}>
                      {copy.wins}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      <BottomTabs />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  backButton: {
    alignItems: "center",
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  backIcon: {
    fontFamily: FONTS.extra,
    fontSize: 26,
  },
  avatar: {
    alignItems: "center",
    borderRadius: 23,
    borderWidth: 2,
    height: 46,
    justifyContent: "center",
    overflow: "hidden",
    width: 46,
  },
  avatarImage: {
    height: "100%",
    width: "100%",
  },
  avatarText: {
    fontFamily: FONTS.extra,
    fontSize: 18,
  },
  container: {
    backgroundColor: COLORS.white,
    flex: 1,
  },
  content: {
    flex: 1,
  },
  contentInner: {
    gap: 12,
    paddingBottom: 112,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  entryList: {
    gap: 10,
  },
  entryMain: {
    flex: 1,
    minWidth: 0,
  },
  entryMeta: {
    fontFamily: FONTS.extra,
    fontSize: 12,
    marginTop: 2,
  },
  entryRow: {
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 2,
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  headerText: {
    flex: 1,
  },
  loadingPanel: {
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 2,
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  loadingText: {
    fontFamily: FONTS.extra,
    fontSize: 16,
    lineHeight: 22,
    textAlign: "center",
  },
  notice: {
    borderRadius: 12,
    borderWidth: 2,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  noticeText: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
  },
  playerName: {
    fontFamily: FONTS.extra,
    fontSize: 16,
  },
  position: {
    fontFamily: FONTS.extra,
    fontSize: 16,
    width: 38,
  },
  rankChip: {
    borderRadius: 12,
    borderWidth: 2,
    flexBasis: "31%",
    flexGrow: 1,
    minHeight: 58,
    justifyContent: "center",
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  rankChipName: {
    fontFamily: FONTS.extra,
    fontSize: 13,
  },
  rankChipRange: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    marginTop: 2,
  },
  rankGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 10,
  },
  rankGuide: {
    borderRadius: 14,
    borderWidth: 2,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  scoreBox: {
    alignItems: "center",
    minWidth: 46,
  },
  sectionTitle: {
    fontFamily: FONTS.extra,
    fontSize: 18,
  },
  subtitle: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
  },
  title: {
    fontFamily: FONTS.extra,
    fontSize: 25,
    lineHeight: 31,
  },
  trophies: {
    fontFamily: FONTS.extra,
    fontSize: 20,
    lineHeight: 24,
  },
  trophyLabel: {
    fontFamily: FONTS.bold,
    fontSize: 10,
  },
});
