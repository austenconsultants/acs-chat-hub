import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/database"
import { estimateTokens } from "@/lib/token-counter"

export async function GET(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params // Await params first
    const db = getDatabase()
    const messages = db.getChatMessages(id)
    return NextResponse.json({ messages })
  } catch (error) {
    console.error("[v0] Failed to fetch messages:", error)
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params // Await params first
    const { role, content, model } = await request.json()
    const db = getDatabase()

    const tokens = estimateTokens(content, model || "gpt-4")

    const message = db.addMessage(id, role, content, tokens)
    return NextResponse.json({ message })
  } catch (error) {
    console.error("[v0] Failed to add message:", error)
    return NextResponse.json({ error: "Failed to add message" }, { status: 500 })
  }
}