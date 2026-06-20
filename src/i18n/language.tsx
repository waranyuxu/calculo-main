import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type Language = "th" | "en";

export const LANGUAGE_OPTIONS: { label: string; nativeLabel: string; value: Language }[] = [
  { label: "ไทย", nativeLabel: "Thai", value: "th" },
  { label: "English", nativeLabel: "อังกฤษ", value: "en" },
];

type Copy = {
  common: {
    back: string;
    confirmPasswordPlaceholder: string;
    continue: string;
    emailPlaceholder: string;
    firebaseWarning: string;
    genericError: string;
    loadingAction: string;
    passwordPlaceholder: string;
    skipPretest: string;
  };
  tabs: {
    home: string;
    profile: string;
    settings: string;
  };
  settings: {
    title: string;
    languageTitle: string;
    languageSubtitle: string;
    selectedLanguage: string;
    appearanceTitle: string;
    darkModeTitle: string;
    darkModeSubtitle: string;
    enabled: string;
    disabled: string;
  };
  landing: {
    dark: string;
    haveAccount: string;
    light: string;
    start: string;
    subtitle: string;
    switchToDark: string;
    switchToLight: string;
  };
  welcome: {
    greeting: string;
  };
  auth: {
    forgotPassword: string;
    loginSubmit: string;
    loginSubtitle: string;
    loginSwitch: string;
    loginTitle: string;
    signupSubmit: string;
    signupSubtitle: string;
    signupSwitch: string;
    signupTitle: string;
  };
  forgotPassword: {
    backToLogin: string;
    description: string;
    sentDescription: string;
    sentTitle: string;
    submit: string;
    submitting: string;
    title: string;
    tooManyRequests: string;
    userNotFound: string;
  };
  profile: {
    defaultUser: string;
    guestDescription: string;
    loading: string;
    loggedInDescription: string;
    logout: string;
    title: string;
  };
  onboarding: {
    questionsIntroPrefix: string;
    questionsIntroCount: string;
    questionsIntroSuffix: string;
    learningReasonQuestion: string;
    learningReasons: string[];
    discoveryQuestion: string;
    discoverySources: { icon: string; label: string }[];
    studyRoutinePrompt: string;
    dailyGoalQuestion: string;
    dailyGoals: { id: string; label: string; right: string }[];
    intenseCommitment: string;
    practiceSummaryPrefix: string;
    practiceSummaryHighlight: string;
    practiceSummarySuffix: string;
    homeWidgetPrompt: string;
    widgetMath: string;
    levelStartPrompt: string;
    levelOptions: {
      badge?: string;
      icon: string;
      id: string;
      label: string;
      sublabel: string;
    }[];
    pretestIntroPrefix: string;
    pretestIntroHighlight: string;
    pretestIntroSuffix: string;
    startPretest: string;
  };
  home: {
    allSections: string;
    currentSection: string;
    currentStage: string;
    currentUnit: string;
    sectionLabel: string;
    sectionMeta: string;
    stage: string;
    stages: string;
    unit: string;
  };
  pretest: {
    allChaptersRequired: string;
    answerCorrect: string;
    chapterPickerSubtitle: string;
    chapterPickerTitle: string;
    completedChapters: string;
    correctAnswer: string;
    latestScore: string;
    nextQuestion: string;
    notAnswered: string;
    otherChapter: string;
    preCheckEyebrow: string;
    questionCounter: string;
    questionNumber: string;
    retryChapter: string;
    reviewHeader: string;
    scoreTotal: string;
    seeResult: string;
    startChapter: string;
    totalScore: string;
    userAnswer: string;
    wrongAnswer: string;
    resultPerfectTitle: string;
    resultPerfectMessage: string;
    resultGreatTitle: string;
    resultGreatMessage: string;
    resultOkayTitle: string;
    resultOkayMessage: string;
    resultTryAgainTitle: string;
    resultTryAgainMessage: string;
  };
};

