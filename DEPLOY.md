# 배포 가이드 (Webhook 서버 자동배포)

`main` 브랜치에 push하면 GitHub Webhook이 서버에서 도는 **웹훅 서버**로 전달되고,
서버가 HMAC 서명을 검증한 뒤 **`deploy.sh`** 를 실행해 이미지 빌드 → 컨테이너 교체를 수행합니다.

```
git push origin main
      │  GitHub Webhook (push, application/json, X-Hub-Signature-256)
      ▼
webhook-server.js (:9000, 호스트에서 실행)  ── HMAC + branch 검증
      │  deploy.sh 실행
      ▼
docker build  →  docker run  (docker_default / 172.23.0.4 : 3000)
```

호스트에서 실행되므로 docker/git CLI를 그대로 쓰며 별도 컨테이너·소켓 마운트가 없습니다.

## 구성 (deploy/)

| 파일                | 역할                                                     |
| ------------------- | -------------------------------------------------------- |
| `webhook-server.js` | 웹훅 수신 서버 (의존성 0, HMAC 검증 → deploy.sh 실행)    |
| `deploy.sh`         | 이미지 빌드 + 컨테이너 실행 (고정 IP)                    |
| `webhook.service`   | systemd 유닛 (웹훅 서버 상시 실행)                       |

## 1. 서버 최초 1회 준비

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER          # 재로그인 후 적용
sudo apt-get install -y nodejs         # 웹훅 서버 실행용 (Node 18+)

git clone https://github.com/d4d-condition-1/front.git ~/apps/d4d-front
cd ~/apps/d4d-front

cp .env.example .env
openssl rand -hex 32                    # 출력을 WEBHOOK_SECRET 에 기입
nano .env

# 고정 IP용 외부 네트워크 (172.23.0.0/16 대역)
docker network inspect docker_default >/dev/null 2>&1 \
  || docker network create --subnet 172.23.0.0/16 docker_default
```

## 2. 웹훅 서버 상시 실행 (systemd)

```bash
sudo cp deploy/webhook.service /etc/systemd/system/d4d-webhook.service
sudo nano /etc/systemd/system/d4d-webhook.service   # User / 경로 확인
sudo systemctl daemon-reload
sudo systemctl enable --now d4d-webhook
sudo systemctl status d4d-webhook                   # "listening on :9000" 확인
```

첫 배포는 수동으로 한 번 돌려도 됩니다:  `bash deploy/deploy.sh`

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
journalctl -u d4d-webhook -f            # 배포 진행 로그
```

## 참고

- **9000 포트 오픈** 필요(방화벽/보안그룹). 실서비스는 Nginx/Caddy로 HTTPS 프록시 권장.
- **CI**: `.github/workflows/ci.yml` 은 push/PR 때 lint+build 검증만 (배포 무관).
- **롤백**: `cd ~/apps/d4d-front && git reset --hard <커밋> && bash deploy/deploy.sh`.
- `deploy.sh` 는 raw `docker build`/`docker run` 방식이라 루트 `docker-compose.yml` 은
  로컬 개발용(`docker compose up`)으로만 남겨둔 참고 파일입니다.
