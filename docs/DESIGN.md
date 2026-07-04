# D4D 디자인 시스템 — "모던 택티컬"

군 훈련 도구다운 절제된 올리브 그린 팔레트 + 각진 실루엣.
모든 토큰은 [src/app/globals.css](../src/app/globals.css)의 `@theme` 블록에 정의되어 있고,
컴포넌트는 **시맨틱 이름(`primary-*`)만 사용**한다. 하드코딩 hex 금지
(SVG 차트도 `var(--color-primary-600)` 형태로 토큰을 참조).

## 컬러 토큰

| 토큰 | 값 | 용도 |
| --- | --- | --- |
| `primary-600` | `#5c7335` | 주 액션 (버튼, 활성 탭, 차트 강조) |
| `primary-700` | `#47592b` | hover, 밝은 배경 위 텍스트 |
| `primary-50~200` | 카키 틴트 | 배지·아바타·활성 메뉴 배경 |
| `primary-900~950` | 다크 올리브 | 랜딩/다크 히어로 배경 |
| `emerald` | Tailwind 기본 | 성공/긍정 지표 |
| `amber` | Tailwind 기본 | 주의/시그널 |
| `red` | Tailwind 기본 | 위험/약점/파괴적 액션 |
| `slate` | Tailwind 기본 | 중립 텍스트·보더·비활성 |

배경: `--background: #f4f5f0`(옅은 카키 화이트) / 전경: `--foreground: #191c14`.

## 형태·타이포

- **라디우스**: `@theme`에서 `--radius-lg/xl/2xl/3xl`을 기본보다 한 단계 축소 — 각진 전술 장비 느낌. 마크업은 계속 `rounded-xl` 등을 쓰면 된다.
- **타이포**: 본문 Geist Sans. 군사 코드·좌표·라벨성 텍스트는 `font-mono` + `uppercase tracking-[0.3em]` 조합 (랜딩 태그라인 참고).

## 사용 규칙

1. 브랜드 색이 필요하면 무조건 `primary-*`. `indigo-*`/`violet-*`는 금지 (2026-07 스윕으로 전량 제거).
2. `Badge` 톤은 `primary | green | amber | slate | red` 5종 — 등급 S=`primary`, A/B=`green`, C=`amber`, D=`red`.
3. 상태색은 시맨틱하게: 성공=emerald, 주의=amber, 위험=red. 장식 목적의 새 색 추가 금지.
4. 다크 히어로(랜딩 등)에서는 글래스 패널(`bg-white/10 backdrop-blur`) + `primary-100/200` 텍스트 틴트.
