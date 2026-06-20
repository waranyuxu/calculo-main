import * as FileSystem from "expo-file-system/legacy";
import { Platform } from "react-native";
import {
  deleteField,
  doc,
  getDoc,
  onSnapshot,
  setDoc,
  updateDoc,
  type Unsubscribe,
} from "firebase/firestore";
import {
  QUESTIONS_PER_UNIT,
  TOTAL_MATH_SECTIONS,
  UNITS_PER_SECTION,
} from "@/constants/math-course-map";
import { getLoginFirebaseDb as getMathProgressDb } from "@/services/firebase";

export type MathProgress = {
  calcuCoin: number;
  completedStages: number;
  currentSectionIndex: number;
  currentUnitIndex: number;
  currentStageIndex: number;
  updatedAt: string;
  xp: number;
};

const STORAGE_KEY = "calculo.math.progress.v1";
const STORAGE_FILE = `${FileSystem.documentDirectory ?? ""}${STORAGE_KEY}.json`;
const FIREBASE_PROGRESS_COLLECTION = "mathProgress";
const CALCU_COIN_FIELD_ALIASES = ["calcuCoin", "calcucoin", "CalcuCoin"];
const XP_FIELD_ALIASES = ["xp", "XP"];
const LEGACY_ECONOMY_FIELD_DELETES = {
  CalcuCoin: deleteField(),
  XP: deleteField(),
  calcucoin: deleteField(),
};
export const STAGE_CORRECT_REWARD = {
  calcuCoin: 10,
  xp: 10,
} as const;

export const DEFAULT_MATH_PROGRESS: MathProgress = {
  calcuCoin: 0,
  completedStages: 0,
  currentSectionIndex: 0,
  currentUnitIndex: 0,
  currentStageIndex: 0,
  updatedAt: new Date(0).toISOString(),
  xp: 0,
};

const maxUnits = TOTAL_MATH_SECTIONS * UNITS_PER_SECTION;
const maxStages = maxUnits * QUESTIONS_PER_UNIT;

function getPositionFromCompletedStages(completedStages: number) {
  const normalizedCompletedStages = Math.max(0, Math.min(maxStages, completedStages));
  const completedUnits = Math.min(
    Math.floor(normalizedCompletedStages / QUESTIONS_PER_UNIT),
    maxUnits - 1,
  );
  const sectionIndex = Math.floor(completedUnits / UNITS_PER_SECTION);
  const unitIndex = completedUnits % UNITS_PER_SECTION;
  const stageIndex =
    normalizedCompletedStages >= maxStages
      ? QUESTIONS_PER_UNIT - 1
      : normalizedCompletedStages % QUESTIONS_PER_UNIT;

  return {
    sectionIndex,
    unitIndex,
    stageIndex,
    sectionNumber: sectionIndex + 1,
    unitNumber: unitIndex + 1,
    stageNumber: stageIndex + 1,
  };
}

function getNonNegativeNumber(
  source: Record<string, unknown> | null | undefined,
  keys: string[],
) {
  let highestValue = 0;

  for (const key of keys) {
    const numberValue = Number(source?.[key]);

    if (Number.isFinite(numberValue)) {
      highestValue = Math.max(highestValue, numberValue);
    }
  }

  return Math.max(0, highestValue);
}

function getNumberFromKeys(
  source: Record<string, unknown> | null | undefined,
  keys: string[],
) {
  for (const key of keys) {
    const numberValue = Number(source?.[key]);

    if (Number.isFinite(numberValue)) {
      return numberValue;
    }
  }

  return Number.NaN;
}

function getCompletedStagesFromPosition(
  source: Record<string, unknown> | null | undefined,
) {
  const sectionValue = getNumberFromKeys(source, [
    "currentSectionIndex",
    "sectionIndex",
    "currentChapterIndex",
  ]);
  const unitValue = getNumberFromKeys(source, [
    "currentUnitIndex",
    "unitIndex",
  ]);
  const stageValue = getNumberFromKeys(source, [
    "currentStageIndex",
    "stageIndex",
  ]);
  const sectionNumberValue = getNumberFromKeys(source, [
    "currentChapter",
    "currentSection",
    "chapter",
    "section",
  ]);
  const unitNumberValue = getNumberFromKeys(source, [
    "currentUnit",
    "unit",
  ]);
  const stageNumberValue = getNumberFromKeys(source, [
    "currentStage",
    "stage",
  ]);
  const sectionIndex = Number.isFinite(sectionValue)
    ? sectionValue
    : sectionNumberValue - 1;
  const unitIndex = Number.isFinite(unitValue) ? unitValue : unitNumberValue - 1;
  const stageIndex = Number.isFinite(stageValue)
    ? stageValue
    : stageNumberValue - 1;

  if (
    !Number.isFinite(sectionIndex) ||
    !Number.isFinite(unitIndex) ||
    !Number.isFinite(stageIndex)
  ) {
    return 0;
  }

  return (
    (Math.max(0, sectionIndex) * UNITS_PER_SECTION + Math.max(0, unitIndex)) *
      QUESTIONS_PER_UNIT +
    Math.max(0, stageIndex)
  );
}

function normalizeProgress(value: Partial<MathProgress> | null | undefined): MathProgress {
  const data = value as Record<string, unknown> | null | undefined;
  const legacyCompletedUnits = Number(
    (value as Partial<MathProgress> & { completedUnits?: number })?.completedUnits,
  );
  const completedStagesFromLegacy =
    Number.isFinite(legacyCompletedUnits) && legacyCompletedUnits > 0
      ? legacyCompletedUnits * QUESTIONS_PER_UNIT
      : 0;
  const completedStagesFromPosition = getCompletedStagesFromPosition(data);
  const completedStages = Math.max(
    0,
    Math.min(
      maxStages,
      Number(value?.completedStages) ||
        completedStagesFromLegacy ||
        completedStagesFromPosition ||
        0,
    ),
  );
  const position = getPositionFromCompletedStages(completedStages);

  return {
    calcuCoin: getNonNegativeNumber(data, CALCU_COIN_FIELD_ALIASES),
    completedStages,
    currentSectionIndex: position.sectionIndex,
    currentUnitIndex: position.unitIndex,
    currentStageIndex: position.stageIndex,
    updatedAt:
      typeof value?.updatedAt === "string"
        ? value.updatedAt
        : DEFAULT_MATH_PROGRESS.updatedAt,
    xp: getNonNegativeNumber(data, XP_FIELD_ALIASES),
  };
}

export function addStageCorrectReward(progress: MathProgress): MathProgress {
  return normalizeProgress({
    ...progress,
    calcuCoin: progress.calcuCoin + STAGE_CORRECT_REWARD.calcuCoin,
    xp: progress.xp + STAGE_CORRECT_REWARD.xp,
  });
}

export function getCurrentCoursePosition(progress: MathProgress) {
  return getPositionFromCompletedStages(progress.completedStages);
}

export function isUnitUnlocked(
  sectionIndex: number,
  unitIndex: number,
  progress: MathProgress,
) {
  const absoluteUnitIndex = sectionIndex * UNITS_PER_SECTION + unitIndex;
  return absoluteUnitIndex * QUESTIONS_PER_UNIT <= progress.completedStages;
}

export function isUnitCompleted(
  sectionIndex: number,
  unitIndex: number,
  progress: MathProgress,
) {
  const absoluteUnitIndex = sectionIndex * UNITS_PER_SECTION + unitIndex;
  return (absoluteUnitIndex + 1) * QUESTIONS_PER_UNIT <= progress.completedStages;
}

export function isStageUnlocked(
  sectionIndex: number,
  unitIndex: number,
  stageIndex: number,
  progress: MathProgress,
) {
  const absoluteStageIndex =
    (sectionIndex * UNITS_PER_SECTION + unitIndex) * QUESTIONS_PER_UNIT + stageIndex;
  return absoluteStageIndex <= progress.completedStages;
}

