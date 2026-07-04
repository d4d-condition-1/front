export type Category = "LC" | "RC";
export type Level = "기초" | "중급" | "실전";

export interface Material {
  id: string;
  title: string;
  category: Category;
  part: string; // 예: "Part 5"
  level: Level;
  questionCount: number;
  minutes: number;
  description: string;
  progress: number; // 0~100, 학습 진척(mock)
  tag?: string;
}

export interface Question {
  id: string;
  materialId: string;
  part: string;
  passage?: string; // 지문(있을 수 있음)
  prompt: string;
  choices: string[]; // 4지선다
  answerIndex: number;
  explanation: string;
}
