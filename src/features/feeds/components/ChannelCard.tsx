"use client";

import { useState } from "react";
import { Badge, Button, Card, Icon } from "@/components/ui";
import { updateChannel, deleteChannel, fetchChannelArticles, type FeedChannel, type ChannelType } from "../api/feedsApi";

const inputCls =
  "w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm text-ink outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/15";

const TYPE_LABELS: Record<ChannelType, string> = {
  telegram: "텔레그램",
  rss: "RSS",
  web: "웹 페이지",
  youtube: "YouTube",
  api: "커스텀 API",
};

const TYPE_TONES: Record<ChannelType, "primary" | "green" | "amber" | "red"> = {
  telegram: "primary",
  rss: "green",
  web: "amber",
  youtube: "red",
  api: "primary",
};

const KEYWORD_HINTS: Record<ChannelType, string> = {
  youtube: "키워드를 설정하면 YouTube 검색 결과에서 영상을 수집합니다.",
  rss: "키워드를 설정하면 RSS 피드에서 해당 키워드가 포함된 아티클만 수집합니다.",
  telegram: "키워드를 설정하면 텔레그램 메시지에서 해당 키워드가 포함된 글만 수집합니다.",
  web: "키워드를 설정하면 웹 페이지에서 해당 키워드가 포함된 콘텐츠만 수집합니다.",
  api: "키워드를 설정하면 API 응답에서 해당 키워드가 포함된 아티클만 저장합니다.",
};

interface Props {
  channel: FeedChannel;
  onUpdated: (ch: FeedChannel) => void;
  onDeleted: (id: string) => void;
  onFetched: () => void;
}

