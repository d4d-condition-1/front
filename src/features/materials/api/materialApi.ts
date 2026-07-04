// 프론트 전용 mock 데이터. 실제 백엔드 연결 시 이 함수들만 apiFetch 로 교체한다.
import type { Material, Question } from "../types";

const MATERIALS: Material[] = [
  {
    id: "m1",
    title: "Part 5 · 문법 핵심 100제",
    category: "RC",
    part: "Part 5",
    level: "중급",
    questionCount: 20,
    minutes: 15,
    description: "빈칸 채우기로 익히는 토익 필수 문법 포인트.",
    progress: 60,
    tag: "추천",
  },
  {
    id: "m2",
    title: "Part 2 · 응답 문제 집중반",
    category: "LC",
    part: "Part 2",
    level: "기초",
    questionCount: 15,
    minutes: 12,
    description: "질문 유형별 응답 패턴을 귀로 익힌다.",
    progress: 25,
  },
  {
    id: "m3",
    title: "Part 7 · 단일 지문 독해",
    category: "RC",
    part: "Part 7",
    level: "실전",
    questionCount: 10,
    minutes: 20,
    description: "이메일·공지문 지문에서 정답 근거 찾기.",
    progress: 0,
    tag: "신규",
  },
  {
    id: "m4",
    title: "Part 1 · 사진 묘사 기초",
    category: "LC",
    part: "Part 1",
    level: "기초",
    questionCount: 12,
    minutes: 10,
    description: "사진 속 인물·사물 묘사 표현 정리.",
    progress: 100,
  },
  {
    id: "m5",
    title: "Part 6 · 장문 빈칸",
    category: "RC",
    part: "Part 6",
    level: "중급",
    questionCount: 16,
    minutes: 14,
    description: "문맥으로 푸는 어휘·문법·문장 삽입.",
    progress: 40,
  },
  {
    id: "m6",
    title: "Part 3 · 대화 문제 실전",
    category: "LC",
    part: "Part 3",
    level: "실전",
    questionCount: 18,
    minutes: 18,
    description: "화자 의도와 세부 정보 동시에 잡기.",
    progress: 10,
  },
];

const QUESTIONS: Question[] = [
  {
    id: "q1",
    materialId: "m1",
    part: "Part 5",
    prompt:
      "The marketing team ______ the new campaign before the end of this quarter.",
    choices: ["complete", "completes", "will complete", "completing"],
    answerIndex: 2,
    explanation:
      "'before the end of this quarter'로 미래 시점을 나타내므로 미래시제 'will complete'가 정답입니다.",
  },
  {
    id: "q2",
    materialId: "m1",
    part: "Part 5",
    prompt:
      "All employees must submit their reports ______ Friday afternoon.",
    choices: ["by", "until", "since", "during"],
    answerIndex: 0,
    explanation:
      "'~까지 (완료)'의 마감 기한은 'by'를 씁니다. 'until'은 동작의 지속을 의미해 부적절합니다.",
  },
  {
    id: "q3",
    materialId: "m1",
    part: "Part 5",
    prompt:
      "The manager was highly ______ with the quarterly sales results.",
    choices: ["satisfy", "satisfied", "satisfying", "satisfaction"],
    answerIndex: 1,
    explanation:
      "감정을 느끼는 주체(사람)는 과거분사 'satisfied'로 수식합니다.",
  },
  {
    id: "q4",
    materialId: "m1",
    part: "Part 5",
    prompt:
      "Please contact the front desk ______ you have any questions.",
    choices: ["although", "if", "unless", "whereas"],
    answerIndex: 1,
    explanation:
      "'질문이 있으면 연락하라'는 조건이므로 'if'가 자연스럽습니다.",
  },
  {
    id: "q5",
    materialId: "m1",
    part: "Part 5",
    prompt:
      "The conference room is ______ larger than the one on the third floor.",
    choices: ["very", "much", "so", "too"],
    answerIndex: 1,
    explanation:
      "비교급(larger)을 강조할 때는 'much'를 씁니다. 'very'는 비교급을 수식하지 못합니다.",
  },
  {
    id: "q6",
    materialId: "m3",
    part: "Part 7",
    passage:
      "NOTICE: The building elevators will undergo scheduled maintenance on Saturday from 8 A.M. to 2 P.M. During this time, please use the stairs. We apologize for any inconvenience.",
    prompt: "What is the purpose of the notice?",
    choices: [
      "To announce a new building",
      "To inform about elevator maintenance",
      "To advertise a stair-climbing event",
      "To request feedback from tenants",
    ],
    answerIndex: 1,
    explanation:
      "공지문은 토요일 엘리베이터 점검을 알리는 내용이므로 (B)가 정답입니다.",
  },
];

export function getMaterials(): Material[] {
  return MATERIALS;
}

export function getMaterial(id: string): Material | undefined {
  return MATERIALS.find((m) => m.id === id);
}

export function getQuestions(materialId: string): Question[] {
  const list = QUESTIONS.filter((q) => q.materialId === materialId);
  // mock: 해당 자료에 전용 문항이 없으면 Part 5 문제로 대체
  return list.length > 0 ? list : QUESTIONS.filter((q) => q.materialId === "m1");
}
