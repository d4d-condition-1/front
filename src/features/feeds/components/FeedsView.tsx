"use client";

import { useCallback, useEffect, useState } from "react";

import { Button, Card, Icon, Spinner } from "@/components/ui";
import {
  fetchChannels,
  fetchArticles,
  deleteAllArticles,
  type FeedChannel,
  type FeedArticle,
} from "../api/feedsApi";
import { ChannelForm } from "./ChannelForm";
import { ChannelCard } from "./ChannelCard";
import { ArticleForm } from "./ArticleForm";
import { ArticleCard } from "./ArticleCard";

type Tab = "channels" | "articles" | "archived";

export function FeedsView() {
  const [tab, setTab] = useState<Tab>("channels");
  const [channels, setChannels] = useState<FeedChannel[]>([]);
  const [articles, setArticles] = useState<FeedArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);

  const loadChannels = useCallback(async () => {
    try { setChannels(await fetchChannels()); } catch { /* ignore */ }
  }, []);

  const loadArticles = useCallback(async (archived?: boolean) => {
    try { setArticles(await fetchArticles({ archived })); } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([loadChannels(), loadArticles()]).finally(() => setLoading(false));
  }, [loadChannels, loadArticles]);

  useEffect(() => {
    if (tab === "archived") loadArticles(true);
    else if (tab === "articles") loadArticles(false);
  }, [tab, loadArticles]);

  async function onDeleteAllArticles() {
    if (!confirm("모든 아티클을 삭제할까요? 이 작업은 되돌릴 수 없습니다.")) return;
    try {
      await deleteAllArticles();
      setArticles([]);
      await loadChannels();
    } catch { /* ignore */ }
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
            <ChannelForm
              onCreated={(ch) => { setChannels((p) => [ch, ...p]); setShowAddForm(false); }}
              onCancel={() => setShowAddForm(false)}
            />
          )}

          {channels.length === 0 && !showAddForm && (
            <Card className="py-12 text-center text-sm text-ink-muted">
              등록된 채널이 없습니다. 채널을 추가하세요.
            </Card>
          )}

          {channels.map((ch) => (
            <ChannelCard
              key={ch.id}
              channel={ch}
              onUpdated={(updated) => setChannels((p) => p.map((c) => (c.id === updated.id ? updated : c)))}
              onDeleted={(id) => setChannels((p) => p.filter((c) => c.id !== id))}
              onFetched={() => { loadChannels(); loadArticles(false); }}
            />
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
            <div className="flex items-center gap-1">
              {articles.length > 0 && (
                <Button variant="danger" size="sm" onClick={onDeleteAllArticles}>전체 삭제</Button>
              )}
              {tab === "articles" && (
                <Button size="sm" onClick={() => setShowManualForm(!showManualForm)}>
                  <Icon name="plus" size={16} /> 직접 등록
                </Button>
              )}
            </div>
          </div>

          {showManualForm && tab === "articles" && (
            <ArticleForm
              onCreated={(a) => { setArticles((p) => [a, ...p]); setShowManualForm(false); }}
              onCancel={() => setShowManualForm(false)}
            />
          )}

          {articles.length === 0 && !showManualForm && (
            <Card className="py-12 text-center text-sm text-ink-muted">
              {tab === "archived" ? "��카이브된 아티클이 없습니다." : "수집된 아티클이 없습니다. 채널에서 수집하거나 직접 등록하세요."}
            </Card>
          )}

          {articles.map((a) => (
            <ArticleCard
              key={a.id}
              article={a}
              onUpdated={(updated) => setArticles((p) => p.map((x) => (x.id === updated.id ? updated : x)))}
              onDeleted={(id) => setArticles((p) => p.filter((x) => x.id !== id))}
            />
          ))}
        </div>
      )}
    </div>
  );
}