export function ChannelCard({ channel: ch, onUpdated, onDeleted, onFetched }: Props) {
  const [editing, setEditing] = useState(false);
  const [editKeywords, setEditKeywords] = useState("");
  const [editLang, setEditLang] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editSince, setEditSince] = useState("");
  const [editUntil, setEditUntil] = useState("");
  const [editMaxPages, setEditMaxPages] = useState("5");
  const [saving, setSaving] = useState(false);

  const [fetching, setFetching] = useState(false);
  const [showFetchOpts, setShowFetchOpts] = useState(false);
  const [fetchSince, setFetchSince] = useState("");
  const [fetchUntil, setFetchUntil] = useState("");
  const [fetchMaxPages, setFetchMaxPages] = useState("5");

  function startEdit() {
    setEditing(true);
    setEditKeywords(ch.keywords);
    setEditLang(ch.language);
    setEditDesc(ch.description);
    setEditSince(ch.fetchSince);
    setEditUntil(ch.fetchUntil);
    setEditMaxPages(String(ch.maxPages || 5));
  }

  async function onSave() {
    setSaving(true);
    try {
      const updated = await updateChannel(ch.id, {
        keywords: editKeywords.trim(),
        language: editLang.trim(),
        description: editDesc.trim(),
        fetchSince: editSince,
        fetchUntil: editUntil,
        maxPages: parseInt(editMaxPages, 10) || 5,
      });
      onUpdated(updated);
      setEditing(false);
    } catch { /* ignore */ }
    finally { setSaving(false); }
  }

  async function onFetch() {
    if (ch.type === "telegram" && !showFetchOpts) {
      setShowFetchOpts(true);
      setFetchSince(ch.fetchSince || "");
      setFetchUntil(ch.fetchUntil || "");
      setFetchMaxPages(String(ch.maxPages || 5));
      return;
    }
    setFetching(true);
    try {
      const opts: { since?: string; until?: string; maxPages?: number } = {};
      if (showFetchOpts) {
        if (fetchSince) opts.since = fetchSince;
        if (fetchUntil) opts.until = fetchUntil;
        const pages = parseInt(fetchMaxPages, 10);
        if (pages > 0) opts.maxPages = pages;
      }
      const result = await fetchChannelArticles(ch.id, opts);
      alert(`${result.inserted}건의 새 아티클을 수집했습니다.`);
      setShowFetchOpts(false);
      onFetched();
    } catch (e) {
      alert(e instanceof Error ? e.message : "수집에 실패했습니다.");
    } finally { setFetching(false); }
  }

  async function onDelete() {
    if (!confirm("이 채널과 수집된 아티클을 모두 삭제할까요?")) return;
    try {
      await deleteChannel(ch.id);
      onDeleted(ch.id);
    } catch { /* ignore */ }
  }

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-center gap-4">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <Badge tone={TYPE_TONES[ch.type]}>{TYPE_LABELS[ch.type]}</Badge>
            <span className="font-semibold text-ink">{ch.name}</span>
          </div>
          {ch.url && <p className="truncate text-xs text-ink-faint">{ch.url}</p>}
          {ch.keywords ? (
            <p className="text-xs text-primary-400">
              키워드: {ch.keywords}{ch.language ? ` (${ch.language})` : ""}
            </p>
          ) : (
            <p className="text-xs text-ink-faint/60">키워드 미설정</p>
          )}
          {(ch.fetchSince || ch.fetchUntil) && (
            <p className="text-xs text-ink-faint">
              기간: {ch.fetchSince || "∞"} ~ {ch.fetchUntil || "∞"}{ch.maxPages ? ` · ${ch.maxPages}페이지` : ""}
            </p>
          )}
          {ch.description && <p className="mt-0.5 text-xs text-ink-muted">{ch.description}</p>}
          <div className="mt-1 flex items-center gap-3 text-xs text-ink-faint">
            <span>아티클 {ch.articleCount}건</span>
            {ch.lastFetchedAt && <span>마지막 수집: {new Date(ch.lastFetchedAt).toLocaleString("ko")}</span>}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => editing ? setEditing(false) : startEdit()}>
            <Icon name="settings" size={14} /> 설정
          </Button>
          <Button size="sm" loading={fetching} onClick={onFetch}>
            <Icon name="rss" size={14} /> 수집
          </Button>
          <Button variant="danger" size="sm" onClick={onDelete}>삭제</Button>
        </div>
      </div>

      {/* 설정 편집 패널 */}
      {editing && (
        <div className="flex flex-col gap-3 rounded-xl bg-surface-2 p-3">
          <p className="text-xs font-semibold text-ink-muted">검색 설정</p>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-ink-faint">검색 키워드 (쉼표로 구분)</span>
            <input value={editKeywords} onChange={(e) => setEditKeywords(e.target.value)} placeholder="예: 국방 훈련, 군사 교육, 사이버 보안" className={inputCls} />
          </label>
          <div className="rounded-xl bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
            {KEYWORD_HINTS[ch.type]}
          </div>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-ink-faint">검색 언어</span>
            <select value={editLang} onChange={(e) => setEditLang(e.target.value)} className={inputCls}>
              <option value="">자동 (제한 없음)</option>
              <option value="ko">한국어</option>
              <option value="en">English</option>
              <option value="ja">日本語</option>
              <option value="zh">中文</option>
            </select>
          </label>
          <p className="mt-1 text-xs font-semibold text-ink-muted">수집 범위</p>
          <div className="grid grid-cols-3 gap-2">
            <label className="flex flex-col gap-1">
              <span className="text-xs text-ink-faint">시작일</span>
              <input type="date" value={editSince} onChange={(e) => setEditSince(e.target.value)} className={inputCls} />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-ink-faint">종료일</span>
              <input type="date" value={editUntil} onChange={(e) => setEditUntil(e.target.value)} className={inputCls} />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-ink-faint">최대 페이지</span>
              <input type="number" min={1} max={50} value={editMaxPages} onChange={(e) => setEditMaxPages(e.target.value)} className={inputCls} />
            </label>
          </div>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-ink-faint">설명 (메모)</span>
            <input value={editDesc} onChange={(e) => setEditDesc(e.target.value)} placeholder="이 채널의 용도나 메모" className={inputCls} />
          </label>
          <div className="flex gap-2">
            <Button size="sm" loading={saving} onClick={onSave} className="flex-1">저장</Button>
            <Button variant="secondary" size="sm" onClick={() => setEditing(false)}>취소</Button>
          </div>
        </div>
      )}

      {/* 텔레그램 수집 옵션 패널 */}
      {showFetchOpts && ch.type === "telegram" && (
        <div className="flex flex-col gap-2 rounded-xl bg-surface-2 p-3">
          <p className="text-xs font-semibold text-ink-muted">수집 옵션</p>
          <div className="grid grid-cols-3 gap-2">
            <label className="flex flex-col gap-1">
              <span className="text-xs text-ink-faint">시작일</span>
              <input type="date" value={fetchSince} onChange={(e) => setFetchSince(e.target.value)} className={inputCls} />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-ink-faint">종료일</span>
              <input type="date" value={fetchUntil} onChange={(e) => setFetchUntil(e.target.value)} className={inputCls} />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-ink-faint">최대 페이지 (1페이지≈20건)</span>
              <input type="number" min={1} max={50} value={fetchMaxPages} onChange={(e) => setFetchMaxPages(e.target.value)} className={inputCls} />
            </label>
          </div>
          <div className="flex gap-2">
            <Button size="sm" loading={fetching} onClick={onFetch} className="flex-1">수집 시작</Button>
            <Button variant="secondary" size="sm" onClick={() => setShowFetchOpts(false)}>취소</Button>
          </div>
        </div>
      )}
    </Card>
  );
}
