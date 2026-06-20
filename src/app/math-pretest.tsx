import Button from "@/components/Button";
import Mascot from "@/components/Mascot";
import ProgressBar from "@/components/ProgressBar";
import { useAppTheme } from "@/constants/app-theme";
import {
  MATH_CHAPTERS,
  MATH_KEYS,
  MATH_QUESTIONS,
  type MathQuestion,
} from "@/constants/math-pretest-data";
import { COLORS, FONTS } from "@/constants/calculo-theme";
import { useAuthUserId } from "@/hooks/use-auth-user-id";
import {
  loadPretestScores,
  saveOnboardingPreferences,
  savePretestChapterScore,
} from "@/services/learning-state-service";
import { setAudioModeAsync, useAudioPlayer } from "expo-audio";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const QUESTION_BANK: Record<string, MathQuestion[]> = MATH_QUESTIONS;
const EMPTY_QUESTIONS: MathQuestion[] = [];
const CORRECT_SOUND = require("../../sound_effect/correct/dragon-studio-correct-472358.mp3");
const WRONG_SOUND = require("../../sound_effect/wrong/universfield-wrong-answer-129254.mp3");
type Screen = "chapters" | "quiz" | "result";

export default function MathPretest() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const userId = useAuthUserId();
  const [screen, setScreen] = useState<Screen>("chapters");
  const [chapterKey, setChapterKey] = useState(MATH_CHAPTERS[0].key);
  const [index, setIndex] = useState(0);
  const [picks, setPicks] = useState<(number | null)[]>([]);
  const [chapterScores, setChapterScores] = useState<Record<string, number>>({});
  const [savingScore, setSavingScore] = useState(false);

  useEffect(() => {
    void setAudioModeAsync({
      allowsRecording: false,
      interruptionMode: "mixWithOthers",
      playsInSilentMode: true,
      shouldPlayInBackground: false,
      shouldRouteThroughEarpiece: false,
    });
  }, []);

  useEffect(() => {
    let mounted = true;

    void loadPretestScores(userId).then((scores) => {
      if (mounted) {
        setChapterScores(scores);
      }
    });

    return () => {
      mounted = false;
    };
  }, [userId]);

  const chapterIndex = Math.max(
    0,
    MATH_CHAPTERS.findIndex((chapter) => chapter.key === chapterKey),
  );
  const chapter = MATH_CHAPTERS[chapterIndex] ?? MATH_CHAPTERS[0];
  const accent = colors.blue;
  const questions = QUESTION_BANK[chapterKey] ?? EMPTY_QUESTIONS;
  const current = questions[index];
  const picked = picks[index] ?? null;
  const allCompleted = MATH_CHAPTERS.every(
    (chapterItem) => chapterScores[chapterItem.key] !== undefined,
  );
  const totalScore = MATH_CHAPTERS.reduce(
    (sum, chapterItem) => sum + (chapterScores[chapterItem.key] ?? 0),
    0,
  );
  const score = useMemo(
    () =>
      picks.reduce<number>(
        (sum, pick, questionIndex) =>
          sum + (pick === questions[questionIndex]?.a ? 1 : 0),
        0,
      ),
    [picks, questions],
  );

  const startChapter = (key: string) => {
    const list = QUESTION_BANK[key] ?? [];
    setChapterKey(key);
    setIndex(0);
    setPicks(Array(list.length).fill(null));
    setScreen("quiz");
  };

  const choose = (answerIndex: number) => {
    if (picked !== null) {
      return;
    }

    setPicks((currentPicks) => {
      const next = [...currentPicks];
      next[index] = answerIndex;
      return next;
    });
  };

  const completeOnboardingAndGoHome = async (pretestSkipped = false) => {
    await saveOnboardingPreferences(
      {
        completedAt: new Date().toISOString(),
        pretestSkipped,
      },
      userId,
    );
    router.replace("/home" as never);
  };

  const goNext = async () => {
    if (index >= questions.length - 1) {
      setSavingScore(true);

      try {
        await savePretestChapterScore(
          chapterKey,
          score,
          MATH_CHAPTERS.map((chapterItem) => chapterItem.key),
          userId,
        );
        setChapterScores((scores) => ({ ...scores, [chapterKey]: score }));
        setScreen("result");
      } finally {
        setSavingScore(false);
      }

      return;
    }

    setIndex((value) => value + 1);
  };

  const goBack = () => {
    if (screen === "chapters") {
      router.back();
      return;
    }

    setScreen("chapters");
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.surface }]}
      edges={["top", "bottom"]}
    >
      <ProgressBar
        progress={
          screen === "chapters"
            ? 0.08
            : screen === "result"
              ? 1
              : (index + 1) / Math.max(questions.length, 1)
        }
        onBack={goBack}
      />

      {screen === "chapters" ? (
        <ChapterPicker
          allCompleted={allCompleted}
          onContinue={() => void completeOnboardingAndGoHome(false)}
          onSkip={() => void completeOnboardingAndGoHome(true)}
          onStart={startChapter}
          scores={chapterScores}
          totalScore={totalScore}
        />
      ) : screen === "result" ? (
        <ResultScreen
          allCompleted={allCompleted}
          accent={accent}
          chapterTitle={chapter.lvl}
          onContinue={() => void completeOnboardingAndGoHome(false)}
          picks={picks}
          questions={questions}
          score={score}
          onRetry={() => startChapter(chapterKey)}
          onOther={() => setScreen("chapters")}
        />
      ) : current ? (
        <QuizScreen
          accent={accent}
          chapterTitle={chapter.lvl}
          index={index}
          picked={picked}
          picks={picks}
          question={current}
          questions={questions}
          saving={savingScore}
          onChoose={choose}
          onNext={goNext}
        />
      ) : null}
    </SafeAreaView>
  );
}

