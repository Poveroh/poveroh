FROM node:23-alpine AS base

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
RUN npm install
RUN npm update
COPY --from=builder /app/out/full/ .

WORKDIR /app/packages/prisma
RUN npx prisma generate

WORKDIR /app
RUN npx turbo build

FROM base AS runner
WORKDIR /app

# Install PostgreSQL client for the wait script
RUN apk add --no-cache postgresql-client

# Only copy the necessary files from the installer stage
# This is where we exclude source code and only include build artifacts
COPY --from=installer /app/apps/api/dist /app/apps/api/dist
COPY --from=installer /app/apps/api/package.json /app/apps/api/
COPY --from=installer /app/node_modules /app/node_modules
COPY --from=installer /app/packages/prisma /app/packages/prisma
COPY --from=installer /app/packages/types /app/packages/types

# Copy the entrypoint script
COPY ./scripts/docker-api-start.sh /app/
# Fix for Windows line endings if needed
RUN sed -i 's/\r$//' /app/docker-api-start.sh
RUN chmod +x /app/docker-api-start.sh

# Don't run production as root
RUN addgroup --system --gid 1001 userapi
RUN adduser --system --uid 1001 userapi
RUN chown -R userapi:userapi /app
USER userapi

ENTRYPOINT ["/app/docker-api-start.sh"]
