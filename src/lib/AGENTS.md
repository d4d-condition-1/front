# lib/ — 전역 공용 로직

**여러 기능이 공유하는** 순수 로직/유틸만 둔다. 특정 기능 전용 로직은 `features/<기능>/hooks|api`로.

- `api/` : 전역 HTTP 클라이언트(`apiFetch`). 모든 외부 요청의 진입점.
- `hooks/` : 도메인과 무관한 공용 훅.
- `utils/` : 사이드이펙트 없는 순수 함수.

## 규칙

- `@/features/*` 를 import하지 않는다 (의존 방향은 features → lib 한 방향 — lint 에러).
- `utils/`의 함수는 순수하게(입력→출력) 유지한다.
- React 훅 파일 상단에는 필요 시 `"use client"`.
