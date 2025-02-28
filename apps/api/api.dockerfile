FROM node:18-alpine AS base

ARG API_PORT
ARG JWT_KEY
ARG DATABASE_URL

ENV API_PORT=$API_PORT \
    JWT_KEY=$JWT_KEY \
    DATABASE_URL=$DATABASE_URL

FROM base AS builder
RUN apk update
RUN apk add --no-cache libc6-compat
# Set working directory
WORKDIR /app
RUN npm install -g turbo
COPY . .
RUN turbo prune api --docker

# Add lockfile and package.json's of isolated subworkspace
FROM base AS installer
RUN apk update
RUN apk add --no-cache libc6-compat
WORKDIR /app

# First install dependencies
COPY --from=builder /app/out/json/ .
RUN npm install

# Build the project and its dependencies
COPY --from=builder /app/out/full/ .

WORKDIR /app/packages/prisma
RUN npx prisma generate

WORKDIR /app
RUN npx turbo build

FROM base AS runner
WORKDIR /app

# Install PostgreSQL client for the wait script
RUN apk add --no-cache postgresql-client

# Copy application files
COPY --from=installer /app .
COPY --from=installer /app/packages/prisma ./packages/prisma

# Create and setup the entrypoint script
COPY ./scripts/docker-api-start.sh /app/
RUN chmod +x /app/docker-api-start.sh

# Don't run production as root - do this AFTER setting up files
RUN addgroup --system --gid 1001 userapi
RUN adduser --system --uid 1001 userapi

# Change ownership of the app directory to the userapi user
RUN chown -R userapi:userapi /app

# Switch to non-root user
USER userapi

# Run the entrypoint script
ENTRYPOINT ["/app/docker-api-start.sh"]