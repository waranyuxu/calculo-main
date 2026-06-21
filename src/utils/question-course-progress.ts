import { QUESTION_COURSE } from "@/generated/question-course";
import {
  addStageCorrectReward,
  saveMathProgress,
  type MathProgress,
} from "@/utils/math-progress-storage";

type QuestionCourse = typeof QUESTION_COURSE;

export function getQuestionCourseTotals(course: QuestionCourse = QUESTION_COURSE) {
  const totalUnits = course.reduce(
    (sum, section) => sum + section.units.length,
    0,
  );
  const totalStages = course.reduce(
    (sectionSum, section) =>
      sectionSum +
      section.units.reduce((unitSum, unit) => unitSum + unit.stages.length, 0),
    0,
  );

  return {
    totalSections: course.length,
    totalStages,
    totalUnits,
  };
}

function getSectionStageCount(course: QuestionCourse, sectionIndex: number) {
  return (
    course[sectionIndex]?.units.reduce(
      (sum, unit) => sum + unit.stages.length,
      0,
    ) ?? 0
  );
}

function getUnitStageCount(
  course: QuestionCourse,
  sectionIndex: number,
  unitIndex: number,
) {
  return course[sectionIndex]?.units[unitIndex]?.stages.length ?? 0;
}

export function getAbsoluteQuestionStageIndex(
  sectionIndex: number,
  unitIndex: number,
  stageIndex: number,
  course: QuestionCourse = QUESTION_COURSE,
) {
  let absoluteIndex = 0;

  for (let currentSection = 0; currentSection < sectionIndex; currentSection += 1) {
    absoluteIndex += getSectionStageCount(course, currentSection);
  }

  for (let currentUnit = 0; currentUnit < unitIndex; currentUnit += 1) {
    absoluteIndex += getUnitStageCount(course, sectionIndex, currentUnit);
  }

  return absoluteIndex + stageIndex;
}

export function getQuestionCoursePosition(
  progress: MathProgress,
  course: QuestionCourse = QUESTION_COURSE,
) {
  const { totalStages } = getQuestionCourseTotals(course);
  const completedStages = Math.max(
    0,
    Math.min(totalStages, progress.completedStages),
  );

  let stageCursor = 0;

  for (let sectionIndex = 0; sectionIndex < course.length; sectionIndex += 1) {
    const section = course[sectionIndex];

    for (let unitIndex = 0; unitIndex < section.units.length; unitIndex += 1) {
      const unit = section.units[unitIndex];
      const nextCursor = stageCursor + unit.stages.length;

      if (completedStages < nextCursor) {
        const stageIndex = completedStages - stageCursor;

        return {
          completedStages,
          sectionIndex,
          sectionNumber: sectionIndex + 1,
          stageIndex,
          stageNumber: stageIndex + 1,
          unitIndex,
          unitNumber: unitIndex + 1,
        };
      }

      stageCursor = nextCursor;
    }
  }

  const lastSectionIndex = Math.max(0, course.length - 1);
  const lastSection = course[lastSectionIndex];
  const lastUnitIndex = Math.max(0, (lastSection?.units.length ?? 1) - 1);
  const lastUnit = lastSection?.units[lastUnitIndex];
  const lastStageIndex = Math.max(0, (lastUnit?.stages.length ?? 1) - 1);

  return {
    completedStages,
    sectionIndex: lastSectionIndex,
    sectionNumber: lastSectionIndex + 1,
    stageIndex: lastStageIndex,
    stageNumber: lastStageIndex + 1,
    unitIndex: lastUnitIndex,
    unitNumber: lastUnitIndex + 1,
  };
}

export function isQuestionSectionUnlocked(
  sectionIndex: number,
  progress: MathProgress,
  course: QuestionCourse = QUESTION_COURSE,
) {
  return (
    getAbsoluteQuestionStageIndex(sectionIndex, 0, 0, course) <=
    progress.completedStages
  );
}

export function isQuestionUnitUnlocked(
  sectionIndex: number,
  unitIndex: number,
  progress: MathProgress,
  course: QuestionCourse = QUESTION_COURSE,
) {
  return (
    getAbsoluteQuestionStageIndex(sectionIndex, unitIndex, 0, course) <=
    progress.completedStages
  );
}

export function isQuestionUnitCompleted(
  sectionIndex: number,
  unitIndex: number,
  progress: MathProgress,
  course: QuestionCourse = QUESTION_COURSE,
) {
  const startIndex = getAbsoluteQuestionStageIndex(
    sectionIndex,
    unitIndex,
    0,
    course,
  );
  return (
    startIndex + getUnitStageCount(course, sectionIndex, unitIndex) <=
    progress.completedStages
  );
}

export function isQuestionStageUnlocked(
  sectionIndex: number,
  unitIndex: number,
  stageIndex: number,
  progress: MathProgress,
  course: QuestionCourse = QUESTION_COURSE,
) {
  return (
    getAbsoluteQuestionStageIndex(sectionIndex, unitIndex, stageIndex, course) <=
    progress.completedStages
  );
}

export function isQuestionStageCompleted(
  sectionIndex: number,
  unitIndex: number,
  stageIndex: number,
  progress: MathProgress,
  course: QuestionCourse = QUESTION_COURSE,
) {
  return (
    getAbsoluteQuestionStageIndex(sectionIndex, unitIndex, stageIndex, course) <
    progress.completedStages
  );
}

export async function moveToQuestionSection(
  sectionIndex: number,
  progress: MathProgress,
  userId?: string | null,
  course: QuestionCourse = QUESTION_COURSE,
) {
  if (!course[sectionIndex]) {
    return progress;
  }

  const nextCompletedStages = Math.max(
    progress.completedStages,
    getAbsoluteQuestionStageIndex(sectionIndex, 0, 0, course),
  );
  const nextPosition = getQuestionCoursePosition(
    {
      ...progress,
      completedStages: nextCompletedStages,
    },
    course,
  );

  return saveMathProgress(
    {
      ...progress,
      completedStages: nextCompletedStages,
      currentSectionIndex: nextPosition.sectionIndex,
      currentStageIndex: nextPosition.stageIndex,
      currentUnitIndex: nextPosition.unitIndex,
    },
    userId,
  );
}

export async function completeQuestionStage(
  sectionIndex: number,
  unitIndex: number,
  stageIndex: number,
  progress: MathProgress,
  userId?: string | null,
  course: QuestionCourse = QUESTION_COURSE,
) {
  const absoluteStageIndex = getAbsoluteQuestionStageIndex(
    sectionIndex,
    unitIndex,
    stageIndex,
    course,
  );

  if (absoluteStageIndex > progress.completedStages) {
    return progress;
  }

  const nextCompletedStages = Math.max(
    progress.completedStages,
    absoluteStageIndex + 1,
  );
  const shouldRewardStage = absoluteStageIndex === progress.completedStages;
  const nextPosition = getQuestionCoursePosition(
    {
      ...progress,
      completedStages: nextCompletedStages,
    },
    course,
  );
  const rewardedProgress = shouldRewardStage
    ? addStageCorrectReward(progress)
    : progress;

  return saveMathProgress(
    {
      ...rewardedProgress,
      completedStages: nextCompletedStages,
      currentSectionIndex: nextPosition.sectionIndex,
      currentStageIndex: nextPosition.stageIndex,
      currentUnitIndex: nextPosition.unitIndex,
    },
    userId,
  );
}
