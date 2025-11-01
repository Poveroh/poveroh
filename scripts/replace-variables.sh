#!/bin/sh

FROM="${1:-}"
TO="${2:-}"

# Skip if FROM is empty (nothing to search for)
if [ -z "$FROM" ]; then
    echo "ℹ️  Skipping replacement: FROM is empty."
    exit 0
fi

if [ "$FROM" = "$TO" ]; then
    echo "Nothing to replace, the value is already set to ${TO}."
    exit 0
fi

echo "Replacing all statically built instances of '$FROM' with '$TO'."

# Collect target directories: ONLY client bundles and public assets (avoid .next/server)
DIRS=""
for d in \
    /app/apps/app/.next/static \
    /app/apps/app/public \
    apps/app/.next/static \
    apps/app/public \
    /app/.next/static \
    /app/public
do
    [ -d "$d" ] && DIRS="$DIRS $d"
done

if [ -z "$DIRS" ]; then
    echo "ℹ️  No .next or public directories found. Nothing to do."
    exit 0
fi

# Escape special characters for sed replacement using '|' delimiter
ESC_FROM=$(printf '%s' "$FROM" | sed -e 's/[\\\/&|]/\\&/g')
ESC_TO=$(printf '%s' "$TO" | sed -e 's/[\\\/&|]/\\&/g')

FILES_SCANNED=0
FILES_MODIFIED=0

# Scan only safe asset types under target dirs, check for FROM, then replace
TMP_LIST=$(mktemp)
find $DIRS -type f \( -name "*.js" -o -name "*.css" -o -name "*.html" -o -name "*.json" \) -print0 2>/dev/null > "$TMP_LIST"
while IFS= read -r -d '' file; do
    if grep -Fq "$FROM" "$file" 2>/dev/null; then
        FILES_SCANNED=$((FILES_SCANNED + 1))
        echo "📝 Processing file: $file"

        # First try in-place replacement
        if sed -i -e "s|$ESC_FROM|$ESC_TO|g" "$file" 2>/dev/null; then
            FILES_MODIFIED=$((FILES_MODIFIED + 1))
            continue
        fi

        # If in-place failed (likely permissions), try to make file/dir writable
        DIR=$(dirname "$file")
        chmod u+w "$file" "$DIR" 2>/dev/null || true
        if sed -i -e "s|$ESC_FROM|$ESC_TO|g" "$file" 2>/dev/null; then
            FILES_MODIFIED=$((FILES_MODIFIED + 1))
            continue
        fi

        # Final fallback: write to temp and replace
        TMP=$(mktemp)
        if sed -e "s|$ESC_FROM|$ESC_TO|g" "$file" > "$TMP" 2>/dev/null; then
            if cp "$TMP" "$file" 2>/dev/null || mv "$TMP" "$file" 2>/dev/null; then
                FILES_MODIFIED=$((FILES_MODIFIED + 1))
            else
                echo "  ⚠️  Skipping (not writable): $file"
            fi
        else
            echo "  ⚠️  Skipping (read error): $file"
        fi
        rm -f "$TMP" 2>/dev/null || true
    fi
done < "$TMP_LIST"
rm -f "$TMP_LIST"

echo "✅ Replacement complete. Matched files: $FILES_SCANNED, Modified: $FILES_MODIFIED"
