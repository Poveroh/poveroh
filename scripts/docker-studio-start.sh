#!/bin/sh
set -e

# Build the complete DATABASE_URL from components
export DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}

exec "$@"
