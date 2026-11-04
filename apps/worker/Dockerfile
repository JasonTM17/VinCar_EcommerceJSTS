# syntax=docker/dockerfile:1
FROM node:24-alpine AS build
WORKDIR /app
RUN corepack enable
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @autonova/api exec prisma generate
RUN pnpm --filter @autonova/outbox build && pnpm --filter @autonova/worker build
FROM node:24-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
RUN corepack enable && addgroup -S app && adduser -S app -G app
COPY --from=build /app ./
USER app
CMD ["node", "apps/worker/dist/main.js"]
