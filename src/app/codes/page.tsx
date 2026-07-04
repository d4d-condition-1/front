import { CodesManager } from "@/features/unit-codes";

/** 비공개 부대코드 발급 페이지 (랜딩 우하단 5탭으로 진입). 서버가 슈퍼관리자 인증을 강제한다. */
export default function CodesPage() {
  return <CodesManager />;
}
