# v0 UI Integration Fix Documentation

## 🚨 Critical Fix for v0 UI Deployment

### Problem Encountered
The v0 UI (Beautiful Next.js interface) wouldn't start when integrated with the ACS Chat Hub.

### Root Cause
Port conflict - v0 UI defaulted to port 3000, which was already in use by the main chat hub server.

## ✅ Solution Applied

### 1. **Port Configuration Change**
Modified v0 UI to use dedicated port 3210.

**Location:** `/opt/acs-chat-hub/package.json`
```json
{
  "scripts": {
    "start": "PORT=3210 npm run start:v0",
    "start:v0": "next start -p 3210"
  }
}
```

### 2. **Next.js Configuration**
**Created:** `/opt/acs-chat-hub/next.config.js`
```javascript
module.exports = {
  distDir: '.next',
  poweredByHeader: false,
  reactStrictMode: true
}
```

### 3. **PM2 Process Configuration**
**File:** `/opt/acs-chat-hub/ecosystem.config.js`
```javascript
module.exports = {
  apps: [{
    name: 'acs-chat-hub',
    script: 'npm',
    args: 'start',
    cwd: '/opt/acs-chat-hub',
    env: {
      PORT: 3210,
      NODE_ENV: 'production',
      API_BASE_URL: 'http://10.152.0.70:3001'
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M'
  }]
}
```

## 📋 Quick Deployment Steps

```bash
# 1. Build the v0 UI
cd /opt/acs-chat-hub
npm run build

# 2. Start with PM2
pm2 delete acs-chat-hub 2>/dev/null
pm2 start ecosystem.config.js
pm2 save

# 3. Verify it's running
curl http://localhost:3210
```

## 🔍 Troubleshooting Guide

### If UI Won't Start:
```bash
# Check port availability
lsof -i :3210

# Check PM2 logs
pm2 logs acs-chat-hub --lines 50

# Restart service
pm2 restart acs-chat-hub
```

### Common Issues:
1. **Port already in use**: Kill process using port 3210
2. **Build failed**: Check for .next directory, rebuild if missing
3. **API connection issues**: Verify agent services on .70 are running

## 🎯 Key Takeaways
- **Always use dedicated ports** for each service
- **Document port assignments** in README
- **Use PM2 for production** deployments
- **Test locally first** before production deploy

## 📝 Port Map Reference
- 3210: v0 UI (Chat Interface)
- 3001: ACS Manager (API Gateway)
- 3002: Voice Services
- 3003: Voice AI
- 3004: Infrastructure Agent

---
*Fix documented: $(date)*
*Next deployment will be 10x faster with this guide!*
