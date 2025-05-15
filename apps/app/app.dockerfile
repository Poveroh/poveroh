FROM node:23-alpine AS base

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

FROM base AS builder
RUN apk update
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN npm install -g turbo
COPY . .
RUN turbo prune app --docker

FROM base AS installer
RUN apk update
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY --from=builder /app/out/json/ .
COPY turbo.json turbo.json
RUN npm ci
RUN npm update
COPY --from=builder /app/out/full/ .
WORKDIR /app
RUN corepack enable
RUN npx turbo build --filter=@poveroh/types
RUN npx turbo build --filter=@poveroh/utils
RUN npx turbo build

FROM base AS runner
WORKDIR /app

# Only copy the necessary files for production
COPY --from=installer /app/apps/app/.next/standalone ./
COPY --from=installer /app/apps/app/.next/static ./apps/app/.next/static
COPY --from=installer /app/apps/app/public ./apps/app/public

# Set up non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

EXPOSE 3000

CMD ["node", "apps/app/server.js"]
