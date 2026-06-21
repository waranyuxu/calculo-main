import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  collection,
  deleteField,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  where,
  type DocumentData,
  type DocumentReference,
  type Firestore,
  type Transaction,
  type Unsubscribe,
} from "firebase/firestore";
import type { User } from "firebase/auth";
import {
  createCompetitionExamSet,
  getCompetitionExamDurationMs,
  getCompetitionExamQuestionCount,
  type CompetitionExamQuestion,
} from "@/constants/competition-exam-questions";
import {
  QUESTIONS_PER_UNIT,
  UNITS_PER_SECTION,
} from "@/constants/math-course-map";
import {
  DEFAULT_PROFILE_AVATAR_ID,
  isProfileAvatarId,
  type PlayerAvatarId,
} from "@/constants/profile-avatars";
import { getDisplayNameFromUser } from "@/services/auth-service";
import { getLoginFirebaseDb as getCompetitionFirebaseDb } from "@/services/firebase";

export type CompetitionSide = "left" | "right";
export type CompetitionStatus = "waiting" | "playing" | "finished" | "cancelled";
export type CompetitionWinner = CompetitionSide | "draw";
export type CompetitionMode = "exam" | "speed";

export type CompetitionPlayer = {
  accountId?: string;
  avatarId?: PlayerAvatarId;
  id: string;
  name: string;
  photoURL?: string;
};

export type CompetitionQuestion = {
  id: string;
  prompt: string;
  answer: number;
};

export type CompetitionExamAnswer = {
  answeredAt: number;
  choiceIndex: number;
  correct: boolean;
  value: string;
};

export type CompetitionAnswerMap = Record<
  CompetitionSide,
  Record<string, CompetitionExamAnswer>
>;

export type CompetitionRoom = {
  answers: CompetitionAnswerMap;
  durationMs: number;
  endsAt: number;
  id: string;
  guestAuthId?: string;
  guestId?: string;
  hostAuthId?: string;
  hostId: string;
  lastAnswer?: {
    correct: boolean;
    playerName: string;
    side: CompetitionSide;
    value: string;
  };
  matchmaking: boolean;
  mode: CompetitionMode;
  players: {
    left: CompetitionPlayer;
    right?: CompetitionPlayer;
  };
  question: CompetitionQuestion;
  questionNumber: number;
  questions: CompetitionExamQuestion[];
  roomCode: string;
  scores: Record<CompetitionSide, number>;
  speedQuestions: CompetitionQuestion[];
  startedAt: number;
  status: CompetitionStatus;
  rewardClaims: Partial<Record<CompetitionSide, boolean>>;
  targetScore: number;
  winner?: CompetitionWinner;
};

export type MatchmakingResult = {
  roomId: string;
  side: CompetitionSide;
};

export type SubmitAnswerResult = {
  alreadyAnswered?: boolean;
  correct: boolean;
  finished: boolean;
  reward?: CompetitionReward;
  score?: number;
  stale?: boolean;
  winner?: CompetitionWinner;
};

export type CompetitionReward = {
  calcuCoin: number;
  margin: number;
  totalQuestions: number;
  trophies: number;
  xp: number;
};

export type CompetitionRank = {
  color: string;
  displayRange: string;
  max?: number;
  min: number;
  name: string;
};

export type CompetitionLeaderboardEntry = {
  avatarId: PlayerAvatarId;
  id: string;
  playerId: string;
  playerName: string;
  photoURL: string;
  rank: CompetitionRank;
  trophies: number;
  wins: number;
};

type CompetitionPlayerIdentity = CompetitionPlayer | string | null | undefined;

const COMPETITION_COLLECTION = "competitionRooms";
const LEADERBOARD_COLLECTION = "competitionLeaderboard";
const MATH_PROGRESS_COLLECTION = "mathProgress";
const PROFILE_COLLECTION = "userProfiles";
const GUEST_PLAYER_ID_KEY = "calculo.competition.guestPlayerId.v1";
const ROOM_CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const ROOM_CODE_LENGTH = 6;
const ROOM_CODE_MAX_ATTEMPTS = 12;
const TARGET_SCORE = getCompetitionExamQuestionCount();
const SPEED_TARGET_SCORE = 20;
const EXAM_DURATION_MS = getCompetitionExamDurationMs();

export const COMPETITION_RANKS: CompetitionRank[] = [
  { color: "#B9783F", displayRange: "0-100", max: 100, min: 0, name: "บลอนซ์" },
  { color: "#8CA3B8", displayRange: "101-300", max: 300, min: 101, name: "เงิน" },
  { color: "#D9A21B", displayRange: "301-500", max: 499, min: 301, name: "โกลด์" },
  { color: "#44BFEF", displayRange: "500-1000", max: 1000, min: 500, name: "ไดม่อน" },
  { color: "#9B66FF", displayRange: "1001-2000", max: 2999, min: 1001, name: "แกน" },
  { color: "#F35DA3", displayRange: "3000+", min: 3000, name: "Prince of Math" },
];

