#!/bin/bash
# replace-variables.sh
# Replace BAKED_ placeholder variables with actual runtime environment variables

# Define environment variables to replace
ENV_VARS=("NEXT_PUBLIC_API_URL" "NEXT_PUBLIC_APP_VERSION" "NEXT_PUBLIC_APP_NAME" "NEXT_PUBLIC_LOG_LEVEL")

echo "🔧 Replacing environment variables..."

# Find all JavaScript files in .next and public directories and replace BAKED_ placeholders
for file in $(find /app/.next /app/public -type f -name "*.js" 2>/dev/null); do
    # Check if file contains any BAKED_ placeholders
    if grep -q "BAKED_" "$file" 2>/dev/null; then
        echo "📝 Processing: $file"

        # Apply replacements one by one (safer than eval)
        for VAR in "${ENV_VARS[@]}"; do
            if [ ! -z "${!VAR}" ]; then
                # Escape special characters for sed
                ESCAPED_VALUE=$(echo "${!VAR}" | sed 's/[\/&]/\\&/g')
                sed -i "s|BAKED_$VAR|$ESCAPED_VALUE|g" "$file"
            fi
        done
    fi
done

echo "✅ Environment replacement completed!"
