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

echo "🔍 Searching for files to update in /app/public, /app/.next and /app/apps/app/.next..."

# Count total files found in multiple locations
TOTAL_FILES=$(find /app/public /app/.next /app/apps/app/.next -type f -name "*.js" 2>/dev/null | wc -l)
echo "📊 Found $TOTAL_FILES JavaScript files to process"

# Also search for any BAKED_ occurrences in the entire app directory to understand the layout
echo "🔍 Searching for BAKED_ patterns in entire /app directory..."
BAKED_FILES=$(find /app -type f -name "*.js" -exec grep -l "BAKED_" {} \; 2>/dev/null | wc -l)
if [ "$BAKED_FILES" -gt 0 ]; then
    echo "🎯 Found $BAKED_FILES files containing BAKED_ patterns:"
    find /app -type f -name "*.js" -exec grep -l "BAKED_" {} \; 2>/dev/null | head -5
fi

# Find and replace BAKED values with real values
find /app/public /app/.next /app/apps/app/.next -type f -name "*.js" 2>/dev/null | while read file; do
    echo "📝 Processing file: $file"

    # Check if file contains any BAKED_ placeholders
    BAKED_COUNT=$(grep -c "BAKED_" "$file" 2>/dev/null || echo "0")
    if [ "$BAKED_COUNT" -gt 0 ]; then
        echo "  🎯 File contains $BAKED_COUNT BAKED_ placeholders"

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

                    # Verify replacement worked
                    REMAINING=$(grep -c "$BAKED_VAR" "$file" 2>/dev/null || echo "0")
                    if [ "$REMAINING" -eq 0 ]; then
                        echo "  ✅ Successfully replaced all occurrences"
                    else
                        echo "  ❌ Warning: $REMAINING occurrences still remain"
                    fi
                fi
            fi
        done
    else
        echo "  ℹ️  No BAKED_ placeholders found in this file"
    fi
done

# Final verification - count remaining BAKED_ placeholders across all files
echo "🔍 Final verification..."
REMAINING_TOTAL=$(find /app/public /app/.next /app/apps/app/.next -type f -name "*.js" -exec grep -l "BAKED_" {} \; 2>/dev/null | wc -l)
if [ "$REMAINING_TOTAL" -gt 0 ]; then
    echo "⚠️  Warning: $REMAINING_TOTAL files still contain BAKED_ placeholders"
    find /app/public /app/.next /app/apps/app/.next -type f -name "*.js" -exec grep -l "BAKED_" {} \; 2>/dev/null | head -5 | while read remaining_file; do
        echo "  📄 $remaining_file still has:"
        grep -o "BAKED_[A-Z_]*" "$remaining_file" 2>/dev/null | sort | uniq | head -3 | while read placeholder; do
            echo "    - $placeholder"
        done
    done
else
    echo "🎉 No BAKED_ placeholders remaining!"
fiecho "✅ Environment variable replacement completed successfully!"
