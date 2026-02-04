# syntax=docker/dockerfile:1

FROM node:20-alpine AS base

WORKDIR /app

# Pin pnpm via corepack for reproducible installs/builds
RUN corepack enable && corepack prepare pnpm@10.11.0 --activate

FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

EXPOSE 3000

COPY --from=build /app ./

CMD ["pnpm","start","--","-H","0.0.0.0","-p","3000"]
