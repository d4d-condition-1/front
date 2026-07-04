# components/ — 전역 공용 컴포넌트

**여러 기능이 공유하는** UI만 둔다. 특정 한 기능에서만 쓰는 컴포넌트는 `features/<기능>/components`로.

- `ui/` : Button, Input 등 순수 프레젠테이션 프리미티브 (도메인 지식 없음).
- `layout/` : Container, Header, Footer 등 레이아웃.

## 규칙

- 순수하게 유지: props로 받은 데이터를 그리기만 한다. 데이터 로딩/전역 상태 로직을 넣지 않는다.
- `@/features/*` 를 import하지 않는다 (공용 계층은 기능을 몰라야 함 — lint 에러).
- className 조합은 `@/lib/utils`의 `cn` 사용.
