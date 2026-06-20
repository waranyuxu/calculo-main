import {
  QUESTION_COURSE,
  type QuestionCourseContent,
} from "@/generated/question-course";

export type MathAdventureAnswerMode = "typed" | "choice";
export type MathAdventureChoiceKey = "ก" | "ข" | "ค" | "ง" | "จ";

export type MathAdventureChoice = {
  key: MathAdventureChoiceKey;
  value: string;
};

export type MathAdventureQuestion = {
  id: string;
  topic: string;
  level: string;
  mode: MathAdventureAnswerMode;
  prompt: string;
  promptContent?: QuestionCourseContent[];
  answer: string;
  correctChoiceKey?: MathAdventureChoiceKey;
  explanation: string;
  choices?: MathAdventureChoice[];
};

type QuestionBase = Omit<MathAdventureQuestion, "choices" | "id" | "mode"> & {
  distractors: number[];
};

const CHOICE_KEYS: MathAdventureChoiceKey[] = ["ก", "ข", "ค", "ง", "จ"];
const THAI_DIGITS = "๐๑๒๓๔๕๖๗๘๙";

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(items: T[]) {
  return items[randomInt(0, items.length - 1)];
}

function shuffle<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}

function uniqueNumbers(items: number[]) {
  return Array.from(new Set(items.filter((value) => Number.isFinite(value))));
}

function formatNumber(value: number) {
  return Number.isInteger(value) ? String(value) : String(Number(value.toFixed(2)));
}

function signedConstant(value: number) {
  if (value === 0) {
    return "";
  }

  return value > 0 ? `+ ${value}` : `- ${Math.abs(value)}`;
}

function signedXTerm(coefficient: number) {
  if (coefficient === 0) {
    return "";
  }

  const absolute = Math.abs(coefficient);
  const term = absolute === 1 ? "x" : `${absolute}x`;
  return coefficient > 0 ? `+ ${term}` : `- ${term}`;
}

function linearExpression(a: number, b: number) {
  return `${a}x ${signedConstant(b)}`.trim();
}

function quadraticExpression(a: number, b: number, c: number) {
  return `${a}x^2 ${signedXTerm(b)} ${signedConstant(c)}`.trim();
}

function formatComplex(real: number, imaginary: number) {
  const imaginaryTerm =
    Math.abs(imaginary) === 1 ? "i" : `${Math.abs(imaginary)}i`;
  return imaginary >= 0
    ? `${real} + ${imaginaryTerm}`
    : `${real} - ${imaginaryTerm}`;
}

function combination(n: number, r: number) {
  let numerator = 1;
  let denominator = 1;

  for (let index = 1; index <= r; index += 1) {
    numerator *= n - index + 1;
    denominator *= index;
  }

  return numerator / denominator;
}

function withNumericChoices(
  answer: number,
  distractors: number[],
): MathAdventureChoice[] {
  const options = uniqueNumbers([answer, ...distractors]).filter(
    (value) => value !== answer,
  );
  let offset = 1;

  while (options.length < 3) {
    const nextValue = answer + (offset % 2 === 0 ? -offset : offset);
    if (nextValue !== answer && !options.includes(nextValue)) {
      options.push(nextValue);
    }
    offset += 1;
  }

  return shuffle([answer, ...options.slice(0, 3)]).map((value, index) => ({
    key: CHOICE_KEYS[index],
    value: formatNumber(value),
  }));
}

function createBaseQuestion(mode: MathAdventureAnswerMode, base: QuestionBase) {
  const question: MathAdventureQuestion = {
    answer: base.answer,
    explanation: base.explanation,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    level: base.level,
    mode,
    prompt: base.prompt,
    topic: base.topic,
  };

  if (mode === "choice") {
    question.choices = withNumericChoices(Number(base.answer), base.distractors);
  }

  return question;
}

function isAdventureChoiceKey(value: string): value is MathAdventureChoiceKey {
  return CHOICE_KEYS.includes(value as MathAdventureChoiceKey);
}