function ChapterPicker({
  allCompleted,
  onContinue,
  onSkip,
  onStart,
  scores,
  totalScore,
}: {
  allCompleted: boolean;
  onContinue: () => void;
  onSkip: () => void;
  onStart: (key: string) => void;
  scores: Record<string, number>;
  totalScore: number;
}) {
  const { colors } = useAppTheme();
  const completedCount = MATH_CHAPTERS.filter(
    (chapter) => scores[chapter.key] !== undefined,
  ).length;

  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={styles.chapterContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.chapterHero}>
        <View style={styles.heroCopy}>
          <Text style={[styles.eyebrow, { color: colors.blue }]}>
            MATH PRE-CHECK
          </Text>
          <Text style={[styles.title, { color: colors.text }]}>
            เลือกบททดสอบก่อนเรียน
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSoft }]}>
            ทำให้ครบทุกบทเพื่อประเมินพื้นฐานก่อนเข้าเนื้อหา
          </Text>
        </View>
        <Mascot size={104} variant="study" />
      </View>

      <View
        style={[
          styles.progressSummary,
          { backgroundColor: colors.blueLight, borderColor: colors.grayBorder },
        ]}
      >
        <Text style={[styles.progressSummaryText, { color: colors.text }]}>
          ทำแล้ว {completedCount}/{MATH_CHAPTERS.length} บท
        </Text>
        <Text style={[styles.progressSummaryScore, { color: colors.blue }]}>
          คะแนนรวม {totalScore}/{MATH_CHAPTERS.length * 10}
        </Text>
      </View>

      <View style={styles.chapterList}>
        {MATH_CHAPTERS.map((chapter, index) => {
          const accent = colors.blue;
          const savedScore = scores[chapter.key];
          return (
            <Pressable
              key={chapter.key}
              onPress={() => onStart(chapter.key)}
              style={({ pressed }) => [
                styles.chapterCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.grayBorder,
                  borderLeftColor: accent,
                },
                pressed && styles.pressed,
              ]}
            >
              <View style={[styles.chapterIcon, { backgroundColor: accent }]}>
                <Text style={styles.chapterIconText}>{index + 1}</Text>
              </View>
              <View style={styles.chapterText}>
                <Text style={[styles.chapterTitle, { color: accent }]}>
                  {chapter.lvl}
                </Text>
                <Text style={[styles.chapterTopics, { color: colors.textSoft }]}>
                  {chapter.topics}
                </Text>
                <Text style={[styles.chapterMeta, { color: colors.blueDark }]}>
                  {savedScore === undefined
                    ? "เริ่มทดสอบ · 10 ข้อ"
                    : `คะแนนล่าสุด ${savedScore}/10 · ทำใหม่ได้`}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.chapterContinue}>
        <Button
          label={allCompleted ? "ไปต่อ" : "ทำให้ครบทุกบทก่อน"}
          disabled={!allCompleted}
          onPress={onContinue}
        />
        <Button label="ข้ามแบบทดสอบ" variant="secondary" onPress={onSkip} />
      </View>
    </ScrollView>
  );
}

