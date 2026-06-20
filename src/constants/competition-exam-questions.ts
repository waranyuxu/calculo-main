import {
  QUESTION_COURSE,
  type QuestionCourseContent,
} from "@/generated/question-course";

export type CompetitionExamDifficulty = "medium" | "hard" | "brutal";

export type CompetitionExamQuestionContent =
  | {
      id: string;
      text: string;
      type: "text";
    }
  | {
      alt: string;
      assetPath: string;
      id: string;
      type: "image";
    };

export type CompetitionExamQuestion = {
  answerIndex: number;
  choiceKeys?: string[];
  choices: string[];
  difficulty: CompetitionExamDifficulty;
  explanation: string;
  id: string;
  prompt: string;
  promptContent?: CompetitionExamQuestionContent[];
  source: string;
  topic: string;
};

const EXAM_SET_SIZE = 20;
const DEFAULT_CHOICE_KEYS = ["ก", "ข", "ค", "ง", "จ"];

function toCompetitionContent(
  content: QuestionCourseContent[],
): CompetitionExamQuestionContent[] {
  return content.map((item) => {
    if (item.type === "image") {
      return {
        alt: item.alt,
        assetPath: item.assetPath,
        id: item.id,
        type: "image",
      };
    }

    return {
      id: item.id,
      text: item.text,
      type: "text",
    };
  });
}

function getChoiceText(choice: { key: string; label: string; value: string }) {
  return choice.value.trim() || choice.key;
}

function buildCourseQuestionBank() {
  const questions: CompetitionExamQuestion[] = [];

  for (const section of QUESTION_COURSE) {
    for (const unit of section.units) {
      for (const stage of unit.stages) {
        const choices = stage.answerChoices.length
          ? stage.answerChoices
          : DEFAULT_CHOICE_KEYS.slice(0, 4).map((choiceKey) => ({
              key: choiceKey,
              label: choiceKey,
              value: "",
            }));
        const answerIndex = choices.findIndex(
          (choice) => choice.key === stage.correctChoiceKey,
        );

        if (choices.length < 2 || answerIndex < 0) {
          continue;
        }

        questions.push({
          answerIndex,
          choiceKeys: choices.map((choice) => choice.key),
          choices: choices.map(getChoiceText),
          difficulty: choices.length >= 5 ? "hard" : "medium",
          explanation: stage.answer,
          id: `course-${questions.length + 1}`,
          prompt: stage.prompt || stage.title,
          promptContent: toCompetitionContent(stage.promptContent),
          source: `${section.title} / ${unit.title}`,
          topic: unit.title || section.title,
        });
      }
    }
  }

  return questions;
}

const COURSE_QUESTION_BANK = buildCourseQuestionBank();

const QUESTION_BANK: CompetitionExamQuestion[] = [
  {
    answerIndex: 2,
    choices: ["55", "60", "65", "70", "75"],
    difficulty: "hard",
    explanation:
      "ใช้สูตรรวมสามเซต แล้วนับเฉพาะสมาชิกที่อยู่เซตเดียว จะได้ 25 + 25 + 15 = 65",
    id: "venn-001",
    prompt:
      "นักเรียน 120 คน ชอบคณิต 70 คน ฟิสิกส์ 65 คน เคมี 50 คน ชอบคณิตและฟิสิกส์ 30 คน ฟิสิกส์และเคมี 20 คน คณิตและเคมี 25 คน และชอบทั้งสามวิชา 10 คน มีกี่คนที่ชอบเพียงวิชาเดียว",
    source: "แนวข้อสอบชุดยาก",
    topic: "เซตและการนับ",
  },
  {
    answerIndex: 3,
    choices: ["1", "2", "3", "4", "5"],
    difficulty: "medium",
    explanation:
      "(p -> q) และ (q -> r) เป็นจริงพร้อมกันเมื่อค่าความจริงเรียง p <= q <= r มี 4 กรณี จากทั้งหมด 8 กรณี",
    id: "logic-001",
    prompt:
      "ให้ p, q, r เป็นประพจน์ จงหาจำนวนกรณีที่ประพจน์ (p -> q) และ (q -> r) เป็นจริงพร้อมกัน",
    source: "แนวข้อสอบชุดกลาง",
    topic: "ตรรกศาสตร์",
  },
  {
    answerIndex: 3,
    choices: ["12", "13", "14", "15", "16"],
    difficulty: "medium",
    explanation:
      "S_n = n/2(2a_1 + (n - 1)d) = n/2(-10 + 3n - 3) เมื่อลอง n = 15 จะได้ 240",
    id: "series-001",
    prompt:
      "ลำดับเลขคณิตมีพจน์แรก -5 และผลต่างร่วม 3 ถ้าผลบวก n พจน์แรกเท่ากับ 240 แล้ว n เท่ากับเท่าใด",
    source: "แนวข้อสอบชุดง่าย",
    topic: "ลำดับและอนุกรม",
  },
  {
    answerIndex: 2,
    choices: ["4,000", "6,000", "8,000", "10,000", "12,000"],
    difficulty: "medium",
    explanation:
      "12 ชั่วโมงคือ 4 รอบของการเพิ่มเป็นสองเท่า จึงได้ 500 x 2^4 = 8,000",
    id: "expo-001",
    prompt:
      "แบคทีเรียเริ่มต้น 500 ตัว และเพิ่มเป็นสองเท่าทุก 3 ชั่วโมง หลังผ่านไป 12 ชั่วโมงจะมีแบคทีเรียกี่ตัว",
    source: "แนวข้อสอบชุดง่าย",
    topic: "เลขยกกำลัง",
  },
  {
    answerIndex: 3,
    choices: ["288", "306", "320", "328", "360"],
    difficulty: "hard",
    explanation:
      "หลักหน่วยเป็น 0 ได้ 9 x 8 แบบ และเป็น 2,4,6,8 ได้ 4 x 8 x 8 แบบ รวม 72 + 256 = 328",
    id: "counting-001",
    prompt:
      "ใช้เลขโดด 0-9 สร้างจำนวนสามหลักที่เป็นเลขคู่ โดยไม่ใช้เลขซ้ำกัน ได้ทั้งหมดกี่จำนวน",
    source: "แนวข้อสอบชุดยาก",
    topic: "การจัดเรียง",
  },
  {
    answerIndex: 1,
    choices: ["12", "15", "18", "21", "24"],
    difficulty: "medium",
    explanation:
      "แจกขนม 7 ชิ้นให้ 3 คน คนละอย่างน้อย 1 ชิ้น คือจำนวนคำตอบบวกของ x+y+z=7 ได้ C(6,2)=15",
    id: "stars-bars-001",
    prompt:
      "มีขนมเหมือนกัน 7 ชิ้น แจกให้นักเรียน 3 คน โดยทุกคนต้องได้อย่างน้อย 1 ชิ้น ทำได้กี่วิธี",
    source: "แนวข้อสอบชุดกลาง",
    topic: "การนับ",
  },
  {
    answerIndex: 2,
    choices: ["-4", "-2", "0", "2", "4"],
    difficulty: "medium",
    explanation:
      "f(g(x)) = 2(x^2+1)-3 = 15 ดังนั้น x^2 = 8 มีรากสองค่าเป็นบวกและลบ ผลบวกของรากจึงเป็น 0",
    id: "function-001",
    prompt:
      "ให้ f(x)=2x-3 และ g(x)=x^2+1 ผลบวกของคำตอบทั้งหมดของสมการ f(g(x))=15 เท่ากับเท่าใด",
    source: "แนวข้อสอบชุดกลาง",
    topic: "ฟังก์ชัน",
  },
  {
    answerIndex: 4,
    choices: ["-1 - 2sqrt(3)", "1 + sqrt(3)", "2sqrt(3)", "1 + 2sqrt(3)", "-1 + 2sqrt(3)"],
    difficulty: "hard",
    explanation:
      "log2((x-1)(x+3)) = 3 จึงได้ x^2+2x-11=0 และโดเมนบังคับ x > 1 ดังนั้น x = -1 + 2sqrt(3)",
    id: "log-001",
    prompt:
      "จงแก้สมการ log2(x-1) + log2(x+3) = 3",
    source: "แนวข้อสอบชุดยาก",
    topic: "ลอการิทึม",
  },
  {
    answerIndex: 3,
    choices: ["8", "10", "12", "14", "16"],
    difficulty: "hard",
    explanation:
      "A^2 = [[7,4],[12,7]] ดังนั้น trace(A^2)=7+7=14",
    id: "matrix-001",
    prompt:
      "ให้ A = [[2,1],[3,2]] จงหา trace(A^2)",
    source: "แนวข้อสอบชุดยาก",
    topic: "เมทริกซ์",
  },
  {
    answerIndex: 0,
    choices: ["0", "1/sqrt(21)", "2/sqrt(21)", "sqrt(21)", "21"],
    difficulty: "medium",
    explanation:
      "u dot v = 2(-1)+(-1)(4)+3(2)=0 ดังนั้น scalar projection เป็น 0",
    id: "vector-001",
    prompt:
      "ให้ u=(2,-1,3) และ v=(-1,4,2) จงหา scalar projection ของ u บน v",
    source: "แนวข้อสอบชุดกลาง",
    topic: "เวกเตอร์",
  },
  {
    answerIndex: 4,
    choices: ["sqrt(5)", "5", "10", "4sqrt(5)", "5sqrt(5)"],
    difficulty: "medium",
    explanation:
      "|(3+4i)(1-2i)| = |3+4i||1-2i| = 5sqrt(5)",
    id: "complex-001",
    prompt:
      "จงหาค่าของ |(3+4i)(1-2i)|",
    source: "แนวข้อสอบชุดกลาง",
    topic: "จำนวนเชิงซ้อน",
  },
  {
    answerIndex: 1,
    choices: ["1", "2", "3", "4", "5"],
    difficulty: "hard",
    explanation:
      "ปริพันธ์คือ x^3 - 2x^2 + x แทนค่า 0 ถึง 2 ได้ 8 - 8 + 2 = 2",
    id: "calculus-001",
    prompt:
      "จงหาค่า integral จาก 0 ถึง 2 ของ (3x^2 - 4x + 1) dx",
    source: "แนวข้อสอบมหาโหด",
    topic: "แคลคูลัส",
  },
  {
    answerIndex: 3,
    choices: ["300", "400", "450", "500", "600"],
    difficulty: "hard",
    explanation:
      "R(x) เป็นพาราโบลาคว่ำ จุดยอดอยู่ที่ x = -b/(2a) = 20 และ R(20)=500",
    id: "calculus-002",
    prompt:
      "รายได้ R(x) = -2x^2 + 80x - 300 เมื่อขายสินค้า x หน่วย รายได้สูงสุดเท่ากับเท่าใด",
    source: "แนวข้อสอบชุดยาก",
    topic: "อนุพันธ์ประยุกต์",
  },
  {
    answerIndex: 2,
    choices: ["3", "5", "6", "9", "12"],
    difficulty: "medium",
    explanation:
      "(x^2-9)/(x-3) = x+3 เมื่อ x ไม่เท่ากับ 3 ดังนั้นลิมิตคือ 6",
    id: "limit-001",
    prompt:
      "จงหาค่า lim เมื่อ x -> 3 ของ (x^2 - 9)/(x - 3)",
    source: "แนวข้อสอบชุดกลาง",
    topic: "ลิมิต",
  },
  {
    answerIndex: 4,
    choices: ["20", "22", "24", "25", "26"],
    difficulty: "hard",
    explanation:
      "ตรวจจุดยอดของบริเวณ feasible: (6,4) ให้ P=3(6)+2(4)=26 ซึ่งมากที่สุด",
    id: "linear-programming-001",
    prompt:
      "จงหาค่าสูงสุดของ P=3x+2y เมื่อ x+y<=10, x<=6, y<=8 และ x,y>=0",
    source: "แนวข้อสอบชุดยาก",
    topic: "กำหนดการเชิงเส้น",
  },
  {
    answerIndex: 2,
    choices: ["6", "7", "8", "9", "10"],
    difficulty: "medium",
    explanation:
      "ค่าเฉลี่ยคือ 8 ผลรวมกำลังสองของส่วนเบี่ยงเบนคือ 40 หารด้วย 5 ได้ 8",
    id: "stats-001",
    prompt:
      "ข้อมูล 4, 6, 8, 10, 12 มีความแปรปรวนแบบประชากรเท่ากับเท่าใด",
    source: "แนวข้อสอบชุดกลาง",
    topic: "สถิติ",
  },
  {
    answerIndex: 1,
    choices: ["1/5", "2/5", "1/2", "3/5", "4/5"],
    difficulty: "medium",
    explanation:
      "P(red)=1/2(3/5)+1/2(1/5)=2/5",
    id: "probability-001",
    prompt:
      "กล่อง A มีลูกแดง 3 น้ำเงิน 2 กล่อง B มีลูกแดง 1 น้ำเงิน 4 สุ่มเลือกกล่องหนึ่งเท่า ๆ กันแล้วหยิบลูกหนึ่งลูก ความน่าจะเป็นที่จะได้ลูกแดงคือเท่าใด",
    source: "แนวข้อสอบชุดกลาง",
    topic: "ความน่าจะเป็น",
  },
  {
    answerIndex: 3,
    choices: ["1/4", "1/2", "2/3", "3/4", "4/5"],
    difficulty: "hard",
    explanation:
      "ใช้ Bayes: P(A|red)=P(A)P(red|A)/P(red)=(1/2)(3/5)/(2/5)=3/4",
    id: "probability-002",
    prompt:
      "จากสถานการณ์กล่อง A มีแดง 3 น้ำเงิน 2 และกล่อง B มีแดง 1 น้ำเงิน 4 ถ้าทราบว่าหยิบได้ลูกแดง ความน่าจะเป็นที่เลือกกล่อง A คือเท่าใด",
    source: "แนวข้อสอบชุดยาก",
    topic: "ความน่าจะเป็นแบบมีเงื่อนไข",
  },
  {
    answerIndex: 4,
    choices: ["20", "40", "60", "70", "80"],
    difficulty: "hard",
    explanation:
      "สัมประสิทธิ์ของ x^3y^2 คือ C(5,3)(2^3)(-1)^2 = 80",
    id: "binomial-001",
    prompt:
      "สัมประสิทธิ์ของ x^3y^2 ในการกระจาย (2x - y)^5 เท่ากับเท่าใด",
    source: "แนวข้อสอบชุดยาก",
    topic: "ทฤษฎีบททวินาม",
  },
  {
    answerIndex: 2,
    choices: ["7", "13", "22", "27", "31"],
    difficulty: "medium",
    explanation:
      "a2 = 3(2)+1 = 7 และ a3 = 3(7)+1 = 22",
    id: "recurrence-001",
    prompt:
      "ให้ a1=2 และ a(n+1)=3a(n)+1 จงหา a3",
    source: "แนวข้อสอบชุดกลาง",
    topic: "ลำดับเวียนเกิด",
  },
  {
    answerIndex: 1,
    choices: ["1", "2", "3", "4", "5"],
    difficulty: "medium",
    explanation:
      "|2x-5|=7 ให้ 2x-5=7 หรือ 2x-5=-7 จึงมีคำตอบ 2 ค่า",
    id: "absolute-001",
    prompt:
      "สมการ |2x - 5| = 7 มีจำนวนคำตอบจริงกี่ค่า",
    source: "แนวข้อสอบชุดง่าย",
    topic: "ค่าสัมบูรณ์",
  },
  {
    answerIndex: 3,
    choices: ["1/2", "2/3", "3/4", "4/5", "5/6"],
    difficulty: "medium",
    explanation:
      "3^(x+1)=27^(2x-1)=3^(6x-3) ดังนั้น x+1=6x-3 ได้ x=4/5",
    id: "expo-002",
    prompt:
      "จงแก้สมการ 3^(x+1) = 27^(2x-1)",
    source: "แนวข้อสอบชุดกลาง",
    topic: "สมการเลขยกกำลัง",
  },
  {
    answerIndex: 4,
    choices: ["56", "64", "72", "78", "84"],
    difficulty: "hard",
    explanation:
      "ใช้สูตร Heron: s=21 พื้นที่ = sqrt(21 x 8 x 7 x 6)=84",
    id: "geometry-001",
    prompt:
      "สามเหลี่ยมมีด้านยาว 13, 14 และ 15 หน่วย มีพื้นที่เท่ากับเท่าใด",
    source: "แนวข้อสอบชุดยาก",
    topic: "เรขาคณิต",
  },
  {
    answerIndex: 3,
    choices: ["10", "12", "20", "24", "26"],
    difficulty: "medium",
    explanation:
      "ครึ่งหนึ่งของคอร์ดยาว sqrt(13^2-5^2)=12 ดังนั้นคอร์ดยาว 24",
    id: "circle-001",
    prompt:
      "วงกลมรัศมี 13 หน่วย มีคอร์ดเส้นหนึ่งห่างจากจุดศูนย์กลาง 5 หน่วย คอร์ดนี้ยาวเท่าใด",
    source: "แนวข้อสอบชุดกลาง",
    topic: "วงกลม",
  },
  {
    answerIndex: 0,
    choices: ["-1", "0", "1", "2", "3"],
    difficulty: "hard",
    explanation:
      "เส้นตรงเดิมมีความชัน 3/4 เส้นตั้งฉากจึงมีความชัน -4/3 แทน x=5 ใน y-3=-4/3(x-2) ได้ y=-1",
    id: "analytic-001",
    prompt:
      "เส้นตรงผ่านจุด (2,3) และตั้งฉากกับเส้น 3x - 4y + 5 = 0 ถ้า x=5 แล้ว y เท่ากับเท่าใด",
    source: "แนวข้อสอบชุดยาก",
    topic: "เรขาคณิตวิเคราะห์",
  },
  {
    answerIndex: 2,
    choices: ["2", "4", "6", "8", "9"],
    difficulty: "medium",
    explanation:
      "จำนวนฟังก์ชันจากเซต 3 สมาชิกไปเซต 2 สมาชิกแบบ onto คือ 2^3 - 2 = 6",
    id: "function-002",
    prompt:
      "จำนวนฟังก์ชันจากเซตที่มี 3 สมาชิกไปยังเซตที่มี 2 สมาชิกซึ่งเป็น onto มีทั้งหมดกี่ฟังก์ชัน",
    source: "แนวข้อสอบชุดกลาง",
    topic: "ฟังก์ชัน",
  },
  {
    answerIndex: 4,
    choices: ["420", "630", "840", "960", "1260"],
    difficulty: "hard",
    explanation:
      "คำว่า CALCULO มี 7 ตัวอักษร โดย C ซ้ำ 2 และ L ซ้ำ 2 จึงเรียงได้ 7!/(2!2!) = 1260",
    id: "permutation-001",
    prompt:
      "นำตัวอักษรทั้งหมดในคำว่า CALCULO มาเรียงเป็นคำใหม่ได้กี่แบบ",
    source: "แนวข้อสอบชุดยาก",
    topic: "การเรียงสับเปลี่ยน",
  },
  {
    answerIndex: 2,
    choices: ["3", "5", "7", "9", "11"],
    difficulty: "medium",
    explanation:
      "ตามทฤษฎีเศษเหลือ เศษจากการหารด้วย x-2 คือ P(2)=8-8+7=7",
    id: "polynomial-001",
    prompt:
      "เมื่อ P(x)=x^3-4x+7 หารด้วย x-2 จะเหลือเศษเท่าใด",
    source: "แนวข้อสอบชุดกลาง",
    topic: "พหุนาม",
  },
  {
    answerIndex: 3,
    choices: ["3", "5", "7", "8", "11"],
    difficulty: "hard",
    explanation:
      "จำนวนที่น้อยที่สุดซึ่งให้เศษ 2 เมื่อหารด้วย 3 และให้เศษ 3 เมื่อหารด้วย 5 คือ 8",
    id: "modular-001",
    prompt:
      "จำนวนนับที่น้อยที่สุดซึ่งหารด้วย 3 เหลือเศษ 2 และหารด้วย 5 เหลือเศษ 3 คือจำนวนใด",
    source: "แนวข้อสอบชุดยาก",
    topic: "ทฤษฎีจำนวน",
  },
  {
    answerIndex: 4,
    choices: ["60", "72", "84", "90", "100"],
    difficulty: "hard",
    explanation:
      "รูปสี่เหลี่ยมผืนผ้าที่มีเส้นรอบรูป 40 จะมีพื้นที่มากสุดเมื่อเป็นสี่เหลี่ยมจัตุรัสด้าน 10 พื้นที่ 100",
    id: "optimization-001",
    prompt:
      "รูปสี่เหลี่ยมผืนผ้ามีเส้นรอบรูป 40 หน่วย พื้นที่มากที่สุดที่เป็นไปได้เท่ากับเท่าใด",
    source: "แนวข้อสอบชุดยาก",
    topic: "การหาค่าสูงสุด",
  },
  {
    answerIndex: 1,
    choices: ["2", "3", "4", "5", "6"],
    difficulty: "brutal",
    explanation:
      "ให้ x^2-4x+1=0 จะได้ x+1/x=4 ดังนั้น x^2+1/x^2 = 4^2-2 = 14 และ x^3+1/x^3 = 4^3-3(4)=52",
    id: "algebra-001",
    prompt:
      "ให้ x เป็นรากบวกของ x^2 - 4x + 1 = 0 จงหาจำนวนหลักของค่า x^3 + 1/x^3",
    source: "แนวข้อสอบมหาโหด",
    topic: "พีชคณิต",
  },
  {
    answerIndex: 1,
    choices: ["1", "2", "3", "4", "5"],
    difficulty: "brutal",
    explanation:
      "จากเงื่อนไข a+b+c=0 และ a^2+b^2+c^2=6 จะได้ ab+bc+ca=-3 แล้ว (a-b)^2+(b-c)^2+(c-a)^2=18",
    id: "algebra-002",
    prompt:
      "ถ้า a+b+c=0 และ a^2+b^2+c^2=6 จงหาจำนวนหลักของ (a-b)^2+(b-c)^2+(c-a)^2",
    source: "แนวข้อสอบมหาโหด",
    topic: "พีชคณิตประยุกต์",
  },
  {
    answerIndex: 2,
    choices: ["10", "12", "14", "16", "18"],
    difficulty: "brutal",
    explanation:
      "จำนวนเส้นทแยงมุมของรูป n เหลี่ยมคือ n(n-3)/2 ให้เท่ากับ 35 ได้ n=10 ดังนั้นจำนวนด้านคือ 10 และมุมภายในรวม 1440 องศา จำนวนหลักคือ 4",
    id: "polygon-001",
    prompt:
      "รูปหลายเหลี่ยมรูปหนึ่งมีเส้นทแยงมุม 35 เส้น จงหาผลรวมของจำนวนด้านกับจำนวนหลักของผลบวกมุมภายใน",
    source: "แนวข้อสอบมหาโหด",
    topic: "เรขาคณิตประยุกต์",
  },
  {
    answerIndex: 0,
    choices: ["1/6", "1/4", "1/3", "5/12", "1/2"],
    difficulty: "brutal",
    explanation:
      "ให้ A เป็นเหตุการณ์ผลรวมเป็นคู่ ได้ P(A)=1/2 และ B เป็นเหตุการณ์มีแต้มซ้ำ ได้ P(A และ B)=3/36 ดังนั้น P(B|A)=1/6",
    id: "probability-003",
    prompt:
      "ทอยลูกเต๋าสองลูก ถ้าทราบว่าผลรวมเป็นจำนวนคู่ ความน่าจะเป็นที่แต้มทั้งสองลูกเท่ากันคือเท่าใด",
    source: "แนวข้อสอบมหาโหด",
    topic: "ความน่าจะเป็น",
  },
  {
    answerIndex: 1,
    choices: ["1", "2", "3", "4", "5"],
    difficulty: "brutal",
    explanation:
      "จำนวนเต็มบวกที่หาร 360 ลงตัวและเป็นกำลังสองสมบูรณ์มีตัวประกอบเฉพาะ 2^a3^b5^c โดย a,b,c เป็นเลขคู่และไม่เกิน 3,2,1 ตามลำดับ จึงมี 2 x 2 x 1 = 4 ค่า ผลรวมคือ 1+4+9+36=50 จำนวนหลักคือ 2",
    id: "number-001",
    prompt:
      "ผลรวมของตัวหารบวกของ 360 ที่เป็นกำลังสองสมบูรณ์มีจำนวนหลักกี่หลัก",
    source: "แนวข้อสอบมหาโหด",
    topic: "ทฤษฎีจำนวน",
  },
  {
    answerIndex: 4,
    choices: ["5", "6", "7", "8", "9"],
    difficulty: "brutal",
    explanation:
      "จำนวนวิธีเลือกคณะ 4 คนจาก 6 คนที่มี A และ B ไม่อยู่พร้อมกัน คือ C(6,4)-C(4,2)=15-6=9",
    id: "combination-001",
    prompt:
      "มีคน 6 คนรวม A และ B เลือกคณะกรรมการ 4 คนโดย A และ B ห้ามอยู่พร้อมกัน ทำได้กี่วิธี",
    source: "แนวข้อสอบมหาโหด",
    topic: "การจัดหมู่",
  },
  {
    answerIndex: 1,
    choices: ["1", "2", "3", "4", "5"],
    difficulty: "brutal",
    explanation:
      "ค่ามากสุดของ sin x + cos x คือ sqrt(2) และค่าน้อยสุดคือ -sqrt(2) ผลต่างคือ 2sqrt(2) มีจำนวนเต็มที่น้อยกว่าค่านี้และมากกว่า 0 คือ 1,2 รวม 2 ค่า",
    id: "trig-001",
    prompt:
      "จำนวนเต็มบวกที่น้อยกว่า ผลต่างระหว่างค่ามากสุดและค่าน้อยสุดของ sin x + cos x มีกี่จำนวน",
    source: "แนวข้อสอบมหาโหด",
    topic: "ตรีโกณมิติ",
  },
  {
    answerIndex: 2,
    choices: ["2", "3", "4", "5", "6"],
    difficulty: "brutal",
    explanation:
      "กราฟ y=x^2-6x+13 มีจุดยอด (3,4) ค่าต่ำสุดคือ 4",
    id: "quadratic-001",
    prompt:
      "ค่าต่ำสุดของ x^2 - 6x + 13 เท่ากับเท่าใด",
    source: "แนวข้อสอบมหาโหด",
    topic: "ฟังก์ชันกำลังสอง",
  },
];