const LANGUAGE_STORAGE_KEY = "calculo.language.v1";

export const COPY: Record<Language, Copy> = {
  th: {
    common: {
      back: "กลับ",
      confirmPasswordPlaceholder: "ยืนยันรหัสผ่าน",
      continue: "ไปต่อ",
      emailPlaceholder: "อีเมล",
      firebaseWarning:
        "ต้องตั้งค่า EXPO_PUBLIC_FIREBASE_* ก่อนเชื่อม Firebase จริง",
      genericError: "เกิดข้อผิดพลาด",
      loadingAction: "กำลังดำเนินการ...",
      passwordPlaceholder: "รหัสผ่าน",
      skipPretest: "ข้ามแบบทดสอบ",
    },
    tabs: {
      home: "โฮม",
      profile: "โปรไฟล์",
      settings: "ตั้งค่า",
    },
    settings: {
      title: "ปรับแต่งการใช้งาน",
      languageTitle: "ภาษา",
      languageSubtitle: "เลือกภาษาที่ต้องการใช้ ทุกหน้าและข้อความจะเปลี่ยนทันที",
      selectedLanguage: "ภาษาปัจจุบัน: {language}",
      appearanceTitle: "การแสดงผล",
      darkModeTitle: "โหมดมืด",
      darkModeSubtitle: "ปรับสีพื้นหลังและข้อความให้อ่านสบายขึ้น",
      enabled: "เปิด",
      disabled: "ปิด",
    },
    landing: {
      dark: "มืด",
      haveAccount: "ฉันมีบัญชีอยู่แล้ว",
      light: "สว่าง",
      start: "เริ่มต้น",
      subtitle: "เข้าใจแนวคิด พิชิตคณิตศาสตร์",
      switchToDark: "เปลี่ยนเป็นโหมดมืด",
      switchToLight: "เปลี่ยนเป็นโหมดสว่าง",
    },
    welcome: {
      greeting: "สวัสดี! เราคือ Calculo",
    },
    auth: {
      forgotPassword: "ลืมรหัสผ่าน?",
      loginSubmit: "เข้าสู่ระบบ",
      loginSubtitle: "ใช้อีเมลและรหัสผ่านเพื่อกลับมาเรียนต่อ",
      loginSwitch: "ยังไม่มีบัญชี?",
      loginTitle: "เข้าสู่ระบบ",
      signupSubmit: "สมัครสมาชิก",
      signupSubtitle: "สร้างบัญชีด้วยอีเมลและรหัสผ่าน",
      signupSwitch: "มีบัญชีอยู่แล้ว?",
      signupTitle: "สมัครสมาชิก",
    },
    forgotPassword: {
      backToLogin: "กลับไปเข้าสู่ระบบ",
      description: "กรอกอีเมลที่ใช้สมัคร แล้วระบบจะส่งลิงก์รีเซ็ตรหัสผ่านไปให้",
      sentDescription: "ตรวจอีเมล {email} รวมถึง Spam หรือ Junk ด้วย",
      sentTitle: "ส่งลิงก์รีเซ็ตรหัสผ่านแล้ว",
      submit: "ส่งลิงก์รีเซ็ตรหัสผ่าน",
      submitting: "กำลังส่งลิงก์...",
      title: "ลืมรหัสผ่าน",
      tooManyRequests: "ส่งหลายครั้งเกินไป รอสักครู่แล้วลองใหม่",
      userNotFound: "ไม่พบอีเมลนี้ในระบบ",
    },
    profile: {
      defaultUser: "ผู้ใช้ Calculo",
      guestDescription: "เข้าสู่ระบบหรือสมัครสมาชิกเพื่อบันทึกความคืบหน้า",
      loading: "กำลังโหลดข้อมูล...",
      loggedInDescription: "พร้อมเรียนคณิตศาสตร์ต่อแล้ว",
      logout: "ออกจากระบบ",
      title: "โปรไฟล์",
    },
    onboarding: {
      questionsIntroPrefix: "มาตอบคำถามสั้นๆ",
      questionsIntroCount: "6 ข้อ",
      questionsIntroSuffix: "ก่อนเริ่มเรียนกันนะ!",
      learningReasonQuestion: "ทำไมคุณถึงอยากเรียนคณิตศาสตร์?",
      learningReasons: [
        "ทบทวนบทเรียน",
        "ปรับพื้นฐานด้านคณิตศาสตร์",
        "ใช้เตรียมสอบเข้าคณะที่ใฝ่ฝัน",
        "อยากท้าทายตัวเองด้วยโจทย์ยากๆ และฝึกคิดอย่างเป็นระบบ",
        "ฝึกกระบวนการคิดและเหตุผลให้แข็งแรงขึ้น",
        "พัฒนาทักษะการคำนวณและการวิเคราะห์",
        "นำคณิตศาสตร์ไปใช้ในชีวิตประจำวันและอาชีพได้จริง",
      ],
      discoveryQuestion: "คุณได้ยินเกี่ยวกับ Calculo จากไหน?",
      discoverySources: [
        { icon: "📘", label: "Facebook/Instagram" },
        { icon: "🛍️", label: "Shopee" },
        { icon: "📰", label: "ข่าว/บทความ/บล็อก" },
        { icon: "📗", label: "Webtoon" },
        { icon: "👨‍👩‍👧", label: "เพื่อน/ครอบครัว" },
        { icon: "🎵", label: "TikTok" },
        { icon: "▶️", label: "YouTube" },
      ],
      studyRoutinePrompt: "มากำหนดกิจวัตรการเรียนกันเถอะ!",
      dailyGoalQuestion: "เป้าหมายประจำวันของคุณเป็นแบบไหนล่ะ?",
      dailyGoals: [
        { id: "3", label: "3 นาที / วัน", right: "สบายๆ" },
        { id: "10", label: "10 นาที / วัน", right: "ปกติ" },
        { id: "15", label: "15 นาที / วัน", right: "จริงจัง" },
        { id: "30", label: "30 นาที / วัน", right: "เข้มข้น" },
      ],
      intenseCommitment: "ฉันมุ่งมั่นสุดๆ",
      practiceSummaryPrefix: "จากเป้าหมายที่เลือก เราจะทำได้",
      practiceSummaryHighlight: "{count} ข้อ",
      practiceSummarySuffix: "ของโจทย์ต่อเดือนกัน!",
      homeWidgetPrompt: "Calculo จะคอยเชียร์คุณอยู่จากหน้าโฮมนะ!",
      widgetMath: "+2 ข้อ",
      levelStartPrompt: "ทีนี้ก็มาดูกันว่าควรเริ่มจากตรงไหนดี!",
      levelOptions: [
        {
          badge: "แนะนำ",
          icon: "⚪⚪⚪⚪",
          id: "new",
          label: "อ่อนมาก",
          sublabel: "เริ่มต้นจากศูนย์",
        },
        {
          icon: "🟢⚪⚪⚪",
          id: "some",
          label: "รู้บ้างนิดหน่อย",
          sublabel: "มาดูกันว่าจะเริ่มตรงไหนดี",
        },
        {
          icon: "🟢🟢⚪⚪",
          id: "basic",
          label: "มีพื้นฐานพอสมควร",
          sublabel: "มาดูกันว่าจะเริ่มตรงไหนดี",
        },
        {
          icon: "🟢🟢🟢⚪",
          id: "good",
          label: "ค่อนข้างเก่ง",
          sublabel: "มาดูกันว่าจะเริ่มตรงไหนดี",
        },
        {
          icon: "🟢🟢🟢🟢",
          id: "great",
          label: "เก่งมากๆ",
          sublabel: "มาดูกันว่าจะเริ่มตรงไหนดี",
        },
      ],
      pretestIntroPrefix: "เอาล่ะ เรามาลอง",
      pretestIntroHighlight: "แบบทดสอบก่อนเข้าเนื้อหา",
      pretestIntroSuffix: "กันก่อนนะ",
      startPretest: "เริ่มแบบทดสอบ",
    },
    home: {
      allSections: "บททั้งหมด",
      currentSection: "บทที่เราอยู่ {current} จาก {total}",
      currentStage: "ด่านที่เราอยู่ {current} จาก {total}",
      currentUnit: "หน่วยที่เราอยู่ {current} จาก {total}",
      sectionLabel: "บทที่ {section}, หน่วยที่ {unit}",
      sectionMeta: "{units} หน่วย · หน่วยละ {stages} ด่าน",
      stage: "ด่าน {stage}",
      stages: "{count} ด่าน",
      unit: "หน่วยที่ {unit}: {title}",
    },
    pretest: {
      allChaptersRequired: "ทำให้ครบทุกบทก่อน",
      answerCorrect: "ถูกต้องยอดเยี่ยม!",
      chapterPickerSubtitle: "ทำให้ครบทุกบทเพื่อประเมินพื้นฐานก่อนเข้าเนื้อหา",
      chapterPickerTitle: "เลือกบททดสอบก่อนเรียน",
      completedChapters: "ทำแล้ว {completed}/{total} บท",
      correctAnswer: "คำตอบที่ถูก:",
      latestScore: "คะแนนล่าสุด {score}/10 · ทำใหม่ได้",
      nextQuestion: "ข้อถัดไป",
      notAnswered: "ไม่ได้ตอบ",
      otherChapter: "เลือกบทอื่น",
      preCheckEyebrow: "เช็กพื้นฐานคณิต",
      questionCounter: "ข้อ {current} จาก {total}",
      questionNumber: "คำถามข้อที่ {number}",
      retryChapter: "ลองบทนี้อีกครั้ง",
      reviewHeader: "ทบทวนเฉลย",
      scoreTotal: "คะแนนรวม {score}/{total}",
      seeResult: "ดูผลการทดสอบ",
      startChapter: "เริ่มทดสอบ · 10 ข้อ",
      totalScore: "คะแนนรวม {score}/{total}",
      userAnswer: "คำตอบของคุณ:",
      wrongAnswer: "ยังไม่ถูก คำตอบคือ {answer}. {choice}",
      resultPerfectTitle: "Perfect!",
      resultPerfectMessage: "เข้าใจคอนเซปต์ของบทนี้แน่นมาก",
      resultGreatTitle: "ยอดเยี่ยมมาก",
      resultGreatMessage: "พื้นฐานดี พร้อมเรียนเนื้อหาต่อได้สบาย",
      resultOkayTitle: "ผ่านเกณฑ์พอใช้",
      resultOkayMessage: "มีบางจุดที่ควรทบทวนจากเฉลยด้านล่าง",
      resultTryAgainTitle: "ลองทบทวนอีกนิด",
      resultTryAgainMessage: "อ่านเฉลยแล้วกลับมาลองใหม่ได้เลย",
    },
  },
  en: {
    common: {
      back: "Back",
      confirmPasswordPlaceholder: "Confirm password",
      continue: "Continue",
      emailPlaceholder: "Email",
      firebaseWarning:
        "Set EXPO_PUBLIC_FIREBASE_* before connecting to a real Firebase project.",
      genericError: "Something went wrong",
      loadingAction: "Working...",
      passwordPlaceholder: "Password",
      skipPretest: "Skip pretest",
    },
    tabs: {
      home: "Home",
      profile: "Profile",
      settings: "Settings",
    },
    settings: {
      title: "Settings",
      languageTitle: "Language",
      languageSubtitle:
        "Choose the app language. Every page and message updates immediately.",
      selectedLanguage: "Current language: {language}",
      appearanceTitle: "Appearance",
      darkModeTitle: "Dark mode",
      darkModeSubtitle: "Adjust the background and text colors for easier reading.",
      enabled: "On",
      disabled: "Off",
    },
    landing: {
      dark: "Dark",
      haveAccount: "I already have an account",
      light: "Light",
      start: "Get started",
      subtitle: "Understand concepts. Conquer mathematics.",
      switchToDark: "Switch to dark mode",
      switchToLight: "Switch to light mode",
    },
    welcome: {
      greeting: "Hi! We are Calculo",
    },
    auth: {
      forgotPassword: "Forgot password?",
      loginSubmit: "Log in",
      loginSubtitle: "Use your email and password to keep learning.",
      loginSwitch: "No account yet?",
      loginTitle: "Log in",
      signupSubmit: "Sign up",
      signupSubtitle: "Create an account with email and password.",
      signupSwitch: "Already have an account?",
      signupTitle: "Sign up",
    },
    forgotPassword: {
      backToLogin: "Back to login",
      description:
        "Enter the email you used to sign up and we will send a reset link.",
      sentDescription: "Check {email}, including Spam or Junk.",
      sentTitle: "Password reset link sent",
      submit: "Send password reset link",
      submitting: "Sending link...",
      title: "Forgot password",
      tooManyRequests: "Too many attempts. Please wait a moment and try again.",
      userNotFound: "We could not find that email.",
    },
    profile: {
      defaultUser: "Calculo user",
      guestDescription: "Log in or sign up to save your progress.",
      loading: "Loading profile...",
      loggedInDescription: "Ready to keep learning mathematics.",
      logout: "Log out",
      title: "Profile",
    },
    onboarding: {
      questionsIntroPrefix: "Let's answer",
      questionsIntroCount: "6 quick questions",
      questionsIntroSuffix: "before we start learning!",
      learningReasonQuestion: "Why do you want to learn mathematics?",
      learningReasons: [
        "Review lessons",
        "Build a stronger math foundation",
        "Prepare for admission to my dream faculty",
        "Challenge myself with harder problems and systematic thinking",
        "Strengthen reasoning and problem-solving habits",
        "Improve calculation and analysis skills",
        "Use mathematics in daily life and future work",
      ],
      discoveryQuestion: "Where did you hear about Calculo?",
      discoverySources: [
        { icon: "📘", label: "Facebook/Instagram" },
        { icon: "🛍️", label: "Shopee" },
        { icon: "📰", label: "News/articles/blogs" },
        { icon: "📗", label: "Webtoon" },
        { icon: "👨‍👩‍👧", label: "Friends/family" },
        { icon: "🎵", label: "TikTok" },
        { icon: "▶️", label: "YouTube" },
      ],
      studyRoutinePrompt: "Let's set up your study routine!",
      dailyGoalQuestion: "What should your daily goal look like?",
      dailyGoals: [
        { id: "3", label: "3 min / day", right: "Easy" },
        { id: "10", label: "10 min / day", right: "Normal" },
        { id: "15", label: "15 min / day", right: "Focused" },
        { id: "30", label: "30 min / day", right: "Intense" },
      ],
      intenseCommitment: "I am fully committed",
      practiceSummaryPrefix: "With your selected goal, you can solve",
      practiceSummaryHighlight: "{count} questions",
      practiceSummarySuffix: "per month!",
      homeWidgetPrompt: "Calculo will cheer you on from the home screen!",
      widgetMath: "+2 questions",
      levelStartPrompt: "Now let's find the best place for you to start!",
      levelOptions: [
        {
          badge: "Recommended",
          icon: "⚪⚪⚪⚪",
          id: "new",
          label: "Very weak",
          sublabel: "Start from zero",
        },
        {
          icon: "🟢⚪⚪⚪",
          id: "some",
          label: "Know a little",
          sublabel: "Let's find the right starting point",
        },
        {
          icon: "🟢🟢⚪⚪",
          id: "basic",
          label: "Some foundation",
          sublabel: "Let's find the right starting point",
        },
        {
          icon: "🟢🟢🟢⚪",
          id: "good",
          label: "Pretty strong",
          sublabel: "Let's find the right starting point",
        },
        {
          icon: "🟢🟢🟢🟢",
          id: "great",
          label: "Very strong",
          sublabel: "Let's find the right starting point",
        },
      ],
      pretestIntroPrefix: "Alright, let's try a",
      pretestIntroHighlight: "pre-content assessment",
      pretestIntroSuffix: "first.",
      startPretest: "Start pretest",
    },
    home: {
      allSections: "All chapters",
      currentSection: "Current chapter {current} of {total}",
      currentStage: "Current stage {current} of {total}",
      currentUnit: "Current unit {current} of {total}",
      sectionLabel: "Chapter {section}, Unit {unit}",
      sectionMeta: "{units} units · {stages} stages each",
      stage: "Stage {stage}",
      stages: "{count} stages",
      unit: "Unit {unit}: {title}",
    },
    pretest: {
      allChaptersRequired: "Complete every chapter first",
      answerCorrect: "Correct. Excellent!",
      chapterPickerSubtitle:
        "Complete every chapter to estimate your foundation before lessons.",
      chapterPickerTitle: "Choose a pretest chapter",
      completedChapters: "Completed {completed}/{total} chapters",
      correctAnswer: "Correct answer:",
      latestScore: "Latest score {score}/10 · Try again anytime",
      nextQuestion: "Next question",
      notAnswered: "Not answered",
      otherChapter: "Choose another chapter",
      preCheckEyebrow: "MATH PRE-CHECK",
      questionCounter: "Question {current} of {total}",
      questionNumber: "Question {number}",
      retryChapter: "Try this chapter again",
      reviewHeader: "Review answers",
      scoreTotal: "Total score {score}/{total}",
      seeResult: "See results",
      startChapter: "Start test · 10 questions",
      totalScore: "Total score {score}/{total}",
      userAnswer: "Your answer:",
      wrongAnswer: "Not quite. The answer is {answer}. {choice}",
      resultPerfectTitle: "Perfect!",
      resultPerfectMessage: "You understand this chapter's concepts very well.",
      resultGreatTitle: "Excellent",
      resultGreatMessage: "Your foundation is strong enough to continue comfortably.",
      resultOkayTitle: "Good enough to pass",
      resultOkayMessage: "A few points are worth reviewing in the answers below.",
      resultTryAgainTitle: "Review a little more",
      resultTryAgainMessage: "Read the explanations, then try again when ready.",
    },
  },
};

