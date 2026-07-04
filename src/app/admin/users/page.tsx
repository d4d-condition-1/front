import { AdminHeader } from "@/components/layout";
import { getAdminUsers, UserTable } from "@/features/admin-users";

export default function AdminUsersPage() {
  const users = getAdminUsers();

  return (
    <>
      <AdminHeader
        title="사용자 관리"
        description={`총 ${users.length}명`}
      />
      <div className="p-6 md:p-8">
        <UserTable users={users} />
      </div>
    </>
  );
}
