import BottomTabs from "@/components/BottomTabs";
import Mascot from "@/components/Mascot";
import { useAppTheme } from "@/constants/app-theme";
import { COLORS, FONTS } from "@/constants/calculo-theme";
import {
  QUESTION_COURSE,
  type QuestionCourseContent,
  type QuestionCourseStage,
  type QuestionCourseUnit,
} from "@/generated/question-course";
import { useLanguage } from "@/i18n/language";
import { watchAuthUser, type AuthUser } from "@/services/auth-service";
import { loadLearningState } from "@/services/learning-state-service";
import { useSoundEffects } from "@/services/sound-effects";
import {
  DEFAULT_MATH_PROGRESS,
  loadMathProgress,
  watchMathProgress,
  type MathProgress,
} from "@/utils/math-progress-storage";
import {
  completeQuestionStage,
  getAbsoluteQuestionStageIndex,
  getQuestionCoursePosition,
  getQuestionCourseTotals,
  isQuestionSectionUnlocked,
  isQuestionStageCompleted,
  isQuestionStageUnlocked,
  isQuestionUnitCompleted,
  isQuestionUnitUnlocked,
} from "@/utils/question-course-progress";
import { Image, type ImageStyle } from "expo-image";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  type StyleProp,
  Text,
  type TextStyle,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const STAGE_NODE_OFFSETS = [0, -42, 40, -30, 32, -44, 18, 44, -24, 0];

type SelectedQuestionStage = {
  sectionIndex: number;
  sectionNumber: number;
  stage: QuestionCourseStage;
  stageIndex: number;
  stageKey: string;
  stageNumber: number;
  unitIndex: number;
  unitTitle: string;
};

type SelectedLearningUnit = {
  learning: string;
  learningContent: QuestionCourseContent[];
  sectionNumber: number;
  title: string;
  unitNumber: number;
};

