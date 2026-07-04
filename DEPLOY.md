# 배포 가이드 (Webhook 서버 컨테이너 자동배포)

`main` 브랜치에 push하면 GitHub Webhook이 서버의 **웹훅 컨테이너**로 전달되고,
컨테이너가 HMAC 서명을 검증한 뒤 **`deploy.sh`** 를 실행해 앱 이미지 빌드 → 앱 컨테이너 교체를 수행합니다.

```
git push origin main
      │  GitHub Webhook (push, application/json, X-Hub-Signature-256)
      ▼
d4d-webhook 컨테이너 (:9000)   ── webhook-server.js: HMAC + branch 검증
      │  deploy.sh 실행 (host docker.sock 사용)
      ▼
docker build  →  docker run  (docker_default / 172.23.0.4 : 9555)
      ▼
d4d-front 컨테이너 (앱)
```

웹훅 서버만 도커 이미지로 돌고, 그 안에서 host Docker 데몬을 조작해 앱을 빌드/실행합니다.

## 구성 (deploy/)

| 파일                | 역할                                                        |
| ------------------- | ----------------------------------------------------------- |
| `Dockerfile`        | 웹훅 서버 이미지 (Node + docker CLI + git + flock)          |
| `webhook-server.js` | 웹훅 수신 (의존성 0, HMAC 검증 → deploy.sh 실행)            |
| `webhook-up.sh`     | 웹훅 이미지 빌드 + 컨테이너 실행                            |
| `deploy.sh`         | 앱 이미지 빌드 + 앱 컨테이너 실행 (고정 IP)                 |

## 1. 서버 최초 1회 준비

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER          # 재로그인 후 적용

git clone https://github.com/d4d-condition-1/front.git ~/apps/d4d-front
cd ~/apps/d4d-front

cp .env.example .env
openssl rand -hex 32                    # 출력을 WEBHOOK_SECRET 에 기입
nano .env

# 고정 IP용 외부 네트워크 (172.23.0.0/16 대역)
docker network inspect docker_default >/dev/null 2>&1 \
  || docker network create --subnet 172.23.0.0/16 docker_default
```

> 서버에 Node 설치는 필요 없습니다 (웹훅 서버가 컨테이너 안에서 실행).

## 2. 웹훅 컨테이너 기동

```bash
cd ~/apps/d4d-front
bash deploy/webhook-up.sh
docker logs -f d4d-webhook              # "listening on :9000" 확인
```

`--restart unless-stopped` 라 서버 재부팅 시 자동 기동됩니다.
첫 앱 배포는 수동으로 한 번:

```bash
docker exec d4d-webhook bash /app/deploy/deploy.sh
```

## 3. GitHub Webhook 등록

`저장소 → Settings → Webhooks → Add webhook`

| 항목         | 값                                             |
| ------------ | ---------------------------------------------- |
| Payload URL  | `http://<서버IP>:9000/webhook` (또는 HTTPS 도메인) |
| Content type | `application/json`                             |
| Secret       | `.env` 의 `WEBHOOK_SECRET` 과 **동일**         |
| Events       | `Just the push event`                          |

등록 후 "Recent Deliveries"에서 `ping → pong(200)` 확인.

## 4. 배포 & 로그

```bash
git push origin main
docker logs -f d4d-webhook              # 배포 진행 로그
```

## 참고

- **9000 포트 오픈** 필요(방화벽/보안그룹). 실서비스는 Nginx/Caddy로 HTTPS 프록시 권장.
- **private 저장소**면 컨테이너 안 git pull 인증 수단 필요(HTTPS 토큰 remote 또는 deploy key).
- **CI**: `.github/workflows/ci.yml` 은 push/PR 때 lint+build 검증만 (배포 무관).
- **롤백**: `docker exec d4d-webhook sh -c 'cd /app && git reset --hard <커밋> && bash deploy/deploy.sh'`.
- `deploy.sh` 는 raw `docker build`/`docker run` 방식이라 루트 `docker-compose.yml` 은
  로컬 개발용(`docker compose up`)으로만 남겨둔 참고 파일입니다.