function createId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 9)}`;
}

const runtimePlayerSessionIds: Record<string, string> = {};

async function getPlayerSessionId(accountId: string) {
  if (!runtimePlayerSessionIds[accountId]) {
    runtimePlayerSessionIds[accountId] = createId("player");
  }

  return runtimePlayerSessionIds[accountId];
}

function getRewardOwnerId(player: CompetitionPlayer) {
  return player.accountId || player.id;
}

function getIdentityPlayerId(identity: CompetitionPlayerIdentity) {
  return typeof identity === "string" ? identity : identity?.id ?? "";
}

function getIdentityAccountId(identity: CompetitionPlayerIdentity) {
  return typeof identity === "string" ? "" : identity?.accountId ?? "";
}

function storedPlayerMatches(
  storedPlayer: CompetitionPlayer | undefined,
  identity: CompetitionPlayerIdentity,
) {
  if (!storedPlayer || !identity) {
    return false;
  }

  const playerId = getIdentityPlayerId(identity);
  const accountId = getIdentityAccountId(identity);

  return (
    (Boolean(playerId) && storedPlayer.id === playerId) ||
    (Boolean(accountId) && storedPlayer.accountId === accountId)
  );
}

function createRoomCode() {
  let code = "";

  for (let index = 0; index < ROOM_CODE_LENGTH; index += 1) {
    code += ROOM_CODE_CHARS[randomInt(0, ROOM_CODE_CHARS.length - 1)];
  }

  return code;
}

export function normalizeCompetitionRoomCode(value: string) {
  return value
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, ROOM_CODE_LENGTH);
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function getCompetitionRank(trophies: number) {
  return (
    COMPETITION_RANKS.find(
      (rank) =>
        trophies >= rank.min &&
        (typeof rank.max !== "number" || trophies <= rank.max),
    ) ?? COMPETITION_RANKS[0]
  );
}

export function createCompetitionQuestion(): CompetitionQuestion {
  const type = randomInt(0, 3);
  const a = randomInt(2, 12);
  const b = randomInt(2, 12);

  if (type === 0) {
    const left = randomInt(12, 80);
    const right = randomInt(8, 60);
    return {
      answer: left + right,
      id: createId("q"),
      prompt: `${left} + ${right}`,
    };
  }

  if (type === 1) {
    const answer = randomInt(5, 70);
    const right = randomInt(4, 45);
    return {
      answer,
      id: createId("q"),
      prompt: `${answer + right} - ${right}`,
    };
  }

  if (type === 2) {
    return {
      answer: a * b,
      id: createId("q"),
      prompt: `${a} x ${b}`,
    };
  }

  return {
    answer: b,
    id: createId("q"),
    prompt: `${a * b} / ${a}`,
  };
}

function createCompetitionSpeedQuestionSet(count = SPEED_TARGET_SCORE) {
  return Array.from({ length: count }, () => createCompetitionQuestion());
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asString(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function asNumber(value: unknown, fallback = 0) {
  const nextValue = Number(value);
  return Number.isFinite(nextValue) ? nextValue : fallback;
}

function normalizeStatus(value: unknown): CompetitionStatus {
  return value === "playing" ||
    value === "finished" ||
    value === "cancelled" ||
    value === "waiting"
    ? value
    : "waiting";
}

function normalizeMode(value: unknown): CompetitionMode {
  return value === "speed" ? "speed" : "exam";
}

function normalizeSide(value: unknown): CompetitionSide | null {
  return value === "left" || value === "right" ? value : null;
}

function normalizeWinner(value: unknown): CompetitionWinner | undefined {
  if (value === "draw") {
    return "draw";
  }

  return normalizeSide(value) ?? undefined;
}

function normalizePlayer(
  value: unknown,
  fallback: CompetitionPlayer,
): CompetitionPlayer {
  if (!isRecord(value)) {
    return fallback;
  }

  return {
    accountId: asString(value.accountId, fallback.accountId),
    avatarId: isProfileAvatarId(value.avatarId)
      ? value.avatarId
      : fallback.avatarId,
    id: asString(value.id, fallback.id),
    name: asString(value.name, fallback.name),
    photoURL: asString(value.photoURL, fallback.photoURL),
  };
}

function normalizeQuestion(value: unknown): CompetitionQuestion {
  const fallback = createCompetitionQuestion();

  if (!isRecord(value)) {
    return fallback;
  }

  return {
    answer: asNumber(value.answer, fallback.answer),
    id: asString(value.id, fallback.id),
    prompt: asString(value.prompt, fallback.prompt),
  };
}

function normalizeSpeedQuestions(value: unknown): CompetitionQuestion[] {
  if (!Array.isArray(value)) {
    return createCompetitionSpeedQuestionSet();
  }

  const questions = value.map(normalizeQuestion);

  return questions.length > 0 ? questions : createCompetitionSpeedQuestionSet();
}

function normalizeExamQuestionContent(
  value: unknown,
): NonNullable<CompetitionExamQuestion["promptContent"]> {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (!isRecord(item)) {
        return null;
      }

      if (item.type === "image") {
        const assetPath = asString(item.assetPath);

        return assetPath
          ? {
              alt: asString(item.alt, "Question image"),
              assetPath,
              id: asString(item.id, assetPath),
              type: "image" as const,
            }
          : null;
      }

      if (item.type === "text") {
        const text = asString(item.text);

        return text
          ? {
              id: asString(item.id, "text"),
              text,
              type: "text" as const,
            }
          : null;
      }

      return null;
    })
    .filter(
      (
        item,
      ): item is NonNullable<CompetitionExamQuestion["promptContent"]>[number] =>
        Boolean(item),
    );
}

function normalizeExamQuestion(value: unknown): CompetitionExamQuestion | null {
  if (!isRecord(value)) {
    return null;
  }

  const choices = Array.isArray(value.choices)
    ? value.choices.filter((choice): choice is string => typeof choice === "string")
    : [];
  const answerIndex = asNumber(value.answerIndex, -1);

  if (
    choices.length < 2 ||
    answerIndex < 0 ||
    answerIndex >= choices.length
  ) {
    return null;
  }

  const question: CompetitionExamQuestion = {
    answerIndex,
    choices,
    difficulty:
      value.difficulty === "medium" ||
      value.difficulty === "hard" ||
      value.difficulty === "brutal"
        ? value.difficulty
        : "hard",
    explanation: asString(value.explanation),
    id: asString(value.id, createId("exam-q")),
    prompt: asString(value.prompt, "Question"),
    source: asString(value.source, "Competition exam"),
    topic: asString(value.topic, "Math"),
  };

  const choiceKeys = Array.isArray(value.choiceKeys)
    ? value.choiceKeys.filter(
        (choiceKey): choiceKey is string =>
          typeof choiceKey === "string" && choiceKey.trim().length > 0,
      )
    : [];
  const promptContent = normalizeExamQuestionContent(value.promptContent);

  if (choiceKeys.length === choices.length) {
    question.choiceKeys = choiceKeys;
  }

  if (promptContent.length > 0) {
    question.promptContent = promptContent;
  }

  return question;
}

function normalizeExamQuestions(value: unknown): CompetitionExamQuestion[] {
  if (!Array.isArray(value)) {
    return createCompetitionExamSet();
  }

  const questions = value
    .map(normalizeExamQuestion)
    .filter((question): question is CompetitionExamQuestion => Boolean(question));

  return questions.length > 0 ? questions : createCompetitionExamSet();
}

function normalizeAnswer(value: unknown): CompetitionExamAnswer | null {
  if (!isRecord(value)) {
    return null;
  }

  const choiceIndex = asNumber(value.choiceIndex, -1);
  if (choiceIndex < 0) {
    return null;
  }

  return {
    answeredAt: Math.max(0, asNumber(value.answeredAt)),
    choiceIndex,
    correct: value.correct === true,
    value: asString(value.value),
  };
}

function normalizeAnswerMap(value: unknown): CompetitionAnswerMap {
  const answers = isRecord(value) ? value : {};

  return {
    left: normalizeSideAnswers(answers.left),
    right: normalizeSideAnswers(answers.right),
  };
}

function normalizeSideAnswers(value: unknown) {
  if (!isRecord(value)) {
    return {};
  }

  return Object.entries(value).reduce<Record<string, CompetitionExamAnswer>>(
    (sideAnswers, [questionId, answer]) => {
      const normalizedAnswer = normalizeAnswer(answer);
      if (questionId && normalizedAnswer) {
        sideAnswers[questionId] = normalizedAnswer;
      }
      return sideAnswers;
    },
    {},
  );
}

function normalizeScores(value: unknown): Record<CompetitionSide, number> {
  const scores = isRecord(value) ? value : {};

  return {
    left: Math.max(0, asNumber(scores.left)),
    right: Math.max(0, asNumber(scores.right)),
  };
}

function normalizeRewardClaims(
  value: unknown,
): Partial<Record<CompetitionSide, boolean>> {
  const rewardClaims = isRecord(value) ? value : {};

  return {
    ...(rewardClaims.left === true ? { left: true } : {}),
    ...(rewardClaims.right === true ? { right: true } : {}),
  };
}

function normalizeLastAnswer(
  value: unknown,
): CompetitionRoom["lastAnswer"] | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const side = normalizeSide(value.side);
  if (!side) {
    return undefined;
  }

  return {
    correct: value.correct === true,
    playerName: asString(value.playerName, "Player"),
    side,
    value: asString(value.value),
  };
}

function normalizeRoom(id: string, data: DocumentData): CompetitionRoom {
  const players = isRecord(data.players) ? data.players : {};
  const hostId = asString(data.hostId, "host");
  const guestId = asString(data.guestId);
  const hostAuthId = asString(data.hostAuthId, hostId);
  const guestAuthId = asString(data.guestAuthId, guestId);
  const mode = normalizeMode(data.mode);
  const questions = mode === "exam" ? normalizeExamQuestions(data.questions) : [];
  const speedQuestions =
    mode === "speed" ? normalizeSpeedQuestions(data.speedQuestions) : [];
  const rightPlayer = players.right
    ? normalizePlayer(players.right, {
        accountId: guestAuthId,
        id: guestId || "guest",
        name: "Player 2",
      })
    : undefined;

  return {
    answers: normalizeAnswerMap(data.answers),
    durationMs: Math.max(0, asNumber(data.durationMs, EXAM_DURATION_MS)),
    endsAt: Math.max(0, asNumber(data.endsAt)),
    guestAuthId: guestAuthId || undefined,
    guestId: guestId || undefined,
    hostAuthId: hostAuthId || undefined,
    hostId,
    id,
    lastAnswer: normalizeLastAnswer(data.lastAnswer),
    matchmaking: data.matchmaking === true,
    players: {
      left: normalizePlayer(players.left, {
        accountId: hostAuthId,
        id: hostId,
        name: "Player 1",
      }),
        ...(rightPlayer ? { right: rightPlayer } : {}),
    },
    mode,
    question: normalizeQuestion(data.question),
    questionNumber: Math.max(0, asNumber(data.questionNumber)),
    questions,
    rewardClaims: normalizeRewardClaims(data.rewardClaims),
    roomCode: normalizeCompetitionRoomCode(asString(data.roomCode, id)) || id,
    scores: normalizeScores(data.scores),
    speedQuestions,
    startedAt: Math.max(0, asNumber(data.startedAt)),
    status: normalizeStatus(data.status),
    targetScore: Math.max(
      1,
      asNumber(data.targetScore, mode === "speed" ? SPEED_TARGET_SCORE : TARGET_SCORE),
    ),
    winner: normalizeWinner(data.winner),
  };
}

function normalizeLeaderboardEntry(
  id: string,
  data: DocumentData,
): CompetitionLeaderboardEntry {
  const trophies = Math.max(0, asNumber(data.trophies));

  return {
    avatarId: isProfileAvatarId(data.avatarId)
      ? data.avatarId
      : DEFAULT_PROFILE_AVATAR_ID,
    id,
    playerId: asString(data.playerId, id),
    playerName: asString(data.playerName, "Player"),
    photoURL: asString(data.photoURL),
    rank: getCompetitionRank(trophies),
    trophies,
    wins: Math.max(0, asNumber(data.wins)),
  };
}

function playerPayload(player: CompetitionPlayer) {
  return {
    accountId: player.accountId ?? player.id,
    avatarId: player.avatarId ?? DEFAULT_PROFILE_AVATAR_ID,
    id: player.id,
    name: player.name,
    photoURL: player.photoURL ?? "",
  };
}

function emptyAnswers(): CompetitionAnswerMap {
  return { left: {}, right: {} };
}

function getModeTargetScore(mode: CompetitionMode) {
  return mode === "speed" ? SPEED_TARGET_SCORE : TARGET_SCORE;
}

function getModeDurationMs(mode: CompetitionMode) {
  return mode === "speed" ? 0 : EXAM_DURATION_MS;
}

function countAnswered(
  answers: CompetitionAnswerMap,
  side: CompetitionSide,
  questions: { id: string }[],
) {
  const questionIds = new Set(questions.map((question) => question.id));

  return Object.keys(answers[side]).filter((questionId) =>
    questionIds.has(questionId),
  ).length;
}

function calculateScores(
  answers: CompetitionAnswerMap,
  questions: { id: string }[],
): Record<CompetitionSide, number> {
  const questionIds = new Set(questions.map((question) => question.id));

  return {
    left: Object.entries(answers.left).filter(
      ([questionId, answer]) => questionIds.has(questionId) && answer.correct,
    ).length,
    right: Object.entries(answers.right).filter(
      ([questionId, answer]) => questionIds.has(questionId) && answer.correct,
    ).length,
  };
}

function anyPlayerFinishedPerfectly(
  answers: CompetitionAnswerMap,
  scores: Record<CompetitionSide, number>,
  questions: { id: string }[],
) {
  const totalQuestions = questions.length;

  if (totalQuestions <= 0) {
    return false;
  }

  return (
    (countAnswered(answers, "left", questions) >= totalQuestions &&
      scores.left >= totalQuestions) ||
    (countAnswered(answers, "right", questions) >= totalQuestions &&
      scores.right >= totalQuestions)
  );
}

function bothPlayersAnsweredAll(
  answers: CompetitionAnswerMap,
  questions: { id: string }[],
) {
  const totalQuestions = questions.length;

  if (totalQuestions <= 0) {
    return false;
  }

  return (
    countAnswered(answers, "left", questions) >= totalQuestions &&
    countAnswered(answers, "right", questions) >= totalQuestions
  );
}

function shouldFinishCompetition(
  answers: CompetitionAnswerMap,
  scores: Record<CompetitionSide, number>,
  questions: { id: string }[],
) {
  return (
    anyPlayerFinishedPerfectly(answers, scores, questions) ||
    bothPlayersAnsweredAll(answers, questions)
  );
}

function getWinnerFromScores(
  scores: Record<CompetitionSide, number>,
): CompetitionWinner {
  if (scores.left === scores.right) {
    return "draw";
  }

  return scores.left > scores.right ? "left" : "right";
}

function getRewardFromScores(
  scores: Record<CompetitionSide, number>,
  questions: { id: string }[],
): CompetitionReward {
  const margin = Math.abs(scores.left - scores.right);
  const totalQuestions = Math.max(1, questions.length || TARGET_SCORE);
  const ratio = Math.min(1, margin / totalQuestions);

  return {
    calcuCoin: margin > 0 ? Math.max(1, Math.ceil(ratio * 100)) : 0,
    margin,
    totalQuestions,
    trophies: margin > 0 ? Math.max(1, Math.ceil(ratio * 100)) : 0,
    xp: margin > 0 ? Math.max(1, Math.ceil(ratio * 500)) : 0,
  };
}

function getNonNegativeDataNumber(
  source: Record<string, unknown> | null | undefined,
  keys: string[],
) {
  let highestValue = 0;

  for (const key of keys) {
    const value = Number(source?.[key]);

    if (Number.isFinite(value)) {
      highestValue = Math.max(highestValue, value);
    }
  }

  return Math.max(0, highestValue);
}

function getStoredProgressNumber(
  source: Record<string, unknown> | null | undefined,
  key: string,
  fallback = 0,
) {
  const value = Number(source?.[key]);
  return Number.isFinite(value) ? value : fallback;
}

function getStoredProgressIndex(
  source: Record<string, unknown> | null | undefined,
  indexKeys: string[],
  numberKeys: string[],
) {
  for (const key of indexKeys) {
    const value = Number(source?.[key]);

    if (Number.isFinite(value)) {
      return Math.max(0, value);
    }
  }

  for (const key of numberKeys) {
    const value = Number(source?.[key]);

    if (Number.isFinite(value)) {
      return Math.max(0, value - 1);
    }
  }

  return 0;
}

function getStoredCompletedStages(
  source: Record<string, unknown> | null | undefined,
  currentSectionIndex: number,
  currentUnitIndex: number,
  currentStageIndex: number,
) {
  const completedStages = getStoredProgressNumber(source, "completedStages");
  const completedUnits = getStoredProgressNumber(source, "completedUnits");
  const completedStagesFromUnits =
    completedUnits > 0 ? completedUnits * QUESTIONS_PER_UNIT : 0;
  const completedStagesFromPosition =
    (currentSectionIndex * UNITS_PER_SECTION + currentUnitIndex) *
      QUESTIONS_PER_UNIT +
    currentStageIndex;

  return Math.max(
    0,
    completedStages,
    completedStagesFromUnits,
    completedStagesFromPosition,
  );
}

function createProgressRewardPayload(
  data: Record<string, unknown> | null,
  reward: CompetitionReward,
) {
  const currentSectionIndex = getStoredProgressIndex(
    data,
    ["currentSectionIndex", "sectionIndex", "currentChapterIndex"],
    ["currentChapter", "currentSection", "chapter", "section"],
  );
  const currentUnitIndex = getStoredProgressIndex(
    data,
    ["currentUnitIndex", "unitIndex"],
    ["currentUnit", "unit"],
  );
  const currentStageIndex = getStoredProgressIndex(
    data,
    ["currentStageIndex", "stageIndex"],
    ["currentStage", "stage"],
  );
  const nextCalcuCoin =
    getNonNegativeDataNumber(data, ["calcuCoin", "calcucoin", "CalcuCoin"]) +
    reward.calcuCoin;
  const nextXp = getNonNegativeDataNumber(data, ["xp", "XP"]) + reward.xp;

  return {
    CalcuCoin: deleteField(),
    XP: deleteField(),
    calcuCoin: nextCalcuCoin,
    calcucoin: deleteField(),
    completedStages: getStoredCompletedStages(
      data,
      currentSectionIndex,
      currentUnitIndex,
      currentStageIndex,
    ),
    currentChapter: currentSectionIndex + 1,
    currentSectionIndex,
    currentStage: currentStageIndex + 1,
    currentStageIndex,
    currentUnit: currentUnitIndex + 1,
    currentUnitIndex,
    updatedAt: new Date().toISOString(),
    xp: nextXp,
  };
}

async function claimWinnerRewardInTransaction({
  db,
  finalScores,
  player,
  room,
  roomRef,
  transaction,
  winner,
}: {
  db: Firestore;
  finalScores: Record<CompetitionSide, number>;
  player: CompetitionPlayer;
  room: CompetitionRoom;
  roomRef: DocumentReference<DocumentData>;
  transaction: Transaction;
  winner: CompetitionWinner;
}) {
  if (winner === "draw") {
    return undefined;
  }

  const winningSide = getCompetitionSideForPlayer(room, player);

  if (winningSide !== winner || room.rewardClaims[winner]) {
    return undefined;
  }

  const rewardQuestions =
    room.mode === "speed" ? room.speedQuestions : room.questions;
  const reward = getRewardFromScores(finalScores, rewardQuestions);

  if (!reward.trophies && !reward.xp && !reward.calcuCoin) {
    return undefined;
  }

  const rewardOwnerId = getRewardOwnerId(player);
  const leaderboardRef = doc(db, LEADERBOARD_COLLECTION, rewardOwnerId);
  const progressRef = doc(db, MATH_PROGRESS_COLLECTION, rewardOwnerId);
  const leaderboardSnapshot = await transaction.get(leaderboardRef);
  const progressSnapshot = await transaction.get(progressRef);
  const leaderboard = leaderboardSnapshot.exists()
    ? normalizeLeaderboardEntry(
        leaderboardSnapshot.id,
        leaderboardSnapshot.data(),
      )
    : null;
  const progressData = progressSnapshot.exists() ? progressSnapshot.data() : null;

  transaction.set(
    leaderboardRef,
    {
      lastCalcuCoinReward: reward.calcuCoin,
      lastMargin: reward.margin,
      lastReward: reward.trophies,
      lastXpReward: reward.xp,
      avatarId: player.avatarId ?? DEFAULT_PROFILE_AVATAR_ID,
      playerId: rewardOwnerId,
      playerName: player.name,
      photoURL: player.photoURL ?? "",
      trophies: (leaderboard?.trophies ?? 0) + reward.trophies,
      updatedAt: serverTimestamp(),
      wins: (leaderboard?.wins ?? 0) + 1,
    },
    { merge: true },
  );
  transaction.set(
    progressRef,
    createProgressRewardPayload(progressData, reward),
    { merge: true },
  );
  transaction.update(roomRef, {
    [`rewardClaims.${winner}`]: true,
    updatedAt: serverTimestamp(),
  });

  return reward;
}

export async function getCompetitionPlayer(user: User | null) {
  if (user) {
    const profile = await loadCompetitionPlayerProfile(user);
    const playerId = await getPlayerSessionId(user.uid);

    return {
      accountId: user.uid,
      avatarId: profile.avatarId,
      id: playerId,
      name: profile.displayName || getDisplayNameFromUser(user) || "Player",
      photoURL: profile.photoURL,
    };
  }

  const storedPlayerId = await AsyncStorage.getItem(GUEST_PLAYER_ID_KEY);
  const playerId = storedPlayerId || createId("guest");

  if (!storedPlayerId) {
    await AsyncStorage.setItem(GUEST_PLAYER_ID_KEY, playerId);
  }

  return {
    avatarId: DEFAULT_PROFILE_AVATAR_ID,
    id: playerId,
    name: `Guest ${playerId.slice(-4).toUpperCase()}`,
    photoURL: "",
  };
}

async function loadCompetitionPlayerProfile(user: User) {
  try {
    const snapshot = await getDoc(
      doc(getCompetitionFirebaseDb(), PROFILE_COLLECTION, user.uid),
    );
    const data = snapshot.exists() ? snapshot.data() : null;

    return {
      displayName: asString(data?.displayName),
      avatarId: isProfileAvatarId(data?.avatarId)
        ? data.avatarId
        : DEFAULT_PROFILE_AVATAR_ID,
      photoURL: asString(data?.photoURL),
    };
  } catch {
    return {
      displayName: "",
      avatarId: DEFAULT_PROFILE_AVATAR_ID,
      photoURL: "",
    };
  }
}

export function getCompetitionSideForPlayer(
  room: CompetitionRoom | null,
  player: CompetitionPlayerIdentity,
): CompetitionSide | null {
  if (!room || !player) {
    return null;
  }

  const accountId = getIdentityAccountId(player);

  if (
    storedPlayerMatches(room.players.left, player) ||
    (Boolean(accountId) && room.hostAuthId === accountId)
  ) {
    return "left";
  }

  if (
    storedPlayerMatches(room.players.right, player) ||
    (Boolean(accountId) && room.guestAuthId === accountId)
  ) {
    return "right";
  }

  return null;
}

export async function createCompetitionRoom(
  player: CompetitionPlayer,
  mode: CompetitionMode = "exam",
  matchmaking = false,
): Promise<MatchmakingResult> {
  const db = getCompetitionFirebaseDb();
  const hostAuthId = getRewardOwnerId(player);

  for (let attempt = 0; attempt < ROOM_CODE_MAX_ATTEMPTS; attempt += 1) {
    const roomCode = createRoomCode();
    const roomRef = doc(db, COMPETITION_COLLECTION, roomCode);
    const questions = mode === "exam" ? createCompetitionExamSet() : [];
    const speedQuestions =
      mode === "speed" ? createCompetitionSpeedQuestionSet() : [];
    const durationMs = getModeDurationMs(mode);
    const created = await runTransaction(db, async (transaction) => {
      const snapshot = await transaction.get(roomRef);

      if (snapshot.exists()) {
        return false;
      }

      transaction.set(roomRef, {
        answers: emptyAnswers(),
        createdAt: serverTimestamp(),
        durationMs,
        endsAt: 0,
        hostAuthId,
        hostId: player.id,
        lastAnswer: null,
        matchmaking,
        mode,
        players: {
          left: playerPayload(player),
        },
        question: mode === "speed" ? speedQuestions[0] : createCompetitionQuestion(),
        questions,
        questionNumber: 0,
        rewardClaims: {},
        roomCode,
        scores: { left: 0, right: 0 },
        speedQuestions,
        startedAt: 0,
        status: "waiting",
        targetScore:
          mode === "speed" ? speedQuestions.length : getModeTargetScore(mode),
        updatedAt: serverTimestamp(),
      });

      return true;
    });

    if (created) {
      return { roomId: roomCode, side: "left" };
    }
  }

  throw new Error("room-code-collision");
}

export async function joinCompetitionRoom(
  roomCodeInput: string,
  player: CompetitionPlayer,
): Promise<MatchmakingResult> {
  const roomCode = normalizeCompetitionRoomCode(roomCodeInput);

  if (!roomCode) {
    throw new Error("room-code-required");
  }

  const db = getCompetitionFirebaseDb();
  const roomRef = doc(db, COMPETITION_COLLECTION, roomCode);
  const guestAuthId = getRewardOwnerId(player);

  return runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(roomRef);

    if (!snapshot.exists()) {
      throw new Error("room-not-found");
    }

    const room = normalizeRoom(snapshot.id, snapshot.data());
    const existingSide = getCompetitionSideForPlayer(room, player);

    if (existingSide) {
      return { roomId: snapshot.id, side: existingSide };
    }

    if (room.status !== "waiting") {
      throw new Error(room.status === "playing" ? "room-full" : "room-unavailable");
    }

    if (room.players.right) {
      throw new Error("room-full");
    }

    const questions =
      room.mode === "exam"
        ? room.questions.length
          ? room.questions
          : createCompetitionExamSet()
        : [];
    const speedQuestions =
      room.mode === "speed"
        ? room.speedQuestions.length
          ? room.speedQuestions
          : createCompetitionSpeedQuestionSet()
        : [];
    const startedAt = Date.now();
    const durationMs = getModeDurationMs(room.mode);

    transaction.update(roomRef, {
      answers: emptyAnswers(),
      durationMs,
      endsAt: room.mode === "exam" ? startedAt + durationMs : 0,
      guestAuthId,
      guestId: player.id,
      lastAnswer: null,
      matchmaking: room.matchmaking,
      mode: room.mode,
      question:
        room.mode === "speed" ? speedQuestions[0] : createCompetitionQuestion(),
      questions,
      questionNumber: 1,
      rewardClaims: {},
      roomCode: room.roomCode || roomCode,
      scores: { left: 0, right: 0 },
      speedQuestions,
      startedAt,
      status: "playing",
      targetScore:
        room.mode === "exam" ? questions.length : speedQuestions.length,
      updatedAt: serverTimestamp(),
      "players.right": playerPayload(player),
    });

    return { roomId: snapshot.id, side: "right" };
  });
}

export async function findOrCreateCompetitionRoom(
  player: CompetitionPlayer,
  mode: CompetitionMode = "exam",
): Promise<MatchmakingResult> {
  const db = getCompetitionFirebaseDb();
  const playerAuthId = getRewardOwnerId(player);
  const roomsRef = collection(db, COMPETITION_COLLECTION);
  const waitingSnapshot = await getDocs(
    query(roomsRef, where("status", "==", "waiting"), limit(12)),
  );

  for (const roomDoc of waitingSnapshot.docs) {
    const room = normalizeRoom(roomDoc.id, roomDoc.data());

    if (
      room.matchmaking &&
      room.mode === mode &&
      getCompetitionSideForPlayer(room, player) === "left" &&
      !room.players.right
    ) {
      return { roomId: room.id, side: "left" };
    }
  }

  for (const roomDoc of waitingSnapshot.docs) {
    const room = normalizeRoom(roomDoc.id, roomDoc.data());

    if (
      !room.matchmaking ||
      room.mode !== mode ||
      Boolean(getCompetitionSideForPlayer(room, player)) ||
      room.players.right
    ) {
      continue;
    }

    const roomRef = doc(db, COMPETITION_COLLECTION, roomDoc.id);
    const joinedRoomId = await runTransaction(db, async (transaction) => {
      const freshSnapshot = await transaction.get(roomRef);
      if (!freshSnapshot.exists()) {
        return null;
      }

      const freshRoom = normalizeRoom(freshSnapshot.id, freshSnapshot.data());
      if (
        freshRoom.mode !== mode ||
        !freshRoom.matchmaking ||
        freshRoom.status !== "waiting" ||
        Boolean(getCompetitionSideForPlayer(freshRoom, player)) ||
        freshRoom.players.right
      ) {
        return null;
      }

      const questions =
        mode === "exam"
          ? freshRoom.questions.length
            ? freshRoom.questions
            : createCompetitionExamSet()
          : [];
      const speedQuestions =
        mode === "speed"
          ? freshRoom.speedQuestions.length
            ? freshRoom.speedQuestions
            : createCompetitionSpeedQuestionSet()
          : [];
      const startedAt = Date.now();
      const durationMs = getModeDurationMs(mode);

      transaction.update(roomRef, {
        answers: emptyAnswers(),
        durationMs,
        endsAt: mode === "exam" ? startedAt + durationMs : 0,
        guestAuthId: playerAuthId,
        guestId: player.id,
        lastAnswer: null,
        matchmaking: true,
        mode,
        question: mode === "speed" ? speedQuestions[0] : createCompetitionQuestion(),
        questions,
        questionNumber: 1,
        rewardClaims: {},
        scores: { left: 0, right: 0 },
        speedQuestions,
        startedAt,
        status: "playing",
        targetScore: mode === "exam" ? questions.length : speedQuestions.length,
        updatedAt: serverTimestamp(),
        "players.right": playerPayload(player),
      });

      return roomDoc.id;
    });

    if (joinedRoomId) {
      return { roomId: joinedRoomId, side: "right" };
    }
  }

  return createCompetitionRoom(player, mode, true);
}

export function watchCompetitionRoom(
  roomId: string,
  onChange: (room: CompetitionRoom | null) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    doc(getCompetitionFirebaseDb(), COMPETITION_COLLECTION, roomId),
    (snapshot) => {
      onChange(snapshot.exists() ? normalizeRoom(snapshot.id, snapshot.data()) : null);
    },
    onError,
  );
}

export function watchCompetitionLeaderboard(
  onChange: (entries: CompetitionLeaderboardEntry[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    query(
      collection(getCompetitionFirebaseDb(), LEADERBOARD_COLLECTION),
      orderBy("trophies", "desc"),
      limit(50),
    ),
    (snapshot) => {
      onChange(
        snapshot.docs.map((leaderboardDoc) =>
          normalizeLeaderboardEntry(leaderboardDoc.id, leaderboardDoc.data()),
        ),
      );
    },
    onError,
  );
}

export function watchPlayerLeaderboardEntry(
  userId: string,
  onChange: (entry: CompetitionLeaderboardEntry) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    doc(getCompetitionFirebaseDb(), LEADERBOARD_COLLECTION, userId),
    (snapshot) => {
      onChange(
        normalizeLeaderboardEntry(
          userId,
          snapshot.exists()
            ? snapshot.data()
            : {
                playerId: userId,
                playerName: "Player",
                trophies: 0,
                wins: 0,
              },
        ),
      );
    },
    onError,
  );
}

export async function submitCompetitionAnswer(
  roomId: string,
  player: CompetitionPlayer,
  side: CompetitionSide,
  questionId: string,
  rawAnswer: string,
): Promise<SubmitAnswerResult> {
  const submittedValue = rawAnswer.trim();
  if (!submittedValue) {
    throw new Error("invalid-answer");
  }

  const db = getCompetitionFirebaseDb();
  const roomRef = doc(db, COMPETITION_COLLECTION, roomId);

  return runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(roomRef);
    if (!snapshot.exists()) {
      throw new Error("room-not-found");
    }

    const room = normalizeRoom(snapshot.id, snapshot.data());
    if (room.status !== "playing" || room.winner) {
      return {
        correct: false,
        finished: room.status === "finished",
        winner: room.winner,
      };
    }

    if (getCompetitionSideForPlayer(room, player) !== side) {
      throw new Error("not-room-player");
    }

    const nowMs = Date.now();
    if (room.mode === "speed") {
      const speedQuestions = room.speedQuestions.length
        ? room.speedQuestions
        : [room.question];
      const answeredCount = countAnswered(room.answers, side, speedQuestions);
      const question = speedQuestions[answeredCount];

      if (!question || question.id !== questionId) {
        throw new Error("invalid-answer");
      }

      if (room.answers[side][questionId]) {
        return {
          alreadyAnswered: true,
          correct: room.answers[side][questionId].correct,
          finished: false,
          score: room.scores[side],
        };
      }

      const submittedNumber = Number(submittedValue.replace(/,/g, ""));
      if (!Number.isInteger(submittedNumber) || submittedNumber < 0) {
        throw new Error("invalid-answer");
      }

      const correct = submittedNumber === question.answer;
      const nextAnswers: CompetitionAnswerMap = {
        left: { ...room.answers.left },
        right: { ...room.answers.right },
      };
      nextAnswers[side][questionId] = {
        answeredAt: nowMs,
        choiceIndex: submittedNumber,
        correct,
        value: submittedValue,
      };

      const nextScores = calculateScores(nextAnswers, speedQuestions);
      const finished = shouldFinishCompetition(
        nextAnswers,
        nextScores,
        speedQuestions,
      );
      const winner = finished ? getWinnerFromScores(nextScores) : undefined;
      const reward = finished && winner
        ? await claimWinnerRewardInTransaction({
            db,
            finalScores: nextScores,
            player,
            room,
            roomRef,
            transaction,
            winner,
          })
        : undefined;
      const nextAnsweredCount = Math.min(speedQuestions.length, answeredCount + 1);
      const update: Record<string, unknown> = {
        answers: nextAnswers,
        lastAnswer: {
          correct,
          playerName: player.name,
          side,
          value: submittedValue,
        },
        questionNumber: Math.max(room.questionNumber, nextAnsweredCount),
        scores: nextScores,
        updatedAt: serverTimestamp(),
      };

      if (finished && winner) {
        update.status = "finished";
        update.winner = winner;
      }

      transaction.update(roomRef, update);

      return {
        correct,
        finished,
        reward,
        score: nextScores[side],
        winner,
      };
    }

    const choiceIndex = Number(submittedValue);
    if (!Number.isInteger(choiceIndex) || choiceIndex < 0) {
      throw new Error("invalid-answer");
    }

    const question = room.questions.find((item) => item.id === questionId);
    if (!question || choiceIndex >= question.choices.length) {
      throw new Error("invalid-answer");
    }

    if (room.endsAt > 0 && nowMs >= room.endsAt) {
      const finalScores = calculateScores(room.answers, room.questions);
      const winner = getWinnerFromScores(finalScores);
      const reward = await claimWinnerRewardInTransaction({
        db,
        finalScores,
        player,
        room,
        roomRef,
        transaction,
        winner,
      });

      transaction.update(roomRef, {
        scores: finalScores,
        status: "finished",
        updatedAt: serverTimestamp(),
        winner,
      });

      return {
        correct: false,
        finished: true,
        reward,
        stale: true,
        winner,
      };
    }

    if (room.answers[side][questionId]) {
      return {
        alreadyAnswered: true,
        correct: room.answers[side][questionId].correct,
        finished: false,
        score: room.scores[side],
      };
    }

    const correct = choiceIndex === question.answerIndex;
    const nextAnswers: CompetitionAnswerMap = {
      left: { ...room.answers.left },
      right: { ...room.answers.right },
    };
    nextAnswers[side][questionId] = {
      answeredAt: nowMs,
      choiceIndex,
      correct,
      value: question.choices[choiceIndex],
    };

    const nextScores = calculateScores(nextAnswers, room.questions);
    const finished = shouldFinishCompetition(
      nextAnswers,
      nextScores,
      room.questions,
    );
    const winner = finished ? getWinnerFromScores(nextScores) : undefined;
    const reward = finished && winner
      ? await claimWinnerRewardInTransaction({
          db,
          finalScores: nextScores,
          player,
          room,
          roomRef,
          transaction,
          winner,
        })
      : undefined;
    const update: Record<string, unknown> = {
      answers: nextAnswers,
      lastAnswer: {
        correct,
        playerName: player.name,
        side,
        value: question.choices[choiceIndex],
      },
      scores: nextScores,
      updatedAt: serverTimestamp(),
    };

    if (finished && winner) {
      update.status = "finished";
      update.winner = winner;
    }

    transaction.update(roomRef, update);

    return {
      correct,
      finished,
      reward,
      score: nextScores[side],
      winner,
    };
  });
}

export async function finishCompetitionRoom(
  roomId: string,
  player: CompetitionPlayer,
): Promise<SubmitAnswerResult> {
  const db = getCompetitionFirebaseDb();
  const roomRef = doc(db, COMPETITION_COLLECTION, roomId);

  return runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(roomRef);
    if (!snapshot.exists()) {
      throw new Error("room-not-found");
    }

    const room = normalizeRoom(snapshot.id, snapshot.data());
    if (room.status !== "playing" || room.winner) {
      return {
        correct: false,
        finished: room.status === "finished",
        winner: room.winner,
      };
    }

    if (!getCompetitionSideForPlayer(room, player)) {
      throw new Error("not-room-player");
    }

    const roomQuestions =
      room.mode === "speed" ? room.speedQuestions : room.questions;
    const finalScores = calculateScores(room.answers, roomQuestions);
    const canFinishByProgress = shouldFinishCompetition(
      room.answers,
      finalScores,
      roomQuestions,
    );
    const timeExpired =
      room.mode === "exam" && room.endsAt > 0 && Date.now() >= room.endsAt;

    if (!timeExpired && !canFinishByProgress) {
      return {
        correct: false,
        finished: false,
        score: finalScores[getCompetitionSideForPlayer(room, player) ?? "left"],
      };
    }

    const winner = getWinnerFromScores(finalScores);
    const reward = await claimWinnerRewardInTransaction({
      db,
      finalScores,
      player,
      room,
      roomRef,
      transaction,
      winner,
    });

    transaction.update(roomRef, {
      scores: finalScores,
      status: "finished",
      updatedAt: serverTimestamp(),
      winner,
    });

    return {
      correct: false,
      finished: true,
      reward,
      winner,
    };
  });
}

export async function claimCompetitionReward(
  roomId: string,
  player: CompetitionPlayer,
) {
  const db = getCompetitionFirebaseDb();
  const roomRef = doc(db, COMPETITION_COLLECTION, roomId);

  return runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(roomRef);
    if (!snapshot.exists()) {
      throw new Error("room-not-found");
    }

    const room = normalizeRoom(snapshot.id, snapshot.data());
    if (room.status !== "finished" || !room.winner) {
      return undefined;
    }

    return claimWinnerRewardInTransaction({
      db,
      finalScores: room.scores,
      player,
      room,
      roomRef,
      transaction,
      winner: room.winner,
    });
  });
}

export async function leaveCompetitionRoom(
  roomId: string,
  player: CompetitionPlayer,
) {
  const db = getCompetitionFirebaseDb();
  const roomRef = doc(db, COMPETITION_COLLECTION, roomId);

  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(roomRef);
    if (!snapshot.exists()) {
      return;
    }

    const room = normalizeRoom(snapshot.id, snapshot.data());
    const playerSide = getCompetitionSideForPlayer(room, player);

    if (!playerSide || room.status === "finished") {
      return;
    }

    if (room.status === "waiting" && playerSide === "left") {
      transaction.delete(roomRef);
      return;
    }

    transaction.update(roomRef, {
      status: "cancelled",
      updatedAt: serverTimestamp(),
    });
  });
}