export function isStageCompleted(
  sectionIndex: number,
  unitIndex: number,
  stageIndex: number,
  progress: MathProgress,
) {
  const absoluteStageIndex =
    (sectionIndex * UNITS_PER_SECTION + unitIndex) * QUESTIONS_PER_UNIT + stageIndex;
  return absoluteStageIndex < progress.completedStages;
}

async function loadLocalMathProgress(): Promise<MathProgress> {
  try {
    if (Platform.OS === "web") {
      const raw = globalThis.localStorage?.getItem(STORAGE_KEY);
      return normalizeProgress(raw ? JSON.parse(raw) : null);
    }

    if (!FileSystem.documentDirectory) {
      return DEFAULT_MATH_PROGRESS;
    }

    const info = await FileSystem.getInfoAsync(STORAGE_FILE);
    if (!info.exists) {
      return DEFAULT_MATH_PROGRESS;
    }

    return normalizeProgress(JSON.parse(await FileSystem.readAsStringAsync(STORAGE_FILE)));
  } catch {
    return DEFAULT_MATH_PROGRESS;
  }
}

async function saveLocalMathProgress(progress: MathProgress) {
  const next = normalizeProgress({
    ...progress,
    updatedAt: new Date().toISOString(),
  });
  const raw = JSON.stringify(next);

  if (Platform.OS === "web") {
    globalThis.localStorage?.setItem(STORAGE_KEY, raw);
    return next;
  }

  if (FileSystem.documentDirectory) {
    await FileSystem.writeAsStringAsync(STORAGE_FILE, raw);
  }

  return next;
}

function hasField(source: Record<string, unknown> | null | undefined, key: string) {
  return Boolean(source && Object.prototype.hasOwnProperty.call(source, key));
}

function numericFieldMatches(
  source: Record<string, unknown> | null | undefined,
  key: string,
  expectedValue: number,
) {
  return hasField(source, key) && Number(source?.[key]) === expectedValue;
}

function hasLegacyEconomyFields(source: Record<string, unknown> | null | undefined) {
  return (
    hasField(source, "CalcuCoin") ||
    hasField(source, "calcucoin") ||
    hasField(source, "XP")
  );
}

function needsCanonicalProgressWrite(
  source: Record<string, unknown> | null | undefined,
  progress: MathProgress,
) {
  return (
    hasLegacyEconomyFields(source) ||
    !numericFieldMatches(source, "calcuCoin", progress.calcuCoin) ||
    !numericFieldMatches(source, "xp", progress.xp) ||
    !numericFieldMatches(source, "completedStages", progress.completedStages) ||
    !numericFieldMatches(
      source,
      "currentSectionIndex",
      progress.currentSectionIndex,
    ) ||
    !numericFieldMatches(source, "currentUnitIndex", progress.currentUnitIndex) ||
    !numericFieldMatches(source, "currentStageIndex", progress.currentStageIndex) ||
    !numericFieldMatches(source, "currentChapter", progress.currentSectionIndex + 1) ||
    !numericFieldMatches(source, "currentUnit", progress.currentUnitIndex + 1) ||
    !numericFieldMatches(source, "currentStage", progress.currentStageIndex + 1)
  );
}

async function writeFirebaseMathProgress(
  userId: string,
  progress: MathProgress,
  touchUpdatedAt: boolean,
) {
  const next = normalizeProgress({
    ...progress,
    updatedAt: touchUpdatedAt ? new Date().toISOString() : progress.updatedAt,
  });
  const progressDoc = doc(getMathProgressDb(), FIREBASE_PROGRESS_COLLECTION, userId);

  await setDoc(
    progressDoc,
    {
      ...next,
      currentChapter: next.currentSectionIndex + 1,
      currentUnit: next.currentUnitIndex + 1,
      currentStage: next.currentStageIndex + 1,
    },
    { merge: true },
  );
  await updateDoc(progressDoc, LEGACY_ECONOMY_FIELD_DELETES).catch(() => null);

  return next;
}

