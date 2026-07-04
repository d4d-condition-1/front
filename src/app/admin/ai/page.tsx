import { AdminHeader } from "@/components/layout";
import { AiManager } from "@/features/ai-providers";

export default function AdminAiPage() {
  return (
    <>
      <AdminHeader
        title="AI 연동"
        description="서비스에 사용할 AI API를 등록하고 관리합니다"
      />
      <div className="p-6 md:p-8">
        <AiManager />
      </div>
    </>
  );
}
