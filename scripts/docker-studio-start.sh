#!/bin/sh
set -e

# Check if DATABASE_HOST contains 'localhost'
if echo "$DATABASE_HOST" | grep -q "localhost"; then
  # Replace 'localhost' with 'db' in DATABASE_URL
  export DATABASE_URL=$(echo "$DATABASE_URL" | sed 's/localhost/db/')
else
  :
  # No change needed; DATABASE_URL remains as is
fi

# Execute the provided command
exec "$@"
