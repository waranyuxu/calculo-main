import type { Language } from "@/i18n/language";

export type MathChapter = {
  key: string;
  lvl: string;
  topics: string;
};

export type MathQuestion = {
  q: string;
  c: string[];
  a: number;
  e: string;
  fig?: string;
};

export const MATH_CHAPTERS = [
  {
    "key": "ch1",
    "lvl": "บทที่ 1: ระบบจำนวนและพีชคณิต",
    "topics": "จำนวนเต็ม · ค่าสัมบูรณ์ · พหุนาม · สมการและนิพจน์"
  },
  {
    "key": "ch2",
    "lvl": "บทที่ 2: เรขาคณิตและเส้นขนาน",
    "topics": "นิยามเส้นขนาน · มุมแย้ง · พีทาโกรัส · สมบัติวงกลม ม.ต้น"
  },
  {
    "key": "ch3",
    "lvl": "บทที่ 3: ความสัมพันธ์และฟังก์ชัน",
    "topics": "นิยามฟังก์ชัน · โดเมน/เรนจ์ · กราฟ V-Shape · ฟังก์ชันผกผัน"
  },
  {
    "key": "ch4",
    "lvl": "บทที่ 4: ภาคตัดกรวย (เน้นภาพกราฟ)",
    "topics": "วงกลม · พาราโบลา · วงรี · ไฮเพอร์โบลา (ช้อยส์หลอกพิเศษ)"
  },
  {
    "key": "ch5",
    "lvl": "บทที่ 5: ฟังก์ชันตรีโกณมิติ",
    "topics": "อัตราส่วนสามเหลี่ยม · วงกลมหนึ่งหน่วย · คาบและแอมพลิจูด"
  },
  {
    "key": "ch6",
    "lvl": "บทที่ 6: แคลคูลัสเบื้องต้น",
    "topics": "แนวคิดลิมิต · ความหมายอนุพันธ์ · พื้นที่ใต้กราฟ"
  }
] satisfies MathChapter[];

