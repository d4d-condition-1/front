"use client";

import { useState } from "react";
import { Badge, Button, Icon } from "@/components/ui";
import { CATEGORIES } from "@/features/categories";
import { archiveArticle, deleteArticle, articleToMaterial, type FeedArticle } from "../api/feedsApi";

const inputCls =
  "w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm text-ink outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/15";

interface Props {
  article: FeedArticle;
  onUpdated: (a: FeedArticle) => void;
  onDeleted: (id: string) => void;
}

export function ArticleCard({ article: a, onUpdated, onDeleted }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [converting, setConverting] = useState(false);
  const [convertCategory, setConvertCategory] = useState("");

  async function onArchiveToggle() {
    try {
      const updated = await archiveArticle(a.id, !a.isArchived);
      onUpdated(updated);
    } catch { /* ignore */ }
  }

  async function onDelete() {
    if (!confirm("이 아티클을 삭제할까요?")) return;
    try {
      await deleteArticle(a.id);
      onDeleted(a.id);
    } catch { /* ignore */ }
  }

  async function onConvert() {
    if (!convertCategory) return alert("카테고리를 선택하세요.");
    setConverting(true);
    try {
      const result = await articleToMaterial(a.id, { category: convertCategory as any });
      alert(`"${result.title}" 교안으로 변환 완료`);
      onUpdated({ ...a, isArchived: true, materialId: result.materialId });
      setExpanded(false);
    } catch (e) {
      alert(e instanceof Error ? e.message : "변환 실패");
    } finally { setConverting(false); }
  }

  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-line bg-surface p-4">
      <div className="flex items-start gap-3">
        {a.thumbnail && (
          <img src={a.thumbnail} alt="" className="h-16 w-28 shrink-0 rounded-lg object-cover" />
        )}
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-1.5">
            {a.channelName && <Badge tone="slate">{a.channelName}</Badge>}
            {a.isArchived && <Badge tone="green">아카이브</Badge>}
            {a.materialId && <Badge tone="primary">교안</Badge>}
          </div>
          <button
            className="text-left text-sm font-semibold text-ink hover:text-primary-400"
            onClick={() => setExpanded(!expanded)}
          >
            {a.title}
          </button>
          <div className="mt-0.5 flex items-center gap-2 text-xs text-ink-faint">
            {a.publishedAt && <span>{new Date(a.publishedAt).toLocaleDateString("ko")}</span>}
            {a.sourceUrl && (
              <a href={a.sourceUrl} target="_blank" rel="noopener noreferrer" className="hover:text-primary-400 hover:underline">원문</a>
            )}
            {a.images.length > 0 && <span>이미지 {a.images.length}개</span>}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Button variant="ghost" size="sm" onClick={onArchiveToggle}>
            {a.isArchived ? "해제" : "아카이브"}
          </Button>
          {!a.materialId && (
            <Button variant="ghost" size="sm" onClick={() => setExpanded(true)}>교안 변환</Button>
          )}
          <Button variant="ghost" size="sm" onClick={onDelete}>
            <Icon name="x" size={14} />
          </Button>
        </div>
      </div>

      {expanded && (
        <div className="flex flex-col gap-3 border-t border-line/30 pt-3">
          <p className="max-h-60 overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed text-ink-muted">
            {a.body.slice(0, 2000)}{a.body.length > 2000 ? "…" : ""}
          </p>

          {!a.materialId && (
            <div className="flex items-end gap-2 rounded-xl bg-surface-2 p-3">
              <label className="flex flex-1 flex-col gap-1">
                <span className="text-xs font-medium text-ink-muted">교안 카테고리</span>
                <select value={convertCategory} onChange={(e) => setConvertCategory(e.target.value)} className={inputCls}>
                  <option value="">선택</option>
                  {CATEGORIES.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
                </select>
              </label>
              <Button size="sm" loading={converting} onClick={onConvert}>교안으로 변환</Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
