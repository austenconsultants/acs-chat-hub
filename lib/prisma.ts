// Production-ready Prisma client singleton
import { PrismaClient } from '@prisma/client'

// Singleton pattern for Prisma client
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Helper functions for common operations
export const db = {
  // User operations
  async getOrCreateUser(username: string = 'default') {
    return await prisma.user.upsert({
      where: { username },
      update: {},
      create: {
        username,
        email: `${username}@localhost`,
        mcpSettings: {
          create: {}
        },
        uiPreferences: {
          create: {}
        }
      },
      include: {
        mcpSettings: true,
        apiKeys: true,
        uiPreferences: true
      }
    })
  },

  // Settings operations
  async getSettings(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        mcpSettings: true,
        apiKeys: true,
        uiPreferences: true
      }
    })
    
    if (!user) return null

    // Transform to expected format
    return {
      mcp: user.mcpSettings ? {
        enabled: user.mcpSettings.enabled,
        serverUrl: user.mcpSettings.serverUrl,
        timeout: user.mcpSettings.timeout,
        maxRetries: user.mcpSettings.maxRetries
      } : null,
      ui: user.uiPreferences ? {
        theme: user.uiPreferences.theme,
        primaryColor: user.uiPreferences.primaryColor,
        fontSize: user.uiPreferences.fontSize,
        displayName: user.uiPreferences.displayName,
        language: user.uiPreferences.language,
        emojiEnabled: user.uiPreferences.emojiEnabled,
        sidebarCollapsed: user.uiPreferences.sidebarCollapsed,
        soundEnabled: user.uiPreferences.soundEnabled
      } : null,
      apiKeys: user.apiKeys.map(key => ({
        provider: key.provider,
        enabled: key.enabled,
        model: key.model,
        lastUsed: key.lastUsedAt
      }))
    }
  },

  // Update MCP settings
  async updateMcpSettings(userId: string, settings: any) {
    return await prisma.mcpSettings.upsert({
      where: { userId },
      update: {
        enabled: settings.enabled,
        serverUrl: settings.serverUrl,
        timeout: settings.timeout,
        maxRetries: settings.maxRetries
      },
      create: {
        userId,
        enabled: settings.enabled ?? true,
        serverUrl: settings.serverUrl ?? 'http://10.152.0.70:8083',
        timeout: settings.timeout ?? 30000,
        maxRetries: settings.maxRetries ?? 3
      }
    })
  },

  // Update UI preferences
  async updateUiPreferences(userId: string, prefs: any) {
    return await prisma.uiPreferences.upsert({
      where: { userId },
      update: prefs,
      create: {
        userId,
        ...prefs
      }
    })
  },

  // Chat operations
  async createChat(userId: string, title?: string, model: string = 'gpt-4') {
    return await prisma.chat.create({
      data: {
        userId,
        title: title || `New Chat - ${new Date().toLocaleString()}`,
        model,
        messageCount: 0,
        tokenCount: 0
      }
    })
  },

  async getChatHistory(userId: string, limit: number = 20) {
    return await prisma.chat.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      take: limit,
      include: {
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' }
        }
      }
    })
  },

  // Message operations
  async addMessage(chatId: string, role: string, content: string, metadata?: any) {
    const message = await prisma.message.create({
      data: {
        chatId,
        role,
        content,
        tokens: metadata?.tokens || 0,
        model: metadata?.model,
        mcpToolUsed: metadata?.mcpTool,
        mcpResult: metadata?.mcpResult
      }
    })

    // Update chat metadata
    await prisma.chat.update({
      where: { id: chatId },
      data: {
        messageCount: { increment: 1 },
        tokenCount: { increment: metadata?.tokens || 0 },
        lastMessageAt: new Date()
      }
    })

    return message
  },

  // Audit logging
  async logAction(action: string, entityType: string, entityId?: string, userId?: string, metadata?: any) {
    return await prisma.auditLog.create({
      data: {
        action,
        entityType,
        entityId,
        userId,
        oldValues: metadata?.oldValues,
        newValues: metadata?.newValues,
        ipAddress: metadata?.ipAddress,
        userAgent: metadata?.userAgent
      }
    })
  },

  // Error logging
  async logError(level: string, message: string, stack?: string, context?: any) {
    return await prisma.errorLog.create({
      data: {
        level,
        message,
        stack,
        context,
        userId: context?.userId,
        url: context?.url,
        userAgent: context?.userAgent
      }
    })
  },

  // Feature flags
  async checkFeatureFlag(name: string, userId?: string) {
    const flag = await prisma.featureFlag.findUnique({
      where: { name }
    })

    if (!flag) return false
    
    // Check user-specific overrides
    if (userId) {
      if (flag.enabledForUsers.includes(userId)) return true
      if (flag.disabledForUsers.includes(userId)) return false
    }

    // Check rollout percentage
    if (flag.rolloutPercentage > 0 && flag.rolloutPercentage < 100) {
      // Simple hash-based rollout
      const hash = userId ? 
        userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : 
        Math.random() * 100
      return (hash % 100) < flag.rolloutPercentage
    }

    return flag.enabled
  },

  // Cache operations
  async getCached(key: string) {
    const entry = await prisma.cacheEntry.findUnique({
      where: { key }
    })

    if (!entry) return null
    if (entry.expiresAt < new Date()) {
      // Expired, delete it
      await prisma.cacheEntry.delete({ where: { key } })
      return null
    }

    // Update access count
    await prisma.cacheEntry.update({
      where: { key },
      data: {
        accessCount: { increment: 1 },
        lastAccessedAt: new Date()
      }
    })

    return entry.value
  },

  async setCached(key: string, value: any, ttlSeconds: number = 3600) {
    return await prisma.cacheEntry.upsert({
      where: { key },
      update: {
        value,
        expiresAt: new Date(Date.now() + ttlSeconds * 1000),
        accessCount: 0
      },
      create: {
        key,
        value,
        expiresAt: new Date(Date.now() + ttlSeconds * 1000)
      }
    })
  },

  // System config
  async getConfig(key: string) {
    const config = await prisma.systemConfig.findUnique({
      where: { key }
    })
    return config?.value
  },

  async setConfig(key: string, value: any, description?: string, isPublic: boolean = false) {
    return await prisma.systemConfig.upsert({
      where: { key },
      update: { value, description, isPublic },
      create: { key, value, description, isPublic }
    })
  }
}

export default db
