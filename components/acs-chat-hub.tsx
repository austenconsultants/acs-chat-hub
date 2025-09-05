"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Settings, Phone, Video, MoreVertical, Bot, User, Search, BarChart3, Shield, Users } from "lucide-react"
import { ChatSidebar } from "./chat-sidebar"
import { ModelSelector } from "./model-selector"
import { MCPStatus } from "./mcp-status"
import { SettingsPage } from "./settings-page"
import { AnalyticsDashboard } from "./analytics-dashboard"
import { AdminPanel } from "./admin-panel"
import { AgentManagement } from "./agent-management"
import { RichTextEditor } from "./rich-text-editor"
import { MessageActions } from "./message-actions"
import { ThemeToggle } from "./theme-toggle"
import { DomainSelector } from "./domain-selector"

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
  status?: "sending" | "sent" | "error"
  tokens?: number
  reactions?: { [key: string]: string[] }
  isEditing?: boolean
  replyTo?: string
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
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [replyingToId, setReplyingToId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [showAdmin, setShowAdmin] = useState(false)
  const [showAgent, setShowAgent] = useState(false)
  const [selectedDomain, setSelectedDomain] = useState<any>(null)

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

      setIsInitialized(true)
      setCurrentChatId(`temp-${Date.now()}`)

      try {
        const savedSettings = localStorage.getItem("acs-chat-settings")
        if (savedSettings) {
          setSettings(JSON.parse(savedSettings))
          console.log("[v0] Settings loaded from localStorage")
        }
      } catch (error) {
        console.warn("[v0] localStorage settings failed:", error)
      }

      try {
        const response = await fetch("/api/health", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        })

        if (response.ok) {
          const healthData = await response.json()
          console.log("[v0] Database connected:", healthData)

          await loadChats()
          await createNewChat()
        }
      } catch (error) {
        console.log("[v0] Database unavailable, running in design mode")
        setInitError("Design mode - database features disabled")
      }

      console.log("[v0] App ready for visual design")
    } catch (error) {
      console.error("[v0] Initialization error:", error)
      setIsInitialized(true)
      setCurrentChatId(`temp-${Date.now()}`)
    }
  }

  const loadSettings = async () => {
    try {
      const savedSettings = localStorage.getItem("acs-chat-settings")
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings))
        return
      }
    } catch (error) {
      console.warn("[v0] localStorage settings failed:", error)
    }

    try {
      const domainId = selectedDomain?.id || "acs-main"
      const response = await fetch(`/api/settings?domain_id=${domainId}`)
      if (response.ok) {
        const settingsData = await response.json()
        setSettings(settingsData)
      }
    } catch (error) {
      console.log("[v0] Database settings unavailable")
    }
  }

  const loadChats = async () => {
    try {
      const domainId = selectedDomain?.id || "acs-main"
      const response = await fetch(`/api/chats?domain_id=${domainId}`)
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
          reactions: msg.reactions,
          replyTo: msg.replyTo,
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
      const domainId = selectedDomain?.id || "acs-main"
      const response = await fetch("/api/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "New Chat",
          model: selectedModel,
          domain_id: domainId,
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
      console.log("[v0] Failed to save message:", error)
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
      replyTo: replyingToId,
    }

    setMessages((prev) => [...prev, userMessage])
    const messageContent = inputValue
    setInputValue("")
    setIsLoading(true)
    setReplyingToId(null)

    if (!currentChatId.startsWith("temp-")) {
      try {
        await saveMessage("user", messageContent)
      } catch (error) {
        console.log("[v0] Message save failed, continuing in memory mode")
      }
    }

    try {
      let apiKeys = {}

      if (settings) {
        apiKeys = {
          openai: settings.openai?.apiKey,
          claude: settings.claude?.apiKey,
        }
      } else {
        const savedSettings = localStorage.getItem("acs-chat-settings")
        if (savedSettings) {
          const localSettings = JSON.parse(savedSettings)
          apiKeys = {
            openai: localSettings.openai?.apiKey,
            claude: localSettings.claude?.apiKey,
          }
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

      if (!currentChatId.startsWith("temp-")) {
        try {
          await saveMessage("assistant", aiMessage.content)
        } catch (error) {
          console.log("[v0] AI message save failed, continuing in memory mode")
        }
      }

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
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleMessageReact = (messageId: string, reaction: string) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === messageId) {
          const reactions = msg.reactions || {}
          const userReactions = reactions[reaction] || []
          const hasReacted = userReactions.includes("user")

          if (hasReacted) {
            reactions[reaction] = userReactions.filter((u) => u !== "user")
          } else {
            reactions[reaction] = [...userReactions, "user"]
          }

          return { ...msg, reactions }
        }
        return msg
      }),
    )
  }

  const handleMessageEdit = (messageId: string) => {
    setEditingMessageId(messageId)
    const message = messages.find((m) => m.id === messageId)
    if (message) {
      setInputValue(message.content)
    }
  }

  const handleMessageDelete = (messageId: string) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== messageId))
  }

  const handleMessageReply = (messageId: string) => {
    setReplyingToId(messageId)
  }

  const handleMessageCopy = (messageId: string) => {
    const message = messages.find((m) => m.id === messageId)
    if (message) {
      navigator.clipboard.writeText(message.content)
    }
  }

  const handleDomainChange = (domain: any) => {
    setSelectedDomain(domain)
    setMessages([])
    setCurrentChatId(null)
    loadChats()
    loadSettings()
    console.log("[v0] Switched to domain:", domain.name)
  }

  if (!isInitialized) {
    return (
      <div className="flex h-screen bg-background items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold mb-4">
            <span className="text-primary">AUSTEN</span>
            <span className="text-accent">TEL</span>
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

  if (showAgent) {
    return <AgentManagement onBack={() => setShowAgent(false)} />
  }

  if (showAdmin) {
    return <AdminPanel onBack={() => setShowAdmin(false)} />
  }

  if (showAnalytics) {
    return <AnalyticsDashboard onBack={() => setShowAnalytics(false)} />
  }

  if (showSettings) {
    return (
      <SettingsPage
        onBack={() => {
          setShowSettings(false)
          const savedSettings = localStorage.getItem("acs-chat-settings")
          if (savedSettings) {
            setSettings(JSON.parse(savedSettings))
          }
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
        selectedDomain={selectedDomain}
      />

      <div className="flex-1 flex flex-col">
        <div className="border-b border-border bg-card px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="text-2xl font-bold">
                  <span className="text-primary">AUSTEN</span>
                  <span className="text-accent">TEL</span>
                </div>
              </div>
              <div className="h-6 w-px bg-border" />
              <div className="w-48">
                <DomainSelector onDomainChange={handleDomainChange} />
              </div>
              <div className="h-6 w-px bg-border" />
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/ai-assistant-avatar.png" />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="font-semibold text-base text-foreground">
                    {selectedDomain ? `${selectedDomain.name} Agent` : "AI Assistant"}
                  </h1>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs bg-muted text-muted-foreground border-0">
                      {selectedModel.toUpperCase()}
                    </Badge>
                    <MCPStatus />
                    <Badge variant="outline" className="text-xs border-border text-muted-foreground">
                      {totalTokens.toLocaleString()} tokens
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:bg-accent/10">
                <Search className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-muted-foreground hover:bg-accent/10"
                onClick={() => setShowAnalytics(true)}
              >
                <BarChart3 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-muted-foreground hover:bg-accent/10"
                onClick={() => setShowAgent(true)}
              >
                <Users className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-muted-foreground hover:bg-accent/10"
                onClick={() => setShowAdmin(true)}
              >
                <Shield className="h-4 w-4" />
              </Button>
              <ModelSelector selectedModel={selectedModel} onModelChange={setSelectedModel} />
              <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:bg-accent/10">
                <Phone className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:bg-accent/10">
                <Video className="h-4 w-4" />
              </Button>
              <ThemeToggle />
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-muted-foreground hover:bg-accent/10"
                onClick={() => setShowSettings(true)}
              >
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:bg-accent/10">
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
                className={`flex gap-3 group ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.sender === "ai" && (
                  <Avatar className="h-8 w-8 mt-1 flex-shrink-0">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}

                <div className={`max-w-[70%] ${message.sender === "user" ? "order-1" : ""}`}>
                  {message.replyTo && <div className="text-xs text-gray-500 mb-1 px-1">Replying to message</div>}

                  <Card
                    className={`p-4 shadow-sm border ${
                      message.sender === "user"
                        ? "bg-primary text-primary-foreground ml-auto border-primary"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>

                    {message.reactions && Object.keys(message.reactions).length > 0 && (
                      <div className="flex gap-1 mt-2">
                        {Object.entries(message.reactions).map(
                          ([reaction, users]) =>
                            users.length > 0 && (
                              <Badge
                                key={reaction}
                                variant="outline"
                                className="text-xs px-2 py-1 cursor-pointer hover:bg-accent/10"
                                onClick={() => handleMessageReact(message.id, reaction)}
                              >
                                {reaction} {users.length}
                              </Badge>
                            ),
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2">
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

                      <MessageActions
                        messageId={message.id}
                        isUser={message.sender === "user"}
                        onReact={(reaction) => handleMessageReact(message.id, reaction)}
                        onEdit={() => handleMessageEdit(message.id)}
                        onDelete={() => handleMessageDelete(message.id)}
                        onReply={() => handleMessageReply(message.id)}
                        onCopy={() => handleMessageCopy(message.id)}
                      />
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
                  <AvatarFallback className="bg-primary text-primary-foreground">
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

        <div className="p-6 border-t border-border bg-card">
          {replyingToId && (
            <div className="mb-3 p-2 bg-muted rounded text-sm text-muted-foreground">
              Replying to message
              <Button variant="ghost" size="sm" className="ml-2 h-6 px-2" onClick={() => setReplyingToId(null)}>
                Cancel
              </Button>
            </div>
          )}
          <RichTextEditor
            value={inputValue}
            onChange={setInputValue}
            onSend={sendMessage}
            disabled={isLoading}
            placeholder={`Type your message to ${selectedDomain?.name || "AI Assistant"}... Use markdown for formatting`}
          />
        </div>
      </div>
    </div>
  )
}
