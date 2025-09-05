# V0 DEPLOYMENT WORKFLOW
**Created:** $(date)
**Backup Location:** /opt/backups/pre-branch-setup-20250905-162601/

## 🎯 **COMPLETE SETUP ACCOMPLISHED**

### ✅ **Comprehensive Backup Created**
- Repository: Complete Git history backed up
- Production: 288MB application archive + PM2 config
- Database: Schema and table information captured
- Restoration: 5-minute emergency recovery documented

### ✅ **GitHub Branch Strategy Implemented**
\`\`\`
austenconsultants/acs-chat-hub
├── main                     ← Production (has DEVELOPMENT_STANDARDS.md)
├── working-state-2025-09-05 ← Stable snapshot (has standards)
├── feature/v0-design-update ← v0 upload target (has standards) 
├── staging/ui-review        ← AI cherry-pick area (has standards)
└── working-state-2025-09-04 ← Yesterday's backup
\`\`\`

### ✅ **Standards Document Deployed**
- **GitHub**: All branches have DEVELOPMENT_STANDARDS.md
- **Development**: /opt/github-agents/acs-chat-hub/DEVELOPMENT_STANDARDS.md
- **Production**: /opt/acs-chat-hub/DEVELOPMENT_STANDARDS.md

---

## 🚀 **YOUR v0 DEPLOYMENT PROCESS**

### **Step 1: Upload v0 Design**
\`\`\`bash
# Extract your v0 ZIP to temporary location
unzip v0-export.zip -d /tmp/v0-project/

# Upload to feature branch
git checkout feature/v0-design-update
git rm -rf . --cached  # Clear existing files
cp -r /tmp/v0-project/* .
git add .
git commit -m "v0 Design Upload - Complete UI from v0.dev"
git push origin feature/v0-design-update
\`\`\`

### **Step 2: AI Deployment Command**
Tell AI: **"Deploy v0 UI changes following the standards document"**

AI will automatically:
1. Read DEVELOPMENT_STANDARDS.md FIRST
2. Switch to staging/ui-review branch
3. Cherry-pick ONLY UI files from feature branch
4. Test build (npm run build)
5. Commit UI-only changes
6. Merge to main if tests pass

### **Step 3: Production Deployment**
\`\`\`bash
# Production server pulls updates
ssh root@10.152.0.71 "cd /opt/acs-chat-hub && git pull origin main"

# Restart PM2 (keeps all working infrastructure)
ssh root@10.152.0.71 "pm2 restart acs-chat-hub"

# Test deployment
curl http://10.152.0.71:3210
\`\`\`

---

## 🛡️ **PROTECTION MECHANISMS**

### **What's Protected:**
- ✅ PM2 process management (no Docker changes)
- ✅ PostgreSQL connections (10.152.0.76:5432)
- ✅ Redis cache (10.152.0.76:6379)  
- ✅ MCP server integration (10.152.0.70:8083)
- ✅ API routes (/app/api/ folder)
- ✅ Database libraries (package.json)
- ✅ Environment configuration (.env)

### **What AI Can Change:**
- ✅ React components (/components/)
- ✅ CSS styling (/styles/, /app/globals.css)
- ✅ Static assets (/public/)
- ✅ Page layouts (/app/page.tsx - visual only)

---

## 🚨 **EMERGENCY PROCEDURES**

### **If v0 Deployment Breaks Chat:**
\`\`\`bash
# Quick rollback to working state
git checkout working-state-2025-09-05
git push -f origin main
ssh root@10.152.0.71 "cd /opt/acs-chat-hub && git reset --hard origin/main && pm2 restart acs-chat-hub"
\`\`\`

### **If Everything Breaks:**
\`\`\`bash
# Full system restore (5 minutes)
cat /opt/backups/pre-branch-setup-20250905-162601/EMERGENCY_RESTORE.md
\`\`\`

---

## 📋 **USAGE EXAMPLES**

### **Example 1: New v0 Design**
1. Export ZIP from v0.dev
2. Upload to feature/v0-design-update branch  
3. Tell AI: "Deploy v0 UI changes"
4. AI follows standards, cherry-picks UI only
5. Production gets visual updates, backend untouched

### **Example 2: UI Tweaks**
1. Modify components/ files directly in staging branch
2. Test with npm run build
3. Merge to main when ready
4. Production deployment via git pull + PM2 restart

### **Example 3: Rollback**
1. Something breaks after deployment
2. git checkout working-state-2025-09-05  
3. Force push to main: git push -f origin main
4. Production pulls and restarts

---

## ✅ **SUCCESS CRITERIA**

**Deployment Successful When:**
- PM2 shows acs-chat-hub as "online"
- http://10.152.0.71:3210 loads UI
- Chat function sends/receives messages  
- No console errors in browser
- Database connections working
- New UI design visible

**Deployment Failed When:**
- PM2 process crashes or shows "errored"
- Port 3210 not responding
- Chat API returns errors
- npm run build fails
- Database connection lost

---

## 🎯 **READY FOR v0 DEPLOYMENTS!**

Your system now has:
- ✅ Complete backup safety net
- ✅ GitHub branch protection  
- ✅ AI behavior guidelines
- ✅ UI-only deployment boundaries
- ✅ Emergency rollback procedures
- ✅ Working PM2/PostgreSQL/MCP preserved

**Next:** Export your v0 design and tell AI to deploy it!
