"use client";

import { Badge, Button, Card, Icon } from "@/components/ui";
import { CATEGORIES } from "@/features/categories";
import type { AdminQuestion } from "../api/questionApi";

interface Props {
  questions: AdminQuestion[];
  onEdit: (q: AdminQuestion) => void;
  onToggle: (q: AdminQuestion) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
}

export function QuestionList({ questions, onEdit, onToggle, onRemove }: Props) {
  const activeCount = questions.filter((q) => q.active).length;

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-ink-faint">
        총 {questions.length}문항 · 출제 활성 {activeCount}문항
      </p>

      {questions.length === 0 && (
        <Card className="py-10 text-center text-sm text-ink-faint">
          등록된 문제가 없습니다. 우측 폼에서 첫 문제를 출제하세요.
        </Card>
      )}

      {CATEGORIES.map((cat) => {
        const items = questions.filter((q) => q.category === cat.code);
        if (!items.length) return null;
        const catActive = items.filter((q) => q.active).length;
        return (
          <section key={cat.code} className="flex flex-col gap-2.5">
            <div className="flex items-center gap-2.5">
              <span
                className="grid h-6 w-8 place-items-center rounded text-[10px] font-bold text-white"
                style={{ backgroundColor: cat.color }}
              >
                {cat.code}
              </span>
              <h2 className="text-sm font-bold text-ink">{cat.name}</h2>
              <span className="tabular text-xs text-ink-faint">
                {items.length}문항 · 활성 {catActive}
              </span>
            </div>

            {items.map((q) => (
              <Card key={q.id} className={q.active ? "" : "opacity-55"}>
                <div className="flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <Badge tone="slate">Lv.{q.difficulty}</Badge>
                      <Badge tone={q.type === "situational" ? "amber" : "primary"}>
                        {q.type === "situational" ? "상황형" : "선택형"}
                      </Badge>
                      <span className="tabular text-xs text-ink-faint">{q.points}점</span>
                      {q.materialTitle && (
                        <span className="inline-flex items-center gap-1 text-xs text-ink-muted">
                          <Icon name="book" size={12} /> {q.materialTitle}
                        </span>
                      )}
                      {!q.active && <Badge tone="red">비활성</Badge>}
                    </div>
                    <p className="truncate font-medium text-ink">{q.question}</p>
                    <p className="mt-0.5 truncate text-xs text-ink-faint">
                      정답: {q.options[q.answerIndex]}
                      {q.reference ? ` · ${q.reference}` : ""}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" onClick={() => onEdit(q)}>
                        수정
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => onToggle(q)}>
                        {q.active ? "비활성" : "활성"}
                      </Button>
                    </div>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => {
                        if (confirm("이 문제를 삭제할까요? (답안 이력이 있으면 비활성 처리됩니다)"))
                          onRemove(q.id).catch((err) =>
                            alert(err instanceof Error ? err.message : "삭제 실패"),
                          );
                      }}
                    >
                      삭제
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </section>
        );
      })}
    </div>
  );
}
