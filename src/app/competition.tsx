import BottomTabs from "@/components/BottomTabs";
import { useAppTheme } from "@/constants/app-theme";
import { COLORS, FONTS } from "@/constants/calculo-theme";
import {
  getCompetitionExamDurationMs,
  type CompetitionExamQuestionContent,
} from "@/constants/competition-exam-questions";
import { getQuestionImageSource } from "@/generated/question-course";
import { useLanguage, type Language } from "@/i18n/language";
import {
  claimCompetitionReward,
  createCompetitionRoom,
  findOrCreateCompetitionRoom,
  finishCompetitionRoom,
  getCompetitionPlayer,
  getCompetitionSideForPlayer,
  joinCompetitionRoom,
  leaveCompetitionRoom,
  normalizeCompetitionRoomCode,
  submitCompetitionAnswer,
  watchCompetitionRoom,
  type CompetitionMode,
  type CompetitionPlayer,
  type CompetitionReward,
  type CompetitionRoom,
  type CompetitionSide,
  type CompetitionWinner,
} from "@/services/competition-service";
import { isFirebaseAuthConfigured } from "@/services/firebase";
import { useSoundEffects } from "@/services/sound-effects";
import {
  loginAnonymously,
  watchAuthUser,
  type AuthUser,
} from "@/services/auth-service";
import { Image } from "expo-image";
import { NetworkStateType, useNetworkState } from "expo-network";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ThemeColors = ReturnType<typeof useAppTheme>["colors"];

const COMPETITION_COPY = {
  th: {
    alreadyAnswered: "ข้อนี้ตอบไปแล้ว",
    autoMatch: "จับคู่อัตโนมัติ",
    autoWaiting: "กำลังรอคู่แข่งจากระบบจับคู่อัตโนมัติ...",
    battle: "ข้อสอบแข่งขัน",
    cancel: "ออกจากห้อง",
    cancelled: "ผู้เล่นอีกคนออกจากเกมแล้ว",
    correct: "ตอบถูก ได้ 1 คะแนน",
    createRoom: "สร้างห้อง",
    difficulty: {
      brutal: "มหาโหด",
      hard: "ยาก",
      medium: "กลาง",
    },
    draw: "เสมอกัน",
    examInfo: "สุ่ม 20 ข้อ | 15 นาที | ทำข้อไหนก่อนก็ได้",
    explanation: "เฉลย",
    firebaseMissing:
      "ยังไม่ได้ตั้งค่า Firebase จาก .env ให้ครบ จึงยังสร้างห้องออนไลน์ไม่ได้",
    finished: "จบการแข่งขัน",
    genericError: "เริ่มเกมไม่สำเร็จ ลองใหม่อีกครั้ง",
    invalidAnswer: "เลือกคำตอบก่อนส่ง",
    joinRoom: "เข้าห้อง",
    leftPlayer: "Player 1",
    loginRequired: "ต้องเข้าสู่ระบบ หรือเปิด Anonymous Auth ก่อนเล่นออนไลน์",
    matched: "จับคู่สำเร็จ เริ่มทำข้อสอบได้เลย",
    matching: "กำลังทำรายการ...",
    modeExam: "ข้อสอบ",
    modeSpeed: "คิดเลขไว",
    networkOffline: "ต้องเชื่อมต่ออินเทอร์เน็ตก่อนเริ่มเกม",
    networkReady: "ออนไลน์พร้อม",
    newMatch: "สร้างห้องใหม่",
    opponent: "คู่แข่ง",
    permissionError:
      "Firestore ยังไม่อนุญาตห้องแข่งขันออนไลน์ ต้องเพิ่ม rules ให้ collection competitionRooms",
    playerAnswered: "ทำแล้ว",
    playerOne: "Player 1",
    playerTwo: "Player 2",
    progress: "ความคืบหน้า",
    question: "ข้อ",
    rightPlayer: "Player 2",
    roomCode: "ห้อง",
    roomCodePlaceholder: "กรอกเลขห้อง",
    roomCodeRequired: "กรุณากรอกเลขห้องก่อน",
    roomCreated: "สร้างห้องแล้ว ส่งเลข {code} ให้เพื่อนเข้ามาแข่ง",
    roomFull: "ห้องนี้มีผู้เล่นครบ 2 คนแล้ว",
    roomNotFound: "ไม่พบห้องนี้ ตรวจเลขห้องอีกครั้ง",
    roomUnavailable: "ห้องนี้เริ่มไปแล้วหรือปิดไปแล้ว",
    speedBattle: "แข่งคิดเลขไว",
    speedDoneWaiting: "ตอบครบแล้ว รอคู่แข่งทำให้เสร็จ...",
    speedInfo: "สุ่ม 20 ข้อ | ตอบเป็นตัวเลข | ใครถูกครบก่อนมีลุ้นชนะ",
    speedInputPlaceholder: "พิมพ์คำตอบ",
    speedProgress: "คิดเลขไว",
    submitAnswer: "ตอบ",
    start: "เริ่มเกม",
    subtitle: "โจทย์ประยุกต์ชุดเดียวกัน แข่งกันทำคะแนนสูงสุดเมื่อหมดเวลา",
    timeLeft: "เวลาที่เหลือ",
    timeUp: "หมดเวลา",
    title: "ข้อสอบแข่งขัน",
    waiting: "กำลังรอ Player 2 เข้ามา...",
    webNetwork: "ออนไลน์พร้อมทดสอบ",
    winnerLose: "คู่แข่งชนะ",
    winnerWin: "คุณชนะ!",
    winReward: "ชนะ +{trophies} ถ้วย +{xp} XP +{coin} Coin",
    wrong: "ยังไม่ถูก",
    yourSide: "ฝั่งของคุณ",
  },
  en: {
    alreadyAnswered: "Already answered",
    autoMatch: "Auto match",
    autoWaiting: "Waiting for an auto-matched opponent...",
    battle: "Competition Exam",
    cancel: "Leave room",
    cancelled: "The other player left the room",
    correct: "Correct. +1 point",
    createRoom: "Create room",
    difficulty: {
      brutal: "Brutal",
      hard: "Hard",
      medium: "Medium",
    },
    draw: "Draw",
    examInfo: "20 random questions | 15 minutes | Any order",
    explanation: "Explanation",
    firebaseMissing:
      "Firebase is not fully configured from .env, so online rooms are unavailable.",
    finished: "Finished",
    genericError: "Could not start the game. Please try again.",
    invalidAnswer: "Choose an answer first",
    joinRoom: "Join room",
    leftPlayer: "Player 1",
    loginRequired: "Log in or enable Anonymous Auth before online play.",
    matched: "Matched. Start the exam.",
    matching: "Working...",
    modeExam: "Exam",
    modeSpeed: "Speed math",
    networkOffline: "Connect to the internet before starting",
    networkReady: "Online ready",
    newMatch: "Create new room",
    opponent: "Opponent",
    permissionError:
      "Firestore is not allowing online rooms yet. Add rules for the competitionRooms collection.",
    playerAnswered: "Done",
    playerOne: "Player 1",
    playerTwo: "Player 2",
    progress: "Progress",
    question: "Question",
    rightPlayer: "Player 2",
    roomCode: "Room",
    roomCodePlaceholder: "Enter room code",
    roomCodeRequired: "Enter a room code first",
    roomCreated: "Room created. Share {code} with your opponent.",
    roomFull: "This room already has 2 players.",
    roomNotFound: "Room not found. Check the code and try again.",
    roomUnavailable: "This room already started or closed.",
    speedBattle: "Speed Math",
    speedDoneWaiting: "All done. Waiting for your opponent...",
    speedInfo: "20 random questions | Numeric answers | Race for correct answers",
    speedInputPlaceholder: "Enter answer",
    speedProgress: "Speed math",
    submitAnswer: "Answer",
    start: "Start game",
    subtitle: "Same applied exam set. Highest score wins when time ends.",
    timeLeft: "Time left",
    timeUp: "Time up",
    title: "Competition Exam",
    waiting: "Waiting for Player 2...",
    webNetwork: "Online for web preview",
    winnerLose: "Opponent wins",
    winnerWin: "You win!",
    winReward: "Win +{trophies} cups +{xp} XP +{coin} Coin",
    wrong: "Not correct",
    yourSide: "Your side",
  },
} satisfies Record<Language, Record<string, unknown>>;

