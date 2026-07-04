# syntax=docker/dockerfile:1

# Multi-stage build for a Next.js (App Router) app using `output: "standalone"`.
# Final image only contains the standalone server + static assets.
#
# 각 스테이지는 공용 `base` 중간 이미지를 재사용하지 않고 각자 node:22-alpine
# (태그된 영구 이미지)에서 시작한다. 레거시 빌더 + 동시 배포의
# `docker image prune -f` 가 dangling 중간 이미지를 지워 "No such image" 로
# 실패하던 문제를 피하기 위함. (근본 해결은 배포 시 DOCKER_BUILDKIT=1)

# --- Install dependencies (cached on lockfile changes) ---
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# --- Build the app ---
FROM node:22-alpine AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# --- Runtime image ---
FROM node:22-alpine AS runner
RUN apk add --no-cache libc6-compat
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=9555
ENV HOSTNAME=0.0.0.0

# Run as a non-root user.
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

# Public assets and the standalone server output.
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 9555

CMD ["node", "server.js"]
