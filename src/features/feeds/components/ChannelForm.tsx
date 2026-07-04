"use client";

import { useState } from "react";
import { Button, Card } from "@/components/ui";
import { createChannel, type ChannelType, type FeedChannel } from "../api/feedsApi";

const inputCls =
  "w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm text-ink outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/15";

const TYPE_LABELS: Record<ChannelType, string> = {
  telegram: "텔레그램",
  rss: "RSS",
  web: "웹 페이지",
  youtube: "YouTube",
  api: "커스텀 API",
};

const URL_PLACEHOLDERS: Record<ChannelType, string> = {
  telegram: "https://t.me/채널명",
  rss: "https://example.com/feed.xml",
  youtube: "https://www.youtube.com/@채널 또는 /channel/ID (키워드 검색 시 비워도 됨)",
  api: "https://your-api.com/articles (JSON 응답 필요)",
  web: "https://example.com/article",
};

interface Props {
  onCreated: (ch: FeedChannel) => void;
  onCancel: () => void;
}

export function ChannelForm({ onCreated, onCancel }: Props) {
  const [type, setType] = useState<ChannelType>("rss");
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [keywords, setKeywords] = useState("");
  const [lang, setLang] = useState("");
  const [desc, setDesc] = useState("");
  const [since, setSince] = useState("");
  const [until, setUntil] = useState("");
  const [maxPages, setMaxPages] = useState("5");
  const [adding, setAdding] = useState(false);

  async function onSubmit() {
    if (!name.trim()) return;
    if (!url.trim() && !keywords.trim()) return;
    setAdding(true);
    try {
      const ch = await createChannel({
        type,
        name: name.trim(),
        url: url.trim(),
        keywords: keywords.trim(),
        language: lang.trim(),
        description: desc.trim(),
        fetchSince: since,
        fetchUntil: until,
        maxPages: parseInt(maxPages, 10) || 5,
      });
      onCreated(ch);
    } catch { /* ignore */ }
    finally { setAdding(false); }
  }

  return (
    <Card className="flex flex-col gap-3">
      <p className="font-bold text-ink">새 채널 등록</p>
      <div className="grid grid-cols-5 gap-1 rounded-xl bg-surface-2 p-1">
        {(Object.keys(TYPE_LABELS) as ChannelType[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className={`rounded-lg py-2 text-sm font-semibold transition-colors ${
              type === t ? "bg-surface text-primary-300 ring-1 ring-line" : "text-ink-muted"
            }`}
          >
            {TYPE_LABELS[t]}
          </button>
        ))}
      </div>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="채널 이름 (예: 국방일보 RSS)"
        className={inputCls}
      />
      <input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder={URL_PLACEHOLDERS[type]}
        className={inputCls}
      />
      <input
        value={keywords}
        onChange={(e) => setKeywords(e.target.value)}
        placeholder="검색 키워드 (예: 국방 훈련, 군사 교육) — 선택"
        className={inputCls}
      />
      <select
        value={lang}
        onChange={(e) => setLang(e.target.value)}
        className={inputCls}
      >
        <option value="">검색 언어 (기본: 자동)</option>
        <option value="ko">한국어</option>
        <option value="en">English</option>
        <option value="ja">日本語</option>
        <option value="zh">中文</option>
      </select>
      <p className="text-xs font-semibold text-ink-muted">수집 범위</p>
      <div className="grid grid-cols-3 gap-2">
        <label className="flex flex-col gap-1">
          <span className="text-xs text-ink-faint">시작일</span>
          <input type="date" value={since} onChange={(e) => setSince(e.target.value)} className={inputCls} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-ink-faint">종료일</span>
          <input type="date" value={until} onChange={(e) => setUntil(e.target.value)} className={inputCls} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-ink-faint">최대 페이지</span>
          <input type="number" min={1} max={50} value={maxPages} onChange={(e) => setMaxPages(e.target.value)} className={inputCls} />
        </label>
      </div>
      <input
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
        placeholder="설명 (선택)"
        className={inputCls}
      />
      <div className="flex gap-2">
        <Button onClick={onSubmit} loading={adding} className="flex-1">등록</Button>
        <Button variant="secondary" onClick={onCancel}>취소</Button>
      </div>
    </Card>
  );
}
