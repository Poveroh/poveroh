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

echo "Database is ready, running migrations..."
cd /app/packages/prisma
npx prisma migrate deploy

echo "Starting application..."
cd /app

export CDN_LOCAL_DATA_PATH=/usr/share/cdn-data
echo $CDN_LOCAL_DATA_PATH

exec node apps/api/dist/src/index.js

# Uncomment the following line if you want to keep the container running without starting the application
# echo "Keeping container running without starting the application..."
# tail -f /dev/null
