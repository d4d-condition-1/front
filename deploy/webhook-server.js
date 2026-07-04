"use strict";

// ─────────────────────────────────────────────────────────────
// 배포 웹훅 서버 (의존성 0, Node 내장 모듈만). 호스트에서 실행한다.
//
//   GitHub push ──webhook──▶ 이 서버(:9444) ──▶ deploy/deploy.sh 실행
//
// - X-Hub-Signature-256 을 WEBHOOK_SECRET(.env)으로 HMAC 검증
// - push 이벤트 & 대상 브랜치(DEPLOY_BRANCH)만 배포
// - 동시 배포가 겹치지 않도록 잠금
//
// 호스트에서 돌기 때문에 docker/git CLI 를 그대로 쓸 수 있어
// 별도 컨테이너/소켓 마운트가 필요 없다.
// ─────────────────────────────────────────────────────────────

const http = require("node:http");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { spawn } = require("node:child_process");

// 도커 이미지로 실행할 때는 앱 소스가 마운트된 경로를 PROJECT_DIR 로 넘긴다.
// (호스트에서 직접 실행하면 deploy/ 의 상위 = 프로젝트 루트로 자동 계산)
const ROOT = process.env.PROJECT_DIR || path.resolve(__dirname, "..");
loadEnv(path.join(ROOT, ".env"));

const PORT = Number(process.env.WEBHOOK_PORT) || 9444;
const SECRET = process.env.WEBHOOK_SECRET || "";
const BRANCH = process.env.DEPLOY_BRANCH || "main";
const DEPLOY_SCRIPT = path.join(ROOT, "deploy", "deploy.sh");

if (!SECRET) {
  console.error("[webhook] .env 에 WEBHOOK_SECRET 이 없습니다. 종료합니다.");
  process.exit(1);
}

let deploying = false;

const server = http.createServer((req, res) => {
  if (req.method !== "POST" || req.url !== "/webhook") {
    res.writeHead(404).end("not found");
    return;
  }

  const chunks = [];
  req.on("data", (c) => chunks.push(c));
  req.on("end", () => {
    const body = Buffer.concat(chunks);

    // 1) HMAC 서명 검증
    if (!verifySignature(body, req.headers["x-hub-signature-256"])) {
      console.warn("[webhook] 서명 검증 실패 — 거부");
      res.writeHead(401).end("invalid signature");
      return;
    }

    const event = req.headers["x-github-event"];
    if (event === "ping") {
      res.writeHead(200).end("pong");
      return;
    }

    let payload;
    try {
      payload = JSON.parse(body.toString("utf8"));
    } catch {
      res.writeHead(400).end("bad payload");
      return;
    }

    // 2) push & 대상 브랜치만
    if (event !== "push" || payload.ref !== `refs/heads/${BRANCH}`) {
      res.writeHead(200).end("ignored");
      return;
    }

    // 3) 배포 트리거 (즉시 응답, 중복 방지)
    res.writeHead(202).end("deploy triggered");
    if (deploying) {
      console.log("[webhook] 이미 배포 중 — 이번 요청은 건너뜀");
      return;
    }
    runDeploy();
  });
});

function verifySignature(body, signature) {
  if (!signature) return false;
  const digest =
    "sha256=" + crypto.createHmac("sha256", SECRET).update(body).digest("hex");
  const a = Buffer.from(digest);
  const b = Buffer.from(signature);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function runDeploy() {
  deploying = true;
  console.log("[webhook] 배포 시작 →", DEPLOY_SCRIPT);
  const child = spawn("bash", [DEPLOY_SCRIPT], { cwd: ROOT, stdio: "inherit" });
  child.on("exit", (code) => {
    deploying = false;
    console.log(`[webhook] 배포 종료 (exit=${code})`);
  });
  child.on("error", (err) => {
    deploying = false;
    console.error("[webhook] 배포 실행 실패:", err.message);
  });
}

// 의존성 없이 .env 로드 (이미 있는 값은 덮어쓰지 않음)
function loadEnv(file) {
  if (!fs.existsSync(file)) return;
  for (const raw of fs.readFileSync(file, "utf8").split("\n")) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = val;
  }
}

server.listen(PORT, () => {
  console.log(`[webhook] listening on :${PORT} (branch=${BRANCH})`);
});
