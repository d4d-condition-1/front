#!/bin/bash
set -euo pipefail

# ─────────────────────────────────────────────────────────────
# webhook 이 들어오면 실행되는 배포 스크립트.
# 프로젝트 위치에서 Docker 이미지를 빌드하고 컨테이너로 실행한다.
# ─────────────────────────────────────────────────────────────

# ── 설정 (환경에 맞게 수정) ──
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"  # 프로젝트 루트 (deploy/ 의 상위)
IMAGE="d4d-front:latest"        # 빌드할 이미지 태그
CONTAINER="d4d-front"           # 실행할 컨테이너 이름
NETWORK="docker_default"        # 연결할 네트워크
IP="172.23.0.4"                 # 고정 IP
PORT="3000"                     # 노출 포트
BRANCH="${DEPLOY_BRANCH:-main}" # 배포 브랜치 (.env 의 DEPLOY_BRANCH 우선)

# 중복 배포 방지 (겹친 요청은 건너뜀)
exec 9>/tmp/deploy.lock
flock -n 9 || { echo "이미 배포 중 — 건너뜀"; exit 0; }

echo "===== Deploy Start ====="
cd "$PROJECT_DIR"

# 1) 최신 소스
git config --global --add safe.directory "$PROJECT_DIR"
git fetch --prune origin
git reset --hard "origin/$BRANCH"

# 2) 이미지 빌드
echo "▶ docker build"
docker build -t "$IMAGE" .

# 3) 기존 컨테이너 제거 후 재실행
echo "▶ 컨테이너 교체"
docker rm -f "$CONTAINER" 2>/dev/null || true

docker run -d \
  --name "$CONTAINER" \
  --restart unless-stopped \
  --network "$NETWORK" \
  --ip "$IP" \
  --env-file "$PROJECT_DIR/.env" \
  -e NODE_ENV=production \
  -p "$PORT:$PORT" \
  "$IMAGE"

# 4) 미사용 이미지 정리
docker image prune -f

echo "===== Deploy Finish : http://<서버>:$PORT ====="