export const MATH_QUESTIONS = {
  "ch1": [
    {
      "q": "จำนวน −15 กับ −5 จำนวนใดมีค่ามากกว่า?",
      "c": [
        "−15",
        "−5",
        "มีค่าเท่ากัน",
        "บอกไม่ได้ถ้าไม่ทราบค่าพิกัดแน่นอน"
      ],
      "a": 1,
      "e": "บนเส้นจำนวน จำนวนที่อยู่ทางขวาจะมีค่ามากกว่าเสมอ −5 อยู่ทางขวาของ −15 จึงมีค่ามากกว่า"
    },
    {
      "q": "จำนวน 1 จัดเป็น “จำนวนเฉพาะ” หรือไม่?",
      "c": [
        "เป็น เพราะไม่มีอะไรหารลงตัวยกเว้นตัวมันเอง",
        "ไม่เป็น เพราะจำนวนเฉพาะต้องมีตัวประกอบที่แตกต่างกัน 2 ตัว",
        "เป็นจำนวนเฉพาะที่เป็นบวกตัวแรก",
        "เป็นเฉพาะกรณีที่เป็นจำนวนเต็มบวก"
      ],
      "a": 1,
      "e": "นิยามของจำนวนเฉพาะคือจำนวนเต็มที่มากกว่า 1 และมีตัวประกอบเพียงสองตัวคือ 1 และตัวมันเอง"
    },
    {
      "q": "ข้อใดต่อไปนี้มีสถานะเป็น “สมการ”?",
      "c": [
        "3x² + 5x − 2",
        "2x + 7 > 10",
        "4x − 1 = 11",
        "[2x + 3]"
      ],
      "a": 2,
      "e": "สมการ (Equation) ต้องปรากฏเครื่องหมายเท่ากับ (=) แสดงความเท่ากันของสองฝั่ง ส่วนข้ออื่นเป็นอสมการหรือนิพจน์"
    },
    {
      "q": "|−20| มีความหมายเชิงเรขาคณิตตรงกับข้อใด?",
      "c": [
        "ผลคูณของ −20 กับตัวมันเอง",
        "ระยะห่างระหว่างจุด −20 กับจุด 0 บนเส้นจำนวน",
        "อินเวอร์สการบวกของ 20",
        "ค่าขอบเขตบนสุดบนระบบพิกัด"
      ],
      "a": 1,
      "e": "ค่าสัมบูรณ์ (Absolute Value) คือระยะทางห่างจากจุดศูนย์บนเส้นจำนวน จึงมีค่าเป็นบวกเสมอ"
    },
    {
      "q": "พหุนาม 7x⁵ − 3x² + 2 มีดีกรี (Degree) เท่ากับเท่าใด?",
      "c": [
        "2",
        "5",
        "7",
        "1"
      ],
      "a": 1,
      "e": "ดีกรีของพหุนามคือเลขชี้กำลังที่สูงสุดของตัวแปรในพหุนามนั้น ซึ่งในที่นี้คือ 5"
    },
    {
      "q": "กำหนดให้ a เป็นจำนวนจริงใดๆ ที่ไม่เท่ากับ 0 ค่าของ a⁰ เท่ากับเท่าใด?",
      "c": [
        "0",
        "a",
        "1",
        "ไม่นิยามในระบบจำนวนจริง"
      ],
      "a": 2,
      "e": "ตามกฎของเลขชี้กำลัง จำนวนจริงใดๆ ที่ไม่ใช่ศูนย์เมื่อยกกำลังศูนย์ จะมีค่าเท่ากับ 1 เสมอ"
    },
    {
      "q": "ข้อใดจัดเป็น “จำนวนอตรรกยะ” ทั้งหมด?",
      "c": [
        "2/3 , 0.5",
        "√4 , π",
        "√2 , π",
        "−9 , 0"
      ],
      "a": 2,
      "e": "จำนวนอตรรกยะคือจำนวนที่ไม่สามารถเขียนในรูปเศษส่วนของจำนวนเต็มได้ เช่น ค่าพาย (π) หรือสแควรูทที่ถอดไม่ลงตัว"
    },
    {
      "q": "สมการ x + 5 = x + 8 มีจำนวนคำตอบที่เป็นจำนวนจริงกี่คำตอบ?",
      "c": [
        "มี 1 คำตอบ",
        "ไม่มีคำตอบเลย",
        "มีคำตอบไม่จำกัดจำนวน",
        "มี 2 คำตอบ"
      ],
      "a": 1,
      "e": "หากย้ายข้างจะได้ 5 = 8 ซึ่งเป็นประพจน์ที่เป็นเท็จ หมายความว่าไม่มีค่า x ใดๆ ที่จะทำให้สมการนี้เป็นจริงได้เลย"
    },
    {
      "q": "นิพจน์ √(x²) มีค่าเท่ากับข้อใดเสมอสำหรับทุกจำนวนจริง x?",
      "c": [
        "x",
        "−x",
        "|x|",
        "x²"
      ],
      "a": 2,
      "e": "เนื่องจากผลลัพธ์จากรากที่สองที่เป็นบวก (Principal Root) ห้ามติดลบ จึงต้องครอบด้วยค่าสัมบูรณ์ เช่น √((−3)²) = √9 = 3 หรือ |−3|"
    },
    {
      "q": "การกระจาย a(b + c) = ab + ac อาศัยสมบัติใดทางคณิตศาสตร์?",
      "c": [
        "สมบัติการสลับที่",
        "สมบัติการเปลี่ยนหมู่",
        "สมบัติการแจกแจง",
        "สมบัติการปิด"
      ],
      "a": 2,
      "e": "นี่คือสมบัติการแจกแจง (Distributive Property) ของการคูณเข้าสู่การบวก"
    }
  ],
  "ch2": [
    {
      "q": "ในการระบุว่าเส้นตรงคู่หนึ่ง “ขนานกัน” บนระนาบเดียวกัน จะต้องมีเส้นตรงอย่างน้อยที่สุดกี่เส้น?",
      "c": [
        "1 เส้น",
        "2 เส้น",
        "3 เส้น",
        "ไม่มีข้อจำกัด"
      ],
      "a": 1,
      "e": "การขนานเป็นความสัมพันธ์ระหว่างเส้นตรง ตั้งแต่ 2 เส้นขึ้นไปบนระนาบเดียวกัน"
    },
    {
      "q": "เมื่อมีเส้นตรงเส้นหนึ่งตัดผ่านเส้นขนานคู่หนึ่ง “มุมแย้ง” ที่เกิดขึ้นจะมีลักษณะอย่างไร?",
      "c": [
        "รวมกันได้ 90 องศา",
        "รวมกันได้ 180 องศา",
        "มีขนาดมุมเท่ากันเสมอ",
        "มีขนาดเป็นครึ่งหนึ่งของมุมประชิด"
      ],
      "a": 2,
      "e": "สมบัติของเส้นขนานระบุว่า หากเส้นตรงตัดเส้นขนานคู่หนึ่ง มุมแย้งภายในและมุมแย้งภายนอกจะมีขนาดเท่ากัน"
    },
    {
      "q": "ข้อใดคือนิยามของ “รังสี” (Ray)?",
      "c": [
        "เส้นตรงที่มีจุดปลายสองข้างชัดเจนและวัดความยาวได้",
        "เส้นที่ลากผ่านจุด 3 จุดในระนาบเดียวกัน",
        "เส้นที่มีจุดเริ่มต้น 1 จุด ส่วนอีกข้างต่อออกไปได้ไม่สิ้นสุด",
        "เส้นตรงสองเส้นที่ตัดกันเป็นมุมฉาก"
      ],
      "a": 2,
      "e": "รังสีมีจุดปลาย (จุดเริ่มต้น) เพียงด้านเดียว ส่วนอีกด้านหนึ่งจะมีลูกศรขยายยาวออกไปอย่างไม่มีสิ้นสุด"
    },
    {
      "q": "มุมฉากมีขนาดกี่องศา?",
      "c": [
        "45 องศา",
        "90 องศา",
        "180 องศา",
        "360 องศา"
      ],
      "a": 1,
      "e": "มุมฉาก (Right Angle) มีขนาดคงที่เท่ากับ 90 องศา หรือ π/2 เรเดียน"
    },
    {
      "q": "ทฤษฎีบทพีทาโกรัส c² = a² + b² ตัวแปร c หมายถึงด้านใดของสามเหลี่ยมมุมฉาก?",
      "c": [
        "ด้านประกอบมุมฉากด้านที่สั้นที่สุด",
        "ด้านประกอบมุมฉากด้านที่ยาวที่สุด",
        "ด้านตรงข้ามมุมฉาก ซึ่งเป็นด้านที่ยาวที่สุดเสมอ",
        "ด้านใดก็ได้ตามความสะดวกในการตั้งชื่อ"
      ],
      "a": 2,
      "e": "c คือความยาวของด้านตรงข้ามมุมฉาก (Hypotenuse) ซึ่งเป็นด้านที่อยู่ตรงข้ามมุม 90 องศาและยาวที่สุดในรูปสามเหลี่ยม"
    },
    {
      "q": "การแปลงทางเรขาคณิตข้อใดต่อไปนี้ ที่อาจทำให้รูปเรขาคณิตมี “ขนาดเปลี่ยนไป” จากเดิม?",
      "c": [
        "การเลื่อนขนาน (Translation)",
        "การสะท้อน (Reflection)",
        "การหมุน (Rotation)",
        "การย่อ/ขยาย (Dilation)"
      ],
      "a": 3,
      "e": "การเลื่อน การสะท้อน และการหมุน เป็นการแปลงที่คงระยะทาง (Isometry) รูปที่ได้จะเท่ากันทุกประการ มีเพียงการย่อ/ขยายเท่านั้นที่เปลี่ยนขนาดรูป"
    },
    {
      "q": "“ส่วนของเส้นตรงที่เชื่อมจุดสองจุดใดๆ บนเส้นรอบวงของวงกลม” เรียกว่าอะไร?",
      "c": [
        "รัศมี (Radius)",
        "เส้นสัมผัส (Tangent)",
        "คอร์ด (Chord)",
        "เส้นผ่านศูนย์กลาง (Diameter)"
      ],
      "a": 2,
      "e": "คอร์ดคือส่วนของเส้นตรงที่เชื่อมจุดสองจุดบนวงกลม โดยคอร์ดที่ยาวที่สุดก็คือเส้นผ่านศูนย์กลางนั่นเอง"
    },
    {
      "q": "มุมที่จุดศูนย์กลางของวงกลม จะมีขนาดเป็นกี่เท่าของมุมในส่วนโค้งของวงกลมที่รองรับด้วยส่วนโค้งเดียวกัน?",
      "c": [
        "เท่ากัน",
        "เป็น 2 เท่า",
        "เป็นครึ่งหนึ่ง",
        "เป็น 4 เท่า"
      ],
      "a": 1,
      "e": "ทฤษฎีบทวงกลมระบุว่า มุมที่จุดศูนย์กลางจะมีขนาดเป็นสองเท่าของมุมในส่วนโค้งที่รองรับด้วยส่วนโค้งเดียวกันเสมอ"
    },
    {
      "q": "เส้นสัมผัสวงกลม (Tangent Line) ณ จุดสัมผัส จะทำมุมอย่างไรกับรัศมีของวงกลมที่ลากมายังจุดสัมผัสนั้น?",
      "c": [
        "ตั้งฉากกัน (90 องศา)",
        "ขนานกัน (0 องศา)",
        "ทำมุม 45 องศา",
        "ทำมุม 60 องศา"
      ],
      "a": 0,
      "e": "เส้นสัมผัสวงกลมจะตั้งฉากกับรัศมี ณ จุดสัมผัสเสมอไม่มีข้อยกเว้น"
    },
    {
      "q": "ถ้าตัดทรงกระบอกตรงในแนวระนาบที่ “ขนานกับฐาน” หน้าตัดที่ได้จะเป็นรูปเรขาคณิตชนิดใด?",
      "c": [
        "รูปสามเหลี่ยม",
        "รูปสี่เหลี่ยมผืนผ้า",
        "รูปวงกลม",
        "รูปวงรี"
      ],
      "a": 2,
      "e": "การตัดทรงกระบอกขนานกับแนวฐานจะได้หน้าตัดเป็นรูปวงกลมที่เท่ากันทุกประการกับฐาน แต่ถ้าตัดเฉียงจะได้รูปวงรี"
    }
  ],
  "ch3": [
    {
      "q": "ข้อใดคือนิยามที่ถูกต้องที่สุดของ “ฟังก์ชัน” (Function)?",
      "c": [
        "ความสัมพันธ์ที่ x หนึ่งค่า จับคู่กับ y ได้หลายค่าพร้อมกัน",
        "ความสัมพันธ์ที่สมาชิกตัวหน้า (x) แต่ละตัว จับคู่กับสมาชิกตัวหลัง (y) ได้เพียงตัวเดียวเท่านั้น",
        "ความสัมพันธ์ที่มีกราฟเป็นเส้นตรงตัดแกน x เสมอ",
        "เซตของคู่อันดับที่สมาชิกตัวหลังซ้ำกันไม่ได้"
      ],
      "a": 1,
      "e": "ฟังก์ชันบังคับว่า อินพุต x แต่ละค่าที่ใส่ลงไป ต้องให้เอาต์พุต y ออกมาเพียงค่าเดียวเท่านั้น (Many-to-One ได้ แต่ One-to-Many ไม่ได้)"
    },
    {
      "q": "การทดสอบด้วย “เส้นตรงแนวตั้ง” (Vertical Line Test) มีวัตถุประสงค์เพื่อเช็กสิ่งใด?",
      "c": [
        "เช็กหาจุดตัดแกน y ของกราฟ",
        "เช็กว่าความสัมพันธ์นั้นเป็นฟังก์ชันหรือไม่",
        "เช็กว่าฟังก์ชันนั้นเป็นฟังก์ชัน 1-to-1 หรือไม่",
        "เช็กหาค่าโดเมนที่ติดลบ"
      ],
      "a": 1,
      "e": "ถ้าลากเส้นตรงแนวตั้ง ณ จุดใดๆ แล้วตัดกราฟเกิน 1 จุด แปลว่า x ค่าเดียวนั้นจับคู่กับ y มากกว่า 1 ค่า ส่งผลให้ไม่เป็นฟังก์ชัน"
    },
    {
      "q": "“เซตของสมาชิกตัวหน้า (x) ทั้งหมดในความสัมพันธ์ที่ทำให้ฟังก์ชันหาค่าได้” มีชื่อเรียกว่าอะไร?",
      "c": [
        "เรนจ์ (Range)",
        "โดเมน (Domain)",
        "โคโดเมน (Codomain)",
        "เอกภพสัมพัทธ์ (Universe)"
      ],
      "a": 1,
      "e": "โดเมน (Domain) คือเซตของอินพุตหรือค่า x ทั้งหมดที่เป็นไปได้ เรนจ์ (Range) คือเซตของเอาต์พุตหรือค่า y ทั้งหมดที่เกิดขึ้น"
    },
    {
      "q": "ฟังก์ชัน y = |x| จะมีลักษณะกราฟตรงกับข้อใด?",
      "c": [
        "กราฟเส้นตรงเฉียงขึ้นผ่านจุดกำเนิด",
        "กราฟเส้นโค้งหงายพาราโบลา",
        "กราฟรูปตัว V มีจุดหักมุมที่ (0,0)",
        "กราฟเป็นเส้นตรงแนวนอนขนานแกน x"
      ],
      "a": 2,
      "e": "ค่าสัมบูรณ์ทำให้ผลลัพธ์ y ห้ามติดลบ ฝั่ง x บวกรุ่นกราฟเส้นตรงปกติ ฝั่ง x ลบจะสะท้อนขึ้นมาเป็นรูปตัว V"
    },
    {
      "q": "ฟังก์ชันประกอบ f(g(x)) หรือเขียนแทนด้วย (f o g)(x) มีขั้นตอนการคิดอย่างไร?",
      "c": [
        "นำฟังก์ชัน f มาคูณเข้ากับฟังก์ชัน g",
        "นำค่า x ไปแทนในฟังก์ชัน f ก่อน แล้วนำผลลัพธ์ไปใส่ใน g",
        "นำค่า x ไปแทนในฟังก์ชัน g ก่อน แล้วนำผลลัพธ์ทั้งหมดไปใส่เป็นอินพุตใน f",
        "นำเอาสมการ f และ g มาบวกกันตรงๆ"
      ],
      "a": 2,
      "e": "(f o g)(x) หมายถึง f ของ g(x) ดังนั้นต้องคำนวณหรือพิจารณาฟังก์ชันด้านในคือ g(x) ก่อน แล้วนำผลลัพธ์นั้นไปส่งต่อให้ฟังก์ชันด้านนอกคือ f"
    },
    {
      "q": "กราฟของฟังก์ชันผกผัน (Inverse Function: f⁻¹) จะมีความสมมาตรกับฟังก์ชันเดิม โดยสะท้อนผ่านเส้นตรงใด?",
      "c": [
        "แกน x (y = 0)",
        "แกน y (x = 0)",
        "เส้นตรง y = x",
        "เส้นตรง y = −x"
      ],
      "a": 2,
      "e": "เนื่องจากการหาอินเวอร์สคือการสลับตำแหน่งระหว่าง x และ y ในมิติทางเรขาคณิตกราฟจะสะท้อนข้ามเส้นทแยงมุมหลัก y = x เสมอ"
    },
    {
      "q": "เงื่อนไขใดที่ทำให้ฟังก์ชันหนึ่งๆ “สามารถหาฟังก์ชันผกผัน (Inverse) ได้”?",
      "c": [
        "ต้องเป็นฟังก์ชันเชิงเส้นเท่านั้น",
        "ต้องเป็นฟังก์ชันแบบหนึ่งต่อหนึ่ง (One-to-One Function)",
        "ต้องเป็นฟังก์ชันที่มีโดเมนเป็นจำนวนเต็ม",
        "ต้องเป็นฟังก์ชันที่มีค่าบวกเสมอ"
      ],
      "a": 1,
      "e": "ฟังก์ชันจะหาอินเวอร์สที่เป็นฟังก์ชันได้ก็ต่อเมื่อมันเป็นฟังก์ชัน 1-1 เพื่อที่เวลาสลับ x, y แล้ว ผลลัพธ์ที่ได้ยังคงมีคุณสมบัติของฟังก์ชันอยู่"
    },
    {
      "q": "กราฟของฟังก์ชันที่จัดอยู่ในประเภท “ฟังก์ชันขั้นบันได” (Step Function) เหมาะกับการอธิบายเหตุการณ์ใดในชีวิตประจำวัน?",
      "c": [
        "การปล่อยลูกบอลให้ตกจากตึกสูงตามแรงโน้มถ่วง",
        "อัตราค่าบริการจอดรถยนต์ที่คิดเศษของชั่วโมงเป็น 1 ชั่วโมง",
        "การเจริญเติบโตของประชากรแบคทีเรียแบบทวีคูณ",
        "กระแสไฟฟ้าสลับในบ้านเรือน"
      ],
      "a": 1,
      "e": "ค่าจอดรถมักคงที่ในช่วงเวลาหนึ่งแล้วกระโดดเพิ่มขึ้นทันทีเมื่อเข้าสู่อีกช่วงเวลาหนึ่ง (เช่น 0-1 ชม. ราคา 20 บาท, พอเกิน 1 นาที กระโดดเป็น 40 บาท) กราฟจึงมีลักษณะขาดตอนเป็นขั้นๆ"
    },
    {
      "q": "ถ้ากำหนดให้ f(−x) = f(x) สำหรับทุกค่า x ในโดเมน ฟังก์ชันนี้จะมีชื่อเรียกว่าอะไรและสมมาตรเทียบกับสิ่งใด?",
      "c": [
        "ฟังก์ชันคี่, สมมาตรเทียบกับจุดกำเนิด",
        "ฟังก์ชันคู่, สมมาตรเทียบกับแกน y",
        "ฟังก์ชันคู่, สมมาตรเทียบกับแกน x",
        "ฟังก์ชันคี่, สมมาตรเทียบกับแกน y"
      ],
      "a": 1,
      "e": "นี่คือนิยามของ ฟังก์ชันคู่ (Even Function) กราฟของมันจะพับทบกันสนิทโดยมีแกน y เป็นแกนสมมาตร (เช่น กราฟ y = x²)"
    },
    {
      "q": "โดเมนของฟังก์ชัน y = 1 / (x − 3) มีขอบเขตตรงกับข้อใด?",
      "c": [
        "x เป็นจำนวนจริงใดๆ ก็ได้",
        "x ต้องมากกว่า 3 เท่านั้น",
        "x เป็นจำนวนจริงใดๆ ยกเว้น 3",
        "x เป็นจำนวนจริงใดๆ ยกเว้น −3"
      ],
      "a": 2,
      "e": "ในทางคณิตศาสตร์ ตัวส่วนห้ามเป็นศูนย์เด็ดขาด x − 3 ≠ 0 ดังนั้น x จึงเป็นค่าใดก็ได้ยกเว้น 3"
    }
  ],
  "ch4": [
    {
      "q": "จากรูปวงรีที่กำหนดให้ ส่วนของเส้นตรงสีแดงที่ตั้งฉากกับแกนเอกและลากผ่านจุดศูนย์กลาง เรียกว่าแกนใด?",
      "c": [
        "แกนสังยุค (Conjugate Axis)",
        "แกนโท (Minor Axis)",
        "แกนตามขวาง (Transverse Axis)",
        "เลตัสเรกตัม (Latus Rectum)"
      ],
      "a": 1,
      "e": "เส้นนี้คือ 'แกนโท' ของวงรี (ระวังโดนหลอก! 'แกนสังยุค' และ 'แกนตามขวาง' เป็นศัพท์เฉพาะของไฮเพอร์โบลา ไม่ใช่วงรี)",
      "fig": "<svg viewBox=\"0 0 320 240\"><ellipse cx=\"160\" cy=\"120\" rx=\"110\" ry=\"60\" fill=\"none\" stroke=\"#1A1C20\" stroke-width=\"2.5\"/><line x1=\"160\" y1=\"60\" x2=\"160\" y2=\"180\" stroke=\"#D23B2E\" stroke-width=\"3.5\"/><circle cx=\"160\" cy=\"120\" r=\"4\" fill=\"#1A1C20\"/></svg>"
    },
    {
      "q": "จากรูปไฮเพอร์โบลา เส้นประสีแดงสมมติที่ตั้งฉากกับแกนตามขวาง ณ จุดศูนย์กลาง มีชื่อเรียกว่าแกนใด?",
      "c": [
        "แกนโท (Minor Axis)",
        "แกนเอก (Major Axis)",
        "แกนสังยุค (Conjugate Axis)",
        "แกนสมมาตรหลัก"
      ],
      "a": 2,
      "e": "ไฮเพอร์โบลาไม่มีแกนเอกแกนโท เส้นสมมติที่ช่วยในการสร้างกล่องไฮเพอร์โบลาและตั้งฉากกับแกนตามขวางเรียกว่า 'แกนสังยุค'",
      "fig": "<svg viewBox=\"0 0 320 240\"><path d=\"M70 30 Q140 120 70 210 M250 30 Q180 120 250 210\" fill=\"none\" stroke=\"#1A1C20\" stroke-width=\"2.5\"/><line x1=\"160\" y1=\"60\" x2=\"160\" y2=\"180\" stroke=\"#D23B2E\" stroke-width=\"3.5\" stroke-dasharray=\"2,2\"/><line x1=\"94\" y1=\"120\" x2=\"226\" y2=\"120\" stroke=\"#1A1C20\" stroke-width=\"1.5\" stroke-dasharray=\"4,4\"/><circle cx=\"160\" cy=\"120\" r=\"4.5\" fill=\"#1A1C20\"/></svg>"
    },
    {
      "q": "จากรูปพาราโบลา เส้นตรงสีแดงหนาที่อยู่ด้านล่างของจุดยอดและมีระยะห่างจากจุดยอดเท่ากับโฟกัส เรียกว่าอะไร?",
      "c": [
        "แกนสมมาตร (Axis of Symmetry)",
        "เส้นกำกับ (Asymptote)",
        "ไดเรกตริกซ์ (Directrix)",
        "เลตัสเรกตัม (Latus Rectum)"
      ],
      "a": 2,
      "e": "เส้นตรงคงที่ภายนอกพาราโบลาซึ่งใช้เป็นเกณฑ์ระยะห่างในการสร้างพาราโบลาคู่กับจุดโฟกัสเรียกว่า เส้นไดเรกตริกซ์",
      "fig": "<svg viewBox=\"0 0 320 240\"><path d=\"M60 50 Q160 210 260 50\" fill=\"none\" stroke=\"#1A1C20\" stroke-width=\"2.5\"/><circle cx=\"160\" cy=\"130\" r=\"4.5\" fill=\"#1A1C20\"/><circle cx=\"160\" cy=\"100\" r=\"4\" fill=\"#5C6068\"/><line x1=\"50\" y1=\"160\" x2=\"270\" y2=\"160\" stroke=\"#D23B2E\" stroke-width=\"3.5\"/></svg>"
    },
    {
      "q": "จากรูปพาราโบลา ส่วนของเส้นตรงสีแดงที่ลากผ่านจุดโฟกัสและมีจุดปลายทั้งสองอยู่บนพาราโบลาโดยตั้งฉากกับแกนสมมาตร เรียกว่าอะไร?",
      "c": [
        "ความยาวโฟกัส (Focal Length)",
        "ไดเรกตริกซ์ (Directrix)",
        "เลตัสเรกตัม (Latus Rectum)",
        "คอร์ดของวงกลม"
      ],
      "a": 2,
      "e": "คอร์ดที่ลากผ่านโฟกัสและตั้งฉากกับแกนสมมาตรของภาคตัดกรวยเพื่อบอกความกว้างของกราฟ เรียกว่า เลตัสเรกตัม",
      "fig": "<svg viewBox=\"0 0 320 240\"><path d=\"M60 40 Q160 200 260 40\" fill=\"none\" stroke=\"#1A1C20\" stroke-width=\"2.5\"/><circle cx=\"160\" cy=\"120\" r=\"4.5\" fill=\"#1A1C20\"/><line x1=\"95\" y1=\"120\" x2=\"225\" y2=\"120\" stroke=\"#D23B2E\" stroke-width=\"3\"/></svg>"
    },
    {
      "q": "จากรูปไฮเพอร์โบลา เส้นประสีแดงสองเส้นที่ตัดกันเป็นรูปกากบาท ซึ่งกราฟไฮเพอร์โบลาจะลู่เข้าหาเรื่อยๆ แต่ไม่มีวันตัดผ่าน เรียกว่าเส้นอะไร?",
      "c": [
        "ไดเรกตริกซ์ (Directrix)",
        "แกนสังยุค (Conjugate Axis)",
        "เส้นกำกับ (Asymptote)",
        "เส้นรังสีโฟกัส"
      ],
      "a": 2,
      "e": "เส้นตรงที่กราฟวิ่งเข้าใกล้ชิดขนานไปเรื่อยๆ ที่ระยะอนันต์เรียกว่า เส้นกำกับ (Asymptote)",
      "fig": "<svg viewBox=\"0 0 320 240\"><path d=\"M90 30 Q150 120 90 210 M230 30 Q170 120 230 210\" fill=\"none\" stroke=\"#1A1C20\" stroke-width=\"2\"/><line x1=\"50\" y1=\"20\" x2=\"270\" y2=\"220\" stroke=\"#D23B2E\" stroke-width=\"2\" stroke-dasharray=\"5,4\"/><line x1=\"50\" y1=\"220\" x2=\"270\" y2=\"20\" stroke=\"#D23B2E\" stroke-width=\"2\" stroke-dasharray=\"5,4\"/><circle cx=\"160\" cy=\"120\" r=\"4\" fill=\"#1A1C20\"/></svg>"
    },
    {
      "q": "จากรูปวงกลมและสมการมาตรฐาน x² + y² = 25 เส้นสีแดงที่ลากจากจุดศูนย์กลางไปยังเส้นรอบวงมีความยาวกี่หน่วย?",
      "c": [
        "25 หน่วย",
        "5 หน่วย",
        "12.5 หน่วย",
        "√5 หน่วย"
      ],
      "a": 1,
      "e": "สมการวงกลมที่จุดศูนย์กลาง (0,0) คือ x² + y² = r² ในภาพ r² = 25 ดังนั้นรัศมี r จึงยาว 5 หน่วย",
      "fig": "<svg viewBox=\"0 0 320 240\"><circle cx=\"160\" cy=\"130\" r=\"65\" fill=\"none\" stroke=\"#1A1C20\" stroke-width=\"2.5\"/><circle cx=\"160\" cy=\"130\" r=\"4.5\" fill=\"#1A1C20\"/><line x1=\"160\" y1=\"130\" x2=\"225\" y2=\"130\" stroke=\"#D23B2E\" stroke-width=\"3.5\"/><text x=\"160\" y=\"45\" text-anchor=\"middle\" font-family=\"Kanit\" font-size=\"20\" fill=\"#1A1C20\">x² + y² = 25</text></svg>"
    },
    {
      "q": "จากรูปวงรี จุดสีแดงสองจุดภายในที่อยู่บนแกนเอก ซึ่งผลรวมของระยะทางจากจุดสองจุดนี้ไปยังจุดใดๆ บนส่วนโค้งวงรีมีค่าคงที่เสมอ เรียกว่าจุดอะไร?",
      "c": [
        "จุดยอด (Vertices)",
        "จุดปลายแกนโท",
        "จุดโฟกัส (Foci)",
        "จุดสมมาตรร่วม"
      ],
      "a": 2,
      "e": "ตามนิยามทางเรขาคณิต วงรีถูกสร้างขึ้นจากจุดคงที่สองจุดข้างในซึ่งเรียกว่า 'จุดโฟกัส' (Foci)",
      "fig": "<svg viewBox=\"0 0 320 240\"><ellipse cx=\"160\" cy=\"120\" rx=\"115\" ry=\"65\" fill=\"none\" stroke=\"#1A1C20\" stroke-width=\"2.5\"/><circle cx=\"100\" cy=\"120\" r=\"5\" fill=\"#D23B2E\"/><circle cx=\"220\" cy=\"120\" r=\"5\" fill=\"#D23B2E\"/><circle cx=\"160\" cy=\"120\" r=\"3.5\" fill=\"#5C6068\"/></svg>"
    },
    {
      "q": "จากรูปไฮเพอร์โบลา ส่วนของเส้นตรงสีแดงหนาที่เชื่อมระหว่างจุดยอดทั้งสองฝั่ง เรียกว่าอะไร?",
      "c": [
        "แกนเอก (Major Axis)",
        "แกนตามขวาง (Transverse Axis)",
        "แกนสังยุค (Conjugate Axis)",
        "เลตัสเรกตัม (Latus Rectum)"
      ],
      "a": 1,
      "e": "ส่วนของเส้นตรงที่เชื่อมจุดยอดทั้งสองของไฮเพอร์โบลาเรียกว่า แกนตามขวาง (Transverse Axis)",
      "fig": "<svg viewBox=\"0 0 320 240\"><path d=\"M80 30 Q140 120 80 210 M240 30 Q180 120 240 210\" fill=\"none\" stroke=\"#1A1C20\" stroke-width=\"2.5\"/><circle cx=\"113\" cy=\"120\" r=\"4\" fill=\"#1A1C20\"/><circle cx=\"207\" cy=\"120\" r=\"4\" fill=\"#1A1C20\"/><line x1=\"113\" y1=\"120\" x2=\"207\" y2=\"120\" stroke=\"#D23B2E\" stroke-width=\"4\"/></svg>"
    },
    {
      "q": "ค่าความเยื้องศูนย์กลาง (Eccentricity: e) ของรูป “วงรี” จะต้องมีค่าตรงกับเงื่อนไขใด?",
      "c": [
        "e = 0",
        "0 < e < 1",
        "e = 1",
        "e > 1"
      ],
      "a": 1,
      "e": "ถ้า e = 0 จะเป็นวงกลม, อยู่ระหว่าง 0 กับ 1 เป็นวงรี, ถ้า e = 1 เป็นพาราโบลา และถ้า e > 1 จะกางออกเป็นไฮเพอร์โบลา"
    },
    {
      "q": "สมการพาราโบลา (x − h)² = −12(y − k) มีลักษณะกราฟเปิดไปทางทิศใด?",
      "c": [
        "หงายขึ้นด้านบน",
        "คว่ำลงด้านล่าง",
        "เปิดไปทางขวา",
        "เปิดไปทางซ้าย"
      ],
      "a": 1,
      "e": "ตัวแปรที่ยกกำลังหนึ่งคือ y แปลว่าเป็นพาราโบลาแนวตั้ง (หงาย/คว่ำ) และเนื่องจากค่า 4c ติดลบ (−12) กราฟจึงเป็นแบบคว่ำลง"
    }
  ],
  "ch5": [
    {
      "q": "ในรูปสามเหลี่ยมมุมฉาก อัตราส่วนตรีโกณมิติของ ฟังก์ชัน sine (sin) นิยามจากข้อใด?",
      "c": [
        "ข้าม / ชิด (ตรงข้ามมุม / ชิดมุม)",
        "ชิด / ฉาก (ชิดมุม / ตรงข้ามมุมฉาก)",
        "ข้าม / ฉาก (ตรงข้ามมุม / ตรงข้ามมุมฉาก)",
        "ฉาก / ข้าม (ตรงข้ามมุมฉาก / ตรงข้ามมุม)"
      ],
      "a": 2,
      "e": "ท่องจำมาตรฐาน: sin = ข้าม/ฉาก, cos = ชิด/ฉาก, tan = ข้าม/ชิด"
    },
    {
      "q": "ฟังก์ชันโคเซแคนต์ (csc θ) เป็นส่วนกลับ (Reciprocal) ของฟังก์ชันตรีโกณมิติใด?",
      "c": [
        "cos θ",
        "sin θ",
        "tan θ",
        "sec θ"
      ],
      "a": 1,
      "e": "csc θ = 1 / sin θ , sec θ = 1 / cos θ และ cot θ = 1 / tan θ"
    },
    {
      "q": "ค่าของ sin 30° มีค่าตรงกับข้อใด?",
      "c": [
        "0",
        "1/2",
        "√3/2",
        "1"
      ],
      "a": 1,
      "e": "ตามค่ามุมมาตรฐานตรีโกณมิติ sin 30° มีค่าเท่ากับ 1/2 (หรือ 0.5)"
    },
    {
      "q": "บนวงกลมหนึ่งหน่วย (Unit Circle) ค่าพิกัดคู่ลำดับ (x, y) ณ มุมใดๆ ค่า x จะสอดคล้องกับฟังก์ชันตรีโกณมิติใด?",
      "c": [
        "sin θ",
        "cos θ",
        "tan θ",
        "sec θ"
      ],
      "a": 1,
      "e": "บนวงกลมหนึ่งหน่วย รัศมี r=1 จะได้ว่าพิกัด x = cos θ และพิกัด y = sin θ เสมอ"
    },
    {
      "q": "มุมขนาด π เรเดียน (Radians) มีค่าเทียบเท่ากับกี่องศาในระบบองศา?",
      "c": [
        "90 องศา",
        "180 องศา",
        "270 องศา",
        "360 องศา"
      ],
      "a": 1,
      "e": "มุมรอบจุดศูนย์กลางของวงกลมคือ 2π เรเดียน ซึ่งเท่ากับ 360 องศา ดังนั้น π เรเดียนจึงเท่ากับ 180 องศา"
    },
    {
      "q": "หากมุม θ ตกอยู่ในจตุภาคที่ 2 (Quadrant 2) ฟังก์ชันตรีโกณมิติพื้นฐานใดที่มีค่าคำตอบเป็น “บวก”?",
      "c": [
        "cos θ",
        "tan θ",
        "sin θ",
        "ทุกฟังก์ชันเป็นลบทั้งหมด"
      ],
      "a": 2,
      "e": "ใน Quadrant 2 พิกัด x เป็นลบ ค่า y เป็นบวก เนื่องจาก y คือ sin ตัวฟังก์ชัน sin จึงเป็นบวก ส่วน cos และ tan จะติดลบ"
    },
    {
      "q": "เอกลักษณ์ตรีโกณมิติข้อใดต่อไปนี้ที่เป็นจริงเสมอสำหรับทุกๆ มุม θ?",
      "c": [
        "sin θ + cos θ = 1",
        "sin² θ + cos² θ = 1",
        "sin² θ − cos² θ = 1",
        "tan² θ + 1 = sin² θ"
      ],
      "a": 1,
      "e": "นี่คือเอกลักษณ์พิทาโกเรียนของตรีโกณมิติ (Pythagorean Identity) sin² θ + cos² θ = 1"
    },
    {
      "q": "กราฟของฟังก์ชัน y = sin x วนลูปกลับมาซ้ำเดิมทุกๆ ความยาวช่วงเท่าใด ซึ่งเรียกว่า คาบ (Period)?",
      "c": [
        "π",
        "π/2",
        "2π",
        "4π"
      ],
      "a": 2,
      "e": "ฟังก์ชัน sin และ cos มาตรฐานมีคาบกว้างเท่ากับ 2π เรเดียนในการคลื่นครบลูป 1 รอบพอดิบพอดี"
    },
    {
      "q": "ค่าแอมพลิจูด (Amplitude) หรือความสูงจากแนวสมดุลของกราฟ y = 4cos x มีค่าเท่าใด?",
      "c": [
        "1",
        "2",
        "4",
        "8"
      ],
      "a": 2,
      "e": "แอมพลิจูดหาได้จากค่าสัมบูรณ์ของสัมประสิทธิ์หน้าฟังก์ชัน ในที่นี้คือ |4| = 4 หน่วย"
    },
    {
      "q": "ฟังก์ชัน tan θ สามารถเขียนให้อยู่ในรูปอัตราส่วนของฟังก์ชันตรีโกณมิติอื่นได้อย่างไร?",
      "c": [
        "cos θ / sin θ",
        "sin θ / cos θ",
        "1 / sec θ",
        "sin θ · cos θ"
      ],
      "a": 1,
      "e": "จากนิยาม ข้าม/ชิด สามารถแตกได้เป็น (ข้าม/ฉาก) / (ชิด/ฉาก) ซึ่งก็คือ sin θ / cos θ นั่นเอง"
    }
  ],
  "ch6": [
    {
      "q": "ความหมายทางเรขาคณิตที่แท้จริงของ “อนุพันธ์ของฟังก์ชันที่จุด x ใดๆ” (Derivative: f'(x)) คือข้อใด?",
      "c": [
        "พื้นที่ใต้เส้นโค้งของกราฟ",
        "ความชันของเส้นสัมผัสเส้นโค้ง ณ จุดนั้น",
        "ระยะทางที่สั้นที่สุดจากจุดศูนย์กลาง",
        "จุดหักเหของกราฟขั้นบันได"
      ],
      "a": 1,
      "e": "อนุพันธ์คืออัตราการเปลี่ยนแปลงเชิงขณะ (Instantaneous Rate of Change) ซึ่งเทียบได้กับความชัน (Slope) ของเส้นตรงที่มาสัมผัสกราฟ ณ จุดนั้น"
    },
    {
      "q": "การหาปริพันธ์จำกัดเขต (Definite Integration) ตั้งแต่ช่วง x = a ถึง b สื่อถึงสิ่งใดในทางเรขาคณิต?",
      "c": [
        "ความชันเฉลี่ยของฟังก์ชัน",
        "พื้นที่สุทธิใต้เส้นโค้งที่ถูกปิดล้อมด้วยแกน x จาก a ถึง b",
        "ระยะทางระหว่างจุดยอดสองจุด",
        "การทดสอบว่าฟังก์ชันเป็นฟังก์ชันต่อเนื่องหรือไม่"
      ],
      "a": 1,
      "e": "การอินทิเกรตจำกัดเขตคือการรวมพื้นที่ย่อยๆ เข้าด้วยกัน ผลลัพธ์ที่ได้คือพื้นที่ใต้กราฟระว่างขอบเขตที่ระบุไว้"
    },
    {
      "q": "ถ้าฟังก์ชัน f(x) = 12 (เป็นฟังก์ชันค่าคงที่) อัตราการเปลี่ยนแปลงหรือค่าอนุพันธ์ f'(x) จะมีค่าเท่ากับเท่าใด?",
      "c": [
        "12",
        "1",
        "0",
        "ไม่นิยามเนื่องจากไม่มีตัวแปร x"
      ],
      "a": 2,
      "e": "เนื่องจากฟังก์ชันค่าคงที่ไม่มีการเปลี่ยนแปลง กราฟเป็นเส้นตรงแนวนอน ความชันจึงเป็น 0 ตลอดสาย อนุพันธ์ของค่าคงที่จึงได้ 0 เสมอ"
    },
    {
      "q": "ถ้าเราทราบว่าอนุพันธ์อันดับหนึ่งของฟังก์ชัน ณ ช่วงหนึ่ง มีค่าเป็น “บวกเสมอ” (f'(x) > 0) กราฟในช่วงนั้นจะมีลักษณะอย่างไร?",
      "c": [
        "เป็นฟังก์ชันลด (กราฟดิ่งลง)",
        "เป็นฟังก์ชันเพิ่ม (กราฟไต่ระดับขึ้น)",
        "กราฟขนานแกน x เป็นเส้นตรงแนวนอน",
        "กราฟขาดตอนไม่ต่อเนื่อง"
      ],
      "a": 1,
      "e": "เมื่อความชัน (อนุพันธ์) เป็นบวก แสดงว่าเมื่อ x เพิ่มขึ้น y ก็จะเพิ่มขึ้นตาม กราฟจึงมีลักษณะลาดชันขึ้น จัดเป็นฟังก์ชันเพิ่ม (Increasing Function)"
    },
    {
      "q": "กระบวนการหาปริพันธ์ (Integration) มีความสัมพันธ์อย่างไรกับการหาอนุพันธ์ (Differentiation)?",
      "c": [
        "เป็นกระบวนการทำซ้ำแบบเดียวกัน",
        "เป็นกระบวนการผกผันหรือสวนทางกลับกัน",
        "ไม่เกี่ยวข้องกันเลยทางคณิตศาสตร์",
        "เป็นการนำผลลัพธ์มาคูณด้วยค่าลิมิตอนันต์"
      ],
      "a": 1,
      "e": "ตามทฤษฎีบทหลักของแคลคูลัส (Fundamental Theorem of Calculus) การอินทิเกรตและการดิฟเฟอเรนชิเอตเป็นกระบวนการผกผันซึ่งกันและกัน"
    },
    {
      "q": "ที่จุดสูงสุดสัมพัทธ์ (Relative Maximum) หรือจุดต่ำสุดสัมพัทธ์บนกราฟเส้นโค้งที่เรียบและต่อเนื่อง ค่าความชันของเส้นสัมผัส ณ จุดนั้นจะมีค่าเท่ากับเท่าใด?",
      "c": [
        "มีค่าสูงสุด",
        "มีค่าเป็น 1",
        "มีค่าเป็น 0",
        "มีค่าติดลบ"
      ],
      "a": 2,
      "e": "ณ จุดสูงสุดหรือต่ำสุดสัมพัทธ์ เส้นสัมผัสกราฟจะอยู่ในแนวราบพอดี ทำให้ความชันหรือ f'(x) เท่ากับ 0"
    },
    {
      "q": "ในทางฟิสิกส์ หากเรานำฟังก์ชัน “ระยะทางตามเวลา s(t)” มาหาอนุพันธ์เทียบกับเวลา 1 ครั้ง (ds/dt) ผลลัพธ์ที่ได้คือปริมาณใด?",
      "c": [
        "ความเร่ง (Acceleration)",
        "ความเร็ว (Velocity)",
        "มวล (Mass)",
        "พลังงานจลน์"
      ],
      "a": 1,
      "e": "อัตราการเปลี่ยนแปลงของระยะทางเทียบกับเวลา ณ ขณะใดขณะหนึ่ง ก็คือ ความเร็ว (v) และถ้าดิฟความเร็วต่อก็จะได้ความเร่ง (a)"
    },
    {
      "q": "ข้อใดคือความหมายของ lim (x→5) f(x) = 10?",
      "c": [
        "ที่จุด x ต้องเท่ากับ 5 เท่านั้น ค่าฟังก์ชันถึงจะเป็น 10",
        "เมื่อ x มีค่าเข้าใกล้ 5 มากๆ (ทั้งฝั่งซ้ายและขวา) ค่าของ f(x) จะมีแนวโน้มเข้าใกล้ 10",
        "ค่าสูงสุดของฟังก์ชัน f(x) คือ 10",
        "ฟังก์ชันนี้ไม่ต่อเนื่องที่ x = 5"
      ],
      "a": 1,
      "e": "ลิมิตพูดถึงแนวโน้มของค่าฟังก์ชันเมื่อตัวแปรวิ่งเข้าไปใกล้จุดนั้นๆ โดยไม่สนใจว่าที่จุด x = 5 ตัวฟังก์ชันจะมีค่าเท่าใดหรือนิยามไว้หรือไม่"
    },
    {
      "q": "สูตรการหาอนุพันธ์มาตรฐาน d/dx [xⁿ] เท่ากับข้อใด?",
      "c": [
        "xⁿ⁺¹",
        "n · xⁿ⁻¹",
        "n · xⁿ",
        "xⁿ / n"
      ],
      "a": 1,
      "e": "กฎกำลังของการดิฟตัวแปรยกกำลังคือ ตบเลขชี้กำลังลงมาข้างหน้า แล้วลดเลขชี้กำลังเดิมลงไป 1 ค่า ได้ n·x^(n−1)"
    },
    {
      "q": "การหาลิมิตของฟังก์ชันที่ติดรูปแบบไม่กำหนด (Indeterminate Form) เช่น 0/0 สามารถใช้กฎของใครในการดิฟเศษและดิฟส่วนแยกกันเพื่อหาคำตอบได้?",
      "c": [
        "กฎของนิวตัน (Newton's Law)",
        "กฎของโลปีตาล (L'Hôpital's Rule)",
        "ทฤษฎีของปาสกาล (Pascal's Theorem)",
        "กฎของเกาส์ (Gauss's Law)"
      ],
      "a": 1,
      "e": "กฎของโลปีตาล (L'Hôpital's Rule) ระบุว่าเมื่อเจอลิมิตในรูป 0/0 หรือ ∞/∞ เราสามารถหาอนุพันธ์ของตัวเศษและตัวส่วนแยกกันเพื่อช่วยหาค่าลิมิตได้"
    }
  ]
} satisfies Record<string, MathQuestion[]>;

