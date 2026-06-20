import BottomTabs from "@/components/BottomTabs";
import { useAppTheme } from "@/constants/app-theme";
import { COLORS, FONTS } from "@/constants/calculo-theme";
import {
  checkMathAdventureAnswer,
  createMathAdventureQuestion,
  type MathAdventureAnswerMode,
  type MathAdventureChoice,
  type MathAdventureChoiceKey,
  type MathAdventureQuestion,
} from "@/constants/math-adventure-questions";
import { useAuthUserId } from "@/hooks/use-auth-user-id";
import { useLanguage, type Language } from "@/i18n/language";
import { recordMathAdventureAnswer } from "@/services/learning-state-service";
import { useSoundEffects } from "@/services/sound-effects";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
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

type AdventureMode = "mixed" | MathAdventureAnswerMode;
type FeedbackState = "idle" | "correct" | "wrong";
type ThemeColors = ReturnType<typeof useAppTheme>["colors"];

const ADVENTURE_COPY = {
  th: {
    answer: "คำตอบ",
    choiceMode: "กขคง",
    correct: "ถูกต้อง!",
    mixedMode: "สุ่ม",
    next: "สุ่มข้อใหม่",
    placeholder: "พิมพ์คำตอบเป็นตัวเลข",
    promptLabel: "โจทย์",
    score: "คะแนน",
    streak: "ต่อเนื่อง",
    submit: "ตอบ",
    subtitle: "สุ่มโจทย์ ม.ปลาย - มหาวิทยาลัย",
    title: "ผจญภัยคณิต",
    total: "ทำแล้ว",
    typedMode: "พิมพ์ตอบ",
    wrong: "ยังไม่ถูก",
  },
  en: {
    answer: "Answer",
    choiceMode: "A-D",
    correct: "Correct!",
    mixedMode: "Mixed",
    next: "New question",
    placeholder: "Type a numeric answer",
    promptLabel: "Question",
    score: "Score",
    streak: "Streak",
    submit: "Submit",
    subtitle: "Random high-school to university problems",
    title: "Math Adventure",
    total: "Total",
    typedMode: "Typed",
    wrong: "Not quite",
  },
} satisfies Record<Language, Record<string, string>>;

function questionForMode(mode: AdventureMode) {
  return createMathAdventureQuestion(mode === "mixed" ? undefined : mode);
}

function StatBox({
  color,
  colors,
  label,
  value,
}: {
  color: string;
  colors: ThemeColors;
  label: string;
  value: number | string;
}) {
  return (
    <View
      style={[
        styles.statBox,
        { backgroundColor: colors.card, borderColor: colors.grayBorder },
      ]}
    >
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.textSoft }]}>{label}</Text>
    </View>
  );
}

