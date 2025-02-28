FROM node:18-alpine AS base

ARG NEXT_PUBLIC_API_URL

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

FROM base AS builder
RUN apk update
RUN apk add --no-cache libc6-compat
# Set working directory
WORKDIR /app
RUN npm install -g turbo
COPY . .
RUN turbo prune app --docker

# Add lockfile and package.json's of isolated subworkspace
FROM base AS installer
RUN apk update
RUN apk add --no-cache libc6-compat
WORKDIR /app

# First install dependencies
COPY --from=builder /app/out/json/ .
COPY turbo.json turbo.json
RUN npm ci

# Build the project and its dependencies
COPY --from=builder /app/out/full/ .

WORKDIR /app
RUN npx turbo build --filter=@poveroh/types
RUN npx turbo build --filter=@poveroh/utils

RUN npx turbo build

FROM base AS runner
WORKDIR /app

COPY --from=installer /app .

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=installer --chown=nextjs:nodejs /app/apps/app/.next/standalone ./
COPY --from=installer --chown=nextjs:nodejs /app/apps/app/.next/static ./apps/app/.next/static
COPY --from=installer --chown=nextjs:nodejs /app/apps/app/public ./apps/app/public

CMD node apps/app/server.js