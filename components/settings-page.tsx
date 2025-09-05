"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Eye, EyeOff, Save, User, Smile } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// [Keep all your existing interfaces and constants - no changes needed]
interface APISettings {
  openai: {
    apiKey: string
    enabled: boolean
    baseUrl?: string
  }
  claude: {
    apiKey: string
    enabled: boolean
    baseUrl?: string
  }
  mcp: {
    enabled: boolean
    serverUrl: string
    timeout: number
  }
  personalization: {
    avatar: string
    username: string
    enableEmojis: boolean
    emojiStyle: "native" | "twitter" | "apple"
    customAvatarUrl?: string
  }
}

interface SettingsPageProps {
  onBack: () => void
}

const AVATAR_OPTIONS = [
  { id: "default", name: "Default", url: "/placeholder.svg?height=40&width=40&text=👤" },
  { id: "professional", name: "Professional", url: "/professional-woman-diverse.png" },
  { id: "casual", name: "Casual", url: "/professional-man.png" },
  { id: "ai", name: "AI Assistant", url: "/ai-assistant-avatar.png" },
  { id: "custom", name: "Custom URL", url: "" },
]

const EMOJI_CATEGORIES = [
  { name: "Smileys", emojis: ["😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇"] },
  { name: "Gestures", emojis: ["👍", "👎", "👌", "✌️", "🤞", "🤟", "🤘", "🤙", "👈", "👉"] },
  { name: "Hearts", emojis: ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💕"] },
  { name: "Objects", emojis: ["💻", "📱", "⌚", "📷", "🎮", "🎧", "📚", "✏️", "📝", "🔍"] },
]

export function SettingsPage({ onBack }: SettingsPageProps) {
  const [settings, setSettings] = useState<APISettings>({
    openai: {
      apiKey: "",
      enabled: true,
      baseUrl: "https://api.openai.com/v1",
    },
    claude: {
      apiKey: "",
      enabled: true,
      baseUrl: "https://api.anthropic.com",
    },
    mcp: {
      enabled: false,
      serverUrl: "",
      timeout: 30000,
    },
    personalization: {
      avatar: "default",
      username: "User",
      enableEmojis: true,
      emojiStyle: "native",
    },
  })

  const [showKeys, setShowKeys] = useState({
    openai: false,
    claude: false,
  })

  const [testResults, setTestResults] = useState<{
    openai?: "success" | "error" | "testing"
    claude?: "success" | "error" | "testing"
    mcp?: "success" | "error" | "testing"
  }>({})

  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [customAvatarUrl, setCustomAvatarUrl] = useState("")

  // Load settings from API on mount
  useEffect(() => {
    const loadSettings = async () => {
      setIsLoading(true)
      try {
        const response = await fetch("/api/settings")
        if (response.ok) {
          const data = await response.json()
          if (data.settings) {
            setSettings(data.settings)
            // Handle custom avatar URL
            if (data.settings.personalization?.avatar === "custom") {
              setCustomAvatarUrl(data.settings.personalization.customAvatarUrl || "")
            }
          }
        } else {
          console.error("Failed to load settings from API")
          // Try localStorage as fallback
          const savedSettings = localStorage.getItem("acs-chat-settings")
          if (savedSettings) {
            try {
              const parsed = JSON.parse(savedSettings)
              setSettings((prev) => ({
                ...prev,
                ...parsed,
                personalization: {
                  ...prev.personalization,
                  ...(parsed.personalization || {}),
                },
              }))
              if (parsed.personalization?.avatar === "custom") {
                const customUrl = localStorage.getItem("acs-custom-avatar-url")
                if (customUrl) setCustomAvatarUrl(customUrl)
              }
            } catch (error) {
              console.error("Failed to parse localStorage settings:", error)
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch settings:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadSettings()
  }, [])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Prepare settings with custom avatar URL if needed
      const settingsToSave = {
        ...settings,
        personalization: {
          ...settings.personalization,
          customAvatarUrl: settings.personalization.avatar === "custom" ? customAvatarUrl : ""
        }
      }
      
      // Save to API (SQLite)
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settingsToSave),
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.settings) {
          setSettings(data.settings)
        }
        // Also save to localStorage as backup
        localStorage.setItem("acs-chat-settings", JSON.stringify(settingsToSave))
        if (settings.personalization.avatar === "custom") {
          localStorage.setItem("acs-custom-avatar-url", customAvatarUrl)
        }
      } else {
        throw new Error("Failed to save settings to API")
      }
    } catch (error) {
      console.error("Failed to save settings:", error)
      // Fall back to localStorage only
      localStorage.setItem("acs-chat-settings", JSON.stringify(settings))
      if (settings.personalization.avatar === "custom") {
        localStorage.setItem("acs-custom-avatar-url", customAvatarUrl)
      }
    } finally {
      setIsSaving(false)
    }
  }

  const updateSettings = (section: keyof APISettings, field: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }))
  }

  const getCurrentAvatarUrl = () => {
    const avatarId = settings.personalization?.avatar || "default"
    const selectedAvatar = AVATAR_OPTIONS.find((a) => a.id === avatarId)
    if (selectedAvatar?.id === "custom") {
      return customAvatarUrl || "/placeholder.svg?height=40&width=40&text=👤"
    }
    return selectedAvatar?.url || "/placeholder.svg?height=40&width=40&text=👤"
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    )
  }

  // [Rest of your component JSX remains exactly the same]
  return (
    <div className="flex h-screen bg-background">
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b border-border bg-white px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={onBack} className="text-gray-600 hover:bg-gray-100">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="text-2xl font-bold">
                <span className="text-black">AUSTEN</span>
                <span className="text-red-600">TEL</span>
              </div>
              <div className="h-6 w-px bg-border" />
              <h1 className="text-xl font-semibold text-black">Settings</h1>
            </div>
            <Button onClick={handleSave} disabled={isSaving} className="bg-black hover:bg-gray-800 text-white">
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </div>

        {/* Settings Content - Keep all your existing JSX here */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* All your existing cards remain the same */}
            <Card className="shadow-sm border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personalization
                </CardTitle>
                <CardDescription>Customize your chat experience with avatars and emojis</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar Selection */}
                <div className="space-y-4">
                  <Label className="text-base font-medium">Avatar</Label>
                  <div className="flex items-center gap-4 mb-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={getCurrentAvatarUrl() || "/placeholder.svg"} alt="Selected avatar" />
                      <AvatarFallback>
                        <User className="h-8 w-8" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{settings.personalization.username}</p>
                      <p className="text-sm text-gray-500">Current avatar</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {AVATAR_OPTIONS.map((avatar) => (
                      <div key={avatar.id} className="space-y-2">
                        <button
                          onClick={() => updateSettings("personalization", "avatar", avatar.id)}
                          className={`w-full p-3 rounded-lg border-2 transition-colors ${
                            settings.personalization.avatar === avatar.id
                              ? "border-black bg-gray-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          {avatar.id !== "custom" ? (
                            <Avatar className="h-12 w-12 mx-auto">
                              <AvatarImage src={avatar.url || "/placeholder.svg"} alt={avatar.name} />
                              <AvatarFallback>
                                <User className="h-6 w-6" />
                              </AvatarFallback>
                            </Avatar>
                          ) : (
                            <div className="h-12 w-12 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                              <User className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                        </button>
                        <p className="text-xs text-center text-gray-600">{avatar.name}</p>
                      </div>
                    ))}
                  </div>

                  {settings.personalization.avatar === "custom" && (
                    <div className="space-y-2">
                      <Label htmlFor="custom-avatar">Custom Avatar URL</Label>
                      <Input
                        id="custom-avatar"
                        value={customAvatarUrl}
                        onChange={(e) => setCustomAvatarUrl(e.target.value)}
                        placeholder="https://example.com/avatar.jpg"
                      />
                    </div>
                  )}
                </div>

                <Separator />

                {/* Username */}
                <div className="space-y-2">
                  <Label htmlFor="username">Display Name</Label>
                  <Input
                    id="username"
                    value={settings.personalization.username}
                    onChange={(e) => updateSettings("personalization", "username", e.target.value)}
                    placeholder="Enter your name"
                  />
                </div>

                <Separator />

                {/* Emoji Settings */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium flex items-center gap-2">
                        <Smile className="h-4 w-4" />
                        Emoji Support
                      </Label>
                      <p className="text-sm text-gray-500">Enable emoji reactions and quick access</p>
                    </div>
                    <Switch
                      checked={settings.personalization.enableEmojis}
                      onCheckedChange={(checked) => updateSettings("personalization", "enableEmojis", checked)}
                    />
                  </div>

                  {settings.personalization.enableEmojis && (
                    <>
                      <div className="space-y-2">
                        <Label>Emoji Style</Label>
                        <div className="flex gap-2">
                          {[
                            { id: "native", name: "Native" },
                            { id: "twitter", name: "Twitter" },
                            { id: "apple", name: "Apple" },
                          ].map((style) => (
                            <Button
                              key={style.id}
                              variant={settings.personalization.emojiStyle === style.id ? "default" : "outline"}
                              size="sm"
                              onClick={() => updateSettings("personalization", "emojiStyle", style.id)}
                            >
                              {style.name}
                            </Button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label>Quick Access Emojis</Label>
                        {EMOJI_CATEGORIES.map((category) => (
                          <div key={category.name} className="space-y-2">
                            <p className="text-sm font-medium text-gray-600">{category.name}</p>
                            <div className="flex flex-wrap gap-2">
                              {category.emojis.map((emoji) => (
                                <button
                                  key={emoji}
                                  className="w-8 h-8 rounded hover:bg-gray-100 flex items-center justify-center text-lg transition-colors"
                                  onClick={() => {
                                    navigator.clipboard?.writeText(emoji)
                                  }}
                                  title={`Copy ${emoji} to clipboard`}
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Rest of your cards (OpenAI, Claude, MCP, Connection Status) remain exactly the same */}
            {/* ... */}
            
            {/* OpenAI Settings */}
            <Card className="shadow-sm border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">OpenAI</CardTitle>
                <CardDescription>Configure OpenAI API settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">API Key</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type={showKeys.openai ? "text" : "password"}
                      value={settings.openai.apiKey}
                      onChange={(e) => updateSettings("openai", "apiKey", e.target.value)}
                      placeholder="Enter your OpenAI API key"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowKeys((prev) => ({ ...prev, openai: !prev.openai }))}
                    >
                      {showKeys.openai ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">Enabled</Label>
                  <Switch
                    checked={settings.openai.enabled}
                    onCheckedChange={(checked) => updateSettings("openai", "enabled", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">Base URL</Label>
                  <Input
                    value={settings.openai.baseUrl || ""}
                    onChange={(e) => updateSettings("openai", "baseUrl", e.target.value)}
                    placeholder="Enter your OpenAI base URL"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Claude Settings */}
            <Card className="shadow-sm border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Claude</CardTitle>
                <CardDescription>Configure Claude API settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">API Key</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type={showKeys.claude ? "text" : "password"}
                      value={settings.claude.apiKey}
                      onChange={(e) => updateSettings("claude", "apiKey", e.target.value)}
                      placeholder="Enter your Claude API key"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowKeys((prev) => ({ ...prev, claude: !prev.claude }))}
                    >
                      {showKeys.claude ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">Enabled</Label>
                  <Switch
                    checked={settings.claude.enabled}
                    onCheckedChange={(checked) => updateSettings("claude", "enabled", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">Base URL</Label>
                  <Input
                    value={settings.claude.baseUrl || ""}
                    onChange={(e) => updateSettings("claude", "baseUrl", e.target.value)}
                    placeholder="Enter your Claude base URL"
                  />
                </div>
              </CardContent>
            </Card>

            <Separator />

            {/* MCP Settings */}
            <Card className="shadow-sm border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">MCP</CardTitle>
                <CardDescription>Configure MCP settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">Enabled</Label>
                  <Switch
                    checked={settings.mcp.enabled}
                    onCheckedChange={(checked) => updateSettings("mcp", "enabled", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">Server URL</Label>
                  <Input
                    value={settings.mcp.serverUrl}
                    onChange={(e) => updateSettings("mcp", "serverUrl", e.target.value)}
                    placeholder="Enter your MCP server URL"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">Timeout (ms)</Label>
                  <Input
                    type="number"
                    value={settings.mcp.timeout.toString()}
                    onChange={(e) => updateSettings("mcp", "timeout", Number.parseInt(e.target.value))}
                    placeholder="Enter your MCP timeout"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Connection Status Summary */}
            <Card className="shadow-sm border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Connection Status</CardTitle>
                <CardDescription>Overview of all configured services</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">OpenAI</span>
                    <Badge variant={settings.openai.enabled && settings.openai.apiKey ? "default" : "secondary"}>
                      {settings.openai.enabled && settings.openai.apiKey ? "Ready" : "Not Configured"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">Claude</span>
                    <Badge variant={settings.claude.enabled && settings.claude.apiKey ? "default" : "secondary"}>
                      {settings.claude.enabled && settings.claude.apiKey ? "Ready" : "Not Configured"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">MCP</span>
                    <Badge variant={settings.mcp.enabled && settings.mcp.serverUrl ? "default" : "secondary"}>
                      {settings.mcp.enabled && settings.mcp.serverUrl ? "Ready" : "Not Configured"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
            
          </div>
        </div>
      </div>
    </div>
  )
}