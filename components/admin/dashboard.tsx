"use client"
import { useCompetition } from "@/contexts/competition-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Bot, Trophy, TrendingUp, Eye, Heart, MessageSquare, Award, Activity } from "lucide-react"

// Dashboard data - empty for production
const mockStats = {
  totalUsers: 0,
  activeUsers: 0,
  totalApps: 0,
  totalCompetitions: 0,
  totalReviews: 0,
  totalViews: 0,
  totalLikes: 0,
}

const recentActivities: any[] = []

const topApps: any[] = []

interface AdminDashboardProps {
  onPageChange?: (page: string) => void
}

export function AdminDashboard({ onPageChange }: AdminDashboardProps) {
  const { competitions } = useCompetition()

  const handleManageUsers = () => {
    if (onPageChange) {
      onPageChange("users")
    }
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">管理儀表板</h1>
        <p className="text-gray-600">歡迎回到 AI 展示平台管理後台</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">總用戶數</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">活躍用戶 {mockStats.activeUsers} 人</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI 應用數</CardTitle>
            <Bot className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.totalApps}</div>
            <p className="text-xs text-muted-foreground">本月新增 2 個應用</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">競賽活動</CardTitle>
            <Trophy className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{competitions.length}</div>
            <p className="text-xs text-muted-foreground">1 個進行中</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">總瀏覽量</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">比上月增長 12%</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="w-5 h-5" />
              <span>最新活動</span>
            </CardTitle>
            <CardDescription>系統最新動態</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => {
                const IconComponent = activity.icon
                return (
                  <div key={activity.id} className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full bg-gray-100 ${activity.color}`}>
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.message}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Top Performing Apps */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="w-5 h-5" />
              <span>熱門應用</span>
            </CardTitle>
            <CardDescription>表現最佳的 AI 應用</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topApps.map((app, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{app.name}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Eye className="w-3 h-3" />
                        <span>{app.views}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Heart className="w-3 h-3" />
                        <span>{app.likes}</span>
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary">{app.rating} ⭐</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>快速操作</CardTitle>
          <CardDescription>常用管理功能</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="h-20 flex flex-col space-y-2" onClick={handleManageUsers}>
              <Users className="w-6 h-6" />
              <span>管理用戶</span>
            </Button>
            <Button className="h-20 flex flex-col space-y-2 bg-transparent" variant="outline">
              <Bot className="w-6 h-6" />
              <span>新增應用</span>
            </Button>
            <Button className="h-20 flex flex-col space-y-2 bg-transparent" variant="outline">
              <Trophy className="w-6 h-6" />
              <span>創建競賽</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
