import Database from "better-sqlite3"
import { randomUUID } from "crypto"
import path from "path"
import fs from "fs"

export interface Chat {
  id: string
  title: string
  model: string
  created_at: string
  updated_at: string
  total_tokens: number
  message_count: number
}

export interface Message {
  id: string
  chat_id: string
  role: "user" | "assistant" | "system"
  content: string
  tokens: number
  created_at: string
}

class DatabaseManager {
  private db: Database.Database | null = null

  constructor() {
    this.initDatabase()
  }

  private initDatabase() {
    try {
      const dbPath =
        process.env.DATABASE_URL?.replace("file:", "") ||
        (process.env.NODE_ENV === "production" ? "/app/data/chat.db" : path.join(process.cwd(), "data", "chat.db"))

      const dbDir = path.dirname(dbPath)
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true })
      }

      this.db = new Database(dbPath)
      this.db.pragma("journal_mode = WAL")
      this.runMigrations()
    } catch (error) {
      console.error("[v0] Database initialization failed:", error)
    }
  }

  private runMigrations() {
    if (!this.db) return

    const migrations = `
      CREATE TABLE IF NOT EXISTS chats (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        model TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        total_tokens INTEGER DEFAULT 0,
        message_count INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        chat_id TEXT NOT NULL,
        role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
        content TEXT NOT NULL,
        tokens INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (chat_id) REFERENCES chats (id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS user_settings (
        user_id TEXT PRIMARY KEY DEFAULT 'default',
        settings_data TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id);
      CREATE INDEX IF NOT EXISTS idx_chats_updated_at ON chats(updated_at DESC);
      CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
    `

    this.db.exec(migrations)
    
    // Insert default settings if none exist
    const checkStmt = this.db.prepare("SELECT COUNT(*) as count FROM user_settings WHERE user_id = 'default'")
    const result = checkStmt.get() as { count: number }
    
    if (result.count === 0) {
      const defaultSettings = JSON.stringify(this.getDefaultSettings())
      const insertStmt = this.db.prepare(
        "INSERT INTO user_settings (user_id, settings_data) VALUES ('default', ?)"
      )
      insertStmt.run(defaultSettings)
    }
  }

  // Chat operations
  createChat(title: string, model: string): Chat {
    if (!this.db) throw new Error("Database not initialized")

    const id = randomUUID()
    const stmt = this.db.prepare(`
      INSERT INTO chats (id, title, model) 
      VALUES (?, ?, ?)
    `)

    stmt.run(id, title, model)
    return this.getChatById(id)!
  }

  getChatById(id: string): Chat | null {
    if (!this.db) return null

    const stmt = this.db.prepare("SELECT * FROM chats WHERE id = ?")
    return stmt.get(id) as Chat | null
  }

  getAllChats(limit = 50): Chat[] {
    if (!this.db) return []

    const stmt = this.db.prepare(`
      SELECT * FROM chats 
      ORDER BY updated_at DESC 
      LIMIT ?
    `)
    return stmt.all(limit) as Chat[]
  }

  searchChats(query: string): Chat[] {
    if (!this.db) return []

    const stmt = this.db.prepare(`
      SELECT DISTINCT c.* FROM chats c
      LEFT JOIN messages m ON c.id = m.chat_id
      WHERE c.title LIKE ? OR m.content LIKE ?
      ORDER BY c.updated_at DESC
    `)
    const searchTerm = `%${query}%`
    return stmt.all(searchTerm, searchTerm) as Chat[]
  }

  updateChatTitle(id: string, title: string): void {
    if (!this.db) return

    const stmt = this.db.prepare(`
      UPDATE chats 
      SET title = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `)
    stmt.run(title, id)
  }

  deleteChat(id: string): void {
    if (!this.db) return

    const stmt = this.db.prepare("DELETE FROM chats WHERE id = ?")
    stmt.run(id)
  }

  // Message operations
  addMessage(chatId: string, role: "user" | "assistant" | "system", content: string, tokens = 0): Message {
    if (!this.db) throw new Error("Database not initialized")

    const messageId = randomUUID()

    // Insert message
    const insertStmt = this.db.prepare(`
      INSERT INTO messages (id, chat_id, role, content, tokens) 
      VALUES (?, ?, ?, ?, ?)
    `)
    insertStmt.run(messageId, chatId, role, content, tokens)

    // Update chat stats
    const updateStmt = this.db.prepare(`
      UPDATE chats 
      SET total_tokens = total_tokens + ?, 
          message_count = message_count + 1,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `)
    updateStmt.run(tokens, chatId)

    return this.getMessageById(messageId)!
  }

  getMessageById(id: string): Message | null {
    if (!this.db) return null

    const stmt = this.db.prepare("SELECT * FROM messages WHERE id = ?")
    return stmt.get(id) as Message | null
  }

  getChatMessages(chatId: string): Message[] {
    if (!this.db) return []

    const stmt = this.db.prepare(`
      SELECT * FROM messages 
      WHERE chat_id = ? 
      ORDER BY created_at ASC
    `)
    return stmt.all(chatId) as Message[]
  }

  // Token counting
  getChatTokenCount(chatId: string): number {
    if (!this.db) return 0

    const stmt = this.db.prepare("SELECT total_tokens FROM chats WHERE id = ?")
    const result = stmt.get(chatId) as { total_tokens: number } | null
    return result?.total_tokens || 0
  }

  getTotalTokensUsed(): number {
    if (!this.db) return 0

    const stmt = this.db.prepare("SELECT SUM(total_tokens) as total FROM chats")
    const result = stmt.get() as { total: number } | null
    return result?.total || 0
  }

  // Settings operations - using user_settings table with JSON blob
  getSettings(): Record<string, any> {
    if (!this.db) return this.getDefaultSettings()
    
    try {
      const stmt = this.db.prepare(`
        SELECT settings_data 
        FROM user_settings 
        WHERE user_id = 'default'
      `)
      const result = stmt.get() as { settings_data: string } | undefined
      
      if (result && result.settings_data) {
        try {
          const parsed = JSON.parse(result.settings_data)
          // Ensure all expected fields exist
          return {
            openai: {
              apiKey: parsed.openai?.apiKey || "",
              enabled: parsed.openai?.enabled !== false,
              baseUrl: parsed.openai?.baseUrl || "https://api.openai.com/v1"
            },
            claude: {
              apiKey: parsed.claude?.apiKey || "",
              enabled: parsed.claude?.enabled !== false,
              baseUrl: parsed.claude?.baseUrl || "https://api.anthropic.com"
            },
            mcp: {
              enabled: parsed.mcp?.enabled === true,
              serverUrl: parsed.mcp?.serverUrl || "",
              timeout: parsed.mcp?.timeout || 30000
            },
            personalization: {
              avatar: parsed.personalization?.avatar || "default",
              username: parsed.personalization?.username || "User",
              enableEmojis: parsed.personalization?.enableEmojis !== false,
              emojiStyle: parsed.personalization?.emojiStyle || "native",
              customAvatarUrl: parsed.personalization?.customAvatarUrl || ""
            }
          }
        } catch (e) {
          console.error("[Database] Failed to parse settings JSON:", e)
          return this.getDefaultSettings()
        }
      }
      
      return this.getDefaultSettings()
    } catch (error) {
      console.error("[Database] Failed to get settings:", error)
      return this.getDefaultSettings()
    }
  }

  updateSettings(settings: any): Record<string, any> {
    if (!this.db) throw new Error("Database not initialized")
    
    try {
      // Merge with existing settings to preserve any fields not being updated
      const currentSettings = this.getSettings()
      const mergedSettings = {
        openai: { ...currentSettings.openai, ...settings.openai },
        claude: { ...currentSettings.claude, ...settings.claude },
        mcp: { ...currentSettings.mcp, ...settings.mcp },
        personalization: { ...currentSettings.personalization, ...settings.personalization }
      }
      
      // Convert to JSON string for storage
      const settingsJson = JSON.stringify(mergedSettings)
      
      // Upsert into user_settings table
      const stmt = this.db.prepare(`
        INSERT INTO user_settings (user_id, settings_data, updated_at) 
        VALUES ('default', ?, CURRENT_TIMESTAMP)
        ON CONFLICT(user_id) DO UPDATE SET 
          settings_data = excluded.settings_data,
          updated_at = CURRENT_TIMESTAMP
      `)
      
      stmt.run(settingsJson)
      
      return mergedSettings
    } catch (error) {
      console.error("[Database] Failed to update settings:", error)
      throw error
    }
  }

  getDefaultSettings() {
    return {
      openai: {
        apiKey: "",
        enabled: true,
        baseUrl: "https://api.openai.com/v1"
      },
      claude: {
        apiKey: "",
        enabled: true,
        baseUrl: "https://api.anthropic.com"
      },
      mcp: {
        enabled: false,
        serverUrl: "",
        timeout: 30000
      },
      personalization: {
        avatar: "default",
        username: "User",
        enableEmojis: true,
        emojiStyle: "native" as const,
        customAvatarUrl: ""
      }
    }
  }
}

// Singleton instance
let dbManager: DatabaseManager | null = null

export function getDatabase(): DatabaseManager {
  if (!dbManager) {
    dbManager = new DatabaseManager()
  }
  return dbManager
}

export default DatabaseManager