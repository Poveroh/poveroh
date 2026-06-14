#!/bin/sh
set -e

if [[ "$DATABASE_HOST" == *"localhost"* || "$DATABASE_HOST" == *"db"* ]]; then
  echo "Waiting for database to be ready..."
  until PGPASSWORD=$POSTGRES_PASSWORD psql -h db -U $POSTGRES_USER -d $POSTGRES_DB -c '\q'; do
    >&2 echo "Postgres is unavailable - sleeping"
    sleep 1
  done
else
  echo "Skipping DB wait - using remote database at $DATABASE_HOST"
fi

# Migrations are owned by the api entrypoint; the worker only consumes the queue.
echo "Starting worker..."
cd /app

export CDN_LOCAL_DATA_PATH=/usr/share/cdn-data

exec node apps/api/dist/apps/api/src/api/v1/worker/index.js
