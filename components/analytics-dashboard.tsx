"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from "recharts"
import {
  TrendingUp,
  TrendingDown,
  Users,
  MessageSquare,
  DollarSign,
  Clock,
  Zap,
  Activity,
  Download,
  RefreshCw,
  Calendar,
  Filter,
} from "lucide-react"

interface AnalyticsDashboardProps {
  onBack: () => void
}

interface MetricCard {
  title: string
  value: string
  change: number
  changeType: "increase" | "decrease"
  icon: React.ReactNode
  color: string
}

interface ChartData {
  name: string
  value: number
  cost?: number
  tokens?: number
  chats?: number
}

export function AnalyticsDashboard({ onBack }: AnalyticsDashboardProps) {
  const [timeRange, setTimeRange] = useState("7d")
  const [isLoading, setIsLoading] = useState(false)

  // Mock data - in real implementation, this would come from API
  const metrics: MetricCard[] = [
    {
      title: "Total Conversations",
      value: "2,847",
      change: 12.5,
      changeType: "increase",
      icon: <MessageSquare className="h-4 w-4" />,
      color: "text-blue-600",
    },
    {
      title: "Active Users",
      value: "1,234",
      change: 8.2,
      changeType: "increase",
      icon: <Users className="h-4 w-4" />,
      color: "text-green-600",
    },
    {
      title: "Total Cost",
      value: "$1,847.32",
      change: -3.1,
      changeType: "decrease",
      icon: <DollarSign className="h-4 w-4" />,
      color: "text-accent",
    },
    {
      title: "Avg Response Time",
      value: "1.2s",
      change: -15.3,
      changeType: "decrease",
      icon: <Clock className="h-4 w-4" />,
      color: "text-purple-600",
    },
    {
      title: "Token Usage",
      value: "2.4M",
      change: 18.7,
      changeType: "increase",
      icon: <Zap className="h-4 w-4" />,
      color: "text-orange-600",
    },
    {
      title: "Success Rate",
      value: "99.2%",
      change: 0.8,
      changeType: "increase",
      icon: <Activity className="h-4 w-4" />,
      color: "text-primary",
    },
  ]

  const usageData: ChartData[] = [
    { name: "Mon", value: 2400, cost: 45.2, tokens: 120000, chats: 89 },
    { name: "Tue", value: 1398, cost: 28.7, tokens: 98000, chats: 67 },
    { name: "Wed", value: 9800, cost: 187.3, tokens: 245000, chats: 156 },
    { name: "Thu", value: 3908, cost: 78.9, tokens: 167000, chats: 134 },
    { name: "Fri", value: 4800, cost: 95.4, tokens: 189000, chats: 178 },
    { name: "Sat", value: 3800, cost: 67.8, tokens: 145000, chats: 98 },
    { name: "Sun", value: 4300, cost: 82.1, tokens: 156000, chats: 112 },
  ]

  const modelUsageData: ChartData[] = [
    { name: "GPT-4o", value: 45, cost: 567.89 },
    { name: "Claude 3.5 Sonnet", value: 32, cost: 423.12 },
    { name: "GPT-4 Turbo", value: 15, cost: 234.56 },
    { name: "Claude 3 Opus", value: 8, cost: 156.78 },
  ]

  const costTrendData: ChartData[] = [
    { name: "Week 1", value: 1245.67 },
    { name: "Week 2", value: 1456.89 },
    { name: "Week 3", value: 1678.23 },
    { name: "Week 4", value: 1847.32 },
  ]

  const COLORS = ["#000000", "#dc2626", "#6b7280", "#374151"]

  const refreshData = () => {
    setIsLoading(true)
    setTimeout(() => setIsLoading(false), 1000)
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
              <h1 className="text-2xl font-bold text-primary">Analytics Dashboard</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={refreshData} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-600 mr-2">Time Range:</span>
          {["24h", "7d", "30d", "90d"].map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeRange(range)}
              className={timeRange === range ? "bg-primary text-primary-foreground" : ""}
            >
              {range}
            </Button>
          ))}
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {metrics.map((metric, index) => (
            <Card key={index} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg bg-gray-100 ${metric.color}`}>{metric.icon}</div>
                  <div className="flex items-center gap-1 text-sm">
                    {metric.changeType === "increase" ? (
                      <TrendingUp className="h-3 w-3 text-green-600" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-600" />
                    )}
                    <span className={metric.changeType === "increase" ? "text-green-600" : "text-red-600"}>
                      {Math.abs(metric.change)}%
                    </span>
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-2xl font-bold text-primary">{metric.value}</p>
                  <p className="text-sm text-gray-600">{metric.title}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Section */}
        <Tabs defaultValue="usage" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="usage">Usage Analytics</TabsTrigger>
            <TabsTrigger value="models">Model Performance</TabsTrigger>
            <TabsTrigger value="costs">Cost Analysis</TabsTrigger>
            <TabsTrigger value="realtime">Real-time Monitoring</TabsTrigger>
          </TabsList>

          <TabsContent value="usage" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-primary">Daily Usage Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={usageData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="chats" stackId="1" stroke="#000000" fill="#000000" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-primary">Token Consumption</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={usageData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="tokens" fill="#dc2626" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="models" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-primary">Model Usage Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={modelUsageData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {modelUsageData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-primary">Model Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {modelUsageData.map((model, index) => (
                    <div key={model.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{model.name}</span>
                        <Badge variant="outline">${model.cost?.toFixed(2)}</Badge>
                      </div>
                      <Progress value={model.value} className="h-2" />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{model.value}% usage</span>
                        <span>Avg response: 1.{index + 1}s</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="costs" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-primary">Cost Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={costTrendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`$${value}`, "Cost"]} />
                      <Line type="monotone" dataKey="value" stroke="#dc2626" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-primary">Cost Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <span className="font-medium">Current Month</span>
                      <span className="text-lg font-bold text-primary">$1,847.32</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <span className="font-medium">Previous Month</span>
                      <span className="text-gray-600">$1,678.23</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-accent/10 rounded">
                      <span className="font-medium">Projected Next Month</span>
                      <span className="text-accent font-bold">$2,156.78</span>
                    </div>
                  </div>
                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-2">Cost per Model</h4>
                    {modelUsageData.map((model) => (
                      <div key={model.name} className="flex justify-between py-1">
                        <span className="text-sm">{model.name}</span>
                        <span className="text-sm font-medium">${model.cost?.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="realtime" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-primary">Live Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Active Conversations</span>
                      <Badge className="bg-green-100 text-green-800">47</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Queue Length</span>
                      <Badge variant="outline">3</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Avg Wait Time</span>
                      <Badge variant="outline">0.8s</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">System Load</span>
                      <div className="flex items-center gap-2">
                        <Progress value={67} className="w-16 h-2" />
                        <span className="text-sm">67%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-primary">Error Monitoring</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">API Errors (24h)</span>
                      <Badge variant="destructive">12</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Timeout Rate</span>
                      <Badge variant="outline">0.3%</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Success Rate</span>
                      <Badge className="bg-green-100 text-green-800">99.2%</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Uptime</span>
                      <Badge className="bg-green-100 text-green-800">99.9%</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-primary">Resource Usage</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>CPU Usage</span>
                        <span>45%</span>
                      </div>
                      <Progress value={45} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Memory Usage</span>
                        <span>67%</span>
                      </div>
                      <Progress value={67} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Network I/O</span>
                        <span>23%</span>
                      </div>
                      <Progress value={23} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Storage</span>
                        <span>78%</span>
                      </div>
                      <Progress value={78} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
