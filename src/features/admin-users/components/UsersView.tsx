"use client";

import { AdminHeader } from "@/components/layout";
import { AdminStatus } from "@/features/admin-dashboard";
import { useTrainees } from "../hooks/useTrainees";
import { UserTable } from "./UserTable";

/** 장병 관리 화면 (데이터는 useTrainees 훅이 담당). */
export function UsersView() {
  const { trainees, loading, error } = useTrainees();

  return (
    <>
      <AdminHeader
        title="장병 관리"
        description={loading ? "불러오는 중..." : `총 ${trainees.length}명`}
      />
      <div className="p-6 md:p-8">
        {loading ? (
          <AdminStatus message="장병 목록을 불러오는 중..." />
        ) : error ? (
          <AdminStatus message={error.message} isError />
        ) : trainees.length === 0 ? (
          <AdminStatus message="가입한 장병이 아직 없습니다." />
        ) : (
          <UserTable trainees={trainees} />
        )}
      </div>
    </>
  );
}
