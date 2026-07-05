"use client";

/**
 * 서버와의 실시간 WebSocket 연결 (알림·채팅 수신).
 * - 서버 WS 는 API 와 같은 포트의 /ws?token=<세션토큰> 로 접속한다.
 * - 단일 연결을 공유하고, 이벤트 type 별로 구독자에게 브로드캐스트한다.
 * - 끊기면 지수 백오프로 재연결한다.
 *
 * (전역 apiFetch 는 보호 파일이라 건드리지 않고, 여기서 토큰만 읽어 사용한다.)
 */

type Listener = (payload: unknown) => void;

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
const TOKEN_KEY = "d4d_token";

let socket: WebSocket | null = null;
let reconnectAt = 1000;
let closedByUs = false;
const listeners = new Map<string, Set<Listener>>();

function wsUrl(): string | null {
  if (typeof window === "undefined") return null;
  const token = sessionStorage.getItem(TOKEN_KEY);
  if (!token) return null;
  // API_BASE(http/https) → ws/wss. 비어 있으면 현재 호스트 기준.
  const base = API_BASE || window.location.origin;
  const url = new URL(base);
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  url.pathname = "/ws";
  url.search = `?token=${encodeURIComponent(token)}`;
  return url.toString();
}

function connect() {
  const url = wsUrl();
  if (!url || socket) return;
  closedByUs = false;
  try {
    socket = new WebSocket(url);
  } catch {
    scheduleReconnect();
    return;
  }
  socket.onopen = () => {
    reconnectAt = 1000; // 성공하면 백오프 리셋
  };
  socket.onmessage = (e) => {
    let msg: { type?: string } | null = null;
    try {
      msg = JSON.parse(e.data);
    } catch {
      return;
    }
    if (msg?.type) emit(msg.type, msg);
  };
  socket.onclose = () => {
    socket = null;
    if (!closedByUs) scheduleReconnect();
  };
  socket.onerror = () => {
    socket?.close();
  };
}

function scheduleReconnect() {
  if (closedByUs) return;
  setTimeout(connect, reconnectAt);
  reconnectAt = Math.min(reconnectAt * 2, 15000);
}

function emit(type: string, payload: unknown) {
  listeners.get(type)?.forEach((fn) => fn(payload));
}

/** 특정 이벤트 type 구독. 해제 함수를 반환한다. 첫 구독 시 연결을 연다. */
export function subscribe(type: string, fn: Listener): () => void {
  if (!listeners.has(type)) listeners.set(type, new Set());
  listeners.get(type)!.add(fn);
  connect();
  return () => {
    listeners.get(type)?.delete(fn);
  };
}

/** 로그아웃 시 연결 종료 */
export function closeRealtime() {
  closedByUs = true;
  socket?.close();
  socket = null;
}
