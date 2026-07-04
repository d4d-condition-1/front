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
