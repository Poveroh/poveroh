#!/bin/sh
set -x

echo "🚀 Starting Next.js app..."
echo "Node version: $(node -v)"

# Directly start the Next.js server; runtime env will be read via next-runtime-env
echo "🎯 Starting Next.js server..."
exec "$@"
