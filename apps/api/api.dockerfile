FROM node:22-alpine AS base

ARG API_PORT
ARG JWT_KEY
ARG DATABASE_URL

ENV API_PORT=$API_PORT \
    JWT_KEY=$JWT_KEY \
    DATABASE_URL=$DATABASE_URL

FROM base AS builder
RUN apk update
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN npm install -g turbo
COPY . .
RUN turbo prune api --docker

FROM base AS installer
RUN apk update
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY --from=builder /app/out/json/ .
RUN npm install --ignore-scripts
COPY --from=builder /app/out/full/ .

WORKDIR /app/packages/prisma
RUN npx prisma generate

WORKDIR /app
RUN npx turbo build

# Drop devDependencies (typescript, eslint, tsx, build tooling) so the runtime
# image only ships production dependencies.
RUN npm prune --omit=dev

FROM base AS runner
WORKDIR /app

# Install PostgreSQL client for the wait script
RUN apk add --no-cache postgresql-client

# Only copy the necessary files from the installer stage
# This is where we exclude source code and only include build artifacts
COPY --from=installer /app/apps/api/dist /app/apps/api/dist
COPY --from=installer /app/apps/api/package.json /app/apps/api/
COPY --from=installer /app/node_modules /app/node_modules
# Copy all workspace packages: the @poveroh/* entries in node_modules are
# symlinks into /app/packages, so every runtime workspace dependency
# (logger, queue, redis, schemas, utils, market-data, prisma, types) must be
# present here or the symlinks dangle and require() fails at startup.
COPY --from=installer /app/packages /app/packages

# Strip TypeScript sources: at runtime each package is loaded through its
# compiled dist/ (see "main"/"typings" in every package.json), so the src/
# folders and tsconfigs are dead weight. prisma.config.ts is the one .ts that
# stays — Prisma 7 reads the datasource URL from it during `migrate deploy`.
RUN find /app/packages -type d -name src -prune -exec rm -rf {} + \
 && find /app/packages -type f -name '*.ts' ! -name 'prisma.config.ts' -delete \
 && find /app/packages -type f -name 'tsconfig*.json' -delete

# Copy the entrypoint scripts (api is the default entrypoint; worker is selected via a compose override)
COPY ./scripts/docker-api-start.sh /app/
COPY ./scripts/docker-worker-start.sh /app/
# Fix for Windows line endings if needed
RUN sed -i 's/\r$//' /app/docker-api-start.sh /app/docker-worker-start.sh
RUN chmod +x /app/docker-api-start.sh /app/docker-worker-start.sh

# Don't run production as root
RUN addgroup --system --gid 1001 userapi
RUN adduser --system --uid 1001 userapi
RUN chown -R userapi:userapi /app
USER userapi

EXPOSE 3001

ENTRYPOINT ["/app/docker-api-start.sh"]
