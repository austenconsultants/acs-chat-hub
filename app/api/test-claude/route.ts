import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { apiKey, baseUrl } = await request.json()

    const response = await fetch(`${baseUrl || "https://api.anthropic.com"}/v1/messages`, {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "Content-Type": "application/json",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        max_tokens: 1,
        messages: [{ role: "user", content: "test" }],
      }),
    })

    if (response.ok || response.status === 400) {
      // 400 is expected for minimal test
      return NextResponse.json({ success: true, message: "Claude API connection successful" })
    } else {
      return NextResponse.json({ success: false, message: "Invalid API key or connection failed" })
    }
  } catch (error) {
    return NextResponse.json({ success: false, message: "Connection failed" })
  }
}