async function loadFirebaseMathProgress(userId: string): Promise<{
  data: Record<string, unknown> | null;
  progress: MathProgress | null;
  readable: boolean;
}> {
  try {
    const snapshot = await getDoc(
      doc(getMathProgressDb(), FIREBASE_PROGRESS_COLLECTION, userId),
    );

    return {
      data: snapshot.exists() ? snapshot.data() : null,
      progress: snapshot.exists() ? normalizeProgress(snapshot.data()) : null,
      readable: true,
    };
  } catch {
    return {
      data: null,
      progress: null,
      readable: false,
    };
  }
}

async function saveFirebaseMathProgress(userId: string, progress: MathProgress) {
  return writeFirebaseMathProgress(userId, progress, true);
}

async function canonicalizeFirebaseMathProgress(
  userId: string,
  progress: MathProgress,
) {
  return writeFirebaseMathProgress(userId, progress, false);
}

export async function loadMathProgress(userId?: string | null): Promise<MathProgress> {
  const localProgress = await loadLocalMathProgress();

  if (userId) {
    const firebaseProgress = await loadFirebaseMathProgress(userId);

    if (firebaseProgress.progress) {
      const remoteProgress = firebaseProgress.progress;
      const nextProgress = needsCanonicalProgressWrite(
        firebaseProgress.data,
        remoteProgress,
      )
        ? await canonicalizeFirebaseMathProgress(
            userId,
            remoteProgress,
          ).catch(() => remoteProgress)
        : remoteProgress;

      await saveLocalMathProgress(nextProgress).catch(() => null);
      return nextProgress;
    }

    if (!firebaseProgress.readable) {
      return localProgress;
    }

    try {
      const syncedProgress = await saveFirebaseMathProgress(userId, localProgress);
      await saveLocalMathProgress(syncedProgress);
      return syncedProgress;
    } catch {
      return localProgress;
    }
  }

  return localProgress;
}

export function watchMathProgress(
  userId: string,
  onChange: (progress: MathProgress) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    doc(getMathProgressDb(), FIREBASE_PROGRESS_COLLECTION, userId),
    (snapshot) => {
      if (!snapshot.exists()) {
        onChange(DEFAULT_MATH_PROGRESS);
        return;
      }

      const data = snapshot.data();
      const progress = normalizeProgress(data);

      onChange(progress);

      if (needsCanonicalProgressWrite(data, progress)) {
        void canonicalizeFirebaseMathProgress(userId, progress);
      }
    },
    onError,
  );
}

export async function saveMathProgress(
  progress: MathProgress,
  userId?: string | null,
) {
  if (userId) {
    try {
      const syncedProgress = await saveFirebaseMathProgress(userId, progress);
      await saveLocalMathProgress(syncedProgress);
      return syncedProgress;
    } catch {
      return saveLocalMathProgress(progress);
    }
  }

  return saveLocalMathProgress(progress);
}

export async function resetMathProgress(userId?: string | null) {
  return saveMathProgress({
    calcuCoin: 0,
    completedStages: 0,
    currentSectionIndex: 0,
    currentUnitIndex: 0,
    currentStageIndex: 0,
    updatedAt: new Date().toISOString(),
    xp: 0,
  }, userId);
}

export async function completeMathStage(
  sectionIndex: number,
  unitIndex: number,
  stageIndex: number,
  progress: MathProgress,
  userId?: string | null,
) {
  const absoluteStageIndex =
    (sectionIndex * UNITS_PER_SECTION + unitIndex) * QUESTIONS_PER_UNIT + stageIndex;
  if (absoluteStageIndex > progress.completedStages) {
    return progress;
  }

  const nextCompletedStages = Math.max(
    progress.completedStages,
    absoluteStageIndex + 1,
  );
  const shouldRewardStage = absoluteStageIndex === progress.completedStages;
  const nextPosition = getPositionFromCompletedStages(nextCompletedStages);
  const rewardedProgress = shouldRewardStage
    ? addStageCorrectReward(progress)
    : progress;

  return saveMathProgress({
    ...rewardedProgress,
    completedStages: nextCompletedStages,
    currentSectionIndex: nextPosition.sectionIndex,
    currentUnitIndex: nextPosition.unitIndex,
    currentStageIndex: nextPosition.stageIndex,
  }, userId);
}
