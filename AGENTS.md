<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# 프로젝트 구조 규약 (반드시 준수)

전체 설명은 `docs/STRUCTURE.md` 참고. 코드를 추가할 때 아래 규칙을 따른다.

- **page / component / logic 분리**를 유지한다. 컴포넌트는 화면만 그리고, 데이터·상태 로직은 훅/api로 분리한다. 컴포넌트에서 `fetch`를 직접 호출하지 않는다.
- 배치 규칙:
  - 특정 한 기능 전용 코드 → `src/features/<기능>/` (`components` / `hooks` / `api` / `types.ts`)
  - 여러 기능 공용 UI → `src/components/{ui,layout}`
  - 여러 기능 공용 로직/유틸 → `src/lib/{api,hooks,utils}`
  - 전역 타입 → `src/types`, 전역 상수 → `src/constants`
- `app/`(page 계층)은 라우팅·조립만 하고 알맹이는 `features/`에서 import해 얇게 유지한다.
- 다른 기능을 참조할 때는 내부 경로가 아니라 barrel(`@/features/<기능>`)로만 import한다.
- 외부 API 호출은 `@/lib/api`의 `apiFetch`를 감싸 `features/*/api`에 함수로 정의한다.
- 새 기능은 `src/features/posts` 구조를 참고한다(이 폴더 자체는 예시이므로 실제 기능 추가 시 교체/삭제).

# 🔒 보호 영역 (AI 수정 금지)

아래 파일/디렉터리는 **앱 전체의 통신 규약·환경·배포를 결정하는 핵심 영역**이다.
AI 에이전트는 이 영역을 **읽는 것은 가능하지만 절대 수정/생성/삭제하지 않는다**
(`.claude/settings.json` 의 deny 규칙으로도 강제된다). 변경이 필요하면 수정안만
제시하고 관리자(리포 소유자)가 직접 반영한다.

- `src/lib/api/**` — 전역 HTTP 클라이언트(apiFetch)·인증 토큰 처리
- `src/app/api/**` — Next.js 서버 라우트(핸들러)
- `next.config.ts` — 빌드/런타임 설정
- `.env*` — 환경 변수 (시크릿 포함)
- `deploy/**` — 배포 스크립트·웹훅 서버
- `.claude/settings.json` — 이 보호 규칙 자체

기능 코드에서 API 를 호출할 때는 기존 `apiFetch` 를 **그대로 가져다 쓰기만** 한다.
새로운 공통 헤더·인터셉터가 필요해도 `client.ts` 를 고치지 말고 관리자에게 요청할 것.
