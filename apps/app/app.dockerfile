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

# Copy the entrypoint script
COPY ./scripts/docker-app-setup.sh /app/
# Fix for Windows line endings if needed
RUN sed -i 's/\r$//' /app/docker-app-setup.sh
RUN chmod +x /app/docker-app-setup.sh

# Set up non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Create public directory and set proper permissions for runtime env injection
RUN mkdir -p /app/apps/app/public && \
    chown -R nextjs:nodejs /app/apps/app/public

USER nextjs

EXPOSE 3000

ENTRYPOINT ["/app/docker-app-setup.sh"]

CMD ["node", "apps/app/server.js"]