function QuizScreen({
  accent,
  chapterTitle,
  index,
  picked,
  picks,
  question,
  questions,
  saving,
  onChoose,
  onNext,
}: {
  accent: string;
  chapterTitle: string;
  index: number;
  picked: number | null;
  picks: (number | null)[];
  question: MathQuestion;
  questions: MathQuestion[];
  saving: boolean;
  onChoose: (answerIndex: number) => void;
  onNext: () => void;
}) {
  const { colors } = useAppTheme();
  const correctSound = useAudioPlayer(CORRECT_SOUND, {
    downloadFirst: true,
    keepAudioSessionActive: true,
  });
  const wrongSound = useAudioPlayer(WRONG_SOUND, {
    downloadFirst: true,
    keepAudioSessionActive: true,
  });
  const answered = picked !== null;
  const correct = picked === question.a;
  const mascotVariant = !answered ? "study" : correct ? "cheer" : "sad";

  const playAnswerSound = (isCorrect: boolean) => {
    const player = isCorrect ? correctSound : wrongSound;

    void player
      .seekTo(0)
      .then(() => player.play())
      .catch(() => player.play());
  };

  return (
    <>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.quizContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.quizHeader}>
          <View style={styles.quizTop}>
            <Text style={[styles.quizChapter, { color: accent }]}>
              {chapterTitle}
            </Text>
          <Text style={[styles.counter, { color: colors.gray }]}>
            ข้อ {index + 1} จาก {questions.length}
          </Text>
          </View>
          <Mascot size={68} variant={mascotVariant} />
        </View>

        <View style={styles.dots}>
          {questions.map((item, dotIndex) => {
            const pick = picks[dotIndex];
            const dotStyle =
              pick === null
                ? dotIndex === index
                  ? [
                      styles.dot,
                      { backgroundColor: colors.card, borderColor: accent },
                    ]
                  : [
                      styles.dot,
                      {
                        backgroundColor: colors.card,
                        borderColor: colors.grayBorder,
                      },
                    ]
                : [
                    styles.dot,
                    styles.dotDone,
                    {
                      backgroundColor:
                        pick === item.a ? COLORS.blue : "#FF4B4B",
                      borderColor: pick === item.a ? COLORS.blue : "#FF4B4B",
                    },
                  ];
            return <View key={`${item.q}-${dotIndex}`} style={dotStyle} />;
          })}
        </View>

        <View
          style={[
            styles.questionCard,
            { backgroundColor: colors.card, borderColor: colors.grayBorder },
          ]}
        >
          <Text style={[styles.questionNumber, { color: accent }]}>
            คำถามข้อที่ {index + 1}
          </Text>
          <Text style={[styles.questionText, { color: colors.text }]}>
            {question.q}
          </Text>
          {question.fig ? <Figure svg={question.fig} /> : null}

          <View style={styles.options}>
            {question.c.map((choice, choiceIndex) => {
              const isCorrect = choiceIndex === question.a;
              const isPicked = choiceIndex === picked;
              const showResultMark = answered && (isPicked || isCorrect);
              const optionState =
                answered && isCorrect
                  ? styles.optionCorrect
                  : answered && isPicked
                    ? styles.optionWrong
                    : answered
                      ? styles.optionDim
                      : null;
              const optionTextColor =
                answered && isCorrect
                  ? COLORS.blueDark
                  : answered && isPicked
                    ? "#D23B2E"
                    : colors.text;

              return (
                <Pressable
                  key={`${choice}-${choiceIndex}`}
                  disabled={answered}
                  onPress={() => {
                    playAnswerSound(isCorrect);
                    onChoose(choiceIndex);
                  }}
                  style={({ pressed }) => [
                    styles.option,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.grayBorder,
                    },
                    optionState,
                    !answered && pressed && styles.pressed,
                  ]}
                >
                  <View
                    style={[
                      styles.optionKey,
                      { backgroundColor: colors.blueLight },
                      answered && isCorrect && styles.optionKeyCorrect,
                      answered && isPicked && !isCorrect && styles.optionKeyWrong,
                    ]}
                  >
                    <Text
                      style={[
                        styles.optionKeyText,
                        { color: colors.textSoft },
                        answered && (isCorrect || isPicked) && styles.optionKeyTextOn,
                      ]}
                    >
                      {MATH_KEYS[choiceIndex]}
                    </Text>
                  </View>
                  <Text style={[styles.optionText, { color: optionTextColor }]}>
                    {choice}
                  </Text>
                  {showResultMark ? (
                    <View
                      style={[
                        styles.answerMark,
                        isCorrect ? styles.answerMarkCorrect : styles.answerMarkWrong,
                      ]}
                    >
                      <Text style={styles.answerMarkText}>
                        {isCorrect ? "✓" : "✕"}
                      </Text>
                    </View>
                  ) : null}
                </Pressable>
              );
            })}
          </View>

          {answered ? (
            <View style={[styles.explain, correct ? styles.goodBox : styles.badBox]}>
              <Text
                style={[
                  styles.explainTitle,
                  { color: correct ? COLORS.blueDark : "#D23B2E" },
                ]}
              >
                {correct
                  ? "ถูกต้องยอดเยี่ยม!"
                  : `ยังไม่ถูก คำตอบคือ ${MATH_KEYS[question.a]}. ${
                      question.c[question.a]
                    }`}
              </Text>
              <Text style={[styles.explainText, { color: colors.text }]}>
                {question.e}
              </Text>
            </View>
          ) : null}
        </View>
      </ScrollView>

      <View style={styles.bottom}>
        <Button
          label={index === questions.length - 1 ? "ดูผลการทดสอบ" : "ข้อถัดไป"}
          disabled={!answered || saving}
          onPress={onNext}
        />
      </View>
    </>
  );
}