function randomize<T>(items: T[]) {
  const nextItems = [...items];

  for (let index = nextItems.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [nextItems[index], nextItems[randomIndex]] = [
      nextItems[randomIndex],
      nextItems[index],
    ];
  }

  return nextItems;
}

function pickFromDifficulty(
  difficulty: CompetitionExamDifficulty,
  count: number,
  pickedIds: Set<string>,
  questionBank: CompetitionExamQuestion[],
) {
  return randomize(
    questionBank.filter(
      (question) =>
        question.difficulty === difficulty && !pickedIds.has(question.id),
    ),
  ).slice(0, count);
}

function cloneQuestion(question: CompetitionExamQuestion): CompetitionExamQuestion {
  const nextQuestion: CompetitionExamQuestion = {
    ...question,
    choices: [...question.choices],
  };

  if (question.choiceKeys?.length) {
    nextQuestion.choiceKeys = [...question.choiceKeys];
  }

  if (question.promptContent?.length) {
    nextQuestion.promptContent = question.promptContent.map((item) => ({
      ...item,
    }));
  }

  return nextQuestion;
}

export function createCompetitionExamSet(count = EXAM_SET_SIZE) {
  if (COURSE_QUESTION_BANK.length > 0) {
    return randomize(COURSE_QUESTION_BANK).slice(0, count).map(cloneQuestion);
  }

  const pickedIds = new Set<string>();
  const plan: { count: number; difficulty: CompetitionExamDifficulty }[] = [
    { difficulty: "brutal", count: 6 },
    { difficulty: "hard", count: 10 },
    { difficulty: "medium", count: 4 },
  ];
  const picked = plan.flatMap((item) => {
    const questions = pickFromDifficulty(
      item.difficulty,
      item.count,
      pickedIds,
      QUESTION_BANK,
    );
    questions.forEach((question) => pickedIds.add(question.id));
    return questions;
  });

  if (picked.length < count) {
    const fill = randomize(
      QUESTION_BANK.filter((question) => !pickedIds.has(question.id)),
    ).slice(0, count - picked.length);
    picked.push(...fill);
  }

  return randomize(picked).slice(0, count).map(cloneQuestion);
}

export function getCompetitionExamQuestionCount() {
  return EXAM_SET_SIZE;
}

export function getCompetitionExamDurationMs() {
  return 15 * 60 * 1000;
}
