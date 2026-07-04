# 서버 구현 계획 (초본)

> 전투 숙달 가속 시뮬레이터 — 백엔드 3-repo 분리 설계 초안.
> 프론트(`front`, mock 완료)는 각 feature의 `api/*.ts` mock 함수를 실제 엔드포인트로 교체하면 연결됨.
> 확정 전 검토가 필요한 항목은 문서 끝 **[결정 필요]** 참고.

---

## 1. 목표

- 관리자가 교범을 업로드하면 **AI가 그 자료를 근거로 문항을 생성**한다.
- 장병은 **진단 → 적응형 훈련 → 리포트** 루프를 돈다.
- 각 서비스는 **물리적으로 분리된 repo/컨테이너**로 운영하고, 공통 `docker_default` 네트워크로 통신한다.
- 배포는 기존과 동일하게 **GitHub Webhook → 컨테이너 재빌드** 방식.

---

## 2. 시스템 아키텍처

### Repo 구성 (4개)

| Repo | 역할 | 스택 | 상태 |
|------|------|------|------|
| `front` | 장병 앱 + 관리자 콘솔 (UI) | Next.js 16 | ✅ 완료(mock) |
| `webhook` | 배포 오케스트레이션 (전 repo 공통) | Node(무의존) + Docker CLI | ✅ 기반 존재(현재 front에 내장 → 분리 예정) |
| `api` | 백엔드 API + AI 엔진 | Express + TS | ⬜ 신규 |
| `db` | 스키마 · 마이그레이션 · 시드 | PostgreSQL(권장) | ⬜ 신규 |

### 런타임 토폴로지

```
                 인터넷
                   │  443 (HTTPS)
              ┌────▼─────┐
              │   NPM     │  Nginx Proxy Manager (리버스 프록시/TLS)
              └──┬───┬───┬┘
      app.도메인 │   │   │ hook.도메인
                 │   │   └────────────────┐
        ┌────────▼┐ ┌▼──────────┐   ┌─────▼──────┐
        │  front  │ │    api     │   │  webhook   │
        │  :9555  │ │   :9500    │   │   :9444    │
        └─────────┘ └─────┬──────┘   └─────┬──────┘
                          │ 5432           │ docker.sock
                     ┌────▼─────┐          │ (호스트 Docker 조작)
                     │    db     │◄─────────┘  배포 시 각 컨테이너 재생성
                     │  :5432    │
                     └───────────┘
        모두 동일 네트워크: docker_default (172.23.0.0/16)
```

### 포트 / 네트워크

| 서비스 | 컨테이너 | 호스트 노출 | 고정 IP(예) | 외부 공개 |
|--------|----------|-------------|-------------|-----------|
| front | `d4d-front` | 9555 | 172.23.0.4 | NPM 경유 |
| api | `d4d-api` | 9500 | 172.23.0.5 | NPM 경유(`/api`) |
| db | `d4d-db` | (미노출) | 172.23.0.6 | ❌ 내부만 |
| webhook | `d4d-webhook` | 9444 | - | NPM 경유(배포 트리거) |

> DB 포트(5432)는 **호스트에 노출하지 않고** docker_default 내부에서만 접근. api만 접근 가능.

---

## 3. Repo별 책임 · 기능

### 3-1. `webhook` — 배포 오케스트레이션 (분리)

현재 `front/deploy/`에 있는 웹훅 서버를 **독립 repo**로 분리하고, **여러 repo를 배포**하도록 확장.

- [x] GitHub push 수신 → HMAC(`X-Hub-Signature-256`) 검증 → 브랜치 필터
- [ ] **멀티 타깃 배포**: repo별 라우팅
  - `POST /webhook/front` → front 재배포
  - `POST /webhook/api`   → api 재배포
- [ ] repo별 `deploy.sh` 매핑 테이블 (`config.json`)
- [x] 동시 배포 잠금(flock), 중복 방지
- [ ] 배포 결과 로깅/알림 (선택: Slack/Discord webhook)

