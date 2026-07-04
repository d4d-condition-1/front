# features/ — 기능(도메인) 수직 슬라이스

한 기능에 필요한 화면·로직·타입을 이 폴더 안에 모은다. 기능 간 결합을 낮추는 것이 목적.

## 새 기능 추가 시 폴더 구조 (posts 예시 참고)

```
features/<기능>/
├── components/   # 이 기능 전용 컴포넌트 (화면만 그림)
├── hooks/        # 이 기능 전용 로직 (상태/데이터). "use client"
├── api/          # 요청 함수 — @/lib/api 의 apiFetch를 감쌈
├── types.ts      # 이 기능 전용 타입
└── index.ts      # 공개 API(barrel) — 외부는 여기로만 import
```

## 규칙

- 채우는 순서: `api` → `hooks` → `components` (로직 먼저, 화면 나중).
- 컴포넌트에서 `fetch` 직접 호출 금지. 반드시 `api/` 함수 또는 `hooks/`를 경유.
- **다른 기능**을 쓸 때는 barrel로만: `import { X } from "@/features/other"` (내부 경로 직접 참조 금지 — lint 에러).
- 외부에 노출할 것만 `index.ts`에 export 한다.