function ModeButton({
  active,
  label,
  onPress,
  colors,
}: {
  active: boolean;
  label: string;
  onPress: () => void;
  colors: ThemeColors;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.modeButton,
        {
          backgroundColor: active ? colors.blue : colors.card,
          borderColor: active ? colors.blue : colors.grayBorder,
        },
        pressed && styles.pressed,
      ]}
    >
      <Text
        style={[
          styles.modeButtonText,
          { color: active ? COLORS.white : colors.text },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export default function MathAdventure() {
  const router = useRouter();
  const { colors, isDark } = useAppTheme();
  const { copy: globalCopy, language } = useLanguage();
  const { playSound } = useSoundEffects();
  const userId = useAuthUserId();
  const copy = ADVENTURE_COPY[language];
  const [mode, setMode] = useState<AdventureMode>("choice");
  const [question, setQuestion] = useState<MathAdventureQuestion>(() =>
    createMathAdventureQuestion("choice"),
  );
  const [typedAnswer, setTypedAnswer] = useState("");
  const [selectedChoice, setSelectedChoice] =
    useState<MathAdventureChoiceKey | null>(null);
  const [feedback, setFeedback] = useState<FeedbackState>("idle");
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [total, setTotal] = useState(0);
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
  const renderPromptContent = useCallback(
    (item: NonNullable<MathAdventureQuestion["promptContent"]>[number]) => {
      if (item.type === "image") {
        return (
          <Image
            accessibilityLabel={item.alt}
            contentFit="contain"
            key={item.id}
            source={item.source}
            style={styles.questionImage}
          />
        );
      }

      return (
        <Text
          key={item.id}
          style={[styles.questionContentText, { color: colors.text }]}
        >
          {item.text}
        </Text>
      );
    },
    [colors.text],
  );

  const resetQuestion = useCallback((nextMode: AdventureMode = mode) => {
    setQuestion(questionForMode(nextMode));
    setTypedAnswer("");
    setSelectedChoice(null);
    setFeedback("idle");
  }, [mode]);

  const handleModeChange = useCallback(
    (nextMode: AdventureMode) => {
      setMode(nextMode);
      resetQuestion(nextMode);
    },
    [resetQuestion],
  );

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/home" as never);
  }, [router]);

  const submitAnswer = useCallback(
    (rawAnswer: string) => {
      if (feedback !== "idle" || !rawAnswer.trim()) {
        return;
      }

      const correct = checkMathAdventureAnswer(question, rawAnswer);
      const nextStreak = correct ? streak + 1 : 0;
      setFeedback(correct ? "correct" : "wrong");
      playSound(correct ? "correct" : "incorrect");
      setTotal((currentTotal) => currentTotal + 1);
      void recordMathAdventureAnswer(correct, nextStreak, userId);

      if (correct) {
        setScore((currentScore) => currentScore + 1);
        setStreak(nextStreak);
      } else {
        setStreak(0);
      }
    },
    [feedback, playSound, question, streak, userId],
  );

  const handleChoicePress = useCallback(
    (choice: MathAdventureChoice) => {
      if (feedback !== "idle") {
        return;
      }

      setSelectedChoice(choice.key);
      submitAnswer(choice.key);
    },
    [feedback, submitAnswer],
  );

  const answered = feedback !== "idle";
  const accuracy = total > 0 ? Math.round((score / total) * 100) : 0;

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
            <Text style={[styles.title, { color: colors.text }]}>
              {copy.title}
            </Text>
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
          <View style={styles.statsRow}>
            <StatBox color={colors.blue} colors={colors} label={copy.score} value={score} />
            <StatBox color="#20A66A" colors={colors} label={copy.streak} value={streak} />
            <StatBox
              color={colors.purple}
              colors={colors}
              label={copy.total}
              value={`${total} | ${accuracy}%`}
            />
          </View>

          <View style={styles.modeRow}>
            <ModeButton
              active={mode === "mixed"}
              colors={colors}
              label={copy.mixedMode}
              onPress={() => handleModeChange("mixed")}
            />
            <ModeButton
              active={mode === "typed"}
              colors={colors}
              label={copy.typedMode}
              onPress={() => handleModeChange("typed")}
            />
            <ModeButton
              active={mode === "choice"}
              colors={colors}
              label={copy.choiceMode}
              onPress={() => handleModeChange("choice")}
            />
          </View>

          <View
            style={[
              styles.questionPanel,
              { backgroundColor: colors.card, borderColor: colors.grayBorder },
            ]}
          >
            <View style={styles.badgeRow}>
              <View style={[styles.topicBadge, { backgroundColor: colors.blueLight }]}>
                <Text style={[styles.topicText, { color: colors.blue }]}>
                  {question.topic}
                </Text>
              </View>
              <View style={[styles.levelBadge, { borderColor: colors.purple }]}>
                <Text style={[styles.levelText, { color: colors.purple }]}>
                  {question.level}
                </Text>
              </View>
            </View>
            <Text style={[styles.promptLabel, { color: colors.textSoft }]}>
              {copy.promptLabel}
            </Text>
            {question.promptContent?.length ? (
              <View style={styles.questionContent}>
                {question.promptContent.map(renderPromptContent)}
              </View>
            ) : (
              <Text style={[styles.questionText, { color: colors.text }]}>
                {question.prompt}
              </Text>
            )}
          </View>

          {question.mode === "choice" && question.choices ? (
            <View style={styles.choiceGrid}>
              {question.choices.map((choice) => {
                const selected = selectedChoice === choice.key;
                const correctChoice = question.correctChoiceKey
                  ? choice.key === question.correctChoiceKey
                  : choice.value === question.answer;
                const compactChoice = choice.value === choice.key;
                const showCorrect = answered && correctChoice;
                const showWrong = answered && selected && !correctChoice;

                return (
                  <Pressable
                    accessibilityRole="button"
                    disabled={answered}
                    key={choice.key}
                    onPress={() => handleChoicePress(choice)}
                    style={({ pressed }) => [
                      styles.choiceButton,
                      compactChoice && styles.choiceButtonCompact,
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
                        styles.choiceKey,
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
                          styles.choiceKeyText,
                          {
                            color: showCorrect || showWrong
                              ? COLORS.white
                              : colors.blue,
                          },
                        ]}
                      >
                      {choice.key}
                    </Text>
                  </View>
                    {compactChoice ? null : (
                      <Text
                        style={[
                          styles.choiceValue,
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
                    )}
                  </Pressable>
                );
              })}
            </View>
          ) : (
            <View
              style={[
                styles.answerPanel,
                { backgroundColor: colors.card, borderColor: colors.grayBorder },
              ]}
            >
              <TextInput
                accessibilityLabel={copy.placeholder}
                editable={!answered}
                keyboardType={
                  Platform.OS === "ios" ? "numbers-and-punctuation" : "default"
                }
                onChangeText={setTypedAnswer}
                onSubmitEditing={() => submitAnswer(typedAnswer)}
                placeholder={copy.placeholder}
                placeholderTextColor={colors.gray}
                returnKeyType="send"
                style={[
                  styles.answerInput,
                  {
                    backgroundColor: colors.surface,
                    borderColor: answered ? colors.grayBorder : colors.blue,
                    color: colors.text,
                  },
                  answered && styles.answerInputDisabled,
                ]}
                value={typedAnswer}
              />
              <Pressable
                accessibilityRole="button"
                disabled={answered || !typedAnswer.trim()}
                onPress={() => submitAnswer(typedAnswer)}
                style={({ pressed }) => [
                  styles.submitButton,
                  {
                    backgroundColor:
                      answered || !typedAnswer.trim()
                        ? colors.grayBorder
                        : colors.green,
                    borderBottomColor:
                      answered || !typedAnswer.trim()
                        ? colors.grayDisabled
                        : colors.greenDark,
                  },
                  pressed && !answered && typedAnswer.trim() && styles.pressed,
                ]}
              >
                <Text
                  style={[
                    styles.submitButtonText,
                    {
                      color:
                        answered || !typedAnswer.trim()
                          ? colors.gray
                          : COLORS.white,
                    },
                  ]}
                >
                  {copy.submit}
                </Text>
              </Pressable>
            </View>
          )}

          {answered ? (
            <View
              style={[
                styles.feedbackPanel,
                {
                  backgroundColor:
                    feedback === "correct"
                      ? feedbackColors.correctBackground
                      : feedbackColors.wrongBackground,
                  borderColor:
                    feedback === "correct"
                      ? feedbackColors.correctBorder
                      : feedbackColors.wrongBorder,
                },
              ]}
            >
              <Text
                style={[
                  styles.feedbackTitle,
                  {
                    color:
                      feedback === "correct"
                        ? feedbackColors.correctText
                        : feedbackColors.wrongText,
                  },
                ]}
              >
                {feedback === "correct" ? copy.correct : copy.wrong}
              </Text>
              <Text
                style={[
                  styles.feedbackAnswer,
                  {
                    color:
                      feedback === "correct"
                        ? feedbackColors.correctText
                        : feedbackColors.wrongText,
                  },
                ]}
              >
                {copy.answer}: {question.answer}
              </Text>
              <Text
                style={[
                  styles.explanation,
                  {
                    color: isDark ? colors.text : colors.textSoft,
                  },
                ]}
              >
                {question.explanation}
              </Text>
            </View>
          ) : null}

          <Pressable
            accessibilityRole="button"
            onPress={() => resetQuestion()}
            style={({ pressed }) => [
              styles.nextButton,
              {
                backgroundColor: colors.purple,
                borderBottomColor: "#A85CDA",
              },
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.nextButtonText}>{copy.next}</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>

      <BottomTabs />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  answerInput: {
    borderRadius: 12,
    borderWidth: 2,
    flex: 1,
    fontFamily: FONTS.extra,
    fontSize: 22,
    height: 54,
    minWidth: 0,
    paddingHorizontal: 12,
    textAlign: "center",
  },
  answerInputDisabled: {
    opacity: 0.72,
  },
  answerPanel: {
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 2,
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
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
    marginBottom: 14,
  },
  choiceButton: {
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 2,
    flexBasis: "48%",
    flexDirection: "row",
    flexGrow: 1,
    gap: 10,
    minHeight: 68,
    minWidth: 142,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  choiceButtonCompact: {
    justifyContent: "center",
  },
  choiceGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
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
    fontSize: 17,
  },
  choiceValue: {
    flex: 1,
    fontFamily: FONTS.extra,
    fontSize: 20,
    lineHeight: 25,
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
    paddingBottom: 120,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  explanation: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
  },
  feedbackAnswer: {
    fontFamily: FONTS.extra,
    fontSize: 15,
    lineHeight: 21,
    textAlign: "center",
  },
  feedbackPanel: {
    borderRadius: 14,
    borderWidth: 2,
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  feedbackTitle: {
    fontFamily: FONTS.extra,
    fontSize: 20,
    lineHeight: 26,
    textAlign: "center",
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
  keyboard: {
    flex: 1,
  },
  levelBadge: {
    borderRadius: 999,
    borderWidth: 2,
    justifyContent: "center",
    minHeight: 34,
    paddingHorizontal: 12,
  },
  levelText: {
    fontFamily: FONTS.extra,
    fontSize: 12,
  },
  modeButton: {
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 2,
    flex: 1,
    justifyContent: "center",
    minHeight: 44,
    minWidth: 86,
    paddingHorizontal: 8,
  },
  modeButtonText: {
    fontFamily: FONTS.extra,
    fontSize: 13,
    letterSpacing: 0,
    textAlign: "center",
  },
  modeRow: {
    flexDirection: "row",
    gap: 8,
  },
  nextButton: {
    alignItems: "center",
    alignSelf: "center",
    borderBottomWidth: 4,
    borderRadius: 14,
    justifyContent: "center",
    minHeight: 52,
    minWidth: 170,
    paddingHorizontal: 18,
  },
  nextButtonText: {
    color: COLORS.white,
    fontFamily: FONTS.extra,
    fontSize: 15,
    letterSpacing: 0,
  },
  pressed: {
    opacity: 0.86,
    transform: [{ translateY: 1 }],
  },
  promptLabel: {
    fontFamily: FONTS.extra,
    fontSize: 13,
    textAlign: "center",
  },
  questionContent: {
    alignItems: "stretch",
    gap: 10,
    marginTop: 8,
    width: "100%",
  },
  questionContentText: {
    fontFamily: FONTS.extra,
    fontSize: 18,
    lineHeight: 26,
    textAlign: "center",
  },
  questionImage: {
    alignSelf: "center",
    aspectRatio: 1.45,
    borderRadius: 10,
    maxHeight: 280,
    width: "100%",
  },
  questionPanel: {
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 2,
    minHeight: 190,
    paddingHorizontal: 16,
    paddingVertical: 18,
  },
  questionText: {
    fontFamily: FONTS.extra,
    fontSize: 25,
    lineHeight: 34,
    marginTop: 8,
    textAlign: "center",
  },
  statBox: {
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 2,
    flex: 1,
    minHeight: 76,
    minWidth: 86,
    paddingHorizontal: 8,
    paddingVertical: 10,
  },
  statLabel: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    marginTop: 2,
    textAlign: "center",
  },
  statValue: {
    fontFamily: FONTS.extra,
    fontSize: 24,
    lineHeight: 30,
    textAlign: "center",
  },
  statsRow: {
    flexDirection: "row",
    gap: 8,
  },
  submitButton: {
    alignItems: "center",
    borderBottomWidth: 4,
    borderRadius: 12,
    height: 54,
    justifyContent: "center",
    minWidth: 82,
    paddingHorizontal: 16,
  },
  submitButtonText: {
    fontFamily: FONTS.extra,
    fontSize: 15,
    letterSpacing: 0,
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
  topicBadge: {
    borderRadius: 999,
    justifyContent: "center",
    minHeight: 34,
    paddingHorizontal: 12,
  },
  topicText: {
    fontFamily: FONTS.extra,
    fontSize: 12,
  },
});
