FROM node:23-alpine AS base

FROM base AS builder
RUN apk update
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN npm install -g turbo
COPY . .
RUN turbo prune app --docker

FROM base AS installer
RUN apk update
RUN apk add --no-cache libc6-compat bash
WORKDIR /app
COPY --from=builder /app/out/json/ .
COPY turbo.json turbo.json
RUN npm ci
COPY --from=builder /app/out/full/ .
WORKDIR /app
RUN corepack enable
RUN npx turbo build --filter=@poveroh/types
RUN npx turbo build --filter=@poveroh/utils
RUN npx turbo build

FROM base AS runner
RUN apk add --no-cache bash
WORKDIR /app

# Only copy the necessary files for production
COPY --from=installer /app/apps/app/.next/standalone ./
COPY --from=installer /app/apps/app/.next/static ./apps/app/.next/static
COPY --from=installer /app/apps/app/public ./apps/app/public

# Copy the entrypoint script
COPY ./scripts/docker-app-setup.sh /app/
RUN sed -i 's/\r$//' /app/docker-app-setup.sh
RUN chmod +x /app/docker-app-setup.sh

# Set up non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Ensure runtime user has access to app directories
RUN mkdir -p /app/apps/app/public && \
    chown -R nextjs:nodejs /app/apps/app/.next /app/apps/app/public || true

USER nextjs

EXPOSE 3000

ENTRYPOINT ["/app/docker-app-setup.sh"]

CMD ["node", "apps/app/server.js"]
