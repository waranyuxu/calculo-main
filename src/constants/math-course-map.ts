import type { Language } from "@/i18n/language";

export const TOTAL_MATH_SECTIONS = 8;
export const UNITS_PER_SECTION = 6;
export const QUESTIONS_PER_UNIT = 10;

export type MathCourseSection = {
  title: string;
  units: string[];
};

const MATH_COURSE_SECTIONS_TH: MathCourseSection[] = [
  {
    title: "เซต",
    units: [
      "ความหมายของเซต",
      "การเขียนเซต",
      "เซตว่างและเอกภพสัมพัทธ์",
      "สับเซตและเพาเวอร์เซต",
      "ยูเนียน อินเตอร์เซกชัน",
      "โจทย์แผนภาพเวนน์",
    ],
  },
  {
    title: "จำนวนจริง",
    units: [
      "ระบบจำนวนจริง",
      "สมบัติของจำนวนจริง",
      "ค่าสัมบูรณ์",
      "ช่วงและการเปรียบเทียบ",
      "สมการจำนวนจริง",
      "อสมการจำนวนจริง",
    ],
  },
  {
    title: "ตรรกศาสตร์",
    units: [
      "ประพจน์",
      "ตัวเชื่อมประพจน์",
      "ตารางค่าความจริง",
      "สัจนิรันดร์",
      "ประโยคเปิด",
      "ตัวบ่งปริมาณ",
    ],
  },
  {
    title: "ฟังก์ชัน",
    units: [
      "คู่อันดับ",
      "ความสัมพันธ์",
      "โดเมนและเรนจ์",
      "นิยามฟังก์ชัน",
      "ฟังก์ชันประกอบ",
      "ฟังก์ชันผกผัน",
    ],
  },
  {
    title: "ตรีโกณมิติ",
    units: [
      "มุมและหน่วยเรเดียน",
      "อัตราส่วนตรีโกณมิติ",
      "วงกลมหนึ่งหน่วย",
      "เอกลักษณ์ตรีโกณมิติ",
      "กราฟตรีโกณมิติ",
      "สมการตรีโกณมิติ",
    ],
  },
  {
    title: "เมทริกซ์",
    units: [
      "ความหมายของเมทริกซ์",
      "ชนิดของเมทริกซ์",
      "การบวกและลบเมทริกซ์",
      "การคูณเมทริกซ์",
      "ดีเทอร์มิแนนต์",
      "เมทริกซ์ผกผัน",
    ],
  },
  {
    title: "ลำดับอนุกรม",
    units: [
      "ความหมายของลำดับ",
      "ลำดับเลขคณิต",
      "ลำดับเรขาคณิต",
      "อนุกรมเลขคณิต",
      "อนุกรมเรขาคณิต",
      "ผลบวกอนุกรม",
    ],
  },
  {
    title: "ความน่าจะเป็น",
    units: [
      "หลักการนับเบื้องต้น",
      "แฟกทอเรียล",
      "การเรียงสับเปลี่ยน",
      "การจัดหมู่",
      "เหตุการณ์และแซมเปิลสเปซ",
      "ความน่าจะเป็นของเหตุการณ์",
    ],
  },
];

const MATH_COURSE_SECTIONS_EN: MathCourseSection[] = [
  {
    title: "Sets",
    units: [
      "Meaning of sets",
      "Writing sets",
      "Empty set and universal set",
      "Subsets and power sets",
      "Union and intersection",
      "Venn diagram problems",
    ],
  },
  {
    title: "Real Numbers",
    units: [
      "Real number system",
      "Properties of real numbers",
      "Absolute value",
      "Intervals and comparisons",
      "Real-number equations",
      "Real-number inequalities",
    ],
  },
  {
    title: "Logic",
    units: [
      "Propositions",
      "Logical connectives",
      "Truth tables",
      "Tautologies",
      "Open sentences",
      "Quantifiers",
    ],
  },
  {
    title: "Functions",
    units: [
      "Ordered pairs",
      "Relations",
      "Domain and range",
      "Definition of a function",
      "Composite functions",
      "Inverse functions",
    ],
  },
  {
    title: "Trigonometry",
    units: [
      "Angles and radians",
      "Trigonometric ratios",
      "Unit circle",
      "Trigonometric identities",
      "Trigonometric graphs",
      "Trigonometric equations",
    ],
  },
  {
    title: "Matrices",
    units: [
      "Meaning of matrices",
      "Types of matrices",
      "Matrix addition and subtraction",
      "Matrix multiplication",
      "Determinants",
      "Inverse matrices",
    ],
  },
  {
    title: "Sequences and Series",
    units: [
      "Meaning of sequences",
      "Arithmetic sequences",
      "Geometric sequences",
      "Arithmetic series",
      "Geometric series",
      "Sums of series",
    ],
  },
  {
    title: "Probability",
    units: [
      "Basic counting principles",
      "Factorials",
      "Permutations",
      "Combinations",
      "Events and sample spaces",
      "Probability of events",
    ],
  },
];

export const MATH_COURSE_SECTIONS_BY_LANGUAGE: Record<
  Language,
  MathCourseSection[]
> = {
  en: MATH_COURSE_SECTIONS_EN,
  th: MATH_COURSE_SECTIONS_TH,
};

export const MATH_COURSE_SECTIONS = MATH_COURSE_SECTIONS_TH;

export function getMathCourseSections(language: Language) {
  return MATH_COURSE_SECTIONS_BY_LANGUAGE[language];
}
