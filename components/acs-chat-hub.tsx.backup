"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Settings, Phone, Video, MoreVertical, Bot, User } from "lucide-react"
import { ChatSidebar } from "./chat-sidebar"
import { ModelSelector } from "./model-selector"
import { MCPStatus } from "./mcp-status"
import { SettingsPage } from "./settings-page"
import { ChatInputSelector } from "./chat-input-selector"

interface Message {
  id: string
  content: string
  sender: "user" | "ai"
  timestamp: Date
  model?:
    | "gpt-4o"
    | "gpt-4o-mini"
    | "gpt-4-turbo"
    | "gpt-4"
    | "gpt-3.5-turbo"
    | "claude-3-5-sonnet"
    | "claude-3-opus"
    | "claude-3-sonnet"
    | "claude-3-haiku"
  | "claude-opus-4-1"
  | "claude-sonnet-4"
  status?: "sending" | "sent" | "error"
  tokens?: number
}

interface Chat {
  id: string
  title: string
  model: string
  created_at: string
  updated_at: string
  total_tokens: number
  message_count: number
}

type ModelId =
  | "gpt-4o"
  | "gpt-4o-mini"
  | "gpt-4-turbo"
  | "gpt-4"
  | "gpt-3.5-turbo"
  | "claude-3-5-sonnet"
  | "claude-3-opus"
  | "claude-3-sonnet"
  | "claude-3-haiku"
  | "claude-opus-4-1"
  | "claude-sonnet-4"

