# ACS CHAT HUB - DEVELOPMENT STANDARDS
## 🚨 **AI: READ THIS FIRST BEFORE ANY CHANGES**

---

## 🏗️ **CURRENT WORKING INFRASTRUCTURE - DO NOT TOUCH**

### **Servers & Services (PRODUCTION - HANDS OFF)**
- **10.152.0.71:3210** - Main App (PM2 process: \`acs-chat-hub\`)
- **10.152.0.76:5432** - PostgreSQL Database 
- **10.152.0.76:6379** - Redis Cache
- **10.152.0.70:8083** - MCP Server
- **10.152.0.77** - FreeSWITCH (future)

### **Process Management (NEVER CHANGE)**
- **PM2** - Process manager (NOT Docker)
- **Database Connection** - PostgreSQL connection string working
- **Environment Variables** - \`.env\` file configured
- **Port Configuration** - 3210 is the ONLY port

---

## 🎨 **UI CHANGES: WHAT YOU CAN TOUCH**

### ✅ **ALLOWED UI Changes:**
\`\`\`
/components/          - React components (visual only)
/styles/             - CSS/Tailwind styling
/public/             - Static assets (images, icons)
/app/globals.css     - Global styles
/app/layout.tsx      - Layout structure (visual only)
/app/page.tsx        - Main page components (visual only)
\`\`\`

### ✅ **ALLOWED UI Properties:**
- Colors, fonts, spacing, animations
- Button styles, form layouts, modal designs
- Responsive breakpoints, grid layouts
- Icons, images, logos
- Loading states, hover effects
- Dark/light mode toggles

---

## 🚫 **CORE FUNCTIONALITY: NEVER TOUCH**

### ❌ **FORBIDDEN Changes:**
\`\`\`
/app/api/            - ALL API routes (HANDS OFF)
/lib/database.ts     - Database connections (HANDS OFF)  
/lib/mcp.ts          - MCP integration (HANDS OFF)
package.json         - Dependencies (HANDS OFF)
.env                 - Environment variables (HANDS OFF)
next.config.mjs      - Next.js config (HANDS OFF)
PM2 processes        - Process management (HANDS OFF)
Database schemas     - PostgreSQL tables (HANDS OFF)
\`\`\`

---

## 📋 **GITHUB BRANCH WORKFLOW**

### **Branch Structure:**
\`\`\`
austenconsultants/acs-chat-hub
├── main                     ← Production code
├── working-state-2025-09-05 ← Today's stable snapshot  
├── feature/v0-ui-only       ← Upload complete v0 export here
└── staging/ui-review        ← AI cherry-picks UI files only
\`\`\`

### **v0 Deployment Process:**
1. **Upload v0**: Complete export → \`feature/v0-ui-only\` branch
2. **AI Review**: AI reads this document FIRST
3. **Cherry-Pick**: AI copies ONLY UI files → \`staging/ui-review\`
4. **Test**: Build test in staging
5. **Deploy**: Merge to main after testing

---

## 🤖 **AI ASSISTANT GUIDELINES**

### **When Asked to "Deploy v0 Changes":**

1. **ALWAYS READ THIS DOCUMENT FIRST**
2. **ALWAYS ASK FIRST:**
   - "I will ONLY change visual components - confirm?"
   - "I will NOT touch API routes or database - agree?"

3. **BEFORE MAKING CHANGES:**
   - Create backup: \`tar -czf backup-$(date +%Y%m%d-%H%M%S).tar.gz .\`
   - Switch to staging branch: \`git checkout staging/ui-review\`
   - Cherry-pick UI files ONLY from feature branch

4. **CHERRY-PICK COMMANDS:**
   \`\`\`bash
   git checkout staging/ui-review
   git checkout feature/v0-ui-only -- components/
   git checkout feature/v0-ui-only -- styles/
   git checkout feature/v0-ui-only -- public/
   git checkout feature/v0-ui-only -- app/globals.css
   git checkout feature/v0-ui-only -- app/page.tsx
   \`\`\`

5. **NEVER CHERRY-PICK:**
   - \`/app/api/\` folder
   - \`package.json\`
   - \`.env\` files
   - \`next.config.mjs\`
   - \`/lib/\` folder

6. **TEST BEFORE MERGING:**
   \`\`\`bash
   npm run build  # Must succeed
   \`\`\`

---

## 💾 **BACKUP & ROLLBACK**

### **Emergency Rollback:**
\`\`\`bash
# If anything breaks, restore from backup:
cat /opt/backups/pre-branch-setup-20250905-162601/EMERGENCY_RESTORE.md
\`\`\`

### **Branch Rollback:**
\`\`\`bash
# Rollback to stable snapshot:
git checkout working-state-2025-09-05
git checkout -b recovery-branch
git push origin recovery-branch
\`\`\`

---

## 🎯 **SUMMARY FOR AI ASSISTANTS**

**YOUR JOB:** Make it look pretty, keep it working.
**NOT YOUR JOB:** Fix, optimize, or improve backend functionality.

**REMEMBER:**
1. **READ THIS DOCUMENT FIRST** - Every time
2. **UI ONLY** - Never touch API, database, or core functionality
3. **BACKUP FIRST** - Always create backup before changes  
4. **ASK PERMISSION** - Confirm scope before making changes
5. **TEST THOROUGHLY** - Build must succeed before merge
6. **ROLLBACK READY** - Know how to restore if anything breaks

---

*Last Updated: September 5, 2025*
*Backup Location: /opt/backups/pre-branch-setup-20250905-162601/*