type CompetitionCopy = typeof COMPETITION_COPY.th;

function getErrorText(error: unknown, copy: CompetitionCopy) {
  const code =
    typeof error === "object" && error && "code" in error
      ? String((error as { code?: unknown }).code)
      : "";
  const message = error instanceof Error ? error.message : "";

  if (message === "invalid-answer") {
    return copy.invalidAnswer;
  }

  if (message === "room-code-required") {
    return copy.roomCodeRequired;
  }

  if (message === "room-not-found") {
    return copy.roomNotFound;
  }

  if (message === "room-full") {
    return copy.roomFull;
  }

  if (message === "room-unavailable") {
    return copy.roomUnavailable;
  }

  if (code === "permission-denied" || message.includes("permission")) {
    return copy.permissionError;
  }

  return copy.genericError;
}

function getSideLabel(
  side: CompetitionSide,
  room: CompetitionRoom | null,
  copy: CompetitionCopy,
) {
  const player =
    side === "left" ? room?.players.left : room?.players.right;

  return player?.name || (side === "left" ? copy.leftPlayer : copy.rightPlayer);
}

function getWinnerText(
  winner: CompetitionWinner | undefined,
  currentSide: CompetitionSide | null,
  copy: CompetitionCopy,
) {
  if (winner === "draw") {
    return copy.draw;
  }

  if (winner && currentSide === winner) {
    return copy.winnerWin;
  }

  return copy.winnerLose;
}

function formatTime(ms: number) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function getRewardText(reward: CompetitionReward, copy: CompetitionCopy) {
  return copy.winReward
    .replace("{trophies}", String(reward.trophies))
    .replace("{xp}", String(reward.xp))
    .replace("{coin}", String(reward.calcuCoin));
}

function ScoreBadge({
  active,
  answered,
  color,
  colors,
  name,
  role,
  score,
  total,
}: {
  active: boolean;
  answered: number;
  color: string;
  colors: ThemeColors;
  name: string;
  role: string;
  score: number;
  total: number;
}) {
  return (
    <View
      style={[
        styles.scoreBadge,
        {
          backgroundColor: colors.card,
          borderColor: active ? color : colors.grayBorder,
        },
      ]}
    >
      <Text style={[styles.scoreRole, { color: active ? color : colors.textSoft }]}>
        {role}
      </Text>
      <Text numberOfLines={1} style={[styles.scoreName, { color: colors.text }]}>
        {name}
      </Text>
      <View style={styles.scoreLine}>
        <Text style={[styles.scoreNumber, { color }]}>{score}</Text>
        <Text style={[styles.scoreMeta, { color: colors.textSoft }]}>
          {answered}/{total}
        </Text>
      </View>
    </View>
  );
}

function ResultMessage({
  colors,
  copy,
  currentSide,
  room,
}: {
  colors: ThemeColors;
  copy: CompetitionCopy;
  currentSide: CompetitionSide | null;
  room: CompetitionRoom;
}) {
  const winnerColor =
    room.winner === "draw"
      ? colors.text
      : room.winner === currentSide
        ? colors.blue
        : colors.purple;

  return (
    <View
      style={[
        styles.resultPanel,
        { backgroundColor: colors.card, borderColor: colors.grayBorder },
      ]}
    >
      <Text style={[styles.resultKicker, { color: colors.textSoft }]}>
        {copy.finished}
      </Text>
      <Text style={[styles.resultTitle, { color: winnerColor }]}>
        {getWinnerText(room.winner, currentSide, copy)}
      </Text>
      <Text style={[styles.resultScore, { color: colors.text }]}>
        {room.scores.left} - {room.scores.right}
      </Text>
    </View>
  );
}

