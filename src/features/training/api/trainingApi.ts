// 프론트 전용 mock 문항 은행. 실제로는 AI가 교범 기반으로 생성한다.
import {
  getMyScores,
  levelForScore,
  weakestCategory,
  type CategoryCode,
} from "@/features/categories";

export type QType = "multiple_choice" | "situational";

export interface TrainingQuestion {
  id: string;
  category: CategoryCode;
  difficulty: number; // 1~5
  type: QType;
  situation?: string;
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
  reference: string;
  points: number; // 정답 시 획득 점수
}

const BANK: TrainingQuestion[] = [
  {
    id: "fir1",
    category: "FIR",
    difficulty: 3,
    type: "situational",
    situation:
      "당신은 소대 2분대장입니다. 전방 500m에 적 기관총 진지가 확인되었습니다. 좌측 200m에 능선이 있고, 분대원 8명 중 2명이 부상 상태입니다.",
    question: "적 화력에 대응하기 위한 가장 적절한 행동은?",
    options: [
      "정면 돌격으로 적 진지 제압",
      "좌측 능선으로 우회 기동",
      "현 위치에서 화력 지원 요청",
      "후방으로 철수 후 재편성",
    ],
    answerIndex: 1,
    explanation:
      "적의 정면 화력이 우세한 상황에서는 우회 기동을 통한 측면 공격이 교리적으로 적절합니다. 부상자가 있는 상태에서 정면 돌격은 추가 피해를 야기합니다.",
    reference: "FM 7-8, 3장 분대 공격 절차",
    points: 6,
  },
  {
    id: "fir2",
    category: "FIR",
    difficulty: 2,
    type: "multiple_choice",
    question: "화력 지원 요청(Call for Fire) 시 가장 먼저 전달하는 요소는?",
    options: ["표적 위치", "관측자 식별/경고", "탄종 요청", "효력사 요청"],
    answerIndex: 1,
    explanation:
      "화력 지원 요청은 '관측자 식별 및 경고(Observer ID & Warning Order)'로 시작합니다. 이후 표적 위치, 표적 묘사, 사격 통제 순으로 진행합니다.",
    reference: "FM 3-09, 화력 지원 절차",
    points: 5,
  },
  {
    id: "tac1",
    category: "TAC",
    difficulty: 3,
    type: "situational",
    situation:
      "야간 수색정찰 중 전방 100m에서 미상의 인원 3명이 접근 중입니다. 아군 여부가 불확실합니다.",
    question: "가장 우선해야 할 행동은?",
    options: [
      "즉시 사격하여 제압",
      "은거 후 관측하며 수하 절차 실시",
      "조명탄 발사",
      "큰 소리로 정지 명령",
    ],
    answerIndex: 1,
    explanation:
      "적아 식별이 불확실할 때는 은거·관측 후 수하(암구호) 절차로 식별하는 것이 원칙입니다. 성급한 사격은 오인 교전을 유발합니다.",
    reference: "야전교범 수색정찰, 2장",
    points: 6,
  },
  {
    id: "tac2",
    category: "TAC",
    difficulty: 2,
    type: "multiple_choice",
    question: "분대 이동 시 개활지를 통과할 때 적절한 대형은?",
    options: ["일렬 종대", "산개(쐐기) 대형", "밀집 대형", "2열 종대"],
    answerIndex: 1,
    explanation:
      "개활지에서는 피해를 최소화하기 위해 간격을 벌린 산개(쐐기) 대형이 적절합니다.",
    reference: "FM 7-8, 2장 이동 대형",
    points: 5,
  },
  {
    id: "med1",
    category: "MED",
    difficulty: 3,
    type: "situational",
    situation:
      "교전 중 아군 1명이 대퇴부 총상으로 다량 출혈 중입니다. 아직 적 화력이 미치는 지역입니다.",
    question: "TCCC 절차상 가장 먼저 할 행동은?",
    options: [
      "기도 확보",
      "엄폐물로 이동 후 지혈대 적용",
      "현장에서 즉시 붕대 처치",
      "후송 요청",
    ],
    answerIndex: 1,
    explanation:
      "교전 중(Care Under Fire) 단계에서는 화력 하 노출을 최소화하고 엄폐 후 사지 대량출혈에 지혈대를 우선 적용합니다.",
    reference: "TCCC 가이드라인, Care Under Fire",
    points: 6,
  },
  {
    id: "com1",
    category: "COM",
    difficulty: 2,
    type: "multiple_choice",
    question: "무전 보고 SALUTE 양식에서 'A'가 의미하는 것은?",
    options: ["Activity(활동)", "Area(지역)", "Ammo(탄약)", "Alert(경보)"],
    answerIndex: 0,
    explanation:
      "SALUTE = Size, Activity, Location, Unit, Time, Equipment. 'A'는 적의 활동(Activity)입니다.",
    reference: "통신 보고 양식, SALUTE",
    points: 5,
  },
  {
    id: "ter1",
    category: "TER",
    difficulty: 2,
    type: "multiple_choice",
    question: "군사지도에서 6자리 좌표는 어느 정도 정밀도를 의미하는가?",
    options: ["1km", "100m", "10m", "1m"],
    answerIndex: 1,
    explanation: "6자리 좌표(예: 123456)는 100m 정밀도를 나타냅니다. 8자리는 10m입니다.",
    reference: "독도법, 좌표 체계",
    points: 5,
  },
  {
    id: "nbc1",
    category: "NBC",
    difficulty: 2,
    type: "situational",
    situation: "훈련 중 화학 경보(가스! 가스! 가스!)가 발령되었습니다.",
    question: "가장 먼저 취해야 할 조치는?",
    options: [
      "9초 내 보호면 착용",
      "제독소로 이동",
      "지휘관에게 보고",
      "오염 여부 탐지",
    ],
    answerIndex: 0,
    explanation:
      "화학 경보 시 최우선 조치는 즉시(9초 이내) 보호면(방독면) 착용입니다. 이후 나머지 개인보호 장비를 착용합니다.",
    reference: "화생방 대응 매뉴얼, 개인보호",
    points: 5,
  },
  {
    id: "eqp1",
    category: "EQP",
    difficulty: 2,
    type: "multiple_choice",
    question: "K2 소총 기능 고장 시 즉각 조치(Immediate Action)의 첫 단계는?",
    options: ["탄알집 제거", "장전 손잡이 후퇴/전진(재장전)", "총기 분해", "약실 확인"],
    answerIndex: 1,
    explanation:
      "즉각 조치는 'Tap-Rack' — 탄알집을 치고 장전손잡이를 당겨 재장전하는 것이 첫 단계입니다.",
    reference: "K2 소총 교범, 기능고장 처치",
    points: 5,
  },
  {
    id: "tac3",
    category: "TAC",
    difficulty: 4,
    type: "situational",
    situation:
      "소대가 방어 진지를 편성 중입니다. 전방은 개활지, 좌측면은 하천, 우측면은 숲입니다. 야간 적 침투가 예상됩니다.",
    question: "화기 배치로 가장 적절한 것은?",
    options: [
      "전 화기를 정면에 집중",
      "우측 숲 방향에 경계·교차사계 구성",
      "좌측 하천에 화력 집중",
      "후방 경계에 주력 배치",
    ],
    answerIndex: 1,
    explanation:
      "하천은 자연 장애물로 접근이 제한되나, 우측 숲은 은폐된 침투로가 됩니다. 취약한 우측에 경계와 교차사계를 구성해야 합니다.",
    reference: "FM 7-8, 4장 방어 진지 편성",
    points: 8,
  },
];

