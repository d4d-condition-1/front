"use client";

import { useEffect, useState } from "react";

import { AdminHeader } from "@/components/layout";
import { Button, Card } from "@/components/ui";
import { apiFetch } from "@/lib/api";

interface SimpleUser {
  id: string;
  name: string;
  rank: string;
}

interface SendResult {
  sent: number;
}

export default function AdminNotificationsPage() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [target, setTarget] = useState<"all" | "single">("all");
  const [userId, setUserId] = useState("");
  const [users, setUsers] = useState<SimpleUser[]>([]);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<SimpleUser[]>("/api/admin/users")
      .then(setUsers)
      .catch(() => {});
  }, []);

  async function onSend() {
    if (!title.trim()) {
      setError("제목을 입력해주세요.");
      return;
    }
    if (target === "single" && !userId) {
      setError("사용자를 선택해주세요.");
      return;
    }

    setSending(true);
    setError(null);
    setResult(null);

    try {
      const res = await apiFetch<SendResult>("/api/admin/notifications/send", {
        method: "POST",
        body: JSON.stringify({
          title: title.trim(),
          message: message.trim(),
          target: target === "all" ? "all" : userId,
        }),
      });
      setResult(`${res.sent}명에게 알림을 전송했습니다.`);
      setTitle("");
      setMessage("");
      setUserId("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "전송 실패");
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <AdminHeader title="알림 전송" description="부대원에게 알림을 보냅니다" />
      <div className="p-6 md:p-8">
        <Card className="mx-auto max-w-lg space-y-5">
          {/* 대상 선택 */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-muted">대상</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setTarget("all")}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  target === "all"
                    ? "bg-primary-600 text-white"
                    : "bg-surface-2 text-ink-muted hover:bg-surface-2/80"
                }`}
              >
                전체 부대원
              </button>
              <button
                type="button"
                onClick={() => setTarget("single")}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  target === "single"
                    ? "bg-primary-600 text-white"
                    : "bg-surface-2 text-ink-muted hover:bg-surface-2/80"
                }`}
              >
                개별 사용자
              </button>
            </div>
          </div>

          {/* 개별 사용자 선택 */}
          {target === "single" && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-muted">
                사용자 선택
              </label>
              <select
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-sm text-ink outline-none focus:border-primary-400"
              >
                <option value="">-- 사용자를 선택하세요 --</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.rank} {u.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 제목 */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-muted">제목</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="알림 제목"
              className="w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-sm text-ink outline-none focus:border-primary-400"
            />
          </div>

          {/* 내용 */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-muted">
              내용 (선택)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="알림 본문 내용"
              rows={4}
              className="w-full resize-none rounded-xl border border-line bg-surface px-4 py-2.5 text-sm text-ink outline-none focus:border-primary-400"
            />
          </div>

          {/* 에러/결과 */}
          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
              {error}
            </p>
          )}
          {result && (
            <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-600">
              {result}
            </p>
          )}

          {/* 전송 버튼 */}
          <Button onClick={onSend} loading={sending} className="w-full">
            알림 전송
          </Button>
        </Card>
      </div>
    </>
  );
}
