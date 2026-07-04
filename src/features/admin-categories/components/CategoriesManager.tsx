"use client";

import { useState } from "react";

import { AdminHeader } from "@/components/layout";
import { Button, Icon } from "@/components/ui";
import { useAdminCategories } from "../hooks/useAdminCategories";

import { CategoryForm } from "./CategoryForm";
import { CategoryList } from "./CategoryList";

export function CategoriesManager() {
  const { categories, loading, error, create, update, remove } = useAdminCategories();
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      <AdminHeader
        title="카테고리 관리"
        description="훈련 영역(카테고리)을 추가·수정·삭제합니다. 카테고리는 문제·자료·점수와 연결됩니다."
      />

      {showForm ? (
        <CategoryForm onCreate={create} onCancel={() => setShowForm(false)} />
      ) : (
        <Button className="self-start" onClick={() => setShowForm(true)}>
          <Icon name="plus" size={16} /> 새 카테고리
        </Button>
      )}

      <CategoryList
        categories={categories}
        loading={loading}
        error={error}
        onUpdate={update}
        onDelete={remove}
      />
    </div>
  );
}
