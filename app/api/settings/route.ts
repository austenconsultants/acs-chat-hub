import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/database"

// GET settings from database
export async function GET() {
  try {
    const db = getDatabase()
    const settings = db.getSettings()
    
    return NextResponse.json({ settings })
  } catch (error) {
    console.error("[Settings API] Failed to fetch settings:", error)
    return NextResponse.json(
      { error: "Failed to fetch settings" }, 
      { status: 500 }
    )
  }
}

// POST/PUT settings to database
export async function POST(request: NextRequest) {
  try {
    const settings = await request.json()
    const db = getDatabase()
    
    const updatedSettings = db.updateSettings(settings)
    
    return NextResponse.json({ 
      success: true,
      settings: updatedSettings 
    })
  } catch (error) {
    console.error("[Settings API] Failed to update settings:", error)
    return NextResponse.json(
      { error: "Failed to update settings" }, 
      { status: 500 }
    )
  }
}

// Support PUT as an alias for POST
export const PUT = POST
