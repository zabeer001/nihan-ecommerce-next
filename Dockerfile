FROM node:22-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

ARG NIHAN_HERO_VIDEO_ID
ENV NIHAN_HERO_VIDEO_ID=$NIHAN_HERO_VIDEO_ID

COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    HOSTNAME=0.0.0.0 \
    PORT=3000

COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static

USER node
EXPOSE 3000
HEALTHCHECK --interval=10s --timeout=10s --start-period=15s --retries=3 CMD wget -q -O /dev/null http://127.0.0.1:3000/dashboard/ || exit 1
CMD ["node", "server.js"]
