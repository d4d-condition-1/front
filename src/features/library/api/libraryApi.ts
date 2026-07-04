// 교범/교리 자료 관리 (관리자용, 서버 /api/admin/materials)
import { apiFetch } from "@/lib/api";
import type { CategoryCode } from "@/features/categories";

export interface LibraryItem {
  id: string;
  title: string;
  category: CategoryCode;
  pages: number;
  hasBody?: boolean; // 본문 존재 여부 (목록)
  isActive: boolean;
  uploadedAt: string;
}

/** 단건(본문 포함) — 자료 상세 화면용 */
export interface MaterialDetail extends LibraryItem {
  body: string;
  hasPdf: boolean;
  pdfFilename: string | null;
}

export interface LibraryItemInput {
  title: string;
  category: CategoryCode;
  pages: number;
  body?: string;
}

/** AI 문항 초안 (저장 전 — 서버 스키마와 동일 형태) */
export interface DraftQuestion {
  type: "multiple_choice" | "situational";
  difficulty: number;
  situation: string | null;
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
  reference: string;
}

export interface GenerateResult {
  materialId: string;
  category: CategoryCode;
  drafts: DraftQuestion[];
}

export function fetchLibrary(): Promise<LibraryItem[]> {
  return apiFetch<LibraryItem[]>("/api/admin/materials");
}

export function fetchMaterial(id: string): Promise<MaterialDetail> {
  return apiFetch<MaterialDetail>(`/api/admin/materials/${id}`);
}

/** AI 문항 초안 생성 (저장 X — 검수 후 문제 은행에 저장) */
export function generateQuestions(
  materialId: string,
  opts: { count?: number; difficulty?: number; instructions?: string },
): Promise<GenerateResult> {
  return apiFetch<GenerateResult>(
    `/api/admin/materials/${materialId}/generate-questions`,
    { method: "POST", body: JSON.stringify(opts) },
  );
}

export function createLibraryItem(
  input: LibraryItemInput,
): Promise<LibraryItem> {
  return apiFetch<LibraryItem>("/api/admin/materials", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateLibraryItem(
  id: string,
  patch: Partial<LibraryItemInput> & { isActive?: boolean },
): Promise<LibraryItem> {
  return apiFetch<LibraryItem>(`/api/admin/materials/${id}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}

export function deleteLibraryItem(id: string): Promise<void> {
  return apiFetch<void>(`/api/admin/materials/${id}`, { method: "DELETE" });
}

/** PDF 파일을 base64로 변환해 업로드 */
export async function uploadPdf(materialId: string, file: File): Promise<MaterialDetail> {
  const data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("파일 읽기에 실패했습니다."));
    reader.readAsDataURL(file);
  });
  return apiFetch<MaterialDetail>(`/api/admin/materials/${materialId}/upload-pdf`, {
    method: "POST",
    body: JSON.stringify({ filename: file.name, data }),
  });
}

/** PDF 삭제 */
export function deletePdf(materialId: string): Promise<MaterialDetail> {
  return apiFetch<MaterialDetail>(`/api/admin/materials/${materialId}/pdf`, { method: "DELETE" });
}
