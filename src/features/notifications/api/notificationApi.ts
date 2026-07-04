import { apiFetch } from "@/lib/api";

export interface Notification {
  id: number;
  type: "program" | "assignment" | "fitness" | "chat" | "system";
  title: string;
  body: string;
  link: string | null;
  read: boolean;
  createdAt: string;
}

export interface NotificationList {
  items: Notification[];
  unread: number;
}

export function fetchNotifications(): Promise<NotificationList> {
  return apiFetch<NotificationList>("/api/me/notifications");
}

/** ids 미지정 시 전체 읽음 처리 */
export function markNotificationsRead(ids?: number[]): Promise<{ unread: number }> {
  return apiFetch<{ unread: number }>("/api/me/notifications/read", {
    method: "POST",
    body: JSON.stringify(ids && ids.length ? { ids } : {}),
  });
}