type FormatParams = Record<string, number | string>;

type LanguageContextValue = {
  copy: Copy;
  format: (template: string, params?: FormatParams) => string;
  language: Language;
  setLanguage: (language: Language) => void;
};

const LanguageContext = createContext<LanguageContextValue>({
  copy: COPY.th,
  format: formatCopy,
  language: "th",
  setLanguage: () => {},
});

export function formatCopy(template: string, params: FormatParams = {}) {
  return Object.entries(params).reduce(
    (text, [key, value]) => text.replaceAll(`{${key}}`, String(value)),
    template,
  );
}

function normalizeLanguage(value: string | null): Language | null {
  return value === "th" || value === "en" ? value : null;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("th");

  useEffect(() => {
    let mounted = true;

    void AsyncStorage.getItem(LANGUAGE_STORAGE_KEY).then((storedLanguage) => {
      const nextLanguage = normalizeLanguage(storedLanguage);
      if (mounted && nextLanguage) {
        setLanguageState(nextLanguage);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  const setLanguage = useCallback((nextLanguage: Language) => {
    setLanguageState(nextLanguage);
    void AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
  }, []);

  const format = useCallback(
    (template: string, params?: FormatParams) => formatCopy(template, params),
    [],
  );

  const value = useMemo(
    () => ({
      copy: COPY[language],
      format,
      language,
      setLanguage,
    }),
    [format, language, setLanguage],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