export const MATH_KEYS = ["ก", "ข", "ค", "ง"];

const MATH_CHAPTERS_EN = [
  {
    key: "ch1",
    lvl: "Chapter 1: Number Systems and Algebra",
    topics: "Integers · Absolute value · Polynomials · Equations and expressions",
  },
  {
    key: "ch2",
    lvl: "Chapter 2: Geometry and Parallel Lines",
    topics: "Parallel lines · Alternate angles · Pythagoras · Lower-secondary circle properties",
  },
  {
    key: "ch3",
    lvl: "Chapter 3: Relations and Functions",
    topics: "Function definitions · Domain/range · V-shaped graphs · Inverse functions",
  },
  {
    key: "ch4",
    lvl: "Chapter 4: Conic Sections (graph focus)",
    topics: "Circles · Parabolas · Ellipses · Hyperbolas with tricky choices",
  },
  {
    key: "ch5",
    lvl: "Chapter 5: Trigonometric Functions",
    topics: "Triangle ratios · Unit circle · Period and amplitude",
  },
  {
    key: "ch6",
    lvl: "Chapter 6: Introductory Calculus",
    topics: "Limit ideas · Meaning of derivatives · Area under a graph",
  },
] satisfies MathChapter[];

const MATH_QUESTIONS_TH: Record<string, MathQuestion[]> = MATH_QUESTIONS;

