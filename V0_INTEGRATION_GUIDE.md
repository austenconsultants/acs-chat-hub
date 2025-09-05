# v0 Design Integration Guide for ACS Chat Hub

## Overview
This guide explains how to safely integrate v0.dev visual design updates without breaking functionality.

## Quick Start

### 1. Download from v0
- Export your v0 project as a ZIP file
- Keep the default structure

### 2. Upload to Server
```bash
scp your-v0-project.zip root@10.152.0.70:/tmp/v0-upload/
```

### 3. Run Integration
```bash
ssh root@10.152.0.70
cd /opt/github-agents/acs-chat-hub
./scripts/v0-integration.sh /tmp/v0-upload/your-v0-project
```

### 4. Review & Commit
```bash
git status
git add .
git commit -m "feat: v0 visual update"
git push origin feature/v0-design-update
```

## What Gets Updated (SAFE)
✅ `components/ui/*` - UI component styles
✅ `styles/*` - Global styles
✅ `app/globals.css` - Global CSS
✅ `public/fonts/*` - Font files
✅ `public/images/*` - Image assets
✅ `tailwind.config.js` - Tailwind configuration

## What NEVER Gets Updated (PROTECTED)
❌ `components/mcp-*.tsx` - MCP integration files
❌ `hooks/use-*.ts` - Custom hooks
❌ `lib/*-client.ts` - Client libraries
❌ `app/api/**` - API endpoints
❌ `prisma/**` - Database schemas
❌ `.env*` - Environment variables
❌ `ecosystem.config.js` - PM2 configuration

## Integration Rules
1. **NEVER** modify API endpoints
2. **NEVER** change database connections
3. **NEVER** alter authentication logic
4. **NEVER** touch MCP integrations
5. **ALWAYS** create backup before changes
6. **ALWAYS** test build after integration
7. **ALWAYS** use feature branch

## Automated Process (via ACS Manager Agent)
The ACS Manager Agent can handle this automatically:

```javascript
// In your chat with ACS Manager
"Download the v0 design from [URL] and integrate it"
```

The agent will:
1. Download the v0 project
2. Extract and analyze components
3. Apply safe visual updates only
4. Create backup
5. Commit to feature branch
6. Create GitHub PR

## Manual Recovery
If something breaks:

```bash
# Restore from backup
cd /opt/github-agents/acs-chat-hub
cp -r backups/[timestamp]/* .

# Or reset with git
git checkout -- .
git clean -fd
```

## Testing After Integration
```bash
# Build test
npm run build

# Start development server
npm run dev

# Check endpoints still work
curl http://localhost:3210/api/health
```

## GitHub Workflow
```
feature/v0-design-update → PR → working-state-2025-09-04 → main
         ↓                         ↓                        ↓
    Test on .71              Review Changes           Production
```

## Important Notes
- v0 is for **visual updates only**
- Core functionality must remain intact
- All integrations must continue working
- Database connections must not break
- API endpoints must stay unchanged

---
Last Updated: 2025-09-05
Version: 1.0
