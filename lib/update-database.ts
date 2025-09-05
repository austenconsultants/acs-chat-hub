// lib/update-database.ts
// Helper to update your existing database.ts file to support MCP

// Add this to your existing Database class in lib/database.ts:

/* 
  getSettings() {
    const stmt = this.db.prepare(`
      SELECT settings_data FROM user_settings WHERE user_id = ?
    `);
    
    const row = stmt.get('default') as { settings_data: string } | undefined;
    
    if (!row) {
      // Return default settings including MCP configuration
      return {
        apiKeys: {
          openai: '',
          anthropic: '',
          groq: '',
          xai: ''
        },
        mcp: {
          enabled: true,
          serverUrl: 'http://10.152.0.70:8083',
          timeout: 30000
        },
        personalization: {
          username: 'User',
          avatar: 'default',
          customAvatarUrl: '',
          enableEmojis: true,
          emojiStyle: 'native'
        }
      };
    }
    
    const settings = JSON.parse(row.settings_data);
    
    // Ensure MCP settings exist with defaults
    if (!settings.mcp) {
      settings.mcp = {
        enabled: true,
        serverUrl: 'http://10.152.0.70:8083',
        timeout: 30000
      };
    }
    
    return settings;
  }
*/
