import { apiFetch } from "@/lib/api";
import type { CategoryCode } from "@/features/categories";

export type ChannelType = "telegram" | "rss" | "web";

export interface FeedChannel {
  id: string;
  type: ChannelType;
  name: string;
  url: string;
  description: string;
  isActive: boolean;
  lastFetchedAt: string | null;
  articleCount: number;
  createdAt: string;
}

export interface FeedArticle {
  id: string;
  channelId: string;
  channelName: string | null;
  title: string;
  body: string;
  sourceUrl: string | null;
  thumbnail: string | null;
  publishedAt: string | null;
  fetchedAt: string;
  isArchived: boolean;
  materialId: string | null;
}

export function fetchChannels(): Promise<FeedChannel[]> {
  return apiFetch<FeedChannel[]>("/api/admin/feeds/channels");
}

export function createChannel(input: {
  type: ChannelType;
  name: string;
  url: string;
  description?: string;
}): Promise<FeedChannel> {
  return apiFetch<FeedChannel>("/api/admin/feeds/channels", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function deleteChannel(id: string): Promise<void> {
  return apiFetch<void>(`/api/admin/feeds/channels/${id}`, { method: "DELETE" });
}

export function fetchChannelArticles(channelId: string): Promise<{ inserted: number }> {
  return apiFetch<{ inserted: number }>(`/api/admin/feeds/channels/${channelId}/fetch`, {
    method: "POST",
  });
}

export function fetchArticles(params?: {
  channelId?: string;
  archived?: boolean;
}): Promise<FeedArticle[]> {
  const q = new URLSearchParams();
  if (params?.channelId) q.set("channelId", params.channelId);
  if (params?.archived) q.set("archived", "1");
  const qs = q.toString();
  return apiFetch<FeedArticle[]>(`/api/admin/feeds/articles${qs ? `?${qs}` : ""}`);
}

export function archiveArticle(id: string, isArchived: boolean): Promise<FeedArticle> {
  return apiFetch<FeedArticle>(`/api/admin/feeds/articles/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ isArchived }),
  });
}

export function deleteArticle(id: string): Promise<void> {
  return apiFetch<void>(`/api/admin/feeds/articles/${id}`, { method: "DELETE" });
}

export function articleToMaterial(
  id: string,
  input: { category: CategoryCode; title?: string; body?: string },
): Promise<{ materialId: string; title: string; category: string }> {
  return apiFetch(`/api/admin/feeds/articles/${id}/to-material`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}
