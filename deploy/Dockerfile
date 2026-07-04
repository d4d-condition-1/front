# 웹훅 서버 전용 이미지. Node 로 서버를 돌리되,
# 컨테이너 안에서 host 의 docker.sock 을 통해 deploy.sh(docker build/run)를
# 실행해야 하므로 docker CLI / git / flock 을 함께 넣는다.
FROM node:22-alpine

RUN apk add --no-cache docker-cli git bash flock

WORKDIR /webhook
COPY webhook-server.js ./webhook-server.js

ENV WEBHOOK_PORT=9000
EXPOSE 9000

CMD ["node", "/webhook/webhook-server.js"]
