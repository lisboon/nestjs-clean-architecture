FROM node:26-bookworm-slim AS base

ENV PNPM_HOME=/pnpm \
    PATH=/pnpm:$PATH \
    HUSKY=0

RUN npm install -g pnpm@11.1.1

WORKDIR /app

FROM base AS builder

RUN apt-get update -y \
  && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY prisma.config.ts nest-cli.json tsconfig.json tsconfig.build.json ./
COPY prisma/ ./prisma/
COPY src/ ./src/

RUN pnpm prisma:generate \
  && pnpm build \
  && pnpm prune --prod --ignore-scripts

FROM node:26-bookworm-slim AS runner

ENV NODE_ENV=production \
    PORT=3001

USER node
WORKDIR /app

COPY --from=builder --chown=node:node /app/package.json ./
COPY --from=builder --chown=node:node /app/node_modules/ ./node_modules/
COPY --from=builder --chown=node:node /app/generated/ ./generated/
COPY --from=builder --chown=node:node /app/dist/ ./dist/

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://localhost:3001/').then((r)=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "dist/infra/http/main.js"]