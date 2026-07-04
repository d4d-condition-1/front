import { AdminHeader } from "@/components/layout";
import { getTrainees, UserTable } from "@/features/admin-users";

export default function AdminUsersPage() {
  const trainees = getTrainees();

  return (
    <>
      <AdminHeader title="장병 관리" description={`총 ${trainees.length}명`} />
      <div className="p-6 md:p-8">
        <UserTable trainees={trainees} />
      </div>
    </>
  );
}
