# app/ — page 계층 (라우팅 전용)

- 이 폴더는 **라우팅과 조립만** 한다. 얇게 유지.
- 화면 알맹이는 `@/features/<기능>` 또는 `@/components`에서 import해 배치한다.
- 데이터 로딩/상태/비즈니스 로직을 여기에 직접 쓰지 않는다 → `features/*/hooks`, `features/*/api`로.
- `page.tsx`는 기본 서버 컴포넌트. 클라이언트 훅이 필요한 부분만 `"use client"` 컴포넌트로 분리한다.
