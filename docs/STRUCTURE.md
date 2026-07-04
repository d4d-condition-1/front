# 프로젝트 구조 가이드

AI 협업 개발을 전제로, **page(화면) / component(UI) / logic(로직)** 을 명확히 분리한 구조입니다.
"이 코드는 어디에 둬야 하나?"의 답이 항상 하나가 되도록 규칙을 고정합니다.

Cicd 테스트

## 폴더 개요

```
src/
├── app/                     # ① page 계층 — 라우팅 전용. 얇게 유지.
│   ├── layout.tsx           #   공통 레이아웃
│   ├── page.tsx             #   "/" 페이지
│   └── api/health/route.ts  #   서버 라우트(핸들러)
│
├── features/                # ② 기능(도메인) 수직 슬라이스 — 앱의 핵심
│   └── posts/               #   ← [예시] 새 기능은 이 구조를 복사
│       ├── components/      #     이 기능 전용 컴포넌트 (화면)
│       ├── hooks/           #     이 기능 전용 로직 (상태/데이터)
│       ├── api/             #     이 기능 데이터 요청 함수
│       ├── types.ts         #     이 기능 전용 타입
│       └── index.ts         #     공개 API(barrel) — 외부는 여기로만 import
│
├── components/              # ③ 전역 공용 컴포넌트 (여러 기능이 공유)
│   ├── ui/                  #     Button 등 순수 프리미티브
│   └── layout/              #     Container/Header/Footer 등
│
├── lib/                     # ④ 전역 공용 로직 (여러 기능이 공유)
│   ├── api/                 #     HTTP 클라이언트(apiFetch)
│   ├── hooks/               #     공용 훅
│   └── utils/               #     순수 유틸(cn 등)
│
├── types/                   # ⑤ 전역 공용 타입
└── constants/               # ⑥ 전역 상수
```

## 계층별 역할 (page / component / logic)

| 단위          | 위치                                            | 담당                                   |
| ------------- | ----------------------------------------------- | -------------------------------------- |
| **page**      | `app/**/page.tsx`, `route.ts`                   | 라우팅·조립만. 로직/마크업은 위임      |
| **component** | `features/*/components/`, `components/`         | 화면(UI). 받은 데이터를 그리기만       |
| **logic**     | `features/*/hooks` · `*/api`, `lib/`            | 상태·데이터·유틸. UI를 모름            |

핵심 원칙: **화면(component)과 로직(hook/api)을 항상 분리**한다.
컴포넌트는 `fetch`를 직접 부르지 않고 훅/api 함수를 통해서만 데이터를 얻는다.

## 데이터 흐름 (posts 예시)

```
app/page.tsx
   └─ <PostList/>                     (features/posts/components) — 화면
        └─ usePosts()                 (features/posts/hooks)      — 로직
             └─ fetchPosts()          (features/posts/api)        — 요청 함수
                  └─ apiFetch()       (lib/api)                   — 공용 HTTP 클라이언트
```

## "이 코드는 어디에?" 결정 규칙

- 특정 **한 기능**에서만 쓴다 → `features/<기능>/` 안에 (component/hook/api/type)
- **여러 기능**이 공유하는 UI → `components/ui` 또는 `components/layout`
- **여러 기능**이 공유하는 로직/유틸 → `lib/`
- URL(화면)이 새로 필요하다 → `app/`에 라우트 추가 후, 알맹이는 `features/`에서 import

## 새 기능 추가 절차

1. `src/features/<이름>/` 생성 — `components/`, `hooks/`, `api/`, `types.ts`, `index.ts`
2. `api/` → `hooks/` → `components/` 순으로 채운다 (로직 먼저, 화면 나중)
3. `index.ts`에 외부 공개 대상만 export
4. 화면이 필요하면 `app/<경로>/page.tsx`에서 `@/features/<이름>`을 import해 조립

## import 규칙

- 별칭 `@/*` = `src/*` (예: `@/lib/utils`, `@/components/ui`, `@/features/posts`)
- 다른 기능을 쓸 때는 **반드시 barrel(`@/features/<이름>`)로** import.
  `@/features/posts/hooks/usePosts` 처럼 내부 경로를 직접 참조하지 않는다.
- `features/posts`는 패턴을 보여주는 **예시**다. 실제 개발 시 참고 후 삭제/교체한다.
