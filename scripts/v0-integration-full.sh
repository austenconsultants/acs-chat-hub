#!/bin/bash
# v0 Full Design Integration Script for ACS Chat Hub
# This script properly integrates ALL v0 visual updates

set -e

V0_DIR="$1"
TARGET_DIR="/opt/github-agents/acs-chat-hub"
BACKUP_DIR="${TARGET_DIR}/backups/$(date +%Y%m%d_%H%M%S)"

echo "🎨 ACS v0 Full Design Integration"
echo "=================================="

# Create backup
echo "📦 Creating full backup..."
mkdir -p "$BACKUP_DIR"
cp -r "${TARGET_DIR}/components" "${BACKUP_DIR}/components"
cp -r "${TARGET_DIR}/styles" "${BACKUP_DIR}/styles" 2>/dev/null || true
cp -r "${TARGET_DIR}/app" "${BACKUP_DIR}/app" 2>/dev/null || true

# Files to ALWAYS preserve (never overwrite)
PRESERVE_FILES=(
    "components/mcp-status.tsx"
    "components/mcp-demo.tsx"
    "hooks/use-mcp.ts"
    "lib/mcp-client.ts"
    "app/api/"
    "prisma/"
    ".env"
    "ecosystem.config.js"
)

echo "🎨 Applying FULL v0 design..."

# 1. Copy ALL UI components
if [ -d "${V0_DIR}/components/ui" ]; then
    echo "  ✓ Updating UI components"
    cp -r "${V0_DIR}/components/ui/"* "${TARGET_DIR}/components/ui/" 2>/dev/null || true
fi

# 2. Copy styles
if [ -d "${V0_DIR}/styles" ]; then
    echo "  ✓ Updating styles"
    cp -r "${V0_DIR}/styles/"* "${TARGET_DIR}/styles/" 2>/dev/null || true
fi

# 3. Update global CSS
if [ -f "${V0_DIR}/app/globals.css" ]; then
    echo "  ✓ Updating global styles"
    cp "${V0_DIR}/app/globals.css" "${TARGET_DIR}/app/globals.css"
fi

# 4. Copy ALL visual components (except protected ones)
echo "📋 Copying visual components..."
for component in "${V0_DIR}/components/"*.tsx; do
    basename=$(basename "$component")
    
    # Skip if it's a preserved file
    skip=false
    for preserve in "mcp-status.tsx" "mcp-demo.tsx"; do
        if [[ "$basename" == "$preserve" ]]; then
            echo "  ⛔ Skipping protected: $basename"
            skip=true
            break
        fi
    done
    
    if [ "$skip" = false ]; then
        echo "  ✓ Copying: $basename"
        cp "$component" "${TARGET_DIR}/components/"
    fi
done

echo "✅ v0 Full integration complete!"
echo "📋 Summary:"
echo "  - Backup created at: $BACKUP_DIR"
echo "  - ALL visual components updated"
echo "  - Protected files preserved"
echo ""
echo "⚠️  Remember to:"
echo "  1. Run 'npm install' for any new dependencies"
echo "  2. Run 'npm run build' to rebuild"
echo "  3. Restart PM2 process"

