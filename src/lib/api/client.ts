/**
 * 앱 전역 HTTP 클라이언트.
 * 모든 외부 API 호출은 이 래퍼를 거치도록 하여
 * baseURL / 공통 헤더 / 인증 / 에러 처리를 한 곳에서 관리한다.
 *
 * 기능별 요청 함수는 features/<기능>/api/*.ts 에서 apiFetch를 감싸 정의한다.
 *
 * ⚠️ 보호 파일: 이 파일은 앱 전체의 통신 규약이다.
 *    수정은 관리자 승인 하에서만 한다 (AGENTS.md '보호 영역' 참고).
 */
/**
 * API 주소 결정:
 * 1) NEXT_PUBLIC_API_BASE_URL 이 빌드에 주어졌으면 그 값을 쓰고,
 * 2) 없으면 브라우저 접속 주소의 호스트 + :9666 으로 자동 유도한다.
 *    (데모용 — 어떤 IP/도메인으로 접속해도 같은 호스트의 API 를 바라본다)
 */
function resolveBaseUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (fromEnv) return fromEnv;
  if (typeof window === "undefined") return "";
  if (window.location.protocol === "https:") return "";   // 프록시가 /api 를 백엔드로
  return `http://${window.location.hostname}:9666`;
}

const BASE_URL = resolveBaseUrl();
const TOKEN_KEY = "d4d_token";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/** 세션 토큰 저장/삭제 (features/auth 에서만 호출) */
export function setAuthToken(token: string) {
  if (typeof window !== "undefined") localStorage.setItem(TOKEN_KEY, token);
}

export function clearAuthToken() {
  if (typeof window !== "undefined") localStorage.removeItem(TOKEN_KEY);
}

function authHeader(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem(TOKEN_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    // 세션 쿠키(d4d_session) 포함 — Bearer 토큰과 이중화
    credentials: "include",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...authHeader(),
      ...init?.headers,
    },
  });

  if (!res.ok) {
    // 서버는 { message } 형태로 에러 사유를 내려준다
    let message = `요청 실패 (status ${res.status})`;
    try {
      const body = await res.json();
      if (body?.message) message = body.message;
    } catch {
      // 본문이 JSON 이 아니면 기본 메시지 사용
    }
    throw new ApiError(res.status, message);
  }

  // 204 No Content 대응
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
