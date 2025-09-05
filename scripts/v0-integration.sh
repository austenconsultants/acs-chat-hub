#!/bin/bash
# v0 Design Integration Script for ACS Chat Hub
# This script safely integrates v0 visual updates while preserving functionality

set -e

V0_DIR="$1"
TARGET_DIR="/opt/github-agents/acs-chat-hub"
BACKUP_DIR="${TARGET_DIR}/backups/$(date +%Y%m%d_%H%M%S)"

echo "🎨 ACS v0 Design Integration Tool"
echo "=================================="

# Create backup
echo "📦 Creating backup..."
mkdir -p "$BACKUP_DIR"
cp -r "${TARGET_DIR}/components" "${BACKUP_DIR}/components"
cp -r "${TARGET_DIR}/styles" "${BACKUP_DIR}/styles" 2>/dev/null || true
cp "${TARGET_DIR}/app/globals.css" "${BACKUP_DIR}/globals.css" 2>/dev/null || true

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

# Extract visual-only changes
echo "🎨 Extracting safe visual updates..."

# Copy UI components (always safe)
if [ -d "${V0_DIR}/components/ui" ]; then
    echo "  ✓ Updating UI components"
    cp -r "${V0_DIR}/components/ui/"* "${TARGET_DIR}/components/ui/" 2>/dev/null || true
fi

# Copy styles (safe)
if [ -d "${V0_DIR}/styles" ]; then
    echo "  ✓ Updating styles"
    cp -r "${V0_DIR}/styles/"* "${TARGET_DIR}/styles/" 2>/dev/null || true
fi

# Update global CSS (safe)
if [ -f "${V0_DIR}/app/globals.css" ]; then
    echo "  ✓ Updating global styles"
    cp "${V0_DIR}/app/globals.css" "${TARGET_DIR}/app/globals.css"
fi

echo "✅ Safe visual updates applied!"
echo "📋 Backup at: $BACKUP_DIR"
