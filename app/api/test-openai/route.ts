import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { apiKey, baseUrl } = await request.json()

    const response = await fetch(`${baseUrl || "https://api.openai.com/v1"}/models`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    })

    if (response.ok) {
      return NextResponse.json({ success: true, message: "OpenAI API connection successful" })
    } else {
      return NextResponse.json({ success: false, message: "Invalid API key or connection failed" })
    }
  } catch (error) {
    return NextResponse.json({ success: false, message: "Connection failed" })
  }
}
