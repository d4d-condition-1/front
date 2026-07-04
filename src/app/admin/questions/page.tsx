import { AdminHeader } from "@/components/layout";
import { QuestionsManager } from "@/features/admin-questions";

export default function AdminQuestionsPage() {
  return (
    <>
      <AdminHeader
        title="문제 은행"
        description="문제를 출제하면 활성 상태에서 훈련 세션에 자동 출제되고, 서버가 채점합니다"
      />
      <div className="p-6 md:p-8">
        <QuestionsManager />
      </div>
    </>
  );
}
