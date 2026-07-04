"use client";

import { useCallback, useEffect, useState } from "react";

import { Badge, Button, Card, Icon, Spinner } from "@/components/ui";
import { CATEGORIES } from "@/features/categories";
import {
  fetchChannels,
  createChannel,
  deleteChannel,
  fetchChannelArticles,
  fetchArticles,
  archiveArticle,
  deleteArticle,
  articleToMaterial,
  type FeedChannel,
  type FeedArticle,
  type ChannelType,
} from "../api/feedsApi";

const inputCls =
  "w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm text-ink outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/15";

const TYPE_LABELS: Record<ChannelType, string> = {
  telegram: "텔레그램",
  rss: "RSS",
  web: "웹 페이지",
};

const TYPE_TONES: Record<ChannelType, "primary" | "green" | "amber"> = {
  telegram: "primary",
  rss: "green",
  web: "amber",
};

type Tab = "channels" | "articles" | "archived";

export function FeedsView() {
  const [tab, setTab] = useState<Tab>("channels");
  const [channels, setChannels] = useState<FeedChannel[]>([]);
  const [articles, setArticles] = useState<FeedArticle[]>([]);
  const [loading, setLoading] = useState(true);

  // 채널 추가 폼
  const [showAddForm, setShowAddForm] = useState(false);
  const [newType, setNewType] = useState<ChannelType>("rss");
  const [newName, setNewName] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [adding, setAdding] = useState(false);

  // 수집 중
  const [fetchingId, setFetchingId] = useState<string | null>(null);

  // 교안 변환
  const [convertingId, setConvertingId] = useState<string | null>(null);
  const [convertCategory, setConvertCategory] = useState("");

  // 아티클 상세
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const loadChannels = useCallback(async () => {
    try {
      const data = await fetchChannels();
      setChannels(data);
    } catch { /* ignore */ }
  }, []);

  const loadArticles = useCallback(async (archived?: boolean) => {
    try {
      const data = await fetchArticles({ archived });
      setArticles(data);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([loadChannels(), loadArticles()])
      .finally(() => setLoading(false));
  }, [loadChannels, loadArticles]);

  useEffect(() => {
    if (tab === "archived") loadArticles(true);
    else if (tab === "articles") loadArticles(false);
  }, [tab, loadArticles]);

  async function onAddChannel() {
    if (!newName.trim() || !newUrl.trim()) return;
    setAdding(true);
    try {
      const ch = await createChannel({
        type: newType,
        name: newName.trim(),
        url: newUrl.trim(),
        description: newDesc.trim(),
      });
      setChannels((prev) => [ch, ...prev]);
      setShowAddForm(false);
      setNewName("");
      setNewUrl("");
      setNewDesc("");
    } catch { /* ignore */ }
    finally { setAdding(false); }
  }

  async function onDeleteChannel(id: string) {
    if (!confirm("이 채널과 수집된 아티클을 모두 삭제할까요?")) return;
    try {
      await deleteChannel(id);
      setChannels((prev) => prev.filter((c) => c.id !== id));
    } catch { /* ignore */ }
  }

  async function onFetchChannel(id: string) {
    setFetchingId(id);
    try {
      const result = await fetchChannelArticles(id);
      await loadChannels();
      if (tab === "articles") await loadArticles(false);
      alert(`${result.inserted}건의 새 아티클을 수집했습니다.`);
    } catch (e) {
      alert(e instanceof Error ? e.message : "수집에 실패했습니다.");
    } finally { setFetchingId(null); }
  }

  async function onArchiveToggle(article: FeedArticle) {
    try {
      const updated = await archiveArticle(article.id, !article.isArchived);
      setArticles((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
    } catch { /* ignore */ }
  }

  async function onDeleteArticle(id: string) {
    if (!confirm("이 아티클을 삭제할까요?")) return;
    try {
      await deleteArticle(id);
      setArticles((prev) => prev.filter((a) => a.id !== id));
    } catch { /* ignore */ }
  }

  async function onConvertToMaterial(article: FeedArticle) {
    if (!convertCategory) return alert("카테고리를 선택하세요.");
    setConvertingId(article.id);
    try {
      const result = await articleToMaterial(article.id, { category: convertCategory as any });
      alert(`"${result.title}" 교안으로 변환 완료`);
      setArticles((prev) =>
        prev.map((a) => (a.id === article.id ? { ...a, isArchived: true, materialId: result.materialId } : a)),
      );
      setConvertingId(null);
      setExpandedId(null);
    } catch (e) {
      alert(e instanceof Error ? e.message : "변환 실패");
      setConvertingId(null);
    }
  }

  if (loading) {
    return (
      <div className="grid flex-1 place-items-center py-24 text-primary-500">
        <Spinner size={28} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-6 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-ink">정보 수집</h1>
      </div>

      {/* 탭 */}
      <div className="flex gap-1 rounded-xl bg-surface-2 p-1">
        {([
          ["channels", "채널 관리"],
          ["articles", "수집 아티클"],
          ["archived", "아카이브"],
        ] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-colors ${
              tab === key ? "bg-surface text-primary-300 ring-1 ring-line" : "text-ink-muted"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── 채널 관리 ── */}
      {tab === "channels" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-ink-muted">{channels.length}개 채널</p>
            <Button size="sm" onClick={() => setShowAddForm(!showAddForm)}>
              <Icon name="plus" size={16} /> 채널 추가
            </Button>
          </div>

          {showAddForm && (
            <Card className="flex flex-col gap-3">
              <p className="font-bold text-ink">새 채널 등록</p>
              <div className="grid grid-cols-3 gap-1 rounded-xl bg-surface-2 p-1">
                {(["rss", "telegram", "web"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setNewType(t)}
                    className={`rounded-lg py-2 text-sm font-semibold transition-colors ${
                      newType === t ? "bg-surface text-primary-300 ring-1 ring-line" : "text-ink-muted"
                    }`}
                  >
                    {TYPE_LABELS[t]}
                  </button>
                ))}
              </div>
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="채널 이름 (예: 국방일보 RSS)"
                className={inputCls}
              />
              <input
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder={
                  newType === "telegram"
                    ? "https://t.me/채널명"
                    : newType === "rss"
                      ? "https://example.com/feed.xml"
                      : "https://example.com/article"
                }
                className={inputCls}
              />
              <input
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="설명 (선택)"
                className={inputCls}
              />
              <div className="flex gap-2">
                <Button onClick={onAddChannel} loading={adding} className="flex-1">
                  등록
                </Button>
                <Button variant="secondary" onClick={() => setShowAddForm(false)}>
                  취소
                </Button>
              </div>
            </Card>
          )}

          {channels.length === 0 && !showAddForm && (
            <Card className="py-12 text-center text-sm text-ink-muted">
              등록된 채널이 없습니다. 채널을 추가하세요.
            </Card>
          )}

          {channels.map((ch) => (
            <Card key={ch.id} className="flex items-center gap-4">
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <Badge tone={TYPE_TONES[ch.type]}>{TYPE_LABELS[ch.type]}</Badge>
                  <span className="font-semibold text-ink">{ch.name}</span>
                </div>
                <p className="truncate text-xs text-ink-faint">{ch.url}</p>
                {ch.description && (
                  <p className="mt-0.5 text-xs text-ink-muted">{ch.description}</p>
                )}
                <div className="mt-1 flex items-center gap-3 text-xs text-ink-faint">
                  <span>아티클 {ch.articleCount}건</span>
                  {ch.lastFetchedAt && (
                    <span>마지막 수집: {new Date(ch.lastFetchedAt).toLocaleString("ko")}</span>
                  )}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Button
                  size="sm"
                  loading={fetchingId === ch.id}
                  onClick={() => onFetchChannel(ch.id)}
                >
                  <Icon name="rss" size={14} /> 수집
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => onDeleteChannel(ch.id)}
                >
                  삭제
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ── 수집 아티클 / 아카이브 ── */}
      {(tab === "articles" || tab === "archived") && (
        <div className="space-y-3">
          <p className="text-sm text-ink-muted">
            {articles.length}건{tab === "archived" ? " (아카이브)" : ""}
          </p>

          {articles.length === 0 && (
            <Card className="py-12 text-center text-sm text-ink-muted">
              {tab === "archived" ? "아카이브된 아티클이 없습니다." : "수집된 아티클이 없습니다. 채널에서 수집하세요."}
            </Card>
          )}

          {articles.map((a) => (
            <Card key={a.id} className="flex flex-col gap-2">
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-1.5">
                    {a.channelName && <Badge tone="slate">{a.channelName}</Badge>}
                    {a.isArchived && <Badge tone="green">아카이브</Badge>}
                    {a.materialId && <Badge tone="primary">교안</Badge>}
                  </div>
                  <button
                    className="text-left text-sm font-semibold text-ink hover:text-primary-400"
                    onClick={() => setExpandedId(expandedId === a.id ? null : a.id)}
                  >
                    {a.title}
                  </button>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-ink-faint">
                    {a.publishedAt && <span>{new Date(a.publishedAt).toLocaleDateString("ko")}</span>}
                    {a.sourceUrl && (
                      <a
                        href={a.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-primary-400 hover:underline"
                      >
                        원문
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => onArchiveToggle(a)}>
                    {a.isArchived ? "해제" : "아카이브"}
                  </Button>
                  {!a.materialId && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setExpandedId(a.id);
                        setConvertingId(null);
                      }}
                    >
                      교안 변환
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => onDeleteArticle(a.id)}>
                    <Icon name="x" size={14} />
                  </Button>
                </div>
              </div>

              {/* 펼침 영역 */}
              {expandedId === a.id && (
                <div className="flex flex-col gap-3 border-t border-line/30 pt-3">
                  <p className="max-h-60 overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed text-ink-muted">
                    {a.body.slice(0, 2000)}{a.body.length > 2000 ? "…" : ""}
                  </p>

                  {/* 교안 변환 폼 */}
                  {!a.materialId && (
                    <div className="flex items-end gap-2 rounded-xl bg-surface-2 p-3">
                      <label className="flex flex-1 flex-col gap-1">
                        <span className="text-xs font-medium text-ink-muted">교안 카테고리</span>
                        <select
                          value={convertCategory}
                          onChange={(e) => setConvertCategory(e.target.value)}
                          className={inputCls}
                        >
                          <option value="">선택</option>
                          {CATEGORIES.map((c) => (
                            <option key={c.code} value={c.code}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </label>
                      <Button
                        size="sm"
                        loading={convertingId === a.id}
                        onClick={() => onConvertToMaterial(a)}
                      >
                        교안으로 변환
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