export default function Home() {
  const router = useRouter();
  const { colors, isDark, toggleTheme } = useAppTheme();
  const { copy, format, language } = useLanguage();
  const { playSound } = useSoundEffects();
  const [progress, setProgress] = useState<MathProgress>(DEFAULT_MATH_PROGRESS);
  const [authUser, setAuthUser] = useState<AuthUser>(null);
  const [viewSectionIndex, setViewSectionIndex] = useState<number | null>(null);
  const [sectionsOpen, setSectionsOpen] = useState(false);
  const [selectedStage, setSelectedStage] = useState<SelectedQuestionStage | null>(
    null,
  );
  const [selectedLearningUnit, setSelectedLearningUnit] =
    useState<SelectedLearningUnit | null>(null);
  const [selectedAnswerKey, setSelectedAnswerKey] = useState<string | null>(null);
  const [savingStageKey, setSavingStageKey] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    try {
      const unsubscribe = watchAuthUser((user) => {
        if (!mounted) {
          return;
        }

        setAuthUser(user);
        void loadLearningState(user?.uid);
      });

      return () => {
        mounted = false;
        unsubscribe();
      };
    } catch {
      return () => {
        mounted = false;
      };
    }
  }, []);

  useEffect(() => {
    let active = true;
    let unsubscribeProgress: (() => void) | undefined;
    const userId = authUser?.uid;

    const syncProgress = async () => {
      try {
        const storedProgress = await loadMathProgress(userId);

        if (active) {
          setProgress(storedProgress);
        }
      } catch {
        if (active) {
          setProgress(DEFAULT_MATH_PROGRESS);
        }
      }
    };

    void syncProgress().then(() => {
      if (!active || !userId) {
        return;
      }

      try {
        unsubscribeProgress = watchMathProgress(
          userId,
          (nextProgress) => {
            if (active) {
              setProgress(nextProgress);
            }
          },
          () => {
            if (active) {
              void syncProgress();
            }
          },
        );
      } catch {
        unsubscribeProgress = undefined;
      }
    });

    return () => {
      active = false;
      unsubscribeProgress?.();
    };
  }, [authUser?.uid]);

  const courseSections = QUESTION_COURSE;
  const courseTotals = useMemo(
    () => getQuestionCourseTotals(courseSections),
    [courseSections],
  );
  const progressPosition = useMemo(
    () => getQuestionCoursePosition(progress, courseSections),
    [progress, courseSections],
  );
  const position = useMemo(() => {
    if (
      viewSectionIndex === null ||
      viewSectionIndex >= progressPosition.sectionIndex ||
      !courseSections[viewSectionIndex]
    ) {
      return progressPosition;
    }

    return {
      completedStages: progressPosition.completedStages,
      sectionIndex: viewSectionIndex,
      sectionNumber: viewSectionIndex + 1,
      stageIndex: 0,
      stageNumber: 1,
      unitIndex: 0,
      unitNumber: 1,
    };
  }, [courseSections, progressPosition, viewSectionIndex]);
  const currentSection =
    courseSections[position.sectionIndex] ?? courseSections[0];
  const currentUnit =
    currentSection?.units[position.unitIndex] ?? currentSection?.units[0];
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
  const competitionTitle = language === "th" ? "การแข่งขัน" : "Competition";
  const competitionSubtitle =
    language === "th"
      ? "แข่งคิดเลขไว ตอบถูกก่อน 5 ข้อชนะ"
      : "Race to 5 correct answers";
  const competitionAction = language === "th" ? "เริ่มแข่ง" : "Start";
  const adventureTitle = language === "th" ? "ผจญภัยคณิต" : "Math Adventure";
  const adventureSubtitle =
    language === "th"
      ? "สุ่มโจทย์ ม.ปลายถึงมหาวิทยาลัย เลือกพิมพ์ตอบหรือ กขคง"
      : "Random high-school to university problems";
  const adventureAction = language === "th" ? "เริ่มลุย" : "Play";

  const canGoBackSection = position.sectionIndex > 0;
  const previousSection = canGoBackSection
    ? courseSections[position.sectionIndex - 1]
    : undefined;

  const handleSectionSelect = useCallback(
    (sectionIndex: number) => {
      const section = courseSections[sectionIndex];

      if (
        !section ||
        sectionIndex > progressPosition.sectionIndex ||
        !isQuestionSectionUnlocked(sectionIndex, progress, courseSections)
      ) {
        return;
      }

      setSelectedAnswerKey(null);
      setSelectedStage(null);
      setViewSectionIndex(
        sectionIndex < progressPosition.sectionIndex ? sectionIndex : null,
      );
      setSectionsOpen(false);
    },
    [courseSections, progress, progressPosition.sectionIndex],
  );

  const handleStagePress = useCallback(
    (unitIndex: number, stageIndex: number) => {
      if (
        !isQuestionStageUnlocked(
          position.sectionIndex,
          unitIndex,
          stageIndex,
          progress,
          courseSections,
        )
      ) {
        return;
      }

      const unit = courseSections[position.sectionIndex]?.units[unitIndex];
      const stage = unit?.stages[stageIndex];

      if (!unit || !stage) {
        return;
      }

      const stageKey = `${position.sectionIndex}-${unitIndex}-${stageIndex}`;
      setSelectedAnswerKey(null);
      setSelectedStage({
        sectionIndex: position.sectionIndex,
        sectionNumber: position.sectionNumber,
        stage,
        stageIndex,
        stageKey,
        stageNumber: stageIndex + 1,
        unitIndex,
        unitTitle: unit.title,
      });
    },
    [
      courseSections,
      position.sectionIndex,
      position.sectionNumber,
      progress,
    ],
  );

  const handleCloseStage = useCallback(() => {
    setSelectedAnswerKey(null);
    setSelectedStage(null);
  }, []);

  const handleLearningPress = useCallback(
    (unit: QuestionCourseUnit, unitIndex: number) => {
      if (!unit.learning && unit.learningContent.length === 0) {
        return;
      }

      setSelectedLearningUnit({
        learning: unit.learning,
        learningContent: unit.learningContent,
        sectionNumber: position.sectionNumber,
        title: unit.title,
        unitNumber: unitIndex + 1,
      });
    },
    [position.sectionNumber],
  );

  const renderCourseContent = useCallback(
    (
      item: QuestionCourseContent,
      imageStyle: ImageStyle,
      textStyle: StyleProp<TextStyle>,
    ) => {
      if (item.type === "image") {
        return (
          <Image
            accessibilityLabel={item.alt}
            contentFit="contain"
            key={item.id}
            source={item.source}
            style={imageStyle}
          />
        );
      }

      return (
        <Text key={item.id} style={[textStyle, { color: colors.text }]}>
          {item.text}
        </Text>
      );
    },
    [colors.text],
  );

  const handleCloseLearning = useCallback(() => {
    setSelectedLearningUnit(null);
  }, []);

  const handleAnswerPress = useCallback(
    async (choiceKey: string) => {
      if (!selectedStage || selectedAnswerKey || savingStageKey) {
        return;
      }

      const answeredCorrectly =
        choiceKey === selectedStage.stage.correctChoiceKey;

      setSelectedAnswerKey(choiceKey);
      playSound(answeredCorrectly ? "correct" : "incorrect");

      if (!answeredCorrectly) {
        return;
      }

      const absoluteStageIndex = getAbsoluteQuestionStageIndex(
        selectedStage.sectionIndex,
        selectedStage.unitIndex,
        selectedStage.stageIndex,
        courseSections,
      );
      const shouldCompleteStage = absoluteStageIndex === progress.completedStages;

      if (!shouldCompleteStage) {
        return;
      }

      setSavingStageKey(selectedStage.stageKey);

      try {
        const nextProgress = await completeQuestionStage(
          selectedStage.sectionIndex,
          selectedStage.unitIndex,
          selectedStage.stageIndex,
          progress,
          authUser?.uid,
          courseSections,
        );
        setProgress(nextProgress);
      } finally {
        setSavingStageKey(null);
      }
    },
    [
      authUser?.uid,
      courseSections,
      playSound,
      progress,
      savingStageKey,
      selectedAnswerKey,
      selectedStage,
    ],
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.surface }]}
      edges={["top", "bottom"]}
    >
      <View style={styles.topStats}>
        <View style={styles.topStatsLeft}>
          <View style={styles.statItem}>
            <View style={styles.flagBadge}>
              <Text style={styles.flagText}>∑</Text>
            </View>
            <Text style={[styles.statText, { color: colors.text }]}>
              {position.sectionNumber}
            </Text>
          </View>
          <View
            style={[
              styles.economyPill,
              { backgroundColor: colors.card, borderColor: colors.grayBorder },
            ]}
          >
            <Text style={[styles.economyLabel, { color: colors.textSoft }]}>
              XP
            </Text>
            <Text style={[styles.economyValue, { color: colors.text }]}>
              {progress.xp}
            </Text>
          </View>
          <View
            style={[
              styles.economyPill,
              { backgroundColor: colors.card, borderColor: colors.grayBorder },
            ]}
          >
            <Text style={[styles.economyLabel, { color: colors.textSoft }]}>
              CC
            </Text>
            <Text style={[styles.economyValue, { color: colors.text }]}>
              {progress.calcuCoin}
            </Text>
          </View>
        </View>
        <Pressable
          accessibilityLabel={
            isDark ? copy.landing.switchToLight : copy.landing.switchToDark
          }
          accessibilityRole="button"
          hitSlop={10}
          onPress={toggleTheme}
          style={[
            styles.themeButton,
            {
              backgroundColor: isDark ? colors.blueLight : colors.card,
              borderColor: colors.grayBorder,
            },
          ]}
        >
          <Text style={[styles.themeButtonText, { color: colors.blue }]}>
            {isDark ? "☀" : "☾"}
          </Text>
        </Pressable>
      </View>

      <Pressable
        onPress={() => setSectionsOpen(true)}
        style={[styles.sectionBanner, { backgroundColor: colors.green }]}
      >
        <View style={styles.sectionBannerText}>
          <Text style={styles.sectionLabel}>
            {format(copy.home.sectionLabel, {
              section: position.sectionNumber,
              unit: position.unitNumber,
            })}
          </Text>
          <Text style={styles.sectionTitle}>{currentSection.title}</Text>
        </View>
        <View style={styles.sectionMenu}>
          <Text style={styles.sectionMenuIcon}>☷</Text>
        </View>
      </Pressable>

      <View
        style={[
          styles.currentPanel,
          { backgroundColor: colors.card, borderColor: colors.grayBorder },
        ]}
      >
        <Text style={[styles.panelText, { color: colors.text }]}>
          {format(copy.home.currentSection, {
            current: position.sectionNumber,
            total: courseTotals.totalSections,
          })}
        </Text>
        <Text style={[styles.panelText, { color: colors.text }]}>
          {format(copy.home.currentUnit, {
            current: position.unitNumber,
            total: currentSection?.units.length ?? 0,
          })}
        </Text>
        <Text style={[styles.panelText, { color: colors.text }]}>
          {format(copy.home.currentStage, {
            current: position.stageNumber,
            total: currentUnit?.stages.length ?? 0,
          })}
        </Text>
      </View>

      {previousSection ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            handleSectionSelect(position.sectionIndex - 1);
          }}
          style={({ pressed }) => [
            styles.backSectionButton,
            {
              backgroundColor: colors.blueLight,
              borderColor: colors.blue,
              borderBottomColor: colors.blueDark,
            },
            pressed && styles.pressed,
          ]}
        >
          <Text style={[styles.backSectionText, { color: colors.blue }]}>
            ย้อนกลับบท
          </Text>
          <Text style={[styles.backSectionMeta, { color: colors.textSoft }]}>
            {previousSection.title}
          </Text>
        </Pressable>
      ) : null}

      <Pressable
        accessibilityRole="button"
        onPress={() => router.push("/competition" as never)}
        style={({ pressed }) => [
          styles.competitionPanel,
          {
            backgroundColor: colors.card,
            borderColor: colors.purple,
          },
          pressed && styles.pressed,
        ]}
      >
        <View style={styles.competitionIcon}>
          <Text style={styles.competitionIconText}>⚡</Text>
        </View>
        <View style={styles.competitionText}>
          <Text style={[styles.competitionTitle, { color: colors.text }]}>
            {competitionTitle}
          </Text>
          <Text style={[styles.competitionSubtitle, { color: colors.textSoft }]}>
            {competitionSubtitle}
          </Text>
        </View>
        <View style={[styles.competitionAction, { backgroundColor: colors.purple }]}>
          <Text style={styles.competitionActionText}>{competitionAction}</Text>
        </View>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        onPress={() => router.push("/math-adventure" as never)}
        style={({ pressed }) => [
          styles.competitionPanel,
          {
            backgroundColor: colors.card,
            borderColor: "#20A66A",
          },
          pressed && styles.pressed,
        ]}
      >
        <View style={[styles.competitionIcon, { backgroundColor: "#E6F8EE" }]}>
          <Text style={[styles.competitionIconText, { color: "#20A66A" }]}>
            ∑
          </Text>
        </View>
        <View style={styles.competitionText}>
          <Text style={[styles.competitionTitle, { color: colors.text }]}>
            {adventureTitle}
          </Text>
          <Text style={[styles.competitionSubtitle, { color: colors.textSoft }]}>
            {adventureSubtitle}
          </Text>
        </View>
        <View style={[styles.competitionAction, { backgroundColor: "#20A66A" }]}>
          <Text style={styles.competitionActionText}>{adventureAction}</Text>
        </View>
      </Pressable>

      <ScrollView
        style={styles.mapScroll}
        contentContainerStyle={styles.mapContent}
        showsVerticalScrollIndicator={false}
      >
        {currentSection.units.map((unit, unitIndex) => {
          const completed = isQuestionUnitCompleted(
            position.sectionIndex,
            unitIndex,
            progress,
            courseSections,
          );
          const unlocked = isQuestionUnitUnlocked(
            position.sectionIndex,
            unitIndex,
            progress,
            courseSections,
          );

          return (
            <View
              key={unit.id}
              style={[
                styles.unitGroup,
                {
                  backgroundColor: colors.card,
                  borderColor: completed
                    ? colors.blue
                    : unlocked
                      ? colors.grayBorder
                      : colors.grayBorder,
                },
              ]} 
            >
              <View style={styles.unitHeader}>
                <View style={styles.unitTitleBlock}>
                  <Text
                    style={[
                      styles.unitText,
                      {
                        color: unlocked ? colors.text : colors.gray,
                      },
                    ]}
                  >
                    {format(copy.home.unit, {
                      title: unit.title,
                      unit: unitIndex + 1,
                    })}
                  </Text>
                  <Text
                    style={[
                      styles.unitMeta,
                      {
                        color: unlocked ? colors.textSoft : colors.gray,
                      },
                    ]}
                  >
                    {format(copy.home.stages, { count: unit.stages.length })}
                  </Text>
                </View>
                {unit.learning || unit.learningContent.length > 0 ? (
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => handleLearningPress(unit, unitIndex)}
                    style={({ pressed }) => [
                      styles.learningButton,
                      {
                        backgroundColor: colors.blueLight,
                        borderColor: colors.blue,
                        borderBottomColor: colors.blueDark,
                      },
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text style={[styles.learningButtonText, { color: colors.blue }]}>
                      เรียนรู้
                    </Text>
                  </Pressable>
                ) : null}
              </View>

              <View style={styles.stageList}>
                {unit.stages.map((stage, stageIndex) => {
                  const stageCompleted = isQuestionStageCompleted(
                    position.sectionIndex,
                    unitIndex,
                    stageIndex,
                    progress,
                    courseSections,
                  );
                  const stageUnlocked = isQuestionStageUnlocked(
                    position.sectionIndex,
                    unitIndex,
                    stageIndex,
                    progress,
                    courseSections,
                  );
                  const active = stageUnlocked && !stageCompleted;
                  const stageKey = `${position.sectionIndex}-${unitIndex}-${stageIndex}`;
                  const stageOffset =
                    STAGE_NODE_OFFSETS[stageIndex % STAGE_NODE_OFFSETS.length];

                  return (
                    <View
                      key={stage.id}
                      style={[
                        styles.stageRow,
                        {
                          transform: [
                            { translateX: stageOffset },
                          ],
                        },
                      ]}
                    >
                      <Pressable
                        disabled={!stageUnlocked || savingStageKey === stageKey}
                        onPress={() => handleStagePress(unitIndex, stageIndex)}
                        style={({ pressed }) => [
                          styles.stageNode,
                          {
                            backgroundColor: stageCompleted
                              ? colors.blueLight
                              : active
                                ? "#58CC02"
                                : "#E5E5E5",
                            borderColor: active ? "#79DD28" : "#D0D4D8",
                            shadowColor: active ? "#48A900" : "#A9ADB1",
                          },
                          !stageUnlocked && styles.stageNodeLocked,
                          pressed && stageUnlocked && styles.pressed,
                        ]}
                      >
                        <Text
                          style={[
                            styles.stageIcon,
                            {
                              color: COLORS.white,
                            },
                          ]}
                        >
                          ★
                        </Text>
                      </Pressable>
                      <Text
                        style={[
                          styles.stageText,
                          { color: stageUnlocked ? colors.text : colors.gray },
                        ]}
                      >
                        {stage.title || format(copy.home.stage, { stage: stageIndex + 1 })}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          );
        })}

        <View style={styles.mapMascot}>
          <Mascot size={82} variant="study" animated={false} />
        </View>
      </ScrollView>

      <BottomTabs />

      <Modal
        animationType="fade"
        transparent
        visible={sectionsOpen}
        onRequestClose={() => setSectionsOpen(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setSectionsOpen(false)}>
          <Pressable
            style={[styles.sectionsSheet, { backgroundColor: colors.card }]}
            onPress={(event) => event.stopPropagation()}
          >
            <Text style={[styles.profileTitle, { color: colors.text }]}>
              {copy.home.allSections}
            </Text>
            <ScrollView
              style={styles.sectionsList}
              contentContainerStyle={styles.sectionsListContent}
              showsVerticalScrollIndicator={false}
            >
              {courseSections.map((section, index) => {
                const active = index === position.sectionIndex;
                const unlocked = isQuestionSectionUnlocked(
                  index,
                  progress,
                  courseSections,
                );
                const selectable =
                  unlocked && index <= progressPosition.sectionIndex;
                const stageCount = section.units.reduce(
                  (sum, unit) => sum + unit.stages.length,
                  0,
                );

                return (
                  <Pressable
                    accessibilityRole="button"
                    disabled={!selectable}
                    key={section.title}
                    onPress={() => {
                      handleSectionSelect(index);
                    }}
                    style={({ pressed }) => [
                      styles.sectionRow,
                      {
                        backgroundColor: active ? colors.blueLight : colors.surface,
                        borderColor: active ? colors.blue : colors.grayBorder,
                      },
                      pressed && selectable && styles.pressed,
                      !selectable && styles.sectionRowDisabled,
                    ]}
                  >
                    <Text
                      style={[
                        styles.sectionNumber,
                        { color: active ? colors.blue : colors.textSoft },
                      ]}
                    >
                      {index + 1}
                    </Text>
                    <View style={styles.sectionRowText}>
                      <Text
                        style={[
                          styles.sectionRowTitle,
                          { color: unlocked ? colors.text : colors.gray },
                        ]}
                      >
                        {section.title}
                      </Text>
                      <Text style={[styles.sectionRowMeta, { color: colors.textSoft }]}>
                        {format(copy.home.sectionMeta, {
                          stages: stageCount,
                          units: section.units.length,
                        })}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        animationType="fade"
        transparent
        visible={Boolean(selectedLearningUnit)}
        onRequestClose={handleCloseLearning}
      >
        <Pressable style={styles.modalBackdrop} onPress={handleCloseLearning}>
          <Pressable
            style={[styles.learningSheet, { backgroundColor: colors.card }]}
            onPress={(event) => event.stopPropagation()}
          >
            <Text style={[styles.learningKicker, { color: colors.blue }]}>
              บท {selectedLearningUnit?.sectionNumber} · หน่วย{" "}
              {selectedLearningUnit?.unitNumber}
            </Text>
            <Text style={[styles.learningTitle, { color: colors.text }]}>
              {selectedLearningUnit?.title}
            </Text>
            <ScrollView
              style={styles.learningScroll}
              contentContainerStyle={[
                styles.learningContent,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.grayBorder,
                },
              ]}
              showsVerticalScrollIndicator={false}
            >
              {selectedLearningUnit?.learningContent.length ? (
                selectedLearningUnit.learningContent.map((item) =>
                  renderCourseContent(
                    item,
                    styles.learningImage,
                    styles.learningText,
                  ),
                )
              ) : (
                <Text style={[styles.learningText, { color: colors.text }]}>
                  {selectedLearningUnit?.learning}
                </Text>
              )}
            </ScrollView>
            <Pressable
              accessibilityRole="button"
              onPress={handleCloseLearning}
              style={({ pressed }) => [
                styles.closeQuestionButton,
                {
                  backgroundColor: colors.green,
                  borderBottomColor: colors.greenDark,
                },
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.closeQuestionText}>ปิด</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        animationType="fade"
        transparent
        visible={Boolean(selectedStage)}
        onRequestClose={handleCloseStage}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={handleCloseStage}
        >
          <Pressable
            style={[styles.questionSheet, { backgroundColor: colors.card }]}
            onPress={(event) => event.stopPropagation()}
          >
            <Text style={[styles.questionKicker, { color: colors.blue }]}>
              บท {selectedStage?.sectionNumber} · {selectedStage?.unitTitle}
            </Text>
            <Text style={[styles.questionTitle, { color: colors.text }]}>
              {selectedStage?.stage.title}
            </Text>
            <ScrollView
              style={styles.questionScroll}
              contentContainerStyle={styles.questionScrollContent}
              showsVerticalScrollIndicator={false}
            >
              <View
                style={[
                  styles.questionBlock,
                  { backgroundColor: colors.surface, borderColor: colors.grayBorder },
                ]}
              >
                <Text style={[styles.questionBlockLabel, { color: colors.textSoft }]}>
                  โจทย์
                </Text>
                {selectedStage?.stage.promptContent.length ? (
                  selectedStage.stage.promptContent.map((item) =>
                    renderCourseContent(
                      item,
                      styles.questionImage,
                      styles.questionPrompt,
                    ),
                  )
                ) : (
                  <Text style={[styles.questionPrompt, { color: colors.text }]}>
                    {selectedStage?.stage.prompt}
                  </Text>
                )}
              </View>
              <View
                style={[
                  styles.questionBlock,
                  { backgroundColor: colors.surface, borderColor: colors.green },
                ]}
              >
                <Text style={[styles.questionBlockLabel, { color: colors.textSoft }]}>
                  คำตอบ
                </Text>
                {selectedStage?.stage.answerChoices.length ? (
                  <View style={styles.answerChoiceList}>
                    {selectedStage.stage.answerChoices.map((choice) => {
                      const answered = selectedAnswerKey !== null;
                      const selected = selectedAnswerKey === choice.key;
                      const correct =
                        choice.key === selectedStage.stage.correctChoiceKey;
                      const showCorrect = answered && correct;
                      const showWrong = answered && selected && !correct;

                      return (
                        <Pressable
                          accessibilityRole="button"
                          disabled={answered}
                          key={choice.key}
                          onPress={() => handleAnswerPress(choice.key)}
                          style={({ pressed }) => [
                            styles.answerChoiceButton,
                            !choice.value && styles.answerChoiceButtonCompact,
                            {
                              backgroundColor: showCorrect
                                ? feedbackColors.correctBackground
                                : showWrong
                                  ? feedbackColors.wrongBackground
                                  : colors.card,
                              borderColor: showCorrect
                                ? feedbackColors.correctBorder
                                : showWrong
                                  ? feedbackColors.wrongBorder
                                  : selected
                                    ? colors.blue
                                    : colors.grayBorder,
                            },
                            pressed && !answered && styles.pressed,
                          ]}
                        >
                          <View
                            style={[
                              styles.answerChoiceKey,
                              !choice.value && styles.answerChoiceKeyCompact,
                              {
                                backgroundColor: showCorrect
                                  ? "#3CCB6D"
                                  : showWrong
                                    ? "#FF6B6B"
                                    : colors.blueLight,
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.answerChoiceKeyText,
                                !choice.value && styles.answerChoiceKeyTextCompact,
                                {
                                  color:
                                    showCorrect || showWrong
                                      ? COLORS.white
                                      : colors.blue,
                                },
                              ]}
                            >
                              {choice.key}
                            </Text>
                          </View>
                          {choice.value ? (
                            <Text
                              style={[
                                styles.answerChoiceText,
                                {
                                  color: showCorrect
                                    ? feedbackColors.correctText
                                    : showWrong
                                      ? feedbackColors.wrongText
                                      : colors.text,
                                },
                              ]}
                            >
                              {choice.value}
                            </Text>
                          ) : null}
                        </Pressable>
                      );
                    })}
                  </View>
                ) : (
                  <Text style={[styles.answerText, { color: colors.text }]}>
                    {selectedStage?.stage.answer || "-"}
                  </Text>
                )}
              </View>
              {selectedAnswerKey ? (
                <View
                  style={[
                    styles.answerFeedback,
                    {
                      backgroundColor:
                        selectedAnswerKey === selectedStage?.stage.correctChoiceKey
                          ? feedbackColors.correctBackground
                          : feedbackColors.wrongBackground,
                      borderColor:
                        selectedAnswerKey === selectedStage?.stage.correctChoiceKey
                          ? feedbackColors.correctBorder
                          : feedbackColors.wrongBorder,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.answerFeedbackText,
                      {
                        color:
                          selectedAnswerKey === selectedStage?.stage.correctChoiceKey
                            ? feedbackColors.correctText
                            : feedbackColors.wrongText,
                      },
                    ]}
                  >
                    {selectedStage?.stage.correctChoiceKey
                      ? selectedAnswerKey === selectedStage.stage.correctChoiceKey
                        ? "ถูกต้อง!"
                        : `ยังไม่ถูก เฉลยคือ ${selectedStage.stage.correctChoiceKey}`
                      : "ด่านนี้ยังไม่ได้ตั้งเฉลยในชื่อโฟลเดอร์"}
                  </Text>
                </View>
              ) : null}
            </ScrollView>
            <Pressable
              accessibilityRole="button"
              onPress={handleCloseStage}
              style={({ pressed }) => [
                styles.closeQuestionButton,
                {
                  backgroundColor: colors.green,
                  borderBottomColor: colors.greenDark,
                },
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.closeQuestionText}>ปิด</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  topStats: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  topStatsLeft: {
    alignItems: "center",
    flexDirection: "row",
    flexShrink: 1,
    flexWrap: "wrap",
    gap: 8,
    minWidth: 0,
  },
  statItem: { alignItems: "center", flexDirection: "row", gap: 8 },
  economyPill: {
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 2,
    flexDirection: "row",
    gap: 5,
    minHeight: 32,
    paddingHorizontal: 9,
  },
  economyLabel: {
    fontFamily: FONTS.extra,
    fontSize: 11,
    lineHeight: 15,
  },
  economyValue: {
    fontFamily: FONTS.extra,
    fontSize: 13,
    lineHeight: 18,
  },
  flagBadge: {
    alignItems: "center",
    backgroundColor: "#FF4B4B",
    borderRadius: 4,
    height: 18,
    justifyContent: "center",
    width: 24,
  },
  flagText: { color: COLORS.white, fontFamily: FONTS.extra, fontSize: 12 },
  statText: { fontFamily: FONTS.extra, fontSize: 14 },
  themeButton: {
    alignItems: "center",
    borderRadius: 18,
    borderWidth: 2,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  themeButtonText: { fontFamily: FONTS.extra, fontSize: 18, lineHeight: 22 },
  sectionBanner: {
    borderBottomWidth: 4,
    borderColor: "#47A800",
    borderRadius: 12,
    flexDirection: "row",
    marginHorizontal: 14,
    overflow: "hidden",
  },
  sectionBannerText: { flex: 1, paddingHorizontal: 14, paddingVertical: 10 },
  sectionLabel: { color: COLORS.white, fontFamily: FONTS.extra, fontSize: 14 },
  sectionTitle: {
    color: COLORS.white,
    fontFamily: FONTS.extra,
    fontSize: 19,
    lineHeight: 25,
    marginTop: 2,
  },
  sectionMenu: {
    alignItems: "center",
    borderLeftColor: "rgba(255,255,255,0.24)",
    borderLeftWidth: 1,
    justifyContent: "center",
    width: 50,
  },
  sectionMenuIcon: { color: COLORS.white, fontFamily: FONTS.extra, fontSize: 27 },
  currentPanel: {
    borderRadius: 12,
    borderWidth: 2,
    gap: 4,
    marginHorizontal: 14,
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  backSectionButton: {
    alignItems: "center",
    borderBottomWidth: 4,
    borderRadius: 12,
    borderWidth: 2,
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    marginHorizontal: 14,
    marginTop: 10,
    minHeight: 48,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  backSectionMeta: {
    flex: 1,
    fontFamily: FONTS.bold,
    fontSize: 13,
    lineHeight: 18,
    minWidth: 0,
  },
  backSectionText: {
    fontFamily: FONTS.extra,
    fontSize: 15,
    lineHeight: 20,
  },
  competitionAction: {
    alignItems: "center",
    borderRadius: 12,
    justifyContent: "center",
    minHeight: 40,
    paddingHorizontal: 12,
  },
  competitionActionText: {
    color: COLORS.white,
    fontFamily: FONTS.extra,
    fontSize: 13,
    letterSpacing: 0,
  },
  competitionIcon: {
    alignItems: "center",
    backgroundColor: "#FFF4D6",
    borderRadius: 14,
    height: 46,
    justifyContent: "center",
    width: 46,
  },
  competitionIconText: {
    color: "#F5A400",
    fontFamily: FONTS.extra,
    fontSize: 24,
    lineHeight: 28,
  },
  competitionPanel: {
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 2,
    flexDirection: "row",
    gap: 12,
    marginHorizontal: 14,
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  competitionSubtitle: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
  },
  competitionText: {
    flex: 1,
    minWidth: 0,
  },
  competitionTitle: {
    fontFamily: FONTS.extra,
    fontSize: 17,
    lineHeight: 22,
  },
  answerText: {
    fontFamily: FONTS.extra,
    fontSize: 17,
    lineHeight: 26,
  },
  answerChoiceList: {
    gap: 10,
    width: "100%",
  },
  answerChoiceButton: {
    alignItems: "flex-start",
    borderRadius: 12,
    borderWidth: 2,
    flexDirection: "row",
    gap: 10,
    minHeight: 52,
    paddingHorizontal: 12,
    paddingVertical: 10,
    width: "100%",
  },
  answerChoiceButtonCompact: {
    alignItems: "center",
    justifyContent: "center",
  },
  answerChoiceKey: {
    alignItems: "center",
    borderRadius: 10,
    height: 30,
    justifyContent: "center",
    width: 30,
  },
  answerChoiceKeyCompact: {
    borderRadius: 14,
    height: 40,
    width: 40,
  },
  answerChoiceKeyText: {
    fontFamily: FONTS.extra,
    fontSize: 15,
    lineHeight: 20,
  },
  answerChoiceKeyTextCompact: {
    fontSize: 18,
    lineHeight: 24,
  },
  answerChoiceText: {
    flex: 1,
    fontFamily: FONTS.bold,
    fontSize: 15,
    lineHeight: 22,
    minWidth: 0,
  },
  answerFeedback: {
    borderRadius: 12,
    borderWidth: 2,
    paddingHorizontal: 14,
    paddingVertical: 12,
    width: "100%",
  },
  answerFeedbackText: {
    fontFamily: FONTS.extra,
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
  },
  closeQuestionButton: {
    alignItems: "center",
    alignSelf: "stretch",
    borderBottomWidth: 4,
    borderRadius: 14,
    justifyContent: "center",
    minHeight: 50,
    paddingHorizontal: 18,
  },
  closeQuestionText: {
    color: COLORS.white,
    fontFamily: FONTS.extra,
    fontSize: 15,
  },
  panelText: { fontFamily: FONTS.bold, fontSize: 14 },
  mapScroll: { flex: 1 },
  mapContent: {
    alignItems: "center",
    paddingBottom: 110,
    paddingTop: 16,
  },
  unitGroup: {
    borderRadius: 14,
    borderWidth: 2,
    marginBottom: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    width: "92%",
  },
  unitHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
    width: "100%",
  },
  unitTitleBlock: {
    alignItems: "center",
    flex: 1,
    minWidth: 0,
  },
  learningButton: {
    alignItems: "center",
    borderBottomWidth: 3,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: "center",
    minHeight: 38,
    paddingHorizontal: 12,
  },
  learningButtonText: {
    fontFamily: FONTS.extra,
    fontSize: 12,
    lineHeight: 16,
  },
  stageList: { alignItems: "center" },
  stageRow: {
    alignItems: "center",
    marginBottom: 18,
    width: 190,
  },
  stageNode: {
    alignItems: "center",
    borderRadius: 34,
    borderWidth: 6,
    elevation: 4,
    height: 68,
    justifyContent: "center",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.28,
    shadowRadius: 0,
    width: 68,
  },
  stageNodeLocked: { opacity: 0.72 },
  stageIcon: { fontFamily: FONTS.extra, fontSize: 28 },
  unitText: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    textAlign: "center",
  },
  unitMeta: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    marginTop: 2,
    textAlign: "center",
  },
  stageText: {
    fontFamily: FONTS.extra,
    fontSize: 12,
    marginTop: 8,
    textAlign: "center",
  },
  mapMascot: {
    opacity: 0.5,
    position: "absolute",
    right: 54,
    top: 230,
  },
  pressed: { opacity: 0.82, transform: [{ translateY: 1 }] },
  modalBackdrop: {
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.34)",
    flex: 1,
    justifyContent: "flex-end",
    padding: 18,
  },
  sectionsSheet: {
    borderRadius: 16,
    gap: 14,
    maxHeight: "78%",
    padding: 18,
    width: "100%",
  },
  profileTitle: { fontFamily: FONTS.extra, fontSize: 22 },
  learningContent: {
    borderRadius: 14,
    borderWidth: 2,
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  learningImage: {
    alignSelf: "center",
    borderRadius: 10,
    height: 360,
    width: "100%",
  },
  learningKicker: {
    fontFamily: FONTS.extra,
    fontSize: 13,
    textAlign: "center",
  },
  learningScroll: {
    alignSelf: "stretch",
    maxHeight: 380,
  },
  learningSheet: {
    borderRadius: 16,
    gap: 12,
    maxHeight: "82%",
    padding: 18,
    width: "100%",
  },
  learningText: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    lineHeight: 23,
  },
  learningTitle: {
    fontFamily: FONTS.extra,
    fontSize: 22,
    lineHeight: 28,
    textAlign: "center",
  },
  questionBlock: {
    borderRadius: 14,
    borderWidth: 2,
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 14,
    width: "100%",
  },
  questionBlockLabel: {
    fontFamily: FONTS.extra,
    fontSize: 12,
  },
  questionKicker: {
    fontFamily: FONTS.extra,
    fontSize: 13,
    textAlign: "center",
  },
  questionImage: {
    alignSelf: "center",
    borderRadius: 10,
    height: 260,
    width: "100%",
  },
  questionPrompt: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    lineHeight: 27,
  },
  questionScroll: {
    alignSelf: "stretch",
  },
  questionScrollContent: {
    gap: 12,
    paddingBottom: 2,
  },
  questionSheet: {
    borderRadius: 16,
    gap: 12,
    maxHeight: "82%",
    padding: 18,
    width: "100%",
  },
  questionTitle: {
    fontFamily: FONTS.extra,
    fontSize: 22,
    textAlign: "center",
  },
  sectionsList: { width: "100%" },
  sectionsListContent: { gap: 10, paddingBottom: 4 },
  sectionRow: {
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 2,
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  sectionRowDisabled: {
    opacity: 0.55,
  },
  sectionNumber: { fontFamily: FONTS.extra, fontSize: 17, width: 24 },
  sectionRowText: { flex: 1 },
  sectionRowTitle: { fontFamily: FONTS.extra, fontSize: 16 },
  sectionRowMeta: { fontFamily: FONTS.bold, fontSize: 12, marginTop: 2 },
});
