#!/bin/sh
set -e

# Check if DATABASE_URL contains localhost:5432
if echo "$DATABASE_URL" | grep -q "localhost:5432"; then
  # Replace localhost:5432 with db:5432 for Docker networking
  export DATABASE_URL=$(echo "$DATABASE_URL" | sed 's/localhost:5432/db:5432/')
  echo "Modified DATABASE_URL to use Docker networking: $DATABASE_URL"
else
  echo "Using provided DATABASE_URL: $DATABASE_URL"
fi

# Execute the provided command
exec "$@"
