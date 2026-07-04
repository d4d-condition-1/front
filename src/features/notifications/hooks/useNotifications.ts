"use client";

import { useCallback, useEffect, useState } from "react";

import {
  fetchNotifications,
  markNotificationsRead,
  type Notification,
} from "../api/notificationApi";
import { subscribe } from "../lib/realtime";

interface UseNotificationsResult {
  items: Notification[];
  unread: number;
  loading: boolean;
  markAllRead: () => Promise<void>;
}

/** 알림 목록 + 안읽음 수. 최초 1회 로드하고 WS 로 실시간 갱신한다. */
export function useNotifications(): UseNotificationsResult {
  const [items, setItems] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchNotifications()
      .then((data) => {
        if (!active) return;
        setItems(data.items);
        setUnread(data.unread);
      })
      .catch(() => {})
      .finally(() => active && setLoading(false));

    // 실시간 수신: 새 알림을 목록 맨 앞에 추가 + 안읽음 +1
    const off = subscribe("notification:new", (payload) => {
      const n = (payload as { notification?: Notification })?.notification;
      if (!n) return;
      setItems((prev) => [n, ...prev].slice(0, 50));
      setUnread((u) => u + 1);
    });

    return () => {
      active = false;
      off();
    };
  }, []);

  const markAllRead = useCallback(async () => {
    if (unread === 0) return;
    // 낙관적 업데이트
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnread(0);
    try {
      await markNotificationsRead();
    } catch {
      // 실패해도 다음 로드에서 보정됨
    }
  }, [unread]);

  return { items, unread, loading, markAllRead };
}