```
webhook/
├── webhook-server.js      # 수신 + 라우팅 + 서명검증
├── config.json            # { "front": {dir, script}, "api": {dir, script} }
├── deploy/front.sh        # git pull + docker build/run (front)
├── deploy/api.sh          # git pull + docker build/run (api)
├── Dockerfile             # node + docker-cli + git
└── docker-compose.yml
```

### 3-2. `api` — 백엔드 핵심

**레이어 구조 (front의 feature 컨벤션과 대칭)**

```
api/src/
├── modules/
│   ├── auth/          # 로그인, JWT 발급/검증, 역할(admin/trainee)
│   ├── materials/     # 교범 업로드, 텍스트 추출, 청크 저장
│   ├── ai/            # LLM 호출 래퍼 (문항 생성 / 서술형 채점)
│   ├── diagnostic/    # 진단 테스트 문항/채점
│   ├── training/      # 적응형 문항 선택 + 채점 + 점수 갱신
│   ├── proficiency/   # 카테고리 점수/등급 계산
│   ├── report/        # 리포트/통계 집계
│   └── admin/         # 사용자·API키·대시보드
├── db/                # DB 커넥션 (db repo 스키마 사용)
├── lib/               # 공통 유틸, 에러, 미들웨어
└── server.ts
```

**기능 목록 (스펙 4절 대응)**

| 기능 | 구현 요지 |
|------|-----------|
| 진단 테스트 | 카테고리별 대표 문항 10~14개 반환 → 답변 채점 → 초기 proficiency 생성 |
| 적응형 문항 선택 | 최저 점수 카테고리 우선 → 점수→Lv 매핑 → AI 문항 생성 |
| 채점/점수 갱신 | 정답 +5~10 / 오답 −3~5, 3연속 정답 시 카테고리 전환 |
| 서술형 채점(Lv.5) | AI가 교리정확성·상황적합성·완전성·논리성 채점 |
| 리포트 | 카테고리 점수(레이더), 강점/약점, 추천 학습 경로 |
| 관리자 | 자료 CRUD, API키 관리, 사용자/부대 현황 |

### 3-3. `db` — 데이터 계층

- **PostgreSQL 컨테이너** (권장) — 스키마·마이그레이션·시드를 이 repo가 소유.
- api는 이 DB에 접속만 함(스키마 변경은 db repo에서 관리).

```
db/
├── docker-compose.yml     # postgres:16 + 볼륨
├── migrations/            # 001_init.sql, 002_...  (순차 적용)
├── seed/                  # categories(7개), 관리자 계정 등 시드
├── schema.sql             # 전체 스키마 스냅샷(참고용)
└── Dockerfile             # (initdb.d 로 마이그레이션 자동 적용)
```

> MVP를 최대한 빨리 돌리려면 **SQLite(api 내장)** 도 가능. 단, repo를 물리적으로 나누는 목표상 **독립 Postgres 컨테이너**가 정합적. → [결정 필요]

---

## 4. 데이터 모델 (스키마 초안)

