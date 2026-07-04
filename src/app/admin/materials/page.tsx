import { AdminHeader } from "@/components/layout";
import { LibraryManager } from "@/features/library";

export default function AdminMaterialsPage() {
  return (
    <>
      <AdminHeader
        title="학습 자료"
        description="교범·교리 자료를 업로드하면 AI가 이를 근거로 문항을 생성합니다"
      />
      <div className="p-6 md:p-8">
        <LibraryManager />
      </div>
    </>
  );
}
