#!/bin/sh
set -e

echo "Waiting for database to be ready..."
until PGPASSWORD=$POSTGRES_PASSWORD psql -h db -U $POSTGRES_USER -d $POSTGRES_DB -c '\q'; do
  >&2 echo "Postgres is unavailable - sleeping"
  sleep 1
done
  
echo "Database is ready, running migrations..."
cd /app/packages/prisma
npx prisma migrate deploy

echo "Starting application..."
cd /app

export CDN_DATA_PATH=/usr/share/cdn-data
echo $CDN_DATA_PATH 

exec node apps/api/dist/index.js