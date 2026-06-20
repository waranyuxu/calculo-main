import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  type DocumentData,
} from "firebase/firestore";
import { getFirebaseDb } from "@/services/firebase";

export type OnboardingPreferences = {
  completedAt: string;
  dailyMinutes: number;
  discoverySource: string;
  homeWidgetSeen: boolean;
  learningReason: string;
  levelStart: string;
  practiceSummarySeen: boolean;
  pretestSkipped: boolean;
  studyRoutineSeen: boolean;
  updatedAt: string;
};

export type PretestState = {
  chapterScores: Record<string, number>;
  completedAt: string;
  updatedAt: string;
};

export type MathAdventureStats = {
  bestStreak: number;
  correctAnswers: number;
  totalAttempts: number;
  updatedAt: string;
};

export type LearningState = {
  adventure: MathAdventureStats;
  onboarding: OnboardingPreferences;
  pretest: PretestState;
  updatedAt: string;
};

const STORAGE_KEY = "calculo.learning.state.v1";
const FIREBASE_COLLECTION = "learningStates";
const EMPTY_DATE = new Date(0).toISOString();

export const DEFAULT_ONBOARDING_PREFERENCES: OnboardingPreferences = {
  completedAt: "",
  dailyMinutes: 0,
  discoverySource: "",
  homeWidgetSeen: false,
  learningReason: "",
  levelStart: "",
  practiceSummarySeen: false,
  pretestSkipped: false,
  studyRoutineSeen: false,
  updatedAt: EMPTY_DATE,
};

export const DEFAULT_PRETEST_STATE: PretestState = {
  chapterScores: {},
  completedAt: "",
  updatedAt: EMPTY_DATE,
};

export const DEFAULT_MATH_ADVENTURE_STATS: MathAdventureStats = {
  bestStreak: 0,
  correctAnswers: 0,
  totalAttempts: 0,
  updatedAt: EMPTY_DATE,
};

export const DEFAULT_LEARNING_STATE: LearningState = {
  adventure: DEFAULT_MATH_ADVENTURE_STATS,
  onboarding: DEFAULT_ONBOARDING_PREFERENCES,
  pretest: DEFAULT_PRETEST_STATE,
  updatedAt: EMPTY_DATE,
};

type LearningStatePatch = {
  adventure?: Partial<MathAdventureStats>;
  onboarding?: Partial<OnboardingPreferences>;
  pretest?: Partial<PretestState>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function asBoolean(value: unknown, fallback = false) {
  return typeof value === "boolean" ? value : fallback;
}

function asNumber(value: unknown, fallback = 0) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
}

function maxNumber(value: unknown, fallback = 0) {
  return Math.max(0, asNumber(value, fallback));
}

function now() {
  return new Date().toISOString();
}

function isNewer(left: string, right: string) {
  return Date.parse(left || EMPTY_DATE) >= Date.parse(right || EMPTY_DATE);
}

function normalizeScores(value: unknown): Record<string, number> {
  if (!isRecord(value)) {
    return {};
  }

  return Object.entries(value).reduce<Record<string, number>>(
    (scores, [key, score]) => {
      const nextScore = Number(score);
      if (key && Number.isFinite(nextScore)) {
        scores[key] = Math.max(0, nextScore);
      }
      return scores;
    },
    {},
  );
}

function normalizeOnboarding(value: unknown): OnboardingPreferences {
  const data = isRecord(value) ? value : {};

  return {
    completedAt: asString(data.completedAt),
    dailyMinutes: maxNumber(data.dailyMinutes),
    discoverySource: asString(data.discoverySource),
    homeWidgetSeen: asBoolean(data.homeWidgetSeen),
    learningReason: asString(data.learningReason),
    levelStart: asString(data.levelStart),
    practiceSummarySeen: asBoolean(data.practiceSummarySeen),
    pretestSkipped: asBoolean(data.pretestSkipped),
    studyRoutineSeen: asBoolean(data.studyRoutineSeen),
    updatedAt: asString(data.updatedAt, EMPTY_DATE),
  };
}

