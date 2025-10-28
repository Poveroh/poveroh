#!/bin/sh
set -e

echo "🚀 Starting Next.js app with runtime environment injection..."
echo "Node version: $(node -v)"

# Create public directory if it doesn't exist
mkdir -p /app/apps/app/public

# Generate runtime environment file if NEXT_PUBLIC_* env vars are provided
if [ -n "$NEXT_PUBLIC_API_URL" ] || [ -n "$NEXT_PUBLIC_APP_VERSION" ] || [ -n "$NEXT_PUBLIC_APP_NAME" ]; then
    echo "📝 Generating runtime environment configuration..."
    cat > /app/apps/app/public/env.js <<EOF
window.__ENV = {
  NEXT_PUBLIC_API_URL: "${NEXT_PUBLIC_API_URL:-}",
  NEXT_PUBLIC_APP_VERSION: "${NEXT_PUBLIC_APP_VERSION:-}",
  NEXT_PUBLIC_APP_NAME: "${NEXT_PUBLIC_APP_NAME:-}",
  LOG_LEVEL: "${LOG_LEVEL:-info}",
  NODE_ENV: "${NODE_ENV:-production}"
};
EOF
    echo "✅ Runtime environment file created at /app/apps/app/public/env.js"
    echo "Environment variables written:"
    cat /app/apps/app/public/env.js
else
    echo "ℹ️  No NEXT_PUBLIC_* environment variables found, using build-time values"
fi

# Execute the original command
echo "🎯 Starting Next.js server..."
exec "$@"
