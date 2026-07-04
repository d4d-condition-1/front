#!/bin/bash
set -euo pipefail

# ─────────────────────────────────────────────────────────────
# 웹훅 서버를 도커 이미지로 빌드해서 실행/재시작한다.
# (앱은 이 컨테이너가 push 를 받아 deploy.sh 로 빌드/실행한다)
#
#   사용:  bash deploy/webhook-up.sh
# ─────────────────────────────────────────────────────────────

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"   # 앱 소스(리포) 루트
IMAGE="d4d-webhook:latest"
CONTAINER="d4d-webhook"
NETWORK="docker_default"
PORT="9444"                                       # 웹훅 수신 포트

# 1) 웹훅 이미지 빌드 (context = deploy/)
docker build -t "$IMAGE" "$PROJECT_DIR/deploy"

# 2) 기존 컨테이너 교체
docker rm -f "$CONTAINER" 2>/dev/null || true

# 3) 실행
#  - docker.sock 마운트: 컨테이너가 host Docker 데몬을 조작
#  - 리포 마운트(/app): deploy.sh 가 여기서 git pull + docker build
#  - PROJECT_DIR=/app: 서버가 .env 와 deploy/deploy.sh 위치를 인식
docker run -d \
  --name "$CONTAINER" \
  --restart unless-stopped \
  --network "$NETWORK" \
  -p "$PORT:9444" \
  -e PROJECT_DIR=/app \
  --env-file "$PROJECT_DIR/.env" \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v "$PROJECT_DIR:/app" \
  "$IMAGE"

echo "✔ 웹훅 컨테이너 실행됨: http://<서버>:$PORT/webhook"
