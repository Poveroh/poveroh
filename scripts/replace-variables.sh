#!/bin/bash
# replace-variables.sh
# Replace BAKED_ placeholder variables with actual runtime environment variables

# Define environment variables to replace
ENV_VARS=("NEXT_PUBLIC_API_URL" "NEXT_PUBLIC_APP_VERSION" "NEXT_PUBLIC_APP_NAME" "NEXT_PUBLIC_LOG_LEVEL")

echo "🔧 Replacing environment variables..."

# Find all JavaScript files and replace BAKED_ placeholders
find /app -type f -name "*.js" 2>/dev/null | while read file; do
    # Check if file contains any BAKED_ placeholders
    if grep -q "BAKED_" "$file" 2>/dev/null; then
        echo "📝 Processing: $file"

        # Build sed command for all replacements in one pass
        SED_CMD=""
        for VAR in "${ENV_VARS[@]}"; do
            if [ ! -z "${!VAR}" ]; then
                # Escape special characters for sed
                ESCAPED_VALUE=$(echo "${!VAR}" | sed 's/[\/&]/\\&/g')
                SED_CMD="$SED_CMD -e s|BAKED_$VAR|$ESCAPED_VALUE|g"
            fi
        done

        # Execute all replacements if any variables are set
        if [ ! -z "$SED_CMD" ]; then
            eval "sed -i $SED_CMD \"$file\""
        fi
    fi
done

echo "✅ Environment replacement completed!"