/** 진단 테스트: 각 카테고리를 폭넓게 커버하는 문항 (mock ~10문항) */
export function getDiagnosticQuestions(): TrainingQuestion[] {
  const byCat = new Map<CategoryCode, TrainingQuestion[]>();
  for (const q of BANK) {
    byCat.set(q.category, [...(byCat.get(q.category) ?? []), q]);
  }
  // 카테고리별 1문항씩 우선, 남으면 추가
  const picked: TrainingQuestion[] = [];
  for (const list of byCat.values()) picked.push(list[0]);
  for (const list of byCat.values()) if (list[1]) picked.push(list[1]);
  return picked.slice(0, 10);
}

/** 적응형 훈련: 가장 약한 카테고리를 우선 출제 (mock) */
export function getAdaptiveQuestions(): TrainingQuestion[] {
  const scores = getMyScores();
  const weak = weakestCategory(scores).code;
  const target = levelForScore(
    scores.find((s) => s.code === weak)!.score,
  );
  const primary = BANK.filter((q) => q.category === weak);
  const rest = BANK.filter((q) => q.category !== weak);
  // 약점 카테고리 문항 → 나머지 순, 목표 난이도 근처 우선
  const ordered = [...primary, ...rest].sort(
    (a, b) => Math.abs(a.difficulty - target) - Math.abs(b.difficulty - target),
  );
  return ordered.slice(0, 8);
}