function buildCourseAdventureQuestionBank() {
  const questions: MathAdventureQuestion[] = [];

  for (const section of QUESTION_COURSE) {
    for (const unit of section.units) {
      for (const stage of unit.stages) {
        const choices = stage.answerChoices.length
          ? stage.answerChoices
          : CHOICE_KEYS.slice(0, 4).map((choiceKey) => ({
              key: choiceKey,
              label: choiceKey,
              value: "",
            }));

        if (!isAdventureChoiceKey(stage.correctChoiceKey)) {
          continue;
        }

        const answerChoice = choices.find(
          (choice) => choice.key === stage.correctChoiceKey,
        );

        if (!answerChoice || choices.length < 2) {
          continue;
        }

        questions.push({
          answer: answerChoice.value.trim() || answerChoice.key,
          choices: choices
            .slice(0, CHOICE_KEYS.length)
            .map((choice, index) => ({
              key: isAdventureChoiceKey(choice.key)
                ? choice.key
                : (CHOICE_KEYS[index] ?? "ก"),
              value: choice.value.trim() || choice.key,
            })),
          correctChoiceKey: stage.correctChoiceKey,
          explanation: stage.answer || answerChoice.label,
          id: `course-${questions.length + 1}`,
          level: section.title,
          mode: "choice",
          prompt: stage.prompt || stage.title,
          promptContent: stage.promptContent,
          topic: unit.title || section.title,
        });
      }
    }
  }

  return questions;
}

function cloneAdventureQuestion(
  question: MathAdventureQuestion,
): MathAdventureQuestion {
  return {
    ...question,
    choices: question.choices?.map((choice) => ({ ...choice })),
    id: `${question.id}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    promptContent: question.promptContent?.map((item) => ({ ...item })),
  };
}

function derivativeQuestion(): QuestionBase {
  const a = randomInt(1, 6);
  const b = randomInt(-8, 8);
  const c = randomInt(-9, 9);
  const x = randomInt(-3, 4);
  const answer = 2 * a * x + b;

  return {
    answer: formatNumber(answer),
    distractors: [2 * a + b, answer + a, answer - b, -answer, answer + 2],
    explanation: `f'(x) = ${2 * a}x ${signedConstant(b)} ดังนั้น f'(${x}) = ${answer}`,
    level: "ม.ปลาย",
    prompt: `ให้ f(x) = ${quadraticExpression(a, b, c)} จงหา f'(${x})`,
    topic: "แคลคูลัส: อนุพันธ์",
  };
}

function limitQuestion(): QuestionBase {
  const a = randomInt(2, 12);
  const answer = 2 * a;

  return {
    answer: formatNumber(answer),
    distractors: [a, a * a, answer - 1, answer + 1, -answer],
    explanation: `(x^2 - ${a * a})/(x - ${a}) = x + ${a} เมื่อ x ไม่เท่ากับ ${a} จึงได้ ${answer}`,
    level: "ม.ปลาย",
    prompt: `จงหาค่า lim เมื่อ x -> ${a} ของ (x^2 - ${a * a})/(x - ${a})`,
    topic: "แคลคูลัส: ลิมิต",
  };
}

function integralQuestion(): QuestionBase {
  const a = pick([2, 4, 6, 8]);
  const b = randomInt(-5, 5);
  const lower = randomInt(0, 3);
  const upper = lower + randomInt(2, 5);
  const answer =
    (a * (upper ** 2 - lower ** 2)) / 2 + b * (upper - lower);

  return {
    answer: formatNumber(answer),
    distractors: [answer + a, answer - a, answer + b, answer - b, answer * 2],
    explanation: `ปริพันธ์ของ ${linearExpression(a, b)} คือ ${`${a / 2}x^2 ${signedXTerm(b)}`.trim()} แล้วแทนขอบเขต ${lower} ถึง ${upper}`,
    level: "มหาวิทยาลัย",
    prompt: `จงหาค่า ∫_${lower}^${upper} (${linearExpression(a, b)}) dx`,
    topic: "แคลคูลัส: ปริพันธ์",
  };
}