function normalizePretest(value: unknown): PretestState {
  const data = isRecord(value) ? value : {};

  return {
    chapterScores: normalizeScores(data.chapterScores),
    completedAt: asString(data.completedAt),
    updatedAt: asString(data.updatedAt, EMPTY_DATE),
  };
}

function normalizeAdventure(value: unknown): MathAdventureStats {
  const data = isRecord(value) ? value : {};

  return {
    bestStreak: maxNumber(data.bestStreak),
    correctAnswers: maxNumber(data.correctAnswers),
    totalAttempts: maxNumber(data.totalAttempts),
    updatedAt: asString(data.updatedAt, EMPTY_DATE),
  };
}

function normalizeLearningState(value: unknown): LearningState {
  const data = isRecord(value) ? value : {};

  return {
    adventure: normalizeAdventure(data.adventure),
    onboarding: normalizeOnboarding(data.onboarding),
    pretest: normalizePretest(data.pretest),
    updatedAt: asString(data.updatedAt, EMPTY_DATE),
  };
}

function mergeOnboarding(
  remote: OnboardingPreferences,
  local: OnboardingPreferences,
) {
  const primary = isNewer(local.updatedAt, remote.updatedAt) ? local : remote;
  const secondary = primary === local ? remote : local;

  return {
    ...primary,
    completedAt: primary.completedAt || secondary.completedAt,
    dailyMinutes: primary.dailyMinutes || secondary.dailyMinutes,
    discoverySource: primary.discoverySource || secondary.discoverySource,
    homeWidgetSeen: primary.homeWidgetSeen || secondary.homeWidgetSeen,
    learningReason: primary.learningReason || secondary.learningReason,
    levelStart: primary.levelStart || secondary.levelStart,
    practiceSummarySeen:
      primary.practiceSummarySeen || secondary.practiceSummarySeen,
    pretestSkipped: primary.pretestSkipped || secondary.pretestSkipped,
    studyRoutineSeen: primary.studyRoutineSeen || secondary.studyRoutineSeen,
    updatedAt: isNewer(local.updatedAt, remote.updatedAt)
      ? local.updatedAt
      : remote.updatedAt,
  };
}

function mergePretest(remote: PretestState, local: PretestState) {
  const localIsNewer = isNewer(local.updatedAt, remote.updatedAt);
  const primaryScores = localIsNewer
    ? local.chapterScores
    : remote.chapterScores;
  const secondaryScores = localIsNewer
    ? remote.chapterScores
    : local.chapterScores;

  return {
    chapterScores: {
      ...secondaryScores,
      ...primaryScores,
    },
    completedAt: local.completedAt || remote.completedAt,
    updatedAt: localIsNewer ? local.updatedAt : remote.updatedAt,
  };
}

function mergeAdventure(
  remote: MathAdventureStats,
  local: MathAdventureStats,
) {
  return {
    bestStreak: Math.max(remote.bestStreak, local.bestStreak),
    correctAnswers: Math.max(remote.correctAnswers, local.correctAnswers),
    totalAttempts: Math.max(remote.totalAttempts, local.totalAttempts),
    updatedAt: isNewer(local.updatedAt, remote.updatedAt)
      ? local.updatedAt
      : remote.updatedAt,
  };
}

function mergeLearningStates(remote: LearningState, local: LearningState) {
  const onboarding = mergeOnboarding(remote.onboarding, local.onboarding);
  const pretest = mergePretest(remote.pretest, local.pretest);
  const adventure = mergeAdventure(remote.adventure, local.adventure);
  const updatedAt = [
    onboarding.updatedAt,
    pretest.updatedAt,
    adventure.updatedAt,
    remote.updatedAt,
    local.updatedAt,
  ].sort((left, right) => Date.parse(right) - Date.parse(left))[0];

  return normalizeLearningState({
    adventure,
    onboarding,
    pretest,
    updatedAt,
  });
}

