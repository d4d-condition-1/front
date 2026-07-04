"use client";

import { useState } from "react";
import { Button, Card } from "@/components/ui";
import { createArticle, type FeedArticle } from "../api/feedsApi";

const inputCls =
  "w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm text-ink outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/15";

interface Props {
  onCreated: (a: FeedArticle) => void;
  onCancel: () => void;
}

export function ArticleForm({ onCreated, onCancel }: Props) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [url, setUrl] = useState("");
  const [adding, setAdding] = useState(false);

  async function onSubmit() {
    if (!title.trim()) return;
    setAdding(true);
    try {
      const isHtml = body.includes("<") && body.includes(">");
      const article = await createArticle({
        title: title.trim(),
        body: isHtml ? undefined : body.trim(),
        bodyHtml: isHtml ? body.trim() : undefined,
        sourceUrl: url.trim() || undefined,
      });
      onCreated(article);
    } catch { /* ignore */ }
    finally { setAdding(false); }
  }

  return (
    <Card className="flex flex-col gap-3">
      <p className="font-bold text-ink">수동 아티클 등록</p>
      <p className="text-xs text-ink-muted">
        스크래핑이 안 되는 경우 직접 제목과 본문을 붙여넣을 수 있습니다. HTML도 지원합니다.
      </p>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="제목"
        className={inputCls}
      />
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="본문 (텍스트 또는 HTML)"
        rows={6}
        className={inputCls + " resize-y"}
      />
      <input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="원본 URL (선택)"
        className={inputCls}
      />
      <div className="flex gap-2">
        <Button onClick={onSubmit} loading={adding} className="flex-1">등록</Button>
        <Button variant="secondary" onClick={onCancel}>취소</Button>
      </div>
    </Card>
  );
}
