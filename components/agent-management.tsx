"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"
import { Bot, Plus, Edit, BarChart3, MessageSquare, Zap, Brain, Save, Copy, Download, Upload } from "lucide-react"

interface AgentManagementProps {
  onBack: () => void
}

interface Agent {
  id: string
  name: string
  description: string
  personality: string
  systemPrompt: string
  model: string
  temperature: number
  maxTokens: number
  status: "active" | "inactive" | "training"
  conversations: number
  avgResponseTime: number
  successRate: number
  totalTokens: number
  capabilities: string[]
  color: string
}

interface AgentTemplate {
  id: string
  name: string
  description: string
  category: "customer-service" | "technical" | "sales" | "creative" | "analytical"
  systemPrompt: string
  capabilities: string[]
}

export function AgentManagement({ onBack }: AgentManagementProps) {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

  // Mock data - in real implementation, this would come from API
  const agents: Agent[] = [
    {
      id: "acs-manager",
      name: "ACS Manager",
      description: "Administrative and management tasks specialist",
      personality: "Professional, efficient, detail-oriented",
      systemPrompt:
        "You are an ACS Manager responsible for administrative tasks, team coordination, and operational efficiency. Always maintain a professional tone and focus on practical solutions.",
      model: "gpt-4o",
      temperature: 0.3,
      maxTokens: 2000,
      status: "active",
      conversations: 247,
      avgResponseTime: 1.2,
      successRate: 96.8,
      totalTokens: 145000,
      capabilities: ["Task Management", "Team Coordination", "Reporting", "Process Optimization"],
      color: "bg-primary",
    },
    {
      id: "acs-voice",
      name: "ACS Voice",
      description: "Voice communication and audio processing specialist",
      personality: "Friendly, clear, empathetic",
      systemPrompt:
        "You are an ACS Voice specialist focused on voice communications, audio processing, and speech-related tasks. Communicate clearly and be helpful with voice-related queries.",
      model: "claude-3-5-sonnet",
      temperature: 0.5,
      maxTokens: 1500,
      status: "active",
      conversations: 189,
      avgResponseTime: 0.9,
      successRate: 98.2,
      totalTokens: 98000,
      capabilities: ["Voice Processing", "Speech Recognition", "Audio Analysis", "Call Management"],
      color: "bg-accent",
    },
    {
      id: "acs-support",
      name: "ACS Support",
      description: "Customer support and troubleshooting specialist",
      personality: "Patient, helpful, solution-focused",
      systemPrompt:
        "You are an ACS Support specialist dedicated to helping customers resolve issues and answer questions. Always be patient, thorough, and focus on finding solutions.",
      model: "gpt-4-turbo",
      temperature: 0.4,
      maxTokens: 1800,
      status: "training",
      conversations: 156,
      avgResponseTime: 1.5,
      successRate: 94.1,
      totalTokens: 87000,
      capabilities: ["Technical Support", "Troubleshooting", "Customer Service", "Documentation"],
      color: "bg-primary/80",
    },
  ]

  const agentTemplates: AgentTemplate[] = [
    {
      id: "customer-service",
      name: "Customer Service Agent",
      description: "Handles customer inquiries and support requests",
      category: "customer-service",
      systemPrompt:
        "You are a helpful customer service representative. Always be polite, professional, and focus on resolving customer issues efficiently.",
      capabilities: ["Customer Support", "Issue Resolution", "Product Knowledge", "Escalation Management"],
    },
    {
      id: "technical-expert",
      name: "Technical Expert",
      description: "Provides technical guidance and troubleshooting",
      category: "technical",
      systemPrompt:
        "You are a technical expert with deep knowledge of systems and processes. Provide clear, accurate technical guidance and step-by-step solutions.",
      capabilities: ["Technical Analysis", "System Diagnostics", "Code Review", "Architecture Planning"],
    },
    {
      id: "sales-assistant",
      name: "Sales Assistant",
      description: "Supports sales processes and customer engagement",
      category: "sales",
      systemPrompt:
        "You are a sales assistant focused on understanding customer needs and presenting appropriate solutions. Be consultative and value-focused.",
      capabilities: ["Lead Qualification", "Product Demos", "Proposal Generation", "CRM Integration"],
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "inactive":
        return "bg-gray-100 text-gray-800"
      case "training":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const createNewAgent = () => {
    setSelectedAgent({
      id: `agent-${Date.now()}`,
      name: "New Agent",
      description: "",
      personality: "",
      systemPrompt: "",
      model: "gpt-4o",
      temperature: 0.7,
      maxTokens: 2000,
      status: "inactive",
      conversations: 0,
      avgResponseTime: 0,
      successRate: 0,
      totalTokens: 0,
      capabilities: [],
      color: "bg-primary",
    })
    setIsCreating(true)
    setActiveTab("configuration")
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Button variant="ghost" onClick={onBack} className="mb-2 text-gray-600 hover:text-primary">
              ← Back to Chat
            </Button>
            <div className="flex items-center gap-3">
              <div className="text-2xl font-bold">
                <span className="text-primary">AUSTEN</span>
                <span className="text-accent">TEL</span>
              </div>
              <div className="h-6 w-px bg-border" />
              <h1 className="text-2xl font-bold text-primary">Agent Management</h1>
              <Badge className="bg-accent text-white">Enterprise</Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Config
            </Button>
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Import Agents
            </Button>
            <Button onClick={createNewAgent} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Plus className="h-4 w-4 mr-2" />
              Create Agent
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Agent List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-primary flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  Active Agents
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {agents.map((agent) => (
                  <Card
                    key={agent.id}
                    className={`p-3 cursor-pointer transition-colors hover:bg-gray-50 ${
                      selectedAgent?.id === agent.id ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => {
                      setSelectedAgent(agent)
                      setIsCreating(false)
                      setActiveTab("overview")
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${agent.color}`} />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{agent.name}</h4>
                        <p className="text-xs text-gray-500 truncate">{agent.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className={getStatusColor(agent.status)}>
                            {agent.status}
                          </Badge>
                          <span className="text-xs text-gray-500">{agent.conversations} chats</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}

                <div className="pt-3 border-t">
                  <h4 className="font-medium text-sm mb-2">Agent Templates</h4>
                  {agentTemplates.slice(0, 3).map((template) => (
                    <Card key={template.id} className="p-2 mb-2 cursor-pointer hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="text-xs font-medium">{template.name}</h5>
                          <p className="text-xs text-gray-500">{template.category}</p>
                        </div>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Agent Details */}
          <div className="lg:col-span-2">
            {selectedAgent ? (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="configuration">Configuration</TabsTrigger>
                  <TabsTrigger value="performance">Performance</TabsTrigger>
                  <TabsTrigger value="workflows">Workflows</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-primary flex items-center gap-2">
                          <div className={`w-4 h-4 rounded-full ${selectedAgent.color}`} />
                          {selectedAgent.name}
                        </CardTitle>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                          <Button variant="outline" size="sm">
                            <Copy className="h-4 w-4 mr-2" />
                            Clone
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium">Status</Label>
                          <Badge className={getStatusColor(selectedAgent.status)}>{selectedAgent.status}</Badge>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Model</Label>
                          <p className="text-sm">{selectedAgent.model}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Conversations</Label>
                          <p className="text-sm">{selectedAgent.conversations}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Success Rate</Label>
                          <p className="text-sm">{selectedAgent.successRate}%</p>
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium">Description</Label>
                        <p className="text-sm text-gray-600 mt-1">{selectedAgent.description}</p>
                      </div>

                      <div>
                        <Label className="text-sm font-medium">Capabilities</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedAgent.capabilities.map((capability) => (
                            <Badge key={capability} variant="outline" className="text-xs">
                              {capability}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="configuration" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-primary">Agent Configuration</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="agent-name">Agent Name</Label>
                          <Input id="agent-name" defaultValue={selectedAgent.name} />
                        </div>
                        <div>
                          <Label htmlFor="agent-model">Model</Label>
                          <Select defaultValue={selectedAgent.model}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                              <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                              <SelectItem value="claude-3-5-sonnet">Claude 3.5 Sonnet</SelectItem>
                              <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="agent-description">Description</Label>
                        <Input id="agent-description" defaultValue={selectedAgent.description} />
                      </div>

                      <div>
                        <Label htmlFor="agent-personality">Personality</Label>
                        <Input id="agent-personality" defaultValue={selectedAgent.personality} />
                      </div>

                      <div>
                        <Label htmlFor="system-prompt">System Prompt</Label>
                        <Textarea
                          id="system-prompt"
                          rows={4}
                          defaultValue={selectedAgent.systemPrompt}
                          className="resize-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Temperature: {selectedAgent.temperature}</Label>
                          <Slider
                            defaultValue={[selectedAgent.temperature]}
                            max={1}
                            min={0}
                            step={0.1}
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label>Max Tokens: {selectedAgent.maxTokens}</Label>
                          <Slider
                            defaultValue={[selectedAgent.maxTokens]}
                            max={4000}
                            min={100}
                            step={100}
                            className="mt-2"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">Agent Status</Label>
                          <p className="text-sm text-gray-500">Enable or disable this agent</p>
                        </div>
                        <Switch defaultChecked={selectedAgent.status === "active"} />
                      </div>

                      <div className="flex gap-2 pt-4">
                        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </Button>
                        <Button variant="outline">Test Agent</Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="performance" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <MessageSquare className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium">Conversations</span>
                        </div>
                        <p className="text-2xl font-bold">{selectedAgent.conversations}</p>
                        <p className="text-xs text-gray-500">Total interactions</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Zap className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium">Response Time</span>
                        </div>
                        <p className="text-2xl font-bold">{selectedAgent.avgResponseTime}s</p>
                        <p className="text-xs text-gray-500">Average response</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <BarChart3 className="h-4 w-4 text-purple-600" />
                          <span className="text-sm font-medium">Success Rate</span>
                        </div>
                        <p className="text-2xl font-bold">{selectedAgent.successRate}%</p>
                        <p className="text-xs text-gray-500">Successful interactions</p>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-primary">Performance Metrics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Response Accuracy</span>
                          <span>{selectedAgent.successRate}%</span>
                        </div>
                        <Progress value={selectedAgent.successRate} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>User Satisfaction</span>
                          <span>94%</span>
                        </div>
                        <Progress value={94} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Task Completion</span>
                          <span>89%</span>
                        </div>
                        <Progress value={89} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="workflows" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-primary">Automation Workflows</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8 text-gray-500">
                        <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <h3 className="font-medium mb-2">Workflow Automation</h3>
                        <p className="text-sm mb-4">Create automated workflows and triggers for this agent</p>
                        <Button variant="outline">
                          <Plus className="h-4 w-4 mr-2" />
                          Create Workflow
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            ) : (
              <Card className="h-96 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="font-medium mb-2">Select an Agent</h3>
                  <p className="text-sm">Choose an agent from the list to view details and configuration</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
