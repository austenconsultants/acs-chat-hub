import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/database"
import { envConfig } from "@/lib/env-config"

export async function GET() {
  try {
    // Check database connection
    const db = getDatabase()
    const chats = db.getAllChats(1)

    // Check API key availability
    const apiStatus = {
      openai: !!envConfig.openaiApiKey,
      anthropic: !!envConfig.anthropicApiKey,
      mcp: envConfig.mcpEnabled,
    }

    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      database: "connected",
      apis: apiStatus,
      environment: envConfig.nodeEnv,
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: "unhealthy",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
