"use client"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Users,
  Shield,
  CreditCard,
  Activity,
  AlertTriangle,
  CheckCircle,
  Edit,
  Trash2,
  Plus,
  Download,
  Upload,
  Key,
  Globe,
  Server,
  Eye,
  EyeOff,
} from "lucide-react"

interface AdminPanelProps {
  onBack: () => void
}

interface User {
  id: string
  name: string
  email: string
  role: "admin" | "user" | "viewer"
  status: "active" | "inactive" | "suspended"
  lastActive: string
  tokensUsed: number
}

interface SystemConfig {
  feature: string
  enabled: boolean
  description: string
  category: "security" | "features" | "integrations" | "billing"
}

export function AdminPanel({ onBack }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState("users")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showApiKeys, setShowApiKeys] = useState(false)

  // Mock data - in real implementation, this would come from API
  const users: User[] = [
    {
      id: "1",
      name: "John Doe",
      email: "john@company.com",
      role: "admin",
      status: "active",
      lastActive: "2 minutes ago",
      tokensUsed: 45000,
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane@company.com",
      role: "user",
      status: "active",
      lastActive: "1 hour ago",
      tokensUsed: 23000,
    },
    {
      id: "3",
      name: "Bob Wilson",
      email: "bob@company.com",
      role: "viewer",
      status: "inactive",
      lastActive: "3 days ago",
      tokensUsed: 5000,
    },
  ]

  const systemConfigs: SystemConfig[] = [
    {
      feature: "File Upload",
      enabled: true,
      description: "Allow users to upload files and attachments",
      category: "features",
    },
    {
      feature: "Voice Recording",
      enabled: true,
      description: "Enable voice message recording functionality",
      category: "features",
    },
    {
      feature: "MCP Integration",
      enabled: false,
      description: "Model Context Protocol server connections",
      category: "integrations",
    },
    {
      feature: "Two-Factor Authentication",
      enabled: true,
      description: "Require 2FA for all admin accounts",
      category: "security",
    },
    {
      feature: "Usage Analytics",
      enabled: true,
      description: "Track and analyze system usage patterns",
      category: "features",
    },
    {
      feature: "Auto-billing",
      enabled: false,
      description: "Automatically charge for usage overages",
      category: "billing",
    },
  ]

  const auditLogs = [
    {
      id: "1",
      user: "john@company.com",
      action: "User created",
      target: "jane@company.com",
      timestamp: "2024-01-15 14:30:22",
      status: "success",
    },
    {
      id: "2",
      user: "admin@company.com",
      action: "Feature toggled",
      target: "MCP Integration",
      timestamp: "2024-01-15 13:45:11",
      status: "success",
    },
    {
      id: "3",
      user: "jane@company.com",
      action: "Login attempt",
      target: "Dashboard",
      timestamp: "2024-01-15 12:15:33",
      status: "failed",
    },
  ]

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-accent text-white"
      case "user":
        return "bg-primary text-white"
      case "viewer":
        return "bg-gray-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "inactive":
        return "bg-gray-100 text-gray-800"
      case "suspended":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
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
              <h1 className="text-2xl font-bold text-primary">Admin Panel</h1>
              <Badge className="bg-accent text-white">Enterprise</Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Logs
            </Button>
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Import Config
            </Button>
          </div>
        </div>

        {/* System Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium">System Status</span>
                </div>
                <Badge className="bg-green-100 text-green-800">Healthy</Badge>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">Active Users</span>
                </div>
                <span className="text-xl font-bold text-primary">47</span>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-purple-600" />
                  <span className="font-medium">API Health</span>
                </div>
                <Badge className="bg-green-100 text-green-800">99.9%</Badge>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  <span className="font-medium">Alerts</span>
                </div>
                <span className="text-xl font-bold text-accent">3</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Admin Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
            <TabsTrigger value="logs">Audit Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-primary">User Management</h3>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Plus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Active</TableHead>
                      <TableHead>Tokens Used</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getRoleColor(user.role)}>{user.role}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getStatusColor(user.status)}>
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">{user.lastActive}</TableCell>
                        <TableCell>{user.tokensUsed.toLocaleString()}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <h3 className="text-lg font-semibold text-primary">Security Settings</h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-primary flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Authentication
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-medium">Two-Factor Authentication</Label>
                      <p className="text-sm text-gray-500">Require 2FA for all users</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-medium">Session Timeout</Label>
                      <p className="text-sm text-gray-500">Auto-logout after inactivity</p>
                    </div>
                    <Select defaultValue="24h">
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1h">1h</SelectItem>
                        <SelectItem value="8h">8h</SelectItem>
                        <SelectItem value="24h">24h</SelectItem>
                        <SelectItem value="never">Never</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-medium">Password Policy</Label>
                      <p className="text-sm text-gray-500">Minimum password requirements</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Configure
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-primary flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    API Keys
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-medium">Master API Key</Label>
                      <p className="text-sm text-gray-500">System-wide API access</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setShowApiKeys(!showApiKeys)}>
                      {showApiKeys ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <Input
                    type={showApiKeys ? "text" : "password"}
                    value="sk-acs-1234567890abcdef"
                    readOnly
                    className="font-mono text-sm"
                  />
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                      Regenerate
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                      Revoke
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="features" className="space-y-4">
            <h3 className="text-lg font-semibold text-primary">Feature Controls</h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {systemConfigs
                .filter((config) => config.category === "features")
                .map((config, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{config.feature}</h4>
                          <p className="text-sm text-gray-500 mt-1">{config.description}</p>
                        </div>
                        <Switch defaultChecked={config.enabled} />
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="integrations" className="space-y-4">
            <h3 className="text-lg font-semibold text-primary">Integration Management</h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-primary flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    External APIs
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">OpenAI API</p>
                        <p className="text-sm text-gray-500">GPT models integration</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Connected</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">Anthropic API</p>
                        <p className="text-sm text-gray-500">Claude models integration</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Connected</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">MCP Server</p>
                        <p className="text-sm text-gray-500">Model Context Protocol</p>
                      </div>
                      <Badge variant="outline">Disconnected</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-primary flex items-center gap-2">
                    <Server className="h-5 w-5" />
                    System Integrations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="font-medium">Database Connection</Label>
                        <p className="text-sm text-gray-500">PostgreSQL cluster</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Healthy</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="font-medium">Redis Cache</Label>
                        <p className="text-sm text-gray-500">Session and data caching</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Healthy</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="font-medium">File Storage</Label>
                        <p className="text-sm text-gray-500">S3-compatible storage</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Healthy</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="billing" className="space-y-4">
            <h3 className="text-lg font-semibold text-primary">Billing & Usage</h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-primary flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Usage Limits
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <Label className="font-medium">Monthly Token Limit</Label>
                      <Input type="number" defaultValue="1000000" className="mt-1" />
                      <p className="text-sm text-gray-500 mt-1">Maximum tokens per month</p>
                    </div>
                    <div>
                      <Label className="font-medium">Cost Alert Threshold</Label>
                      <Input type="number" defaultValue="500" className="mt-1" />
                      <p className="text-sm text-gray-500 mt-1">Alert when monthly cost exceeds ($)</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="font-medium">Auto-billing</Label>
                        <p className="text-sm text-gray-500">Charge for overages automatically</p>
                      </div>
                      <Switch />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-primary">Current Usage</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Tokens Used</span>
                      <span className="font-medium">847,392 / 1,000,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Current Cost</span>
                      <span className="font-medium">$423.67</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Projected Monthly</span>
                      <span className="font-medium text-accent">$567.89</span>
                    </div>
                    <div className="pt-2 border-t">
                      <Button variant="outline" className="w-full bg-transparent">
                        View Detailed Billing
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="logs" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-primary">Audit Logs</h3>
              <div className="flex gap-2">
                <Select defaultValue="all">
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Actions</SelectItem>
                    <SelectItem value="auth">Authentication</SelectItem>
                    <SelectItem value="admin">Admin Actions</SelectItem>
                    <SelectItem value="errors">Errors</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Target</TableHead>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-medium">{log.user}</TableCell>
                        <TableCell>{log.action}</TableCell>
                        <TableCell>{log.target}</TableCell>
                        <TableCell className="text-sm text-gray-600">{log.timestamp}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              log.status === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                            }
                          >
                            {log.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