```sql
-- 사용자(장병/관리자)
CREATE TABLE users (
  id           SERIAL PRIMARY KEY,
  name         TEXT NOT NULL,
  role         TEXT NOT NULL CHECK (role IN ('admin','trainee')),
  rank         TEXT,                    -- 계급
  unit         TEXT,                    -- 소속부대
  password_hash TEXT,
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- 역량 카테고리 (시드: TAC/FIR/TER/COM/MED/NBC/EQP)
CREATE TABLE categories (
  id          SERIAL PRIMARY KEY,
  code        TEXT UNIQUE NOT NULL,
  name        TEXT NOT NULL,
  description TEXT
);

-- 학습 자료 (교범) — 청크 단위 저장
CREATE TABLE materials (
  id          SERIAL PRIMARY KEY,
  title       TEXT NOT NULL,
  category_id INT REFERENCES categories(id),
  content     TEXT NOT NULL,           -- 청크 텍스트
  chunk_index INT DEFAULT 0,
  file_url    TEXT,
  is_active   BOOLEAN DEFAULT true,
  created_by  INT REFERENCES users(id),
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- AI가 생성/출제한 문항 이력
CREATE TABLE questions_history (
  id            SERIAL PRIMARY KEY,
  user_id       INT REFERENCES users(id),
  category_id   INT REFERENCES categories(id),
  question_json JSONB NOT NULL,        -- 문항/선택지/정답/해설/출처
  user_answer   TEXT,
  is_correct    BOOLEAN,
  score_awarded INT,                   -- 점수 변동(+/-)
  difficulty    INT,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- 사용자별 카테고리 숙련도
CREATE TABLE proficiency (
  id            SERIAL PRIMARY KEY,
  user_id       INT REFERENCES users(id),
  category_id   INT REFERENCES categories(id),
  score         INT DEFAULT 45 CHECK (score BETWEEN 0 AND 100),
  total_attempts INT DEFAULT 0,
  correct_count INT DEFAULT 0,
  streak        INT DEFAULT 0,         -- 연속 정답(카테고리 전환 판단)
  updated_at    TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, category_id)
);

-- LLM API 설정
CREATE TABLE api_config (
  id            SERIAL PRIMARY KEY,
  provider      TEXT NOT NULL,         -- anthropic / openai
  label         TEXT,                  -- 용도(문항생성/채점)
  api_key_enc   TEXT NOT NULL,         -- 암호화 저장
  model         TEXT NOT NULL,
  is_active     BOOLEAN DEFAULT true,
  created_by    INT REFERENCES users(id),
  created_at    TIMESTAMPTZ DEFAULT now()
);
```

---

## 5. API 엔드포인트 (스펙 8절 정리)

### 인증
```
POST /api/auth/login            로그인 → JWT
GET  /api/auth/me               내 정보
```

### 사용자(Trainee)
```
GET  /api/training/diagnostic       진단 문항 요청
POST /api/training/diagnostic       진단 답변 제출 → 초기 프로필
POST /api/training/next-question    다음 적응형 문항 (약점 우선)
POST /api/training/submit-answer    답변 제출 + 채점 + 점수 갱신
GET  /api/profile/scores            카테고리 점수(레이더)
GET  /api/profile/report            강점/약점/추천
GET  /api/profile/history           학습 이력
```

### 관리자(Admin)
```
POST   /api/admin/materials         자료 업로드 (multipart)
GET    /api/admin/materials         자료 목록
PATCH  /api/admin/materials/:id     활성/비활성 토글
DELETE /api/admin/materials/:id     삭제
POST   /api/admin/api-config        API키 등록
POST   /api/admin/api-config/test   연결 테스트
GET    /api/admin/users             장병 목록
GET    /api/admin/users/:id/stats   개별 현황
GET    /api/admin/dashboard         부대 전체 현황
```

**응답 예 — 다음 문항**
```jsonc
// POST /api/training/next-question  →
{
  "id": 1421,
  "category": "FIR",
  "difficulty": 3,
  "type": "situational",
  "situation": "당신은 소대 2분대장입니다...",
  "question": "가장 적절한 행동은?",
  "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
  // 정답/해설은 submit 후 반환 (프론트로 미리 노출 X)
}
```

---

## 6. AI 연동 설계 (`api/modules/ai`)

- **SDK**: `@anthropic-ai/sdk` (기본). provider 추상화로 OpenAI도 교체 가능.
- **모델 선택 (권장, 최신 기준)**
  - 문항 생성: `claude-sonnet-5` (품질/속도 균형)
  - 서술형 채점(Lv.5): `claude-opus-4-8` (정밀 평가)
  - 저비용 분류/태깅: `claude-haiku-4-5`