function withOriginalFigure(
  chapterKey: string,
  index: number,
  question: Omit<MathQuestion, "fig">,
): MathQuestion {
  const fig = MATH_QUESTIONS_TH[chapterKey]?.[index]?.fig;
  return fig ? { ...question, fig } : question;
}

const MATH_QUESTIONS_EN = {
  ch1: [
    {
      q: "Which number is greater, −15 or −5?",
      c: ["−15", "−5", "They are equal", "Cannot tell without exact coordinates"],
      a: 1,
      e: "On a number line, the number farther to the right is always greater. −5 is to the right of −15, so −5 is greater.",
    },
    {
      q: "Is the number 1 a prime number?",
      c: [
        "Yes, because nothing divides it except itself",
        "No, because a prime number must have exactly 2 distinct factors",
        "Yes, it is the first positive prime number",
        "Only when it is treated as a positive integer",
      ],
      a: 1,
      e: "A prime number is an integer greater than 1 with exactly two factors: 1 and itself.",
    },
    {
      q: "Which of the following is an equation?",
      c: ["3x² + 5x − 2", "2x + 7 > 10", "4x − 1 = 11", "[2x + 3]"],
      a: 2,
      e: "An equation must contain an equals sign (=) showing that two sides are equal. The other choices are inequalities or expressions.",
    },
    {
      q: "What is the geometric meaning of |−20|?",
      c: [
        "The product of −20 and itself",
        "The distance from −20 to 0 on the number line",
        "The additive inverse of 20",
        "The highest boundary value on a coordinate system",
      ],
      a: 1,
      e: "Absolute value is the distance from zero on the number line, so it is always nonnegative.",
    },
    {
      q: "What is the degree of the polynomial 7x⁵ − 3x² + 2?",
      c: ["2", "5", "7", "1"],
      a: 1,
      e: "The degree of a polynomial is the highest exponent of its variable. Here, the highest exponent is 5.",
    },
    {
      q: "If a is any nonzero real number, what is a⁰?",
      c: ["0", "a", "1", "Undefined in the real number system"],
      a: 2,
      e: "By the exponent rules, any nonzero real number raised to the zero power equals 1.",
    },
    {
      q: "Which choice contains only irrational numbers?",
      c: ["2/3 , 0.5", "√4 , π", "√2 , π", "−9 , 0"],
      a: 2,
      e: "An irrational number cannot be written as a fraction of integers, such as π or a square root that does not simplify exactly.",
    },
    {
      q: "How many real solutions does x + 5 = x + 8 have?",
      c: ["One solution", "No solution", "Infinitely many solutions", "Two solutions"],
      a: 1,
      e: "Subtracting x from both sides gives 5 = 8, which is false. No real value of x can make the equation true.",
    },
    {
      q: "For every real number x, what is √(x²) always equal to?",
      c: ["x", "−x", "|x|", "x²"],
      a: 2,
      e: "The principal square root is never negative, so √(x²) must be |x|. For example, √((−3)²) = √9 = 3 = |−3|.",
    },
    {
      q: "The expansion a(b + c) = ab + ac uses which mathematical property?",
      c: [
        "Commutative property",
        "Associative property",
        "Distributive property",
        "Closure property",
      ],
      a: 2,
      e: "This is the distributive property: multiplying across a sum.",
    },
  ],
  ch2: [
    {
      q: "To state that lines are parallel on the same plane, what is the minimum number of lines needed?",
      c: ["1 line", "2 lines", "3 lines", "No restriction"],
      a: 1,
      e: "Parallelism is a relationship between at least two lines on the same plane.",
    },
    {
      q: "When a transversal cuts a pair of parallel lines, what is true about the alternate angles formed?",
      c: [
        "They add to 90 degrees",
        "They add to 180 degrees",
        "They always have equal measures",
        "They are half of the adjacent angles",
      ],
      a: 2,
      e: "For parallel lines cut by a transversal, alternate interior and alternate exterior angles are equal.",
    },
    {
      q: "Which choice is the definition of a ray?",
      c: [
        "A line segment with two clear endpoints and measurable length",
        "A line passing through 3 points on the same plane",
        "A line with one starting point that extends forever in the other direction",
        "Two lines intersecting at a right angle",
      ],
      a: 2,
      e: "A ray has one endpoint, while the other side extends infinitely.",
    },
    {
      q: "How many degrees are in a right angle?",
      c: ["45 degrees", "90 degrees", "180 degrees", "360 degrees"],
      a: 1,
      e: "A right angle always measures 90 degrees, or π/2 radians.",
    },
    {
      q: "In the Pythagorean theorem c² = a² + b², which side does c represent?",
      c: [
        "The shortest leg of the right triangle",
        "The longest leg of the right triangle",
        "The hypotenuse, which is always the longest side",
        "Any side, depending on how you name the triangle",
      ],
      a: 2,
      e: "c is the hypotenuse: the side opposite the 90-degree angle and the longest side of a right triangle.",
    },
    {
      q: "Which geometric transformation can change the size of a figure?",
      c: ["Translation", "Reflection", "Rotation", "Dilation"],
      a: 3,
      e: "Translations, reflections, and rotations preserve distance. Dilation is the transformation that changes size.",
    },
    {
      q: "What is the segment joining any two points on a circle's circumference called?",
      c: ["Radius", "Tangent", "Chord", "Diameter"],
      a: 2,
      e: "A chord is a line segment joining two points on a circle. The longest chord is the diameter.",
    },
    {
      q: "A central angle of a circle is how many times the inscribed angle that subtends the same arc?",
      c: ["The same", "Twice as large", "Half as large", "Four times as large"],
      a: 1,
      e: "The circle theorem states that a central angle is twice the inscribed angle subtending the same arc.",
    },
    {
      q: "At the point of tangency, how does a tangent line meet the radius drawn to that point?",
      c: [
        "Perpendicularly (90 degrees)",
        "In parallel (0 degrees)",
        "At 45 degrees",
        "At 60 degrees",
      ],
      a: 0,
      e: "A tangent line to a circle is always perpendicular to the radius at the point of tangency.",
    },
    {
      q: "If a right cylinder is cut by a plane parallel to its base, what shape is the cross-section?",
      c: ["Triangle", "Rectangle", "Circle", "Ellipse"],
      a: 2,
      e: "A cut parallel to the base of a cylinder produces a circle congruent to the base. An angled cut can produce an ellipse.",
    },
  ],
  ch3: [
    {
      q: "Which is the most accurate definition of a function?",
      c: [
        "A relation where one x value can pair with many y values at the same time",
        "A relation where each input x pairs with exactly one output y",
        "A relation whose graph is always a straight line crossing the x-axis",
        "A set of ordered pairs where output values may never repeat",
      ],
      a: 1,
      e: "A function requires each input x to produce exactly one output y. Many-to-one is allowed, but one-to-many is not.",
    },
    {
      q: "What is the purpose of the vertical line test?",
      c: [
        "To find the y-intercept of a graph",
        "To check whether a relation is a function",
        "To check whether a function is one-to-one",
        "To find negative domain values",
      ],
      a: 1,
      e: "If a vertical line crosses a graph at more than one point, one x value has more than one y value, so the relation is not a function.",
    },
    {
      q: "What is the set of all first components x that make a function defined called?",
      c: ["Range", "Domain", "Codomain", "Universal set"],
      a: 1,
      e: "The domain is the set of all possible inputs x. The range is the set of output values y that occur.",
    },
    {
      q: "Which graph shape matches the function y = |x|?",
      c: [
        "A rising straight line through the origin",
        "An upward-opening parabola",
        "A V-shaped graph with vertex at (0,0)",
        "A horizontal line parallel to the x-axis",
      ],
      a: 2,
      e: "Absolute value prevents y from being negative. The positive x side is a normal line, while the negative x side reflects upward into a V shape.",
    },
    {
      q: "How should you evaluate the composite function f(g(x)), also written (f o g)(x)?",
      c: [
        "Multiply function f by function g",
        "Substitute x into f first, then put the result into g",
        "Substitute x into g first, then use that result as the input of f",
        "Add the equations f and g directly",
      ],
      a: 2,
      e: "(f o g)(x) means f of g(x). Work from the inside, g(x), then pass that result into the outside function f.",
    },
    {
      q: "The graph of an inverse function f⁻¹ is symmetric to the original function across which line?",
      c: ["The x-axis (y = 0)", "The y-axis (x = 0)", "The line y = x", "The line y = −x"],
      a: 2,
      e: "Finding an inverse swaps x and y, so the graph reflects across the main diagonal y = x.",
    },
    {
      q: "What condition allows a function to have an inverse that is also a function?",
      c: [
        "It must be linear only",
        "It must be one-to-one",
        "Its domain must be integers",
        "Its values must always be positive",
      ],
      a: 1,
      e: "A function has an inverse that is also a function only when it is one-to-one, so swapping x and y still passes the function rule.",
    },
    {
      q: "Which real-life situation is well modeled by a step function?",
      c: [
        "Dropping a ball from a tall building under gravity",
        "A parking fee that rounds any fraction of an hour up to a full hour",
        "Exponential bacterial population growth",
        "Alternating current in a household",
      ],
      a: 1,
      e: "Parking fees often stay constant for one interval, then jump at the next interval. That creates a discontinuous step-like graph.",
    },
    {
      q: "If f(−x) = f(x) for every x in the domain, what is the function called and what symmetry does it have?",
      c: [
        "Odd function, symmetric about the origin",
        "Even function, symmetric about the y-axis",
        "Even function, symmetric about the x-axis",
        "Odd function, symmetric about the y-axis",
      ],
      a: 1,
      e: "This is the definition of an even function. Its graph folds onto itself across the y-axis, such as y = x².",
    },
    {
      q: "What is the domain of y = 1 / (x − 3)?",
      c: [
        "Any real number",
        "Only x values greater than 3",
        "Any real number except 3",
        "Any real number except −3",
      ],
      a: 2,
      e: "A denominator cannot be zero. Since x − 3 ≠ 0, x can be any real number except 3.",
    },
  ],
  ch4: [
    withOriginalFigure("ch4", 0, {
      q: "In the ellipse shown, what is the red segment perpendicular to the major axis and passing through the center called?",
      c: ["Conjugate axis", "Minor axis", "Transverse axis", "Latus rectum"],
      a: 1,
      e: "This is the minor axis of the ellipse. Be careful: conjugate axis and transverse axis are hyperbola terms, not ellipse terms.",
    }),
    withOriginalFigure("ch4", 1, {
      q: "In the hyperbola shown, what is the dashed red line perpendicular to the transverse axis at the center called?",
      c: ["Minor axis", "Major axis", "Conjugate axis", "Main axis of symmetry"],
      a: 2,
      e: "A hyperbola does not have a major/minor axis. The construction line perpendicular to the transverse axis is called the conjugate axis.",
    }),
    withOriginalFigure("ch4", 2, {
      q: "In the parabola shown, what is the thick red line below the vertex, the same distance from the vertex as the focus?",
      c: ["Axis of symmetry", "Asymptote", "Directrix", "Latus rectum"],
      a: 2,
      e: "The fixed line outside a parabola used with the focus to define equal distances is the directrix.",
    }),
    withOriginalFigure("ch4", 3, {
      q: "In the parabola shown, what is the red segment passing through the focus with endpoints on the parabola and perpendicular to the axis of symmetry?",
      c: ["Focal length", "Directrix", "Latus rectum", "Chord of a circle"],
      a: 2,
      e: "The chord through the focus and perpendicular to the axis of symmetry of a conic is called the latus rectum.",
    }),
    withOriginalFigure("ch4", 4, {
      q: "In the hyperbola shown, what are the two dashed red crossing lines that the graph approaches forever without touching?",
      c: ["Directrices", "Conjugate axes", "Asymptotes", "Focal rays"],
      a: 2,
      e: "A line that a graph approaches more and more closely at infinite distance is called an asymptote.",
    }),
    withOriginalFigure("ch4", 5, {
      q: "In the circle shown with standard equation x² + y² = 25, how long is the red segment from the center to the circumference?",
      c: ["25 units", "5 units", "12.5 units", "√5 units"],
      a: 1,
      e: "For a circle centered at (0,0), the equation is x² + y² = r². Here r² = 25, so r = 5.",
    }),
    withOriginalFigure("ch4", 6, {
      q: "In the ellipse shown, what are the two red interior points on the major axis whose distance sum to any point on the ellipse is constant?",
      c: ["Vertices", "Minor-axis endpoints", "Foci", "Shared symmetry points"],
      a: 2,
      e: "By geometric definition, an ellipse is built from two fixed interior points called foci.",
    }),
    withOriginalFigure("ch4", 7, {
      q: "In the hyperbola shown, what is the thick red segment connecting the two vertices called?",
      c: ["Major axis", "Transverse axis", "Conjugate axis", "Latus rectum"],
      a: 1,
      e: "The segment connecting the two vertices of a hyperbola is called the transverse axis.",
    }),
    {
      q: "What condition must the eccentricity e of an ellipse satisfy?",
      c: ["e = 0", "0 < e < 1", "e = 1", "e > 1"],
      a: 1,
      e: "If e = 0, the conic is a circle. Between 0 and 1 gives an ellipse, e = 1 gives a parabola, and e > 1 gives a hyperbola.",
    },
    {
      q: "Which direction does the parabola (x − h)² = −12(y − k) open?",
      c: ["Upward", "Downward", "To the right", "To the left"],
      a: 1,
      e: "Because y is the variable to the first power, this is a vertical parabola. Since 4c is negative (−12), it opens downward.",
    },
  ],
  ch5: [
    {
      q: "In a right triangle, which ratio defines sine (sin)?",
      c: [
        "Opposite / adjacent",
        "Adjacent / hypotenuse",
        "Opposite / hypotenuse",
        "Hypotenuse / opposite",
      ],
      a: 2,
      e: "The standard memory rule is sin = opposite/hypotenuse, cos = adjacent/hypotenuse, and tan = opposite/adjacent.",
    },
    {
      q: "Cosecant (csc θ) is the reciprocal of which trigonometric function?",
      c: ["cos θ", "sin θ", "tan θ", "sec θ"],
      a: 1,
      e: "csc θ = 1 / sin θ, sec θ = 1 / cos θ, and cot θ = 1 / tan θ.",
    },
    {
      q: "What is sin 30°?",
      c: ["0", "1/2", "√3/2", "1"],
      a: 1,
      e: "From standard trigonometric angle values, sin 30° = 1/2, or 0.5.",
    },
    {
      q: "On the unit circle, the x-coordinate of a point at any angle corresponds to which trigonometric function?",
      c: ["sin θ", "cos θ", "tan θ", "sec θ"],
      a: 1,
      e: "On the unit circle, r = 1, so x = cos θ and y = sin θ.",
    },
    {
      q: "How many degrees is an angle of π radians?",
      c: ["90 degrees", "180 degrees", "270 degrees", "360 degrees"],
      a: 1,
      e: "A full circle is 2π radians, equal to 360 degrees. Therefore π radians equals 180 degrees.",
    },
    {
      q: "If θ is in Quadrant 2, which basic trigonometric function is positive?",
      c: ["cos θ", "tan θ", "sin θ", "All functions are negative"],
      a: 2,
      e: "In Quadrant 2, x is negative and y is positive. Since y represents sin, sin is positive while cos and tan are negative.",
    },
    {
      q: "Which trigonometric identity is always true for every angle θ?",
      c: ["sin θ + cos θ = 1", "sin² θ + cos² θ = 1", "sin² θ − cos² θ = 1", "tan² θ + 1 = sin² θ"],
      a: 1,
      e: "This is the Pythagorean identity for trigonometry: sin² θ + cos² θ = 1.",
    },
    {
      q: "The graph y = sin x repeats after what interval length, called its period?",
      c: ["π", "π/2", "2π", "4π"],
      a: 2,
      e: "The standard sine and cosine functions have period 2π radians for one full cycle.",
    },
    {
      q: "What is the amplitude of y = 4cos x?",
      c: ["1", "2", "4", "8"],
      a: 2,
      e: "Amplitude is the absolute value of the coefficient in front of the trig function. Here it is |4| = 4.",
    },
    {
      q: "How can tan θ be written as a ratio of other trigonometric functions?",
      c: ["cos θ / sin θ", "sin θ / cos θ", "1 / sec θ", "sin θ · cos θ"],
      a: 1,
      e: "From the definition opposite/adjacent, tan can be written as (opposite/hypotenuse) / (adjacent/hypotenuse), which is sin θ / cos θ.",
    },
  ],
  ch6: [
    {
      q: "What is the true geometric meaning of the derivative f'(x) at a point?",
      c: [
        "The area under the graph",
        "The slope of the tangent line to the curve at that point",
        "The shortest distance from the center",
        "A corner point of a step graph",
      ],
      a: 1,
      e: "A derivative is an instantaneous rate of change, which matches the slope of the tangent line to the graph at that point.",
    },
    {
      q: "What does a definite integral from x = a to b represent geometrically?",
      c: [
        "The average slope of the function",
        "The net area under the curve bounded by the x-axis from a to b",
        "The distance between two vertices",
        "A test for whether a function is continuous",
      ],
      a: 1,
      e: "Definite integration sums many small areas. The result is the area under the graph over the specified interval.",
    },
    {
      q: "If f(x) = 12 is a constant function, what is f'(x)?",
      c: ["12", "1", "0", "Undefined because there is no variable x"],
      a: 2,
      e: "A constant function does not change. Its graph is horizontal, so its slope and derivative are always 0.",
    },
    {
      q: "If the first derivative is always positive on an interval, f'(x) > 0, what does the graph do on that interval?",
      c: [
        "It is decreasing",
        "It is increasing",
        "It is a horizontal line parallel to the x-axis",
        "It is discontinuous",
      ],
      a: 1,
      e: "A positive derivative means y increases as x increases, so the graph rises and the function is increasing.",
    },
    {
      q: "How is integration related to differentiation?",
      c: [
        "They are the same repeated process",
        "They are inverse processes",
        "They are unrelated mathematically",
        "They multiply results by an infinite limit",
      ],
      a: 1,
      e: "By the Fundamental Theorem of Calculus, integration and differentiation are inverse processes.",
    },
    {
      q: "At a relative maximum or relative minimum on a smooth continuous curve, what is the slope of the tangent line?",
      c: ["It is maximum", "It equals 1", "It equals 0", "It is negative"],
      a: 2,
      e: "At a smooth relative high or low point, the tangent line is horizontal, so the slope or f'(x) is 0.",
    },
    {
      q: "In physics, if we differentiate a position function s(t) with respect to time once, ds/dt, what quantity do we get?",
      c: ["Acceleration", "Velocity", "Mass", "Kinetic energy"],
      a: 1,
      e: "The instantaneous rate of change of position with respect to time is velocity. Differentiating velocity gives acceleration.",
    },
    {
      q: "What does lim (x→5) f(x) = 10 mean?",
      c: [
        "x must equal exactly 5 for the function value to be 10",
        "As x gets very close to 5 from both sides, f(x) tends toward 10",
        "The maximum value of f(x) is 10",
        "The function is discontinuous at x = 5",
      ],
      a: 1,
      e: "A limit describes the trend of function values as the variable approaches a point, regardless of the actual value or definition at x = 5.",
    },
    {
      q: "What is the standard derivative formula for d/dx [xⁿ]?",
      c: ["xⁿ⁺¹", "n · xⁿ⁻¹", "n · xⁿ", "xⁿ / n"],
      a: 1,
      e: "The power rule says to bring the exponent down in front and reduce the original exponent by 1, giving n·x^(n−1).",
    },
    {
      q: "For limits with an indeterminate form such as 0/0, whose rule can differentiate numerator and denominator separately to help find the limit?",
      c: [
        "Newton's Law",
        "L'Hôpital's Rule",
        "Pascal's Theorem",
        "Gauss's Law",
      ],
      a: 1,
      e: "L'Hôpital's Rule states that for limits of forms such as 0/0 or ∞/∞, differentiating the numerator and denominator separately can help evaluate the limit.",
    },
  ],
} satisfies Record<string, MathQuestion[]>;

export const MATH_CHAPTERS_BY_LANGUAGE: Record<Language, MathChapter[]> = {
  en: MATH_CHAPTERS_EN,
  th: MATH_CHAPTERS,
};

export const MATH_QUESTIONS_BY_LANGUAGE: Record<
  Language,
  Record<string, MathQuestion[]>
> = {
  en: MATH_QUESTIONS_EN,
  th: MATH_QUESTIONS,
};

export const MATH_KEYS_BY_LANGUAGE: Record<Language, string[]> = {
  en: ["A", "B", "C", "D"],
  th: MATH_KEYS,
};

export function getMathPretestContent(language: Language) {
  return {
    chapters: MATH_CHAPTERS_BY_LANGUAGE[language],
    keys: MATH_KEYS_BY_LANGUAGE[language],
    questions: MATH_QUESTIONS_BY_LANGUAGE[language],
  };
}