export default function Competition() {
  const router = useRouter();
  const { colors, isDark } = useAppTheme();
  const { language, copy: globalCopy } = useLanguage();
  const { playSound } = useSoundEffects();
  const copy = COMPETITION_COPY[language] as CompetitionCopy;
  const networkState = useNetworkState();
  const firebaseReady = isFirebaseAuthConfigured();
  const [authUser, setAuthUser] = useState<AuthUser | undefined>(
    firebaseReady ? undefined : null,
  );
  const [error, setError] = useState("");
  const [finishing, setFinishing] = useState(false);
  const claimedRewardRoomsRef = useRef<Record<string, boolean>>({});
  const [message, setMessage] = useState("");
  const [now, setNow] = useState(() => Date.now());
  const [player, setPlayer] = useState<CompetitionPlayer | null>(null);
  const [room, setRoom] = useState<CompetitionRoom | null>(null);
  const [selectedMode, setSelectedMode] = useState<CompetitionMode>("exam");
  const [roomAction, setRoomAction] = useState<
    "create" | "join" | "match" | null
  >(null);
  const [roomCodeInput, setRoomCodeInput] = useState("");
  const [roomId, setRoomId] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [side, setSide] = useState<CompetitionSide | null>(null);
  const [speedAnswer, setSpeedAnswer] = useState("");
  const [submittingQuestionId, setSubmittingQuestionId] = useState("");

  useEffect(() => {
    if (!firebaseReady) {
      return undefined;
    }

    try {
      return watchAuthUser(setAuthUser);
    } catch {
      void Promise.resolve().then(() => setAuthUser(null));
      return undefined;
    }
  }, [firebaseReady]);

  useEffect(() => {
    if (authUser === undefined) {
      return undefined;
    }

    let mounted = true;

    void getCompetitionPlayer(authUser).then((nextPlayer) => {
      if (mounted) {
        setPlayer(nextPlayer);
      }
    });

    return () => {
      mounted = false;
    };
  }, [authUser]);

  useEffect(() => {
    if (!roomId) {
      return undefined;
    }

    return watchCompetitionRoom(
      roomId,
      (nextRoom) => {
        setRoom(nextRoom);

        if (!nextRoom) {
          setMessage("");
          setRoomId("");
          setSide(null);
          setSelectedIndex(0);
          setSpeedAnswer("");
          return;
        }

        setSelectedMode(nextRoom.mode);
      },
      (snapshotError) => {
        setError(getErrorText(snapshotError, copy));
      },
    );
  }, [copy, roomId]);

  useEffect(() => {
    if (room?.status !== "playing") {
      return undefined;
    }

    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [room?.status]);

  const activeRoom = room;
  const safeSelectedIndex =
    activeRoom && selectedIndex < activeRoom.questions.length ? selectedIndex : 0;
  const currentSide = useMemo(
    () => getCompetitionSideForPlayer(room, player) ?? side,
    [player, room, side],
  );
  const rewardClaimedForCurrentSide =
    activeRoom && currentSide ? activeRoom.rewardClaims[currentSide] === true : false;
  const opponentSide: CompetitionSide =
    currentSide === "right" ? "left" : "right";

  const networkReady = useMemo(() => {
    if (networkState.type === NetworkStateType.NONE) {
      return false;
    }

    return networkState.isConnected !== false;
  }, [networkState.isConnected, networkState.type]);

  const feedbackColors = useMemo(
    () => ({
      correctBackground: isDark ? "#123B2A" : "#E6F8EE",
      correctBorder: "#3CCB6D",
      correctText: isDark ? "#BDF7D0" : "#178C45",
      wrongBackground: isDark ? "#3A1820" : "#FFF0F0",
      wrongBorder: "#FF6B6B",
      wrongText: isDark ? "#FFB4B4" : "#D83A3A",
    }),
    [isDark],
  );
  const renderQuestionContent = useCallback(
    (item: CompetitionExamQuestionContent) => {
      if (item.type === "image") {
        const source = getQuestionImageSource(item.assetPath);

        return source ? (
          <Image
            accessibilityLabel={item.alt}
            contentFit="contain"
            key={item.id}
            source={source}
            style={styles.questionImage}
          />
        ) : null;
      }

      return (
        <Text key={item.id} style={[styles.questionText, { color: colors.text }]}>
          {item.text}
        </Text>
      );
    },
    [colors.text],
  );

  const networkText = networkReady
    ? Platform.OS === "web"
      ? copy.webNetwork
      : copy.networkReady
    : copy.networkOffline;
  const authLoading = firebaseReady && authUser === undefined;
  const canUseRooms =
    firebaseReady &&
    networkReady &&
    !authLoading &&
    Boolean(player) &&
    !roomAction;
  const normalizedRoomCodeInput = normalizeCompetitionRoomCode(roomCodeInput);
  const roomQuestions =
    activeRoom?.mode === "speed"
      ? activeRoom.speedQuestions
      : activeRoom?.questions ?? [];
  const totalQuestions = roomQuestions.length || activeRoom?.targetScore || 0;
  const currentQuestion =
    activeRoom?.mode === "exam"
      ? activeRoom.questions[safeSelectedIndex] ?? null
      : null;
  const myAnswers =
    activeRoom && currentSide ? activeRoom.answers[currentSide] : {};
  const opponentAnswers = activeRoom ? activeRoom.answers[opponentSide] : {};
  const myAnsweredCount = activeRoom && currentSide
    ? Object.keys(activeRoom.answers[currentSide]).length
    : 0;
  const opponentAnsweredCount = activeRoom
    ? Object.keys(opponentAnswers).length
    : 0;
  const currentAnswer =
    currentQuestion && currentSide ? myAnswers[currentQuestion.id] : undefined;
  const speedCurrentQuestion =
    activeRoom?.mode === "speed"
      ? activeRoom.speedQuestions[myAnsweredCount] ?? null
      : null;
  const speedDone =
    activeRoom?.mode === "speed" &&
    totalQuestions > 0 &&
    myAnsweredCount >= totalQuestions;
  const remainingMs =
    activeRoom?.mode === "speed"
      ? 0
      : activeRoom?.status === "playing"
      ? Math.max(0, (activeRoom.endsAt || now) - now)
      : activeRoom?.status === "finished"
        ? 0
      : getCompetitionExamDurationMs();
  const gameIsActive =
    activeRoom?.status === "playing" &&
    Boolean(currentSide) &&
    (activeRoom.mode === "speed" || remainingMs > 0);
  const answerDisabled =
    activeRoom?.mode !== "exam" ||
    !gameIsActive ||
    !currentQuestion ||
    Boolean(currentAnswer) ||
    Boolean(submittingQuestionId) ||
    finishing;
  const speedAnswerDisabled =
    activeRoom?.mode !== "speed" ||
    !gameIsActive ||
    !speedCurrentQuestion ||
    speedDone ||
    Boolean(submittingQuestionId) ||
    finishing;
  const selectedModeIsSpeed = selectedMode === "speed";

  const leftName = getSideLabel("left", activeRoom, copy);
  const rightName = getSideLabel("right", activeRoom, copy);

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/home" as never);
  }, [router]);

  const prepareOnlinePlayer = useCallback(async () => {
    if (!networkReady) {
      setError(copy.networkOffline);
      return null;
    }

    if (!firebaseReady) {
      setError(copy.firebaseMissing);
      return null;
    }

    if (!player || authLoading) {
      setError(copy.genericError);
      return null;
    }

    let matchPlayer = player;

    if (!authUser) {
      try {
        const guestUser = await loginAnonymously();
        const guestPlayer = await getCompetitionPlayer(guestUser);
        setAuthUser(guestUser);
        setPlayer(guestPlayer);
        matchPlayer = guestPlayer;
      } catch {
        setError(copy.loginRequired);
        return null;
      }
    }

    if (authUser && matchPlayer.id !== authUser.uid) {
      matchPlayer = await getCompetitionPlayer(authUser);
      setPlayer(matchPlayer);
    }

    return matchPlayer;
  }, [authLoading, authUser, copy, firebaseReady, networkReady, player]);

  const resetRoomState = useCallback(() => {
    setError("");
    setFinishing(false);
    setMessage("");
    setRoom(null);
    setRoomCodeInput("");
    setRoomId("");
    setSelectedIndex(0);
    setSide(null);
    setSpeedAnswer("");
    setSubmittingQuestionId("");
  }, []);

  const handleCreateRoom = useCallback(async () => {
    setRoomAction("create");
    setError("");
    setMessage(copy.matching);

    try {
      const matchPlayer = await prepareOnlinePlayer();

      if (!matchPlayer) {
        setMessage("");
        return;
      }

      resetRoomState();
      setRoomAction("create");

      const result = await createCompetitionRoom(matchPlayer, selectedMode);
      setRoomId(result.roomId);
      setRoomCodeInput(result.roomId);
      setSide(result.side);
      setMessage(copy.roomCreated.replace("{code}", result.roomId));
    } catch (startError) {
      setError(getErrorText(startError, copy));
      setMessage("");
    } finally {
      setRoomAction(null);
    }
  }, [copy, prepareOnlinePlayer, resetRoomState, selectedMode]);

  const handleAutoMatchRoom = useCallback(async () => {
    setRoomAction("match");
    setError("");
    setMessage(copy.matching);

    try {
      const matchPlayer = await prepareOnlinePlayer();

      if (!matchPlayer) {
        setMessage("");
        return;
      }

      resetRoomState();
      setRoomAction("match");

      const result = await findOrCreateCompetitionRoom(matchPlayer, selectedMode);
      setRoomId(result.roomId);
      setRoomCodeInput("");
      setSide(result.side);
      setNow(Date.now());
      setMessage(result.side === "left" ? copy.autoWaiting : copy.matched);
    } catch (matchError) {
      setError(getErrorText(matchError, copy));
      setMessage("");
    } finally {
      setRoomAction(null);
    }
  }, [copy, prepareOnlinePlayer, resetRoomState, selectedMode]);

  const handleJoinRoom = useCallback(async () => {
    const roomCode = normalizeCompetitionRoomCode(roomCodeInput);

    if (!roomCode) {
      setError(copy.roomCodeRequired);
      return;
    }

    setRoomAction("join");
    setError("");
    setMessage(copy.matching);

    try {
      const matchPlayer = await prepareOnlinePlayer();

      if (!matchPlayer) {
        setMessage("");
        return;
      }

      resetRoomState();
      setRoomAction("join");

      const result = await joinCompetitionRoom(roomCode, matchPlayer);
      setRoomId(result.roomId);
      setRoomCodeInput(roomCode);
      setSide(result.side);
      setNow(Date.now());
      setMessage(result.side === "left" ? copy.waiting : copy.matched);
    } catch (joinError) {
      setError(getErrorText(joinError, copy));
      setMessage("");
    } finally {
      setRoomAction(null);
    }
  }, [copy, prepareOnlinePlayer, resetRoomState, roomCodeInput]);

  const setNextUnansweredQuestion = useCallback(
    (answeredQuestionId: string) => {
      if (!activeRoom || !currentSide) {
        return;
      }

      const nextIndex = activeRoom.questions.findIndex((question) => {
        if (question.id === answeredQuestionId) {
          return false;
        }

        return !activeRoom.answers[currentSide][question.id];
      });

      if (nextIndex >= 0) {
        setSelectedIndex(nextIndex);
      }
    },
    [activeRoom, currentSide],
  );

  const handleFinishRoom = useCallback(async () => {
    if (!activeRoom || !player || activeRoom.status !== "playing" || finishing) {
      return;
    }

    setFinishing(true);
    setError("");

    try {
      const result = await finishCompetitionRoom(activeRoom.id, player);
      setMessage(
        result.reward
          ? getRewardText(result.reward, copy)
          : result.winner === "draw"
            ? copy.draw
            : copy.timeUp,
      );
    } catch (finishError) {
      setError(getErrorText(finishError, copy));
    } finally {
      setFinishing(false);
    }
  }, [activeRoom, copy, finishing, player]);

  useEffect(() => {
    if (
      activeRoom?.status !== "playing" ||
      !activeRoom.endsAt ||
      remainingMs > 0 ||
      !player ||
      finishing
    ) {
      return;
    }

    const finishTimer = setTimeout(() => {
      void handleFinishRoom();
    }, 0);

    return () => clearTimeout(finishTimer);
  }, [activeRoom?.endsAt, activeRoom?.status, finishing, handleFinishRoom, player, remainingMs]);

  useEffect(() => {
    if (
      !activeRoom ||
      activeRoom.status !== "finished" ||
      !player ||
      !currentSide ||
      activeRoom.winner !== currentSide ||
      rewardClaimedForCurrentSide ||
      claimedRewardRoomsRef.current[activeRoom.id]
    ) {
      return;
    }

    claimedRewardRoomsRef.current[activeRoom.id] = true;
    void claimCompetitionReward(activeRoom.id, player)
      .then((reward) => {
        if (reward) {
          setMessage(getRewardText(reward, copy));
        }
      })
      .catch((claimError) => {
        setError(getErrorText(claimError, copy));
      });
  }, [
    activeRoom,
    copy,
    currentSide,
    player,
    rewardClaimedForCurrentSide,
  ]);

  const handleChoicePress = useCallback(
    async (choiceIndex: number) => {
      if (
        !activeRoom ||
        !player ||
        !currentSide ||
        !currentQuestion ||
        answerDisabled
      ) {
        return;
      }

      setError("");
      setSubmittingQuestionId(currentQuestion.id);

      try {
        const result = await submitCompetitionAnswer(
          activeRoom.id,
          player,
          currentSide,
          currentQuestion.id,
          String(choiceIndex),
        );

        setMessage(
          result.alreadyAnswered
            ? copy.alreadyAnswered
            : result.reward
              ? getRewardText(result.reward, copy)
              : result.finished
                ? getWinnerText(result.winner, currentSide, copy)
                : result.correct
                  ? copy.correct
                  : copy.wrong,
        );

        if (!result.alreadyAnswered && !result.stale) {
          playSound(result.correct ? "correct" : "incorrect");
        }

        if (!result.finished) {
          setNextUnansweredQuestion(currentQuestion.id);
        }
      } catch (submitError) {
        setError(getErrorText(submitError, copy));
      } finally {
        setSubmittingQuestionId("");
      }
    },
    [
      activeRoom,
      answerDisabled,
      copy,
      currentQuestion,
      currentSide,
      playSound,
      player,
      setNextUnansweredQuestion,
    ],
  );

  const handleSpeedAnswer = useCallback(async () => {
    if (
      !activeRoom ||
      activeRoom.mode !== "speed" ||
      !player ||
      !currentSide ||
      !speedCurrentQuestion ||
      speedAnswerDisabled
    ) {
      return;
    }

    setError("");
    setSubmittingQuestionId(speedCurrentQuestion.id);

    try {
      const result = await submitCompetitionAnswer(
        activeRoom.id,
        player,
        currentSide,
        speedCurrentQuestion.id,
        speedAnswer,
      );

      setSpeedAnswer("");
      setMessage(
        result.alreadyAnswered
          ? copy.alreadyAnswered
          : result.reward
            ? getRewardText(result.reward, copy)
            : result.finished
              ? getWinnerText(result.winner, currentSide, copy)
              : result.correct
                ? copy.correct
                : copy.wrong,
      );

      if (!result.alreadyAnswered && !result.stale) {
        playSound(result.correct ? "correct" : "incorrect");
      }
    } catch (submitError) {
      setError(getErrorText(submitError, copy));
    } finally {
      setSubmittingQuestionId("");
    }
  }, [
    activeRoom,
    copy,
    currentSide,
    playSound,
    player,
    speedAnswer,
    speedAnswerDisabled,
    speedCurrentQuestion,
  ]);

  const handleLeave = useCallback(async () => {
    if (roomId && player) {
      try {
        await leaveCompetitionRoom(roomId, player);
      } catch {
        // Leaving is best-effort; the UI resets either way.
      }
    }

    resetRoomState();
  }, [player, resetRoomState, roomId]);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.surface }]}
      edges={["top", "bottom"]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboard}
      >
        <View style={styles.header}>
          <Pressable
            accessibilityLabel={globalCopy.common.back}
            accessibilityRole="button"
            hitSlop={12}
            onPress={handleBack}
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
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.statusRow}>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: networkReady ? "#E6F8EE" : "#FFF0F0",
                  borderColor: networkReady ? "#3CCB6D" : "#FF6B6B",
                },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  { color: networkReady ? "#178C45" : "#D83A3A" },
                ]}
              >
                {networkText}
              </Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: firebaseReady ? colors.blueLight : "#FFF0F0",
                  borderColor: firebaseReady ? colors.blue : "#FF6B6B",
                },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  { color: firebaseReady ? colors.blue : "#D83A3A" },
                ]}
              >
                Firebase
              </Text>
            </View>
          </View>

          {!activeRoom ? (
            <View
              style={[
                styles.startPanel,
                { backgroundColor: colors.card, borderColor: colors.grayBorder },
              ]}
            >
              <View
                style={[
                  styles.modeTabs,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.grayBorder,
                  },
                ]}
              >
                {(["exam", "speed"] as const).map((mode) => {
                  const selected = selectedMode === mode;

                  return (
                    <Pressable
                      accessibilityRole="button"
                      disabled={Boolean(roomAction)}
                      key={mode}
                      onPress={() => setSelectedMode(mode)}
                      style={({ pressed }) => [
                        styles.modeButton,
                        {
                          backgroundColor: selected
                            ? colors.blueLight
                            : colors.surface,
                          borderColor: selected ? colors.blue : "transparent",
                        },
                        pressed && !roomAction && styles.pressed,
                      ]}
                    >
                      <Text
                        style={[
                          styles.modeButtonText,
                          { color: selected ? colors.blue : colors.textSoft },
                        ]}
                      >
                        {mode === "speed" ? copy.modeSpeed : copy.modeExam}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <View style={styles.startText}>
                <Text style={[styles.battleTitle, { color: colors.text }]}>
                  {selectedModeIsSpeed ? copy.speedBattle : copy.battle}
                </Text>
                <Text style={[styles.targetText, { color: colors.textSoft }]}>
                  {selectedModeIsSpeed ? copy.speedInfo : copy.examInfo}
                </Text>
              </View>

              <View style={styles.roomActions}>
                <Pressable
                  accessibilityRole="button"
                  disabled={!canUseRooms}
                  onPress={handleCreateRoom}
                  style={({ pressed }) => [
                    styles.primaryButton,
                    styles.roomButton,
                    {
                      backgroundColor: canUseRooms
                        ? colors.green
                        : colors.grayBorder,
                      borderBottomColor: canUseRooms
                        ? colors.greenDark
                        : colors.grayDisabled,
                    },
                    pressed && canUseRooms && styles.pressed,
                  ]}
                >
                  {roomAction === "create" ? (
                    <ActivityIndicator color={COLORS.white} size="small" />
                  ) : (
                    <Text
                      style={[
                        styles.primaryButtonText,
                        { color: canUseRooms ? colors.surface : colors.gray },
                      ]}
                    >
                      {copy.createRoom}
                    </Text>
                  )}
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  disabled={!canUseRooms}
                  onPress={handleAutoMatchRoom}
                  style={({ pressed }) => [
                    styles.primaryButton,
                    styles.roomButton,
                    {
                      backgroundColor: canUseRooms
                        ? colors.purple
                        : colors.grayBorder,
                      borderBottomColor: canUseRooms
                        ? colors.blueDark
                        : colors.grayDisabled,
                    },
                    pressed && canUseRooms && styles.pressed,
                  ]}
                >
                  {roomAction === "match" ? (
                    <ActivityIndicator color={COLORS.white} size="small" />
                  ) : (
                    <Text
                      style={[
                        styles.primaryButtonText,
                        { color: canUseRooms ? colors.surface : colors.gray },
                      ]}
                    >
                      {copy.autoMatch}
                    </Text>
                  )}
                </Pressable>

                <View style={styles.roomCodeRow}>
                  <TextInput
                    accessibilityLabel={copy.roomCodePlaceholder}
                    autoCapitalize="characters"
                    autoCorrect={false}
                    editable={!roomAction}
                    maxLength={6}
                    onChangeText={(value) =>
                      setRoomCodeInput(normalizeCompetitionRoomCode(value))
                    }
                    onSubmitEditing={handleJoinRoom}
                    placeholder={copy.roomCodePlaceholder}
                    placeholderTextColor={colors.gray}
                    returnKeyType="go"
                    style={[
                      styles.roomCodeInput,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.grayBorder,
                        color: colors.text,
                      },
                    ]}
                    value={roomCodeInput}
                  />
                  <Pressable
                    accessibilityRole="button"
                    disabled={!canUseRooms || !normalizedRoomCodeInput}
                    onPress={handleJoinRoom}
                    style={({ pressed }) => [
                      styles.joinButton,
                      {
                        backgroundColor:
                          canUseRooms && normalizedRoomCodeInput
                            ? colors.blue
                            : colors.grayBorder,
                        borderBottomColor:
                          canUseRooms && normalizedRoomCodeInput
                            ? colors.blueDark
                            : colors.grayDisabled,
                      },
                      pressed &&
                        canUseRooms &&
                        normalizedRoomCodeInput &&
                        styles.pressed,
                    ]}
                  >
                    {roomAction === "join" ? (
                      <ActivityIndicator color={COLORS.white} size="small" />
                    ) : (
                      <Text
                        style={[
                          styles.primaryButtonText,
                          {
                            color:
                              canUseRooms && normalizedRoomCodeInput
                                ? colors.surface
                                : colors.gray,
                          },
                        ]}
                      >
                        {copy.joinRoom}
                      </Text>
                    )}
                  </Pressable>
                </View>
              </View>
            </View>
          ) : null}

          {error ? (
            <View style={[styles.notice, { borderColor: "#FF6B6B" }]}>
              <Text style={[styles.noticeText, { color: "#D83A3A" }]}>
                {error}
              </Text>
            </View>
          ) : null}

          {message ? (
            <View style={[styles.notice, { borderColor: colors.grayBorder }]}>
              <Text style={[styles.noticeText, { color: colors.textSoft }]}>
                {message}
              </Text>
            </View>
          ) : null}

          {activeRoom?.status === "waiting" ? (
            <View
              style={[
                styles.waitingPanel,
                { backgroundColor: colors.card, borderColor: colors.grayBorder },
              ]}
            >
              <ActivityIndicator color={colors.blue} size="large" />
              <Text style={[styles.waitingText, { color: colors.text }]}>
                {activeRoom.mode === "speed" && activeRoom.matchmaking
                  ? copy.autoWaiting
                  : copy.waiting}
              </Text>
              <Text style={[styles.roomCode, { color: colors.textSoft }]}>
                {copy.roomCode}: {activeRoom.roomCode}
              </Text>
              <Pressable
                accessibilityRole="button"
                onPress={handleLeave}
                style={[styles.secondaryButton, { borderColor: colors.grayBorder }]}
              >
                <Text style={[styles.secondaryButtonText, { color: colors.blue }]}>
                  {copy.cancel}
                </Text>
              </Pressable>
            </View>
          ) : null}

          {activeRoom?.status === "playing" || activeRoom?.status === "finished" ? (
            <View style={styles.gameArea}>
              <View style={styles.scoreRow}>
                <ScoreBadge
                  active={currentSide === "left"}
                  answered={
                    Object.keys(activeRoom.answers.left).length
                  }
                  color={colors.blue}
                  colors={colors}
                  name={leftName}
                  role={copy.playerOne}
                  score={activeRoom.scores.left}
                  total={totalQuestions}
                />
                <ScoreBadge
                  active={currentSide === "right"}
                  answered={
                    Object.keys(activeRoom.answers.right).length
                  }
                  color={colors.purple}
                  colors={colors}
                  name={rightName}
                  role={copy.playerTwo}
                  score={activeRoom.scores.right}
                  total={totalQuestions}
                />
              </View>

              <View
                style={[
                  styles.timerPanel,
                  { backgroundColor: colors.card, borderColor: colors.grayBorder },
                ]}
              >
                <View>
                  <Text style={[styles.timerLabel, { color: colors.textSoft }]}>
                    {activeRoom.mode === "speed"
                      ? copy.speedProgress
                      : remainingMs <= 0
                        ? copy.timeUp
                        : copy.timeLeft}
                  </Text>
                  <Text
                    style={[
                      styles.timerValue,
                      {
                        color:
                          activeRoom.mode !== "speed" && remainingMs <= 60_000
                            ? "#D83A3A"
                            : colors.text,
                      },
                    ]}
                  >
                    {activeRoom.mode === "speed"
                      ? `${myAnsweredCount}/${totalQuestions}`
                      : formatTime(remainingMs)}
                  </Text>
                </View>
                <Text style={[styles.progressText, { color: colors.textSoft }]}>
                  {copy.yourSide}: {myAnsweredCount}/{totalQuestions} ·{" "}
                  {copy.opponent}: {opponentAnsweredCount}/{totalQuestions}
                </Text>
              </View>

              {activeRoom.status === "finished" ? (
                <ResultMessage
                  colors={colors}
                  copy={copy}
                  currentSide={currentSide}
                  room={activeRoom}
                />
              ) : null}

              <View style={styles.questionGrid}>
                {roomQuestions.map((question, index) => {
                  const answer = currentSide
                    ? activeRoom.answers[currentSide][question.id]
                    : undefined;
                  const selected =
                    activeRoom.mode === "speed"
                      ? index === myAnsweredCount && !speedDone
                      : index === safeSelectedIndex;
                  const answered = Boolean(answer);
                  const borderColor = selected
                    ? colors.blue
                    : answered
                      ? answer?.correct
                        ? feedbackColors.correctBorder
                        : feedbackColors.wrongBorder
                      : colors.grayBorder;
                  const backgroundColor = selected
                    ? colors.blueLight
                    : answered
                      ? answer?.correct
                        ? feedbackColors.correctBackground
                        : feedbackColors.wrongBackground
                      : colors.card;

                  return (
                    <Pressable
                      accessibilityRole="button"
                      disabled={activeRoom.mode === "speed"}
                      key={question.id}
                      onPress={() => {
                        if (activeRoom.mode === "exam") {
                          setSelectedIndex(index);
                        }
                      }}
                      style={({ pressed }) => [
                        styles.questionChip,
                        { backgroundColor, borderColor },
                        pressed && styles.pressed,
                      ]}
                    >
                      <Text
                        style={[
                          styles.questionChipText,
                          {
                            color: selected
                              ? colors.blue
                              : answered
                                ? answer?.correct
                                  ? feedbackColors.correctText
                                  : feedbackColors.wrongText
                                : colors.text,
                          },
                        ]}
                      >
                        {index + 1}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {activeRoom.mode === "speed" ? (
                speedDone ? (
                  <View
                    style={[
                      styles.waitingPanel,
                      {
                        backgroundColor: colors.card,
                        borderColor: colors.grayBorder,
                      },
                    ]}
                  >
                    <ActivityIndicator color={colors.blue} size="small" />
                    <Text style={[styles.waitingText, { color: colors.text }]}>
                      {copy.speedDoneWaiting}
                    </Text>
                  </View>
                ) : speedCurrentQuestion ? (
                  <View
                    style={[
                      styles.questionPanel,
                      {
                        backgroundColor: colors.card,
                        borderColor: colors.grayBorder,
                      },
                    ]}
                  >
                    <View style={styles.badgeRow}>
                      <View
                        style={[
                          styles.topicBadge,
                          { backgroundColor: colors.blueLight },
                        ]}
                      >
                        <Text style={[styles.topicText, { color: colors.blue }]}>
                          {copy.speedBattle}
                        </Text>
                      </View>
                    </View>
                    <Text
                      style={[styles.questionKicker, { color: colors.textSoft }]}
                    >
                      {copy.question} {myAnsweredCount + 1}/{totalQuestions}
                    </Text>
                    <Text style={[styles.speedQuestionText, { color: colors.text }]}>
                      {speedCurrentQuestion.prompt}
                    </Text>
                    <View style={styles.speedAnswerRow}>
                      <TextInput
                        accessibilityLabel={copy.speedInputPlaceholder}
                        editable={!speedAnswerDisabled}
                        keyboardType="number-pad"
                        onChangeText={(value) =>
                          setSpeedAnswer(value.replace(/[^0-9]/g, ""))
                        }
                        onSubmitEditing={handleSpeedAnswer}
                        placeholder={copy.speedInputPlaceholder}
                        placeholderTextColor={colors.gray}
                        returnKeyType="done"
                        style={[
                          styles.speedAnswerInput,
                          {
                            backgroundColor: colors.surface,
                            borderColor: colors.grayBorder,
                            color: colors.text,
                          },
                        ]}
                        value={speedAnswer}
                      />
                      <Pressable
                        accessibilityRole="button"
                        disabled={speedAnswerDisabled || !speedAnswer}
                        onPress={handleSpeedAnswer}
                        style={({ pressed }) => [
                          styles.speedSubmitButton,
                          {
                            backgroundColor:
                              !speedAnswerDisabled && speedAnswer
                                ? colors.blue
                                : colors.grayBorder,
                            borderBottomColor:
                              !speedAnswerDisabled && speedAnswer
                                ? colors.blueDark
                                : colors.grayDisabled,
                          },
                          pressed &&
                            !speedAnswerDisabled &&
                            speedAnswer &&
                            styles.pressed,
                        ]}
                      >
                        {submittingQuestionId === speedCurrentQuestion.id ? (
                          <ActivityIndicator color={COLORS.white} size="small" />
                        ) : (
                          <Text
                            style={[
                              styles.primaryButtonText,
                              {
                                color:
                                  !speedAnswerDisabled && speedAnswer
                                    ? colors.surface
                                    : colors.gray,
                              },
                            ]}
                          >
                            {copy.submitAnswer}
                          </Text>
                        )}
                      </Pressable>
                    </View>
                  </View>
                ) : null
              ) : null}

              {currentQuestion ? (
                <View
                  style={[
                    styles.questionPanel,
                    { backgroundColor: colors.card, borderColor: colors.grayBorder },
                  ]}
                >
                  <View style={styles.badgeRow}>
                    <View
                      style={[
                        styles.topicBadge,
                        { backgroundColor: colors.blueLight },
                      ]}
                    >
                      <Text style={[styles.topicText, { color: colors.blue }]}>
                        {currentQuestion.topic}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.levelBadge,
                        { borderColor: colors.purple },
                      ]}
                    >
                      <Text style={[styles.levelText, { color: colors.purple }]}>
                        {copy.difficulty[currentQuestion.difficulty]}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.questionKicker, { color: colors.textSoft }]}>
                    {copy.question} {safeSelectedIndex + 1}/{totalQuestions} ·{" "}
                    {currentQuestion.source}
                  </Text>
                  {currentQuestion.promptContent?.length ? (
                    <View style={styles.questionContent}>
                      {currentQuestion.promptContent.map(renderQuestionContent)}
                    </View>
                  ) : (
                    <Text style={[styles.questionText, { color: colors.text }]}>
                      {currentQuestion.prompt}
                    </Text>
                  )}
                </View>
              ) : null}

              {currentQuestion ? (
                <View style={styles.choiceList}>
                  {currentQuestion.choices.map((choice, index) => {
                    const choiceKey =
                      currentQuestion.choiceKeys?.[index] ?? String(index + 1);
                    const compactChoice = choice === choiceKey;
                    const selected = currentAnswer?.choiceIndex === index;
                    const correctChoice =
                      Boolean(currentAnswer) &&
                      currentQuestion.answerIndex === index;
                    const showWrong =
                      Boolean(currentAnswer) && selected && !currentAnswer?.correct;
                    const disabled =
                      answerDisabled || submittingQuestionId === currentQuestion.id;

                    return (
                      <Pressable
                        accessibilityRole="button"
                        disabled={disabled}
                        key={`${currentQuestion.id}-${choiceKey}-${index}`}
                        onPress={() => handleChoicePress(index)}
                        style={({ pressed }) => [
                          styles.choiceButton,
                          compactChoice && styles.choiceButtonCompact,
                          {
                            backgroundColor: correctChoice
                              ? feedbackColors.correctBackground
                              : showWrong
                                ? feedbackColors.wrongBackground
                                : colors.card,
                            borderColor: correctChoice
                              ? feedbackColors.correctBorder
                              : showWrong
                                ? feedbackColors.wrongBorder
                                : selected
                                  ? colors.blue
                                  : colors.grayBorder,
                          },
                          pressed && !disabled && styles.pressed,
                        ]}
                      >
                        <View
                          style={[
                            styles.choiceKey,
                            {
                              backgroundColor: correctChoice
                                ? feedbackColors.correctBorder
                                : showWrong
                                  ? feedbackColors.wrongBorder
                                  : colors.blueLight,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.choiceKeyText,
                              {
                                color:
                                  correctChoice || showWrong
                                    ? COLORS.white
                                    : colors.blue,
                              },
                            ]}
                          >
                            {choiceKey}
                          </Text>
                        </View>
                        {compactChoice ? null : (
                          <Text
                            style={[
                              styles.choiceText,
                              {
                                color: correctChoice
                                  ? feedbackColors.correctText
                                  : showWrong
                                    ? feedbackColors.wrongText
                                    : colors.text,
                              },
                            ]}
                          >
                            {choice}
                          </Text>
                        )}
                        {submittingQuestionId === currentQuestion.id && selected ? (
                          <ActivityIndicator color={colors.blue} size="small" />
                        ) : null}
                      </Pressable>
                    );
                  })}
                </View>
              ) : null}

              {currentAnswer && currentQuestion ? (
                <View
                  style={[
                    styles.explanationPanel,
                    {
                      backgroundColor: currentAnswer.correct
                        ? feedbackColors.correctBackground
                        : feedbackColors.wrongBackground,
                      borderColor: currentAnswer.correct
                        ? feedbackColors.correctBorder
                        : feedbackColors.wrongBorder,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.explanationTitle,
                      {
                        color: currentAnswer.correct
                          ? feedbackColors.correctText
                          : feedbackColors.wrongText,
                      },
                    ]}
                  >
                    {currentAnswer.correct ? copy.correct : copy.wrong}
                  </Text>
                  <Text
                    style={[
                      styles.explanationText,
                      {
                        color: currentAnswer.correct
                          ? feedbackColors.correctText
                          : feedbackColors.wrongText,
                      },
                    ]}
                  >
                    {copy.explanation}: {currentQuestion.explanation}
                  </Text>
                </View>
              ) : null}

              {activeRoom.mode === "exam" &&
              activeRoom.status === "playing" &&
              remainingMs <= 0 ? (
                <Pressable
                  accessibilityRole="button"
                  disabled={finishing}
                  onPress={handleFinishRoom}
                  style={({ pressed }) => [
                    styles.secondaryButton,
                    { borderColor: colors.purple },
                    pressed && !finishing && styles.pressed,
                  ]}
                >
                  {finishing ? (
                    <ActivityIndicator color={colors.purple} size="small" />
                  ) : (
                    <Text
                      style={[styles.secondaryButtonText, { color: colors.purple }]}
                    >
                      {copy.finished}
                    </Text>
                  )}
                </Pressable>
              ) : null}

              {activeRoom.status === "finished" ? (
                <Pressable
                  accessibilityRole="button"
                  onPress={handleCreateRoom}
                  style={({ pressed }) => [
                    styles.primaryButton,
                    {
                      backgroundColor: colors.green,
                      borderBottomColor: colors.greenDark,
                    },
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={[styles.primaryButtonText, { color: colors.surface }]}>
                    {copy.newMatch}
                  </Text>
                </Pressable>
              ) : null}
            </View>
          ) : null}

          {activeRoom?.status === "cancelled" ? (
            <View
              style={[
                styles.waitingPanel,
                { backgroundColor: colors.card, borderColor: colors.grayBorder },
              ]}
            >
              <Text style={[styles.waitingText, { color: colors.text }]}>
                {copy.cancelled}
              </Text>
              <Pressable
                accessibilityRole="button"
                onPress={handleCreateRoom}
                style={({ pressed }) => [
                  styles.primaryButton,
                  {
                    backgroundColor: colors.green,
                    borderBottomColor: colors.greenDark,
                  },
                  pressed && styles.pressed,
                ]}
              >
                <Text style={[styles.primaryButtonText, { color: colors.surface }]}>
                  {copy.newMatch}
                </Text>
              </Pressable>
            </View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>

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
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
    marginBottom: 12,
  },
  battleTitle: {
    fontFamily: FONTS.extra,
    fontSize: 22,
    lineHeight: 28,
  },
  choiceButton: {
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 2,
    flexDirection: "row",
    gap: 10,
    minHeight: 58,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  choiceButtonCompact: {
    justifyContent: "center",
  },
  choiceKey: {
    alignItems: "center",
    borderRadius: 18,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  choiceKeyText: {
    fontFamily: FONTS.extra,
    fontSize: 16,
  },
  choiceList: {
    gap: 8,
  },
  choiceText: {
    flex: 1,
    fontFamily: FONTS.extra,
    fontSize: 15,
    lineHeight: 21,
    minWidth: 0,
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
    paddingBottom: 126,
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  explanationPanel: {
    borderRadius: 14,
    borderWidth: 2,
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  explanationText: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    lineHeight: 19,
  },
  explanationTitle: {
    fontFamily: FONTS.extra,
    fontSize: 16,
    lineHeight: 22,
  },
  gameArea: {
    gap: 12,
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
    minWidth: 0,
  },
  joinButton: {
    alignItems: "center",
    borderBottomWidth: 4,
    borderRadius: 12,
    justifyContent: "center",
    minHeight: 50,
    minWidth: 104,
    paddingHorizontal: 14,
  },
  keyboard: {
    flex: 1,
  },
  levelBadge: {
    borderRadius: 999,
    borderWidth: 2,
    justifyContent: "center",
    minHeight: 32,
    paddingHorizontal: 12,
  },
  levelText: {
    fontFamily: FONTS.extra,
    fontSize: 12,
  },
  modeButton: {
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 2,
    flex: 1,
    justifyContent: "center",
    minHeight: 42,
    paddingHorizontal: 12,
  },
  modeButtonText: {
    fontFamily: FONTS.extra,
    fontSize: 13,
  },
  modeTabs: {
    borderRadius: 12,
    borderWidth: 2,
    flexDirection: "row",
    gap: 8,
    padding: 4,
    width: "100%",
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
  pressed: {
    opacity: 0.85,
    transform: [{ translateY: 1 }],
  },
  primaryButton: {
    alignItems: "center",
    borderBottomWidth: 4,
    borderRadius: 14,
    justifyContent: "center",
    minHeight: 50,
    paddingHorizontal: 18,
  },
  primaryButtonText: {
    fontFamily: FONTS.extra,
    fontSize: 15,
    letterSpacing: 0,
  },
  progressText: {
    flex: 1,
    fontFamily: FONTS.bold,
    fontSize: 12,
    lineHeight: 17,
    minWidth: 0,
    textAlign: "right",
  },
  questionChip: {
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 2,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  questionChipText: {
    fontFamily: FONTS.extra,
    fontSize: 14,
  },
  questionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
  },
  questionContent: {
    alignItems: "stretch",
    gap: 10,
    marginTop: 8,
    width: "100%",
  },
  questionImage: {
    alignSelf: "center",
    aspectRatio: 1.45,
    borderRadius: 10,
    maxHeight: 260,
    width: "100%",
  },
  questionKicker: {
    fontFamily: FONTS.extra,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
  },
  questionPanel: {
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 2,
    paddingHorizontal: 14,
    paddingVertical: 16,
  },
  questionText: {
    fontFamily: FONTS.extra,
    fontSize: 17,
    lineHeight: 25,
    marginTop: 8,
    textAlign: "center",
  },
  resultKicker: {
    fontFamily: FONTS.extra,
    fontSize: 12,
    textAlign: "center",
  },
  resultPanel: {
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 2,
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  resultScore: {
    fontFamily: FONTS.extra,
    fontSize: 20,
  },
  resultTitle: {
    fontFamily: FONTS.extra,
    fontSize: 24,
    lineHeight: 31,
    textAlign: "center",
  },
  roomActions: {
    gap: 10,
    width: "100%",
  },
  roomButton: {
    width: "100%",
  },
  roomCode: {
    fontFamily: FONTS.bold,
    fontSize: 13,
  },
  roomCodeInput: {
    borderRadius: 12,
    borderWidth: 2,
    flex: 1,
    fontFamily: FONTS.extra,
    fontSize: 17,
    height: 50,
    letterSpacing: 0,
    minWidth: 0,
    paddingHorizontal: 12,
    textAlign: "center",
  },
  roomCodeRow: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
  },
  scoreBadge: {
    borderRadius: 14,
    borderWidth: 2,
    flex: 1,
    minWidth: 0,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  scoreLine: {
    alignItems: "flex-end",
    flexDirection: "row",
    gap: 8,
  },
  scoreMeta: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    marginBottom: 5,
  },
  scoreName: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    lineHeight: 17,
    minHeight: 17,
  },
  scoreNumber: {
    fontFamily: FONTS.extra,
    fontSize: 32,
    lineHeight: 38,
  },
  scoreRole: {
    fontFamily: FONTS.extra,
    fontSize: 12,
  },
  scoreRow: {
    flexDirection: "row",
    gap: 10,
  },
  secondaryButton: {
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: "center",
    minHeight: 46,
    paddingHorizontal: 16,
    width: "100%",
  },
  secondaryButtonText: {
    fontFamily: FONTS.extra,
    fontSize: 14,
  },
  speedAnswerInput: {
    borderRadius: 12,
    borderWidth: 2,
    flex: 1,
    fontFamily: FONTS.extra,
    fontSize: 20,
    height: 54,
    letterSpacing: 0,
    minWidth: 0,
    paddingHorizontal: 12,
    textAlign: "center",
  },
  speedAnswerRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
    width: "100%",
  },
  speedQuestionText: {
    fontFamily: FONTS.extra,
    fontSize: 34,
    lineHeight: 42,
    marginTop: 10,
    textAlign: "center",
  },
  speedSubmitButton: {
    alignItems: "center",
    borderBottomWidth: 4,
    borderRadius: 12,
    justifyContent: "center",
    minHeight: 54,
    minWidth: 92,
    paddingHorizontal: 14,
  },
  startPanel: {
    alignItems: "stretch",
    borderRadius: 14,
    borderWidth: 2,
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  startText: {
    flex: 1,
    minWidth: 0,
  },
  statusBadge: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  statusRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  statusText: {
    fontFamily: FONTS.extra,
    fontSize: 12,
  },
  subtitle: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
  },
  targetText: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
  },
  timerLabel: {
    fontFamily: FONTS.extra,
    fontSize: 12,
  },
  timerPanel: {
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 2,
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  timerValue: {
    fontFamily: FONTS.extra,
    fontSize: 28,
    lineHeight: 34,
  },
  title: {
    fontFamily: FONTS.extra,
    fontSize: 25,
    lineHeight: 31,
  },
  topicBadge: {
    borderRadius: 999,
    justifyContent: "center",
    minHeight: 32,
    paddingHorizontal: 12,
  },
  topicText: {
    fontFamily: FONTS.extra,
    fontSize: 12,
  },
  waitingPanel: {
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 2,
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  waitingText: {
    fontFamily: FONTS.extra,
    fontSize: 18,
    lineHeight: 24,
    textAlign: "center",
  },
});
