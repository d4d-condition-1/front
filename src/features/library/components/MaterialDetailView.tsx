"use client";

import { useState } from "react";

import { Button, Icon, Spinner } from "@/components/ui";
import { getCategory } from "@/features/categories";
import { useMaterialHub } from "../hooks/useMaterialHub";
import { EMPTY_QUESTION, QuestionForm, type QuestionFormValue } from "./QuestionForm";
import { MaterialHeader } from "./MaterialHeader";
import { MaterialBody } from "./MaterialBody";
import { MaterialAIGenerate } from "./MaterialAIGenerate";
import { MaterialQuestions } from "./MaterialQuestions";

interface Editing {
  value: QuestionFormValue;
  editingId?: string;
  fromDraft?: number;
}

export function MaterialDetailView({ materialId }: { materialId: string }) {
  const hub = useMaterialHub(materialId);
  const { material, questions } = hub;

  const [editing, setEditing] = useState<Editing | null>(null);

  if (hub.loading) {
    return (
      <div className="grid flex-1 place-items-center py-24 text-primary-500">
        <Spinner size={28} />
      </div>
    );
  }
  if (hub.error || !material) {
    return (
      <div className="grid flex-1 place-items-center px-8 py-24 text-center text-sm text-ink-muted">
        {hub.error ?? "자료를 찾을 수 없습니다."}
      </div>
    );
  }

  const cat = getCategory(material.category);

  async function onSaveQuestion(input: Parameters<typeof hub.saveQuestion>[0], editingId?: string) {
    await hub.saveQuestion(input, editingId);
    setEditing(null);
  }

  return (
    <div className="flex flex-col gap-5 p-6 md:p-8">
      <MaterialHeader material={material} questionCount={questions.length} />

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Left: body + AI generation */}
        <div className="flex flex-col gap-5">
          <MaterialBody
            material={material}
            onSaveBody={hub.saveBody}
            onMaterialUpdated={hub.updateMaterial}
          />
          <MaterialAIGenerate
            material={material}
            onReviewDraft={(value, draftIndex) =>
              setEditing({ value, fromDraft: draftIndex })
            }
          />
        </div>

        {/* Right: edit form + question list */}
        <div className="flex flex-col gap-5">
          {editing ? (
            <QuestionForm
              key={editing.editingId ?? `draft-${editing.fromDraft}`}
              materialId={material.id}
              categoryName={cat.name}
              initial={editing.value}
              editingId={editing.editingId}
              onSave={onSaveQuestion}
              onCancel={() => setEditing(null)}
            />
          ) : (
            <Button
              variant="secondary"
              onClick={() => setEditing({ value: { ...EMPTY_QUESTION } })}
              className="self-start"
            >
              <Icon name="plus" size={16} /> 문제 직접 추가
            </Button>
          )}

          <MaterialQuestions
            questions={questions}
            onEdit={(value, editingId) => setEditing({ value, editingId })}
            onToggle={hub.toggleQuestion}
            onRemove={hub.removeQuestion}
            onGenImagePreview={hub.genImagePreview}
            onConfirmImage={hub.confirmImage}
            onRemoveImage={hub.removeImage}
            onEditImage={hub.editImage}
          />
        </div>
      </div>
    </div>
  );
}