function determinantQuestion(): QuestionBase {
  const a = randomInt(-5, 6);
  const b = randomInt(-5, 6);
  const c = randomInt(-5, 6);
  const d = randomInt(-5, 6);
  const answer = a * d - b * c;

  return {
    answer: formatNumber(answer),
    distractors: [a * d + b * c, b * c - a * d, a + d, b + c, answer + 3],
    explanation: `det = (${a})(${d}) - (${b})(${c}) = ${answer}`,
    level: "มหาวิทยาลัย",
    prompt: `หา det ของเมทริกซ์ [[${a}, ${b}], [${c}, ${d}]]`,
    topic: "พีชคณิตเชิงเส้น: ดีเทอร์มิแนนต์",
  };
}

function dotProductQuestion(): QuestionBase {
  const u = [randomInt(-5, 5), randomInt(-5, 5), randomInt(-5, 5)];
  const v = [randomInt(-5, 5), randomInt(-5, 5), randomInt(-5, 5)];
  const answer = u.reduce((sum, value, index) => sum + value * v[index], 0);

  return {
    answer: formatNumber(answer),
    distractors: [
      u.reduce((sum, value) => sum + value, 0),
      v.reduce((sum, value) => sum + value, 0),
      -answer,
      answer + u[0],
      answer - v[1],
    ],
    explanation: `u · v = (${u[0]})(${v[0]}) + (${u[1]})(${v[1]}) + (${u[2]})(${v[2]}) = ${answer}`,
    level: "มหาวิทยาลัย",
    prompt: `ให้ u = (${u.join(", ")}) และ v = (${v.join(", ")}) จงหา u · v`,
    topic: "เวกเตอร์",
  };
}

function complexQuestion(): QuestionBase {
  const a = randomInt(-5, 5);
  const b = randomInt(1, 6);
  const c = randomInt(-5, 5);
  const d = randomInt(1, 6);
  const answer = a * c - b * d;

  return {
    answer: formatNumber(answer),
    distractors: [a * c + b * d, a * d + b * c, -answer, answer + b, answer - d],
    explanation: `ส่วนจริงของผลคูณคือ ac - bd = (${a})(${c}) - (${b})(${d}) = ${answer}`,
    level: "ม.ปลาย",
    prompt: `ส่วนจริงของ (${formatComplex(a, b)})(${formatComplex(c, d)}) เท่ากับเท่าไร`,
    topic: "จำนวนเชิงซ้อน",
  };
}

function combinationQuestion(): QuestionBase {
  const n = randomInt(5, 16);
  const answer = combination(n, 2);

  return {
    answer: formatNumber(answer),
    distractors: [n * 2, n + 2, answer - n, answer + n, n ** 2],
    explanation: `เลือก 2 จาก ${n} คือ ${n}C2 = ${n}(${n - 1})/2 = ${answer}`,
    level: "ม.ปลาย",
    prompt: `เลือกตัวแทน 2 คนจาก ${n} คน ได้กี่วิธี`,
    topic: "ความน่าจะเป็นและการจัดหมู่",
  };
}

function logarithmQuestion(): QuestionBase {
  const base = pick([2, 3, 5]);
  const exponent = randomInt(2, 5);
  const answer = base ** exponent;

  return {
    answer: formatNumber(answer),
    distractors: [base * exponent, answer + base, answer - base, exponent ** base, base + exponent],
    explanation: `log_${base}(x) = ${exponent} แปลว่า x = ${base}^${exponent} = ${answer}`,
    level: "ม.ปลาย",
    prompt: `ถ้า log_${base}(x) = ${exponent} แล้ว x เท่ากับเท่าไร`,
    topic: "ลอการิทึม",
  };
}

function arithmeticSeriesQuestion(): QuestionBase {
  const first = randomInt(-4, 8);
  const difference = randomInt(2, 7);
  const count = pick([6, 8, 10, 12]);
  const answer = (count * (2 * first + (count - 1) * difference)) / 2;

  return {
    answer: formatNumber(answer),
    distractors: [
      first + (count - 1) * difference,
      answer + difference,
      answer - difference,
      count * first,
      count * difference,
    ],
    explanation: `S_n = n/2(2a_1 + (n - 1)d) = ${count}/2(2(${first}) + ${count - 1}(${difference})) = ${answer}`,
    level: "ม.ปลาย",
    prompt: `ลำดับเลขคณิตมีพจน์แรก ${first} และผลต่างร่วม ${difference} จงหาผลบวก ${count} พจน์แรก`,
    topic: "ลำดับและอนุกรม",
  };
}

