import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/database"

export async function GET() {
  try {
    const db = getDatabase()
    const chats = db.getAllChats()
    return NextResponse.json({ chats })
  } catch (error) {
    console.error("[v0] Failed to fetch chats:", error)
    return NextResponse.json({ error: "Failed to fetch chats" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, model } = await request.json()
    const db = getDatabase()
    const chat = db.createChat(title, model)
    return NextResponse.json({ chat })
  } catch (error) {
    console.error("[v0] Failed to create chat:", error)
    return NextResponse.json({ error: "Failed to create chat" }, { status: 500 })
  }
}
