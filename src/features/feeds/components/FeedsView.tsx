"use client";

import { useCallback, useEffect, useState } from "react";

import { Badge, Button, Card, Icon, Spinner } from "@/components/ui";
import { CATEGORIES } from "@/features/categories";
import {
  fetchChannels,
  createChannel,
  updateChannel,
  deleteChannel,
  fetchChannelArticles,
  createArticle,
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
  const [newKeywords, setNewKeywords] = useState("");
  const [newLang, setNewLang] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newSince, setNewSince] = useState("");
  const [newUntil, setNewUntil] = useState("");
  const [newMaxPages, setNewMaxPages] = useState("5");
  const [adding, setAdding] = useState(false);

  // 수집 중
  const [fetchingId, setFetchingId] = useState<string | null>(null);
  // 수집 옵션 (텔레그램용)
  const [fetchOptsId, setFetchOptsId] = useState<string | null>(null);
  const [fetchSince, setFetchSince] = useState("");
  const [fetchUntil, setFetchUntil] = useState("");
  const [fetchMaxPages, setFetchMaxPages] = useState("5");

  // 교안 변환
  const [convertingId, setConvertingId] = useState<string | null>(null);
  const [convertCategory, setConvertCategory] = useState("");

  // 채널 설정 편집
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editKeywords, setEditKeywords] = useState("");
  const [editLang, setEditLang] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editSince, setEditSince] = useState("");
  const [editUntil, setEditUntil] = useState("");
  const [editMaxPages, setEditMaxPages] = useState("5");
  const [saving, setSaving] = useState(false);

  // 수동 아티클 등록
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualTitle, setManualTitle] = useState("");
  const [manualBody, setManualBody] = useState("");
  const [manualUrl, setManualUrl] = useState("");
  const [manualAdding, setManualAdding] = useState(false);

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
    if (!newName.trim()) return;
    if (!newUrl.trim() && !newKeywords.trim()) return;
    setAdding(true);
    try {
      const ch = await createChannel({
        type: newType,
        name: newName.trim(),
        url: newUrl.trim(),
        keywords: newKeywords.trim(),
        language: newLang.trim(),
        description: newDesc.trim(),
      });
      setChannels((prev) => [ch, ...prev]);
      setShowAddForm(false);
      setNewName("");
      setNewUrl("");
      setNewKeywords("");
      setNewLang("");
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

  function startEdit(ch: FeedChannel) {
    setEditingId(ch.id);
    setEditKeywords(ch.keywords);
    setEditLang(ch.language);
    setEditDesc(ch.description);
    setEditSince(ch.fetchSince);
    setEditUntil(ch.fetchUntil);
    setEditMaxPages(String(ch.maxPages || 5));
  }

  async function onAddManualArticle() {
    if (!manualTitle.trim()) return;
    setManualAdding(true);
    try {
      const isHtml = manualBody.includes("<") && manualBody.includes(">");
      const article = await createArticle({
        title: manualTitle.trim(),
        body: isHtml ? undefined : manualBody.trim(),
        bodyHtml: isHtml ? manualBody.trim() : undefined,
        sourceUrl: manualUrl.trim() || undefined,
      });
      setArticles((prev) => [article, ...prev]);
      setShowManualForm(false);
      setManualTitle("");
      setManualBody("");
      setManualUrl("");
    } catch { /* ignore */ }
    finally { setManualAdding(false); }
  }

  async function onSaveChannel(id: string) {
    setSaving(true);
    try {
      const updated = await updateChannel(id, {
        keywords: editKeywords.trim(),
        language: editLang.trim(),
        description: editDesc.trim(),
        fetchSince: editSince,
        fetchUntil: editUntil,
        maxPages: parseInt(editMaxPages, 10) || 5,
      });
      setChannels((prev) => prev.map((c) => (c.id === id ? updated : c)));
      setEditingId(null);
    } catch { /* ignore */ }
    finally { setSaving(false); }
  }

  async function onFetchChannel(id: string, ch?: FeedChannel) {
    if (ch?.type === "telegram" && fetchOptsId !== id) {
      setFetchOptsId(id);
      return;
    }
    setFetchingId(id);
    try {
      const opts: { since?: string; until?: string; maxPages?: number } = {};
      if (fetchSince) opts.since = fetchSince;
      if (fetchUntil) opts.until = fetchUntil;
      const pages = parseInt(fetchMaxPages, 10);
      if (pages > 0) opts.maxPages = pages;
      const result = await fetchChannelArticles(id, opts);
      await loadChannels();
      if (tab === "articles") await loadArticles(false);
      alert(`${result.inserted}건의 새 아티클을 수집했습니다.`);
      setFetchOptsId(null);
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
              <div className="grid grid-cols-5 gap-1 rounded-xl bg-surface-2 p-1">
                {(["rss", "telegram", "web", "youtube", "api"] as const).map((t) => (
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
                      : newType === "youtube"
                        ? "https://www.youtube.com/@채널 또는 /channel/ID (키워드 검색 시 비워도 됨)"
                        : newType === "api"
                          ? "https://your-api.com/articles (JSON 응답 필요)"
                          : "https://example.com/article"
                }
                className={inputCls}
              />
              <input
                value={newKeywords}
                onChange={(e) => setNewKeywords(e.target.value)}
                placeholder="검색 키워드 (예: 국방 훈련, 군사 교육) — 선택"
                className={inputCls}
              />
              <select
                value={newLang}
                onChange={(e) => setNewLang(e.target.value)}
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
                  <input
                    type="date"
                    value={newSince}
                    onChange={(e) => setNewSince(e.target.value)}
                    className={inputCls}
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs text-ink-faint">종료일</span>
                  <input
                    type="date"
                    value={newUntil}
                    onChange={(e) => setNewUntil(e.target.value)}
                    className={inputCls}
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs text-ink-faint">최대 페이지</span>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={newMaxPages}
                    onChange={(e) => setNewMaxPages(e.target.value)}
                    className={inputCls}
                  />
                </label>
              </div>
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
            <Card key={ch.id} className="flex flex-col gap-3">
              <div className="flex items-center gap-4">
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <Badge tone={TYPE_TONES[ch.type]}>{TYPE_LABELS[ch.type]}</Badge>
                    <span className="font-semibold text-ink">{ch.name}</span>
                  </div>
                  {ch.url && <p className="truncate text-xs text-ink-faint">{ch.url}</p>}
                  {ch.keywords && (
                    <p className="text-xs text-primary-400">
                      키워드: {ch.keywords}{ch.language ? ` (${ch.language})` : ""}
                    </p>
                  )}
                  {!ch.keywords && (
                    <p className="text-xs text-ink-faint/60">키워드 미설정</p>
                  )}
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
                    variant="ghost"
                    size="sm"
                    onClick={() => editingId === ch.id ? setEditingId(null) : startEdit(ch)}
                  >
                    <Icon name="settings" size={14} /> 설정
                  </Button>
                  <Button
                    size="sm"
                    loading={fetchingId === ch.id}
                    onClick={() => onFetchChannel(ch.id, ch)}
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
              </div>

              {/* 채널 설정 편집 패널 */}
              {editingId === ch.id && (
                <div className="flex flex-col gap-3 rounded-xl bg-surface-2 p-3">
                  <p className="text-xs font-semibold text-ink-muted">검색 설정</p>
                  <label className="flex flex-col gap-1">
                    <span className="text-xs text-ink-faint">검색 키워드 (쉼표로 구분)</span>
                    <input
                      value={editKeywords}
                      onChange={(e) => setEditKeywords(e.target.value)}
                      placeholder="예: 국방 훈련, 군사 교육, 사이버 보안"
                      className={inputCls}
                    />
                  </label>
                  <div className="rounded-xl bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
                    {ch.type === "youtube"
                      ? "키워드를 설정하면 YouTube 검색 결과에서 영상을 수집합니다."
                      : ch.type === "rss"
                        ? "키워드를 설정하면 RSS 피드에서 해당 키워드가 포함된 아티클만 수집합니다."
                        : ch.type === "telegram"
                          ? "키워드를 설정하면 텔레그램 메시지에서 해당 키워드가 포함된 글만 수집합니다."
                          : "키워드를 설정하면 웹 페이지에서 해당 키워드가 포함된 콘텐츠만 수집합니다."}
                  </div>
                  <label className="flex flex-col gap-1">
                    <span className="text-xs text-ink-faint">검색 언어</span>
                    <select
                      value={editLang}
                      onChange={(e) => setEditLang(e.target.value)}
                      className={inputCls}
                    >
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
                      <input
                        type="date"
                        value={editSince}
                        onChange={(e) => setEditSince(e.target.value)}
                        className={inputCls}
                      />
                    </label>
                    <label className="flex flex-col gap-1">
                      <span className="text-xs text-ink-faint">종료일</span>
                      <input
                        type="date"
                        value={editUntil}
                        onChange={(e) => setEditUntil(e.target.value)}
                        className={inputCls}
                      />
                    </label>
                    <label className="flex flex-col gap-1">
                      <span className="text-xs text-ink-faint">최대 페이지</span>
                      <input
                        type="number"
                        min={1}
                        max={50}
                        value={editMaxPages}
                        onChange={(e) => setEditMaxPages(e.target.value)}
                        className={inputCls}
                      />
                    </label>
                  </div>
                  <label className="flex flex-col gap-1">
                    <span className="text-xs text-ink-faint">설명 (메모)</span>
                    <input
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                      placeholder="이 채널의 용도나 메모"
                      className={inputCls}
                    />
                  </label>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      loading={saving}
                      onClick={() => onSaveChannel(ch.id)}
                      className="flex-1"
                    >
                      저장
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setEditingId(null)}
                    >
                      취소
                    </Button>
                  </div>
                </div>
              )}

              {/* 텔레그램 수집 옵션 패널 */}
              {fetchOptsId === ch.id && ch.type === "telegram" && (
                <div className="flex flex-col gap-2 rounded-xl bg-surface-2 p-3">
                  <p className="text-xs font-semibold text-ink-muted">수집 옵션</p>
                  <div className="grid grid-cols-3 gap-2">
                    <label className="flex flex-col gap-1">
                      <span className="text-xs text-ink-faint">시작일</span>
                      <input
                        type="date"
                        value={fetchSince}
                        onChange={(e) => setFetchSince(e.target.value)}
                        className={inputCls}
                      />
                    </label>
                    <label className="flex flex-col gap-1">
                      <span className="text-xs text-ink-faint">종료일</span>
                      <input
                        type="date"
                        value={fetchUntil}
                        onChange={(e) => setFetchUntil(e.target.value)}
                        className={inputCls}
                      />
                    </label>
                    <label className="flex flex-col gap-1">
                      <span className="text-xs text-ink-faint">최대 페이지 (1페이지≈20건)</span>
                      <input
                        type="number"
                        min={1}
                        max={50}
                        value={fetchMaxPages}
                        onChange={(e) => setFetchMaxPages(e.target.value)}
                        className={inputCls}
                      />
                    </label>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      loading={fetchingId === ch.id}
                      onClick={() => onFetchChannel(ch.id)}
                      className="flex-1"
                    >
                      수집 시작
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setFetchOptsId(null)}
                    >
                      취소
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* ── 수집 아티클 / 아카이브 ── */}
      {(tab === "articles" || tab === "archived") && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-ink-muted">
              {articles.length}건{tab === "archived" ? " (아카이브)" : ""}
            </p>
            {tab === "articles" && (
              <Button size="sm" onClick={() => setShowManualForm(!showManualForm)}>
                <Icon name="plus" size={16} /> 직접 등록
              </Button>
            )}
          </div>

          {showManualForm && tab === "articles" && (
            <Card className="flex flex-col gap-3">
              <p className="font-bold text-ink">수동 아티클 등록</p>
              <p className="text-xs text-ink-muted">
                스크래핑이 안 되는 경우 직접 제목과 본문을 붙여넣을 수 있습니다. HTML도 지원합니다.
              </p>
              <input
                value={manualTitle}
                onChange={(e) => setManualTitle(e.target.value)}
                placeholder="제목"
                className={inputCls}
              />
              <textarea
                value={manualBody}
                onChange={(e) => setManualBody(e.target.value)}
                placeholder="본문 (텍스트 또는 HTML)"
                rows={6}
                className={inputCls + " resize-y"}
              />
              <input
                value={manualUrl}
                onChange={(e) => setManualUrl(e.target.value)}
                placeholder="원본 URL (선택)"
                className={inputCls}
              />
              <div className="flex gap-2">
                <Button onClick={onAddManualArticle} loading={manualAdding} className="flex-1">
                  등록
                </Button>
                <Button variant="secondary" onClick={() => setShowManualForm(false)}>
                  취소
                </Button>
              </div>
            </Card>
          )}

          {articles.length === 0 && !showManualForm && (
            <Card className="py-12 text-center text-sm text-ink-muted">
              {tab === "archived" ? "아카이브된 아티클이 없습니다." : "수집된 아티클이 없습니다. 채널에서 수집하거나 직접 등록하세요."}
            </Card>
          )}

          {articles.map((a) => (
            <Card key={a.id} className="flex flex-col gap-2">
              <div className="flex items-start gap-3">
                {a.thumbnail && (
                  <img
                    src={a.thumbnail}
                    alt=""
                    className="h-16 w-28 shrink-0 rounded-lg object-cover"
                  />
                )}
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
