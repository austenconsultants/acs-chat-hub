import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q") || ""

    if (query.length < 2) {
      return NextResponse.json({ chats: [] })
    }

    const db = getDatabase()
    const chats = db.searchChats(query)

    const sortedChats = chats.sort((a, b) => {
      // Prioritize title matches over content matches
      const aInTitle = a.title.toLowerCase().includes(query.toLowerCase())
      const bInTitle = b.title.toLowerCase().includes(query.toLowerCase())

      if (aInTitle && !bInTitle) return -1
      if (!aInTitle && bInTitle) return 1

      // Then sort by most recent
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    })

    return NextResponse.json({
      chats: sortedChats.slice(0, 20), // Limit to 20 results for performance
      total: sortedChats.length,
    })
  } catch (error) {
    console.error("[v0] Failed to search chats:", error)
    return NextResponse.json({ error: "Failed to search chats" }, { status: 500 })
  }
}
