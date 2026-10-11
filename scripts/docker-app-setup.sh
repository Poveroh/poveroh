#!/bin/sh
set -x

echo "🚀 Starting Next.js app..."
echo "Node version: $(node -v)"

# Directly start the Next.js server; public runtime env is injected per request by PublicEnvScript
echo "🎯 Starting Next.js server..."
exec "$@"
