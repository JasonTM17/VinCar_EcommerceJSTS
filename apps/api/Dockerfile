# syntax=docker/dockerfile:1
FROM node:24-alpine AS build
WORKDIR /app
RUN corepack enable
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @autonova/api exec prisma generate
RUN pnpm --filter @autonova/outbox build && pnpm --filter @autonova/pricing build && pnpm --filter @autonova/api build

FROM node:24-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
RUN corepack enable && addgroup -S app && adduser -S app -G app
COPY --from=build /app ./
USER app
EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s \
  CMD wget -qO- http://127.0.0.1:4000/api/v1/health || exit 1
CMD ["node", "apps/api/dist/main.js"]