function Figure({ svg }: { svg: string }) {
  const { colors } = useAppTheme();

  return (
    <View
      style={[
        styles.figure,
        { backgroundColor: colors.surface, borderColor: colors.grayBorder },
      ]}
    >
      <Image
        source={{ uri: `data:image/svg+xml;utf8,${encodeURIComponent(svg)}` }}
        style={styles.figureImage}
        contentFit="contain"
      />
    </View>
  );
}

function ResultScreen({
  allCompleted,
  accent,
  chapterTitle,
  onContinue,
  picks,
  questions,
  score,
  onRetry,
  onOther,
}: {
  allCompleted: boolean;
  accent: string;
  chapterTitle: string;
  onContinue: () => void;
  picks: (number | null)[];
  questions: MathQuestion[];
  score: number;
  onRetry: () => void;
  onOther: () => void;
}) {
  const { colors } = useAppTheme();
  const mascotVariant = score >= 8 ? "cheer" : score >= 5 ? "smile" : "sad";
  const result =
    score === questions.length
      ? {
          title: "Perfect!",
          message: "เข้าใจคอนเซปต์ของบทนี้แน่นมาก",
        }
      : score >= 8
        ? {
            title: "ยอดเยี่ยมมาก",
            message: "พื้นฐานดี พร้อมเรียนเนื้อหาต่อได้สบาย",
          }
        : score >= 5
          ? {
              title: "ผ่านเกณฑ์พอใช้",
              message: "มีบางจุดที่ควรทบทวนจากเฉลยด้านล่าง",
            }
          : {
              title: "ลองทบทวนอีกนิด",
              message: "อ่านเฉลยแล้วกลับมาลองใหม่ได้เลย",
            };

  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={styles.resultContent}
      showsVerticalScrollIndicator={false}
    >
      <View
        style={[
          styles.scoreCard,
          {
            backgroundColor: colors.card,
            borderColor: colors.grayBorder,
            borderTopColor: accent,
          },
        ]}
      >
        <Mascot size={112} variant={mascotVariant} />
        <Text style={[styles.score, { color: accent }]}>
          {score}
          <Text style={[styles.scoreTotal, { color: colors.gray }]}>
            {" "}
            / {questions.length}
          </Text>
        </Text>
        <Text style={[styles.resultTitle, { color: colors.text }]}>
          {result.title}
        </Text>
        <Text style={[styles.resultChapter, { color: colors.text }]}>
          {chapterTitle}
        </Text>
        <Text style={[styles.resultMessage, { color: colors.textSoft }]}>
          {result.message}
        </Text>
        <View style={styles.resultButtons}>
          <Button label="ลองบทนี้อีกครั้ง" onPress={onRetry} />
          <Button label="เลือกบทอื่น" variant="secondary" onPress={onOther} />
          <Button
            label={allCompleted ? "ไปต่อ" : "ทำทุกบทให้ครบก่อน"}
            disabled={!allCompleted}
            onPress={onContinue}
          />
        </View>
      </View>

      <Text style={[styles.reviewHeader, { color: colors.text }]}>
        ทบทวนเฉลย
      </Text>
      {questions.map((question, index) => {
        const pick = picks[index];
        const isCorrect = pick === question.a;
        return (
          <View
            key={`${question.q}-${index}`}
            style={[
              styles.reviewCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.grayBorder,
                borderLeftColor: isCorrect ? colors.blue : "#FF4B4B",
              },
            ]}
          >
            <Text style={[styles.reviewQuestion, { color: colors.text }]}>
              {index + 1}. {question.q}
            </Text>
            {!isCorrect ? (
              <Text style={[styles.reviewLine, { color: colors.textSoft }]}>
                คำตอบของคุณ:{" "}
                <Text style={styles.wrongText}>
                  {pick === null
                    ? "ไม่ได้ตอบ"
                    : `${MATH_KEYS[pick]}. ${question.c[pick]}`}
                </Text>
              </Text>
            ) : null}
            <Text style={[styles.reviewLine, { color: colors.textSoft }]}>
              คำตอบที่ถูก:{" "}
              <Text style={styles.correctText}>
                {MATH_KEYS[question.a]}. {question.c[question.a]}
              </Text>
            </Text>
            <Text style={[styles.reviewExplain, { color: colors.textSoft }]}>
              {question.e}
            </Text>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white, paddingHorizontal: 20 },
  flex: { flex: 1 },
  chapterContent: { paddingBottom: 28, paddingTop: 10 },
  chapterHero: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
  },
  heroCopy: { flex: 1 },
  eyebrow: {
    color: COLORS.blue,
    fontFamily: FONTS.extra,
    fontSize: 12,
    letterSpacing: 0.8,
  },
  title: {
    color: COLORS.text,
    fontFamily: FONTS.extra,
    fontSize: 27,
    lineHeight: 34,
    marginTop: 4,
  },
  subtitle: {
    color: COLORS.textSoft,
    fontFamily: FONTS.regular,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
  },
  progressSummary: {
    backgroundColor: COLORS.blueLight,
    borderColor: "#BDEBFF",
    borderRadius: 14,
    borderWidth: 2,
    marginTop: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  progressSummaryText: {
    color: COLORS.text,
    fontFamily: FONTS.extra,
    fontSize: 16,
  },
  progressSummaryScore: {
    color: COLORS.blue,
    fontFamily: FONTS.bold,
    fontSize: 14,
    marginTop: 2,
  },
  chapterList: { gap: 12, marginTop: 22 },
  chapterContinue: { gap: 12, marginTop: 18 },
  chapterCard: {
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderColor: COLORS.grayBorder,
    borderLeftWidth: 6,
    borderRadius: 14,
    borderWidth: 2,
    flexDirection: "row",
    gap: 12,
    padding: 14,
  },
  pressed: { opacity: 0.82, transform: [{ translateY: 1 }] },
  chapterIcon: {
    alignItems: "center",
    borderRadius: 15,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  chapterIconText: {
    color: COLORS.white,
    fontFamily: FONTS.extra,
    fontSize: 18,
  },
  chapterText: { flex: 1 },
  chapterTitle: {
    fontFamily: FONTS.extra,
    fontSize: 16,
    lineHeight: 22,
  },
  chapterTopics: {
    color: COLORS.textSoft,
    fontFamily: FONTS.regular,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 3,
  },
  chapterMeta: {
    color: COLORS.blueDark,
    fontFamily: FONTS.bold,
    fontSize: 13,
    marginTop: 6,
  },
  quizContent: { paddingBottom: 24, paddingTop: 6 },
  quizHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  quizTop: { gap: 6, marginBottom: 12 },
  quizChapter: { fontFamily: FONTS.extra, fontSize: 17, lineHeight: 24 },
  counter: { color: COLORS.gray, fontFamily: FONTS.bold, fontSize: 13 },
  dots: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 14,
  },
  dot: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.grayBorder,
    borderRadius: 6,
    borderWidth: 2,
    flex: 1,
    height: 12,
  },
  dotDone: { borderWidth: 0 },
  questionCard: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.grayBorder,
    borderRadius: 14,
    borderWidth: 2,
    padding: 16,
  },
  questionNumber: {
    fontFamily: FONTS.extra,
    fontSize: 13,
    marginBottom: 8,
  },
  questionText: {
    color: COLORS.text,
    fontFamily: FONTS.bold,
    fontSize: 20,
    lineHeight: 29,
  },
  figure: {
    alignItems: "center",
    backgroundColor: "#F7F7F7",
    borderColor: COLORS.grayBorder,
    borderRadius: 12,
    borderWidth: 2,
    height: 170,
    justifyContent: "center",
    marginTop: 14,
    overflow: "hidden",
  },
  figureImage: { height: "100%", width: "100%" },
  options: { gap: 10, marginTop: 16 },
  option: {
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderColor: COLORS.grayBorder,
    borderRadius: 14,
    borderWidth: 2,
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  optionCorrect: {
    backgroundColor: COLORS.blueLight,
    borderColor: COLORS.blue,
  },
  optionWrong: {
    backgroundColor: "#FFEDED",
    borderColor: "#FF4B4B",
  },
  optionDim: { opacity: 0.5 },
  optionKey: {
    alignItems: "center",
    backgroundColor: "#F0F0F0",
    borderRadius: 9,
    height: 30,
    justifyContent: "center",
    width: 30,
  },
  optionKeyCorrect: { backgroundColor: COLORS.blue },
  optionKeyWrong: { backgroundColor: "#FF4B4B" },
  optionKeyText: {
    color: COLORS.gray,
    fontFamily: FONTS.extra,
    fontSize: 14,
  },
  optionKeyTextOn: { color: COLORS.white },
  optionText: {
    color: COLORS.text,
    flex: 1,
    fontFamily: FONTS.bold,
    fontSize: 15,
    lineHeight: 22,
  },
  answerMark: {
    alignItems: "center",
    borderRadius: 12,
    height: 24,
    justifyContent: "center",
    width: 24,
  },
  answerMarkCorrect: { backgroundColor: COLORS.blue },
  answerMarkWrong: { backgroundColor: "#FF4B4B" },
  answerMarkText: {
    color: COLORS.white,
    fontFamily: FONTS.extra,
    fontSize: 14,
    lineHeight: 18,
  },
  explain: {
    borderRadius: 14,
    marginTop: 14,
    padding: 14,
  },
  goodBox: { backgroundColor: COLORS.blueLight },
  badBox: { backgroundColor: "#FFEDED" },
  explainTitle: { fontFamily: FONTS.extra, fontSize: 15, marginBottom: 4 },
  explainText: {
    color: COLORS.text,
    fontFamily: FONTS.regular,
    fontSize: 14,
    lineHeight: 21,
  },
  bottom: { paddingBottom: 16, paddingTop: 4 },
  resultContent: { paddingBottom: 28, paddingTop: 8 },
  scoreCard: {
    alignItems: "center",
    borderColor: COLORS.grayBorder,
    borderRadius: 14,
    borderTopWidth: 6,
    borderWidth: 2,
    padding: 18,
  },
  score: { fontFamily: FONTS.extra, fontSize: 52, lineHeight: 60 },
  scoreTotal: { color: COLORS.gray, fontSize: 24 },
  resultTitle: {
    color: COLORS.text,
    fontFamily: FONTS.extra,
    fontSize: 22,
    marginTop: 4,
  },
  resultChapter: {
    color: COLORS.text,
    fontFamily: FONTS.bold,
    fontSize: 15,
    marginTop: 8,
    textAlign: "center",
  },
  resultMessage: {
    color: COLORS.textSoft,
    fontFamily: FONTS.regular,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 6,
    textAlign: "center",
  },
  resultButtons: { gap: 10, marginTop: 16, width: "100%" },
  reviewHeader: {
    color: COLORS.text,
    fontFamily: FONTS.extra,
    fontSize: 18,
    marginBottom: 12,
    marginTop: 22,
  },
  reviewCard: {
    borderColor: COLORS.grayBorder,
    borderLeftWidth: 5,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 10,
    padding: 14,
  },
  reviewQuestion: {
    color: COLORS.text,
    fontFamily: FONTS.bold,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 8,
  },
  reviewLine: {
    color: COLORS.textSoft,
    fontFamily: FONTS.regular,
    fontSize: 14,
    lineHeight: 21,
  },
  wrongText: { color: "#D23B2E", fontFamily: FONTS.bold },
  correctText: { color: COLORS.blueDark, fontFamily: FONTS.bold },
  reviewExplain: {
    color: COLORS.textSoft,
    fontFamily: FONTS.regular,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 7,
  },
});