async function loadLocalLearningState() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return normalizeLearningState(raw ? JSON.parse(raw) : null);
  } catch {
    return DEFAULT_LEARNING_STATE;
  }
}

async function saveLocalLearningState(state: LearningState) {
  const next = normalizeLearningState(state);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

async function loadFirebaseLearningState(userId: string) {
  try {
    const snapshot = await getDoc(
      doc(getFirebaseDb(), FIREBASE_COLLECTION, userId),
    );

    return snapshot.exists() ? normalizeLearningState(snapshot.data()) : null;
  } catch {
    return null;
  }
}

async function saveFirebaseLearningState(userId: string, state: LearningState) {
  const next = normalizeLearningState(state);

  await setDoc(
    doc(getFirebaseDb(), FIREBASE_COLLECTION, userId),
    {
      ...next,
      serverUpdatedAt: serverTimestamp(),
      userId,
    },
    { merge: true },
  );

  return next;
}

export async function loadLearningState(userId?: string | null) {
  const localState = await loadLocalLearningState();

  if (!userId) {
    return localState;
  }

  const firebaseState = await loadFirebaseLearningState(userId);
  const nextState = firebaseState
    ? mergeLearningStates(firebaseState, localState)
    : localState;

  await saveLocalLearningState(nextState);

  try {
    await saveFirebaseLearningState(userId, nextState);
  } catch {
    // Local data is still usable when Firebase is unavailable.
  }

  return nextState;
}

async function saveLearningStatePatch(
  patch: LearningStatePatch,
  userId?: string | null,
) {
  const current = await loadLearningState(userId);
  const timestamp = now();
  const nextState = normalizeLearningState({
    ...current,
    adventure: {
      ...current.adventure,
      ...patch.adventure,
      updatedAt: patch.adventure ? timestamp : current.adventure.updatedAt,
    },
    onboarding: {
      ...current.onboarding,
      ...patch.onboarding,
      updatedAt: patch.onboarding ? timestamp : current.onboarding.updatedAt,
    },
    pretest: {
      ...current.pretest,
      ...patch.pretest,
      updatedAt: patch.pretest ? timestamp : current.pretest.updatedAt,
    },
    updatedAt: timestamp,
  });

  await saveLocalLearningState(nextState);

  if (userId) {
    try {
      await saveFirebaseLearningState(userId, nextState);
    } catch {
      // Keep the local write; the next authenticated load will retry sync.
    }
  }

  return nextState;
}

export async function saveOnboardingPreferences(
  preferences: Partial<OnboardingPreferences>,
  userId?: string | null,
) {
  return saveLearningStatePatch({ onboarding: preferences }, userId);
}

export async function loadPretestScores(userId?: string | null) {
  const state = await loadLearningState(userId);
  return state.pretest.chapterScores;
}

export async function savePretestChapterScore(
  chapterKey: string,
  score: number,
  allChapterKeys: string[],
  userId?: string | null,
) {
  const state = await loadLearningState(userId);
  const chapterScores = {
    ...state.pretest.chapterScores,
    [chapterKey]: Math.max(0, score),
  };
  const completedAt = allChapterKeys.every(
    (key) => chapterScores[key] !== undefined,
  )
    ? state.pretest.completedAt || now()
    : state.pretest.completedAt;

  return saveLearningStatePatch(
    {
      pretest: {
        chapterScores,
        completedAt,
      },
    },
    userId,
  );
}

export async function recordMathAdventureAnswer(
  correct: boolean,
  streak: number,
  userId?: string | null,
) {
  const state = await loadLearningState(userId);

  return saveLearningStatePatch(
    {
      adventure: {
        bestStreak: Math.max(state.adventure.bestStreak, streak),
        correctAnswers: state.adventure.correctAnswers + (correct ? 1 : 0),
        totalAttempts: state.adventure.totalAttempts + 1,
      },
    },
    userId,
  );
}

export function learningStateFromSnapshot(data: DocumentData | null) {
  return normalizeLearningState(data);
}