export function ACSChatHub() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [selectedModel, setSelectedModel] = useState<ModelId>("gpt-4o")
  const [isLoading, setIsLoading] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const [chats, setChats] = useState<Chat[]>([])
  const [totalTokens, setTotalTokens] = useState(0)
  const [isInitialized, setIsInitialized] = useState(false)
  const [initError, setInitError] = useState<string | null>(null)
  const [settings, setSettings] = useState<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    initializeApp()
  }, [])

  useEffect(() => {
    if (currentChatId) {
      loadMessages(currentChatId)
    }
  }, [currentChatId])

  const initializeApp = async () => {
    try {
      console.log("[v0] Starting app initialization...")
      console.log("[v0] Current URL:", window.location.href)
      console.log("[v0] Attempting health check...")

      const dbResponse = await fetch("/api/health")
      console.log("[v0] Health check response status:", dbResponse.status)

      const healthData = await dbResponse.json()
      console.log("[v0] Health check response:", healthData)

      if (!dbResponse.ok) {
        throw new Error(`Health check failed: ${healthData.error || "Unknown error"}`)
      }

      if (healthData.status === "degraded") {
        console.warn("[v0] Database is degraded, continuing with limited functionality")
        setInitError("Database unavailable - running in limited mode")
      }

      console.log("[v0] Loading settings from database...")
      await loadSettings()

      console.log("[v0] Loading chats...")
      await loadChats()
      console.log("[v0] Creating new chat...")
      await createNewChat()
      setIsInitialized(true)
      console.log("[v0] App initialization completed successfully")
    } catch (error) {
      console.error("[v0] App initialization failed:", error)
      setInitError(error instanceof Error ? error.message : "Unknown initialization error")
      setIsInitialized(true)
      setCurrentChatId(`temp-${Date.now()}`)
    }
  }

  const loadSettings = async () => {
    try {
      const response = await fetch("/api/settings")
      if (response.ok) {
        const settingsData = await response.json()
        setSettings(settingsData)
        console.log("[v0] Settings loaded from database:", settingsData)
      } else {
        console.warn("[v0] Failed to load settings from database, using defaults")
        // Fallback to localStorage if database fails
        const savedSettings = localStorage.getItem("acs-chat-settings")
        if (savedSettings) {
          setSettings(JSON.parse(savedSettings))
        }
      }
    } catch (error) {
      console.error("[v0] Failed to load settings:", error)
      // Fallback to localStorage
      const savedSettings = localStorage.getItem("acs-chat-settings")
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings))
      }
    }
  }

  const loadChats = async () => {
    try {
      const response = await fetch("/api/chats")
      if (!response.ok) {
        console.warn("[v0] Failed to load chats, continuing without chat history")
        return
      }
      const data = await response.json()
      setChats(data.chats || [])
    } catch (error) {
      console.error("[v0] Failed to load chats:", error)
    }
  }

  const loadMessages = async (chatId: string) => {
    try {
      const response = await fetch(`/api/chats/${chatId}/messages`)
      const data = await response.json()

      const formattedMessages =
        data.messages?.map((msg: any) => ({
          id: msg.id,
          content: msg.content,
          sender: msg.role === "user" ? "user" : "ai",
          timestamp: new Date(msg.created_at),
          model: selectedModel,
          status: "sent",
          tokens: msg.tokens,
        })) || []

      setMessages(formattedMessages)

      const tokens = formattedMessages.reduce((sum: number, msg: Message) => sum + (msg.tokens || 0), 0)
      setTotalTokens(tokens)
    } catch (error) {
      console.error("[v0] Failed to load messages:", error)
    }
  }

  const createNewChat = async () => {
    try {
      const response = await fetch("/api/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "New Chat",
          model: selectedModel,
        }),
      })

      if (!response.ok) {
        console.warn("[v0] Failed to create chat in database, using temporary chat")
        setCurrentChatId(`temp-${Date.now()}`)
        return
      }

      const data = await response.json()

      if (data.chat) {
        setCurrentChatId(data.chat.id)
        setMessages([])
        setTotalTokens(0)
        loadChats()
      }
    } catch (error) {
      console.error("[v0] Failed to create chat:", error)
      setCurrentChatId(`temp-${Date.now()}`)
    }
  }

  const saveMessage = async (role: "user" | "assistant", content: string) => {
    if (!currentChatId || currentChatId.startsWith("temp-")) return

    try {
      await fetch(`/api/chats/${currentChatId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role,
          content,
          model: selectedModel,
        }),
      })
    } catch (error) {
      console.error("[v0] Failed to save message:", error)
    }
  }

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading || !currentChatId) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
      status: "sent",
    }

    setMessages((prev) => [...prev, userMessage])
    const messageContent = inputValue
    setInputValue("")
    setIsLoading(true)

    await saveMessage("user", messageContent)

    try {
      let apiKeys = {}

      if (settings) {
        apiKeys = {
          openai: settings.openai?.apiKey,
          claude: settings.claude?.apiKey,
        }
        console.log("[v0] Using API keys from database settings")
      } else {
        // Fallback to localStorage if settings not loaded
        const savedSettings = localStorage.getItem("acs-chat-settings")
        if (savedSettings) {
          const localSettings = JSON.parse(savedSettings)
          apiKeys = {
            openai: localSettings.openai?.apiKey,
            claude: localSettings.claude?.apiKey,
          }
          console.log("[v0] Fallback: Using API keys from localStorage")
        }
      }

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageContent,
          model: selectedModel,
          apiKeys,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `API call failed: ${response.statusText}`)
      }

      const data = await response.json()

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        sender: "ai",
        timestamp: new Date(),
        model: selectedModel,
        status: "sent",
        tokens: data.usage?.totalTokens || 0,
      }

      setMessages((prev) => [...prev, aiMessage])
      await saveMessage("assistant", aiMessage.content)

      // Update total tokens
      if (data.usage?.totalTokens) {
        setTotalTokens((prev) => prev + data.usage.totalTokens)
      }
    } catch (error) {
      console.error("[v0] Failed to send message:", error)

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `Error: ${error instanceof Error ? error.message : "Failed to get AI response"}. Please check your API keys in settings.`,
        sender: "ai",
        timestamp: new Date(),
        model: selectedModel,
        status: "error",
      }

      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
      if (currentChatId) {
        loadMessages(currentChatId)
      }
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (!isInitialized) {
    return (
      <div className="flex h-screen bg-background items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold mb-4">
            <span className="text-black">AUSTEN</span>
            <span className="text-red-600">TEL</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
            <span className="text-sm text-gray-500 ml-2">Initializing...</span>
          </div>
          {initError && <p className="text-red-500 text-sm mt-2">Warning: {initError}</p>}
        </div>
      </div>
    )
  }

  if (showSettings) {
    return (
      <SettingsPage
        onBack={() => {
          setShowSettings(false)
          loadSettings()
        }}
      />
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <ChatSidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        chats={chats}
        currentChatId={currentChatId}
        onChatSelect={setCurrentChatId}
        onNewChat={createNewChat}
      />

      <div className="flex-1 flex flex-col">
        <div className="border-b border-border bg-white px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="text-2xl font-bold">
                  <span className="text-black">AUSTEN</span>
                  <span className="text-red-600">TEL</span>
                </div>
              </div>
              <div className="h-6 w-px bg-border" />
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/ai-assistant-avatar.png" />
                  <AvatarFallback className="bg-black text-white">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="font-semibold text-base text-black">AI Assistant</h1>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700 border-0">
                      {selectedModel.toUpperCase()}
                    </Badge>
                    <MCPStatus />
                    <Badge variant="outline" className="text-xs border-gray-300 text-gray-600">
                      {totalTokens.toLocaleString()} tokens
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <ModelSelector selectedModel={selectedModel} onModelChange={setSelectedModel} />
              <Button variant="ghost" size="icon" className="h-9 w-9 text-gray-600 hover:bg-gray-100">
                <Phone className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-9 w-9 text-gray-600 hover:bg-gray-100">
                <Video className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-gray-600 hover:bg-gray-100"
                onClick={() => setShowSettings(true)}
              >
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-9 w-9 text-gray-600 hover:bg-gray-100">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <ScrollArea className="flex-1 px-6 py-6">
          <div className="space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.sender === "ai" && (
                  <Avatar className="h-8 w-8 mt-1 flex-shrink-0">
                    <AvatarFallback className="bg-black text-white">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}

                <div className={`max-w-[70%] ${message.sender === "user" ? "order-1" : ""}`}>
                  <Card
                    className={`p-4 shadow-sm border ${
                      message.sender === "user"
                        ? "bg-black text-white ml-auto border-black"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    <div className="flex items-center gap-2 mt-2">
                      {message.model && (
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            message.sender === "user"
                              ? "border-white/20 text-white/70"
                              : "border-gray-300 text-gray-600"
                          }`}
                        >
                          {message.model}
                        </Badge>
                      )}
                      {message.tokens && (
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            message.sender === "user"
                              ? "border-white/20 text-white/70"
                              : "border-gray-300 text-gray-600"
                          }`}
                        >
                          {message.tokens} tokens
                        </Badge>
                      )}
                    </div>
                  </Card>
                  <p className="text-xs text-gray-500 mt-2 px-1">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                {message.sender === "user" && (
                  <Avatar className="h-8 w-8 mt-1 flex-shrink-0">
                    <AvatarFallback className="bg-gray-100 text-gray-700">
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 justify-start">
                <Avatar className="h-8 w-8 mt-1">
                  <AvatarFallback className="bg-black text-white">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <Card className="p-4 bg-white border-gray-200 shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      />
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      />
                    </div>
                    <span className="text-sm text-gray-500">AI is typing...</span>
                  </div>
                </Card>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <ChatInputSelector
          value={inputValue}
          onChange={setInputValue}
          onSend={sendMessage}
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
          disabled={isLoading}
          onKeyPress={handleKeyPress}
        />
      </div>
    </div>
  )
}
