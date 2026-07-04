// 프론트 전용 mock: 관리자가 업로드한 교범/교리 자료.
import type { CategoryCode } from "@/features/categories";

export interface LibraryItem {
  id: string;
  title: string;
  category: CategoryCode;
  pages: number;
  isActive: boolean;
  uploadedAt: string;
}

const LIBRARY: LibraryItem[] = [
  { id: "l1", title: "FM 7-8 보병소대 전술", category: "TAC", pages: 32, isActive: true, uploadedAt: "2026-05-02" },
  { id: "l2", title: "K2 소총 정비 매뉴얼", category: "EQP", pages: 15, isActive: true, uploadedAt: "2026-05-04" },
  { id: "l3", title: "TCCC 응급처치 교범", category: "MED", pages: 28, isActive: true, uploadedAt: "2026-05-10" },
  { id: "l4", title: "화생방 대응 매뉴얼", category: "NBC", pages: 20, isActive: false, uploadedAt: "2026-05-18" },
  { id: "l5", title: "FM 3-09 화력 지원 절차", category: "FIR", pages: 24, isActive: true, uploadedAt: "2026-06-01" },
];

export function getLibrary(): LibraryItem[] {
  return LIBRARY;
}
