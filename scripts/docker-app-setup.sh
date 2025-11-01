#!/bin/sh
set -x

echo "🚀 Starting Next.js app with runtime environment injection..."
echo "Node version: $(node -v)"

# Run the variable replacement script
if [ -f "/app/replace-variables.sh" ]; then
    echo "🔧 Running environment variable replacement..."
    # Ensure build output is writable when possible (best-effort)
    for d in \
        /app/apps/app/.next \
        /app/apps/app/public \
        apps/app/.next \
        apps/app/public \
        /app/.next \
        /app/public
    do
        [ -d "$d" ] && chmod -R u+w "$d" 2>/dev/null || true
    done
    # Replace placeholders with runtime values
    # 1) Try BAKED_* tokens that we inject in production client bundles
    /app/replace-variables.sh "${BAKED_NEXT_PUBLIC_API_URL:-BAKED_NEXT_PUBLIC_API_URL}" "${NEXT_PUBLIC_API_URL}"
    /app/replace-variables.sh "${BAKED_NEXT_PUBLIC_APP_VERSION:-BAKED_NEXT_PUBLIC_APP_VERSION}" "${NEXT_PUBLIC_APP_VERSION}"
    /app/replace-variables.sh "${BAKED_NEXT_PUBLIC_APP_NAME:-BAKED_NEXT_PUBLIC_APP_NAME}" "${NEXT_PUBLIC_APP_NAME}"
    # 2) Also try replacing the actual built env values if provided (for cases where Next baked real values)
    #    You can set BUILT_NEXT_PUBLIC_* at runtime or bake them into the image at build-time.
    /app/replace-variables.sh "${BUILT_NEXT_PUBLIC_API_URL:-}" "${NEXT_PUBLIC_API_URL}"
    /app/replace-variables.sh "${BUILT_NEXT_PUBLIC_APP_VERSION:-}" "${NEXT_PUBLIC_APP_VERSION}"
    /app/replace-variables.sh "${BUILT_NEXT_PUBLIC_APP_NAME:-}" "${NEXT_PUBLIC_APP_NAME}"
else
    echo "⚠️  replace-variables.sh not found, skipping variable replacement"
fi

# Execute the original command
echo "🎯 Starting Next.js server..."
exec "$@"