- **구조화 출력**: 프롬프트 JSON 강제보다 **Tool Use(structured output)** 로 스키마 고정 → 파싱 실패 시 재시도.
- **근거 자료 주입(RAG-lite, MVP)**: 해당 카테고리의 `materials` 청크를 프롬프트에 삽입.
  (임베딩 검색은 후순위 — MVP는 카테고리 필터 + 최근 오답 키워드로 충분)
- **가드레일**: "제공된 학습 자료 범위 내에서만 출제", 최근 오답 키워드 우선.

> 문항 생성/채점 프롬프트 원본은 스펙 4-2 / 4-3 참고. → 확정 모델·가격은 발주 전 최신 확인 [결정 필요].

---

## 7. 인증 · 보안

- **JWT**(Bearer) + 역할 기반 접근제어(admin/trainee 미들웨어).
- 비밀번호 `bcrypt` 해시.
- **API 키 암호화 저장**(`api_config.api_key_enc`) — 서버 환경변수 키로 AES 암호화, 응답 시 마스킹.
- DB는 외부 미노출(내부 네트워크만), api만 접근.
- 웹훅은 HMAC 시크릿(`.env`, gitignore) — [DEPLOY.md](../DEPLOY.md) 참고.

---

## 8. 배포 파이프라인 (repo별)

각 repo(`front`,`api`,`db`)에 GitHub Webhook을 걸고, 공통 `webhook` 서버가 라우팅 배포.

```
GitHub(각 repo) push
   → NPM(443) → webhook(:9444)/webhook/<repo>
   → HMAC 검증 → deploy/<repo>.sh
   → docker build + docker run (docker_default, 고정 IP)
```

- `.env`(포트/시크릿/DB URL)는 gitignore → **서버에서 직접 관리**.
- 현재 포트: **front 9555 / webhook 9444 / api 9500 / db 5432(내부)**.
- NPM Proxy Host: `app.*→d4d-front:9555`, `api.*→d4d-api:9500`, `hook.*→d4d-webhook:9444`.

---

## 9. MVP 스코프 & 마일스톤

### Phase 1 — 뼈대 (반드시)
- [ ] `db`: Postgres 컨테이너 + 스키마 + categories 시드
- [ ] `api`: 프로젝트 셋업, auth(로그인/JWT), DB 커넥션
- [ ] `api`: 관리자 자료 업로드(PDF→텍스트→청크 저장)
- [ ] `api`: API키 등록 + 연결 테스트
- [ ] `webhook`: front/api 멀티 배포 라우팅

### Phase 2 — 핵심 루프
- [ ] `api`: 진단 테스트(문항 반환 + 채점 + 초기 프로필)
- [ ] `api`: 적응형 훈련(문항 선택 + AI 생성 + 채점 + 점수 갱신)
- [ ] `api`: 리포트(레이더/강점·약점)
- [ ] `front`: mock → 실제 API 연동 교체

### Phase 3 — 확장
- [ ] 서술형(Lv.5) AI 채점
- [ ] 부대 대시보드 집계
- [ ] RAG 임베딩 검색 고도화

---

## 10. [결정 필요]

1. **DB**: 독립 Postgres 컨테이너(권장) vs api 내장 SQLite(빠른 MVP) — repo 분리 목표상 전자 추천.
2. **repo 네이밍/소유**: `d4d-condition-1/api`, `/db`, `/webhook` 확정?
3. **webhook 위치**: front에서 분리해 독립 repo로? (현재는 front/deploy 내장)
4. **AI provider/모델**: Anthropic 단독 vs 멀티 — 확정 모델ID·예산.
5. **인증 범위**: MVP에서 장병 로그인까지 필요? (익명 세션으로 단축 가능)
6. **파일 저장**: PDF 원본을 어디에(로컬 볼륨 vs 오브젝트 스토리지).
```
