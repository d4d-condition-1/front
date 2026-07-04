/**
 * 앱 전역 HTTP 클라이언트.
 * 모든 외부 API 호출은 이 래퍼를 거치도록 하여
 * baseURL / 공통 헤더 / 에러 처리를 한 곳에서 관리한다.
 *
 * 기능별 요청 함수는 features/<기능>/api/*.ts 에서 apiFetch를 감싸 정의한다.
 */
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!res.ok) {
    throw new ApiError(res.status, `Request failed with status ${res.status}`);
  }

  // 204 No Content 대응
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
