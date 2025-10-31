#!/bin/bash
# replace-variables.sh
# Replace BAKED_ placeholder variables with actual runtime environment variables

# Define a list of mandatory environment variables to check
MANDATORY_VARS=("NEXT_PUBLIC_API_URL" "NEXT_PUBLIC_APP_VERSION" "NEXT_PUBLIC_APP_NAME")

# Define a list of optional environment variables (no check needed)
OPTIONAL_VARS=("NEXT_PUBLIC_LOG_LEVEL")

echo "🔧 Starting environment variable replacement..."

# Check if each mandatory variable is set
for VAR in "${MANDATORY_VARS[@]}"; do
    if [ -z "${!VAR}" ]; then
        echo "❌ $VAR is not set. Please set it and rerun the script."
        exit 1
    fi
    echo "✅ Found mandatory variable: $VAR=${!VAR}"
done

# Combine mandatory and optional variables for replacement
ALL_VARS=("${MANDATORY_VARS[@]}" "${OPTIONAL_VARS[@]}")

echo "🔍 Searching for files to update in /app/public and /app/.next..."

# Find and replace BAKED values with real values
find /app/public /app/.next -type f -name "*.js" 2>/dev/null | while read file; do
    echo "📝 Processing file: $file"

    for VAR in "${ALL_VARS[@]}"; do
        if [ ! -z "${!VAR}" ]; then
            # Use a more specific pattern to avoid accidental replacements
            BAKED_VAR="BAKED_$VAR"
            ACTUAL_VALUE="${!VAR}"

            # Count occurrences before replacement
            COUNT=$(grep -c "$BAKED_VAR" "$file" 2>/dev/null || echo "0")

            if [ "$COUNT" -gt 0 ]; then
                echo "  🔄 Replacing $COUNT occurrences of $BAKED_VAR with $ACTUAL_VALUE"
                sed -i "s|$BAKED_VAR|$ACTUAL_VALUE|g" "$file"
            fi
        fi
    done
done

echo "✅ Environment variable replacement completed successfully!"
