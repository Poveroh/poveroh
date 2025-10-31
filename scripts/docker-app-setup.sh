#!/bin/sh
set -e

echo "🚀 Starting Next.js app with runtime environment injection..."
echo "Node version: $(node -v)"

# Run the variable replacement script
if [ -f "/app/replace-variables.sh" ]; then
    echo "� Running environment variable replacement..."
    bash /app/replace-variables.sh
else
    echo "⚠️  replace-variables.sh not found, skipping variable replacement"
fi

# Execute the original command
echo "🎯 Starting Next.js server..."
exec "$@"