function binomialQuestion(): QuestionBase {
  const n = randomInt(4, 8);
  const k = randomInt(1, n - 1);
  const answer = combination(n, k);

  return {
    answer: formatNumber(answer),
    distractors: [combination(n, k - 1), combination(n, k + 1), n * k, answer + n, answer - k],
    explanation: `สัมประสิทธิ์คือ ${n}C${k} = ${answer}`,
    level: "มหาวิทยาลัย",
    prompt: `สัมประสิทธิ์ของ x^${k}y^${n - k} ใน (x + y)^${n} คือเท่าไร`,
    topic: "ทฤษฎีบททวินาม",
  };
}

function linearSolveQuestion(): QuestionBase {
  const a = pick([2, 3, 4, 5, 6, 7]);
  const x = randomInt(-6, 9);
  const b = randomInt(-10, 10);
  const target = a * x + b;

  return {
    answer: formatNumber(x),
    distractors: [target, target - b, x + a, x - a, -x],
    explanation: `${linearExpression(a, b)} = ${target} จึงได้ ${a}x = ${target - b} และ x = ${x}`,
    level: "ม.ปลาย",
    prompt: `ถ้า f(x) = ${linearExpression(a, b)} จงหา x เมื่อ f(x) = ${target}`,
    topic: "ฟังก์ชันและสมการ",
  };
}

const QUESTION_GENERATORS: (() => QuestionBase)[] = [
  derivativeQuestion,
  limitQuestion,
  integralQuestion,
  determinantQuestion,
  dotProductQuestion,
  complexQuestion,
  combinationQuestion,
  logarithmQuestion,
  arithmeticSeriesQuestion,
  binomialQuestion,
  linearSolveQuestion,
];
const COURSE_ADVENTURE_QUESTION_BANK = buildCourseAdventureQuestionBank();

export function createMathAdventureQuestion(mode?: MathAdventureAnswerMode) {
  if (COURSE_ADVENTURE_QUESTION_BANK.length > 0) {
    return cloneAdventureQuestion(pick(COURSE_ADVENTURE_QUESTION_BANK));
  }

  const answerMode = mode ?? pick<MathAdventureAnswerMode>(["typed", "choice"]);
  return createBaseQuestion(answerMode, pick(QUESTION_GENERATORS)());
}

function normalizeAnswer(value: string) {
  return value
    .replace(/[๐-๙]/g, (digit) => String(THAI_DIGITS.indexOf(digit)))
    .replace(/−/g, "-")
    .replace(/,/g, "")
    .replace(/\s+/g, "")
    .replace(/^[a-z]=/i, "")
    .trim()
    .toLowerCase();
}

function normalizeChoiceKey(value: string) {
  return normalizeAnswer(value).replace(/[.):]/g, "");
}

function valuesMatch(expected: string, raw: string) {
  const expectedValue = normalizeAnswer(expected);
  const rawValue = normalizeAnswer(raw);

  if (expectedValue === rawValue) {
    return true;
  }

  const expectedNumber = Number(expectedValue);
  const rawNumber = Number(rawValue);

  return (
    Number.isFinite(expectedNumber) &&
    Number.isFinite(rawNumber) &&
    Math.abs(expectedNumber - rawNumber) < 1e-9
  );
}

export function checkMathAdventureAnswer(
  question: MathAdventureQuestion,
  rawAnswer: string,
) {
  if (question.mode === "choice" && question.choices) {
    if (question.correctChoiceKey) {
      return (
        normalizeChoiceKey(question.correctChoiceKey) ===
        normalizeChoiceKey(rawAnswer)
      );
    }

    const selectedChoice = question.choices.find(
      (choice) => normalizeChoiceKey(choice.key) === normalizeChoiceKey(rawAnswer),
    );

    if (selectedChoice) {
      return valuesMatch(question.answer, selectedChoice.value);
    }
  }

  return valuesMatch(question.answer, rawAnswer);
}
