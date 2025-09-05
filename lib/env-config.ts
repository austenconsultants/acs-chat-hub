// Environment configuration with validation
export const envConfig = {
  // Database
  databaseUrl: process.env.DATABASE_URL || "file:./data/chat.db",

  // API Keys
  openaiApiKey: process.env.OPENAI_API_KEY || "",
  openaiBaseUrl: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || "",
  groqApiKey: process.env.GROQ_API_KEY || "",
  xaiApiKey: process.env.XAI_API_KEY || "",

  // MCP Configuration
  mcpServerUrl: process.env.MCP_SERVER_URL || "ws://localhost:8080/mcp",
  mcpEnabled: process.env.MCP_ENABLED === "true",

  // App Configuration
  appUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number.parseInt(process.env.PORT || "3000"),

  // Security
  jwtSecret: process.env.JWT_SECRET || "change-this-in-production",

  // Logging
  logLevel: process.env.LOG_LEVEL || "info",
}

// Validation function
export function validateEnvironment() {
  const required = ["OPENAI_API_KEY", "ANTHROPIC_API_KEY"]
  const missing = required.filter((key) => !process.env[key])

  if (missing.length > 0) {
    console.warn(`[v0] Missing environment variables: ${missing.join(", ")}`)
    console.warn("[v0] Some features may not work properly")
  }

  return missing.length === 0
}

// Initialize validation on import
if (typeof window === "undefined") {
  validateEnvironment()
}
