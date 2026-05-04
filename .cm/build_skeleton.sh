#!/bin/bash
OUTPUT="/Volumes/Data/Hotel/CapyInn/.cm/skeleton.md"
mkdir -p "$(dirname "$OUTPUT")"

echo "# 🦴 Skeleton Index: CapyInn" > "$OUTPUT"
echo "" >> "$OUTPUT"
echo "| Meta | Value |" >> "$OUTPUT"
echo "|------|-------|" >> "$OUTPUT"
echo "| Framework | Tauri 2 (Rust + React) |" >> "$OUTPUT"
echo "" >> "$OUTPUT"
echo "## Code Skeleton" >> "$OUTPUT"

# Index React code
find /Volumes/Data/Hotel/CapyInn/mhm/src -type f \( -name "*.ts" -o -name "*.tsx" \) | sort | while read -r file; do
    rel_path="${file#/Volumes/Data/Hotel/CapyInn/}"
    echo "### \`$(dirname "$rel_path")/\`" >> "$OUTPUT"
    echo "**$(basename "$rel_path")**" >> "$OUTPUT"
    echo '```typescript' >> "$OUTPUT"
    awk '
    /^(export )?(function|const|class|interface|type) / {
        print NR ":" $0
    }
    ' "$file" >> "$OUTPUT"
    echo '```' >> "$OUTPUT"
    echo "" >> "$OUTPUT"
done

# Index Rust code
find /Volumes/Data/Hotel/CapyInn/mhm/src-tauri/src -type f -name "*.rs" | sort | while read -r file; do
    rel_path="${file#/Volumes/Data/Hotel/CapyInn/}"
    echo "### \`$(dirname "$rel_path")/\`" >> "$OUTPUT"
    echo "**$(basename "$rel_path")**" >> "$OUTPUT"
    echo '```rust' >> "$OUTPUT"
    awk '
    /^(pub )?(struct|enum|fn|trait|impl)/ {
        print NR ":" $0
    }
    ' "$file" >> "$OUTPUT"
    echo '```' >> "$OUTPUT"
    echo "" >> "$OUTPUT"
done
