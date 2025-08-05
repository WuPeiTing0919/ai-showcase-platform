"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Star,
  Eye,
  Heart,
  Info,
  MessageSquare,
  User,
  Calendar,
  Building,
  TrendingUp,
  Users,
  BarChart3,
} from "lucide-react"
import { FavoriteButton } from "./favorite-button"
import { ReviewSystem } from "./reviews/review-system"

interface AppDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  app: {
    id: number
    name: string
    type: string
    department: string
    description: string
    icon: any
    creator: string
    featured: boolean
    judgeScore: number
  }
}

// Usage statistics data - empty for production
const getAppUsageStats = (appId: string, startDate: string, endDate: string) => {
  return {
    dailyUsers: 0,
    weeklyUsers: 0,
    monthlyUsers: 0,
    totalSessions: 0,
    topDepartments: [],
    trendData: [],
  }
}

export function AppDetailDialog({ open, onOpenChange, app }: AppDetailDialogProps) {
  const { user, addToRecentApps, getAppLikes, incrementViewCount, getViewCount, getAppRating } = useAuth()
  const [currentRating, setCurrentRating] = useState(getAppRating(app.id.toString()))
  const [reviewCount, setReviewCount] = useState(0)

  // Date range for usage trends
  const [startDate, setStartDate] = useState(() => {
    const date = new Date()
    date.setDate(date.getDate() - 6) // Default to last 7 days
    return date.toISOString().split("T")[0]
  })
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split("T")[0]
  })

  const IconComponent = app.icon
  const likes = getAppLikes(app.id.toString())
  const views = getViewCount(app.id.toString())
  const usageStats = getAppUsageStats(app.id.toString(), startDate, endDate)

  const getTypeColor = (type: string) => {
    const colors = {
      文字處理: "bg-blue-100 text-blue-800 border-blue-200",
      圖像生成: "bg-purple-100 text-purple-800 border-purple-200",
      語音辨識: "bg-green-100 text-green-800 border-green-200",
      推薦系統: "bg-orange-100 text-orange-800 border-orange-200",
    }
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800 border-gray-200"
  }

  const handleRatingUpdate = (newRating: number, newReviewCount: number) => {
    setCurrentRating(newRating)
    setReviewCount(newReviewCount)
  }

  const handleTryApp = () => {
    if (user) {
      addToRecentApps(app.id.toString())
    }

    // Increment view count when trying the app
    incrementViewCount(app.id.toString())

    // Open external app URL in new tab
    const appUrls: Record<string, string> = {
      "1": "https://dify.example.com/chat-assistant",
      "2": "https://image-gen.example.com",
      "3": "https://speech.example.com",
      "4": "https://recommend.example.com",
      "5": "https://text-analysis.example.com",
      "6": "https://ai-writing.example.com",
    }

    const appUrl = appUrls[app.id.toString()]
    if (appUrl) {
      window.open(appUrl, "_blank", "noopener,noreferrer")
    }
  }

  // Helper function to group data by month/year for section headers
  const getDateSections = (trendData: any[]) => {
    const sections: { [key: string]: { startIndex: number; endIndex: number; label: string } } = {}

    trendData.forEach((day, index) => {
      const date = new Date(day.date)
      const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
      const label = date.toLocaleDateString("zh-TW", { year: "numeric", month: "long" })

      if (!sections[yearMonth]) {
        sections[yearMonth] = { startIndex: index, endIndex: index, label }
      } else {
        sections[yearMonth].endIndex = index
      }
    })

    return sections
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
              <IconComponent className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold mb-2">{app.name}</DialogTitle>
              <DialogDescription className="text-base mb-3">{app.description}</DialogDescription>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="outline" className={getTypeColor(app.type)}>
                  {app.type}
                </Badge>
                <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-200">
                  {app.department}
                </Badge>
                {app.featured && (
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                    <Star className="w-3 h-3 mr-1" />
                    精選
                  </Badge>
                )}
              </div>
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Heart className="w-4 h-4" />
                  <span>{likes} 讚</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Eye className="w-4 h-4" />
                  <span>{views} 瀏覽</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span>{currentRating.toFixed(1)}</span>
                  {reviewCount > 0 && <span className="text-gray-500">({reviewCount} 評價)</span>}
                </div>
              </div>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <Info className="w-4 h-4" />
              <span>應用概覽</span>
            </TabsTrigger>
            <TabsTrigger value="statistics" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>使用統計</span>
            </TabsTrigger>
            <TabsTrigger value="reviews" className="flex items-center space-x-2">
              <MessageSquare className="w-4 h-4" />
              <span>用戶評價</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>應用詳情</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <User className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">開發者</p>
                        <p className="font-medium">{app.creator}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Building className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">所屬部門</p>
                        <p className="font-medium">{app.department}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">發布日期</p>
                        <p className="font-medium">2024年1月15日</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-2">功能特色</p>
                      <ul className="space-y-1 text-sm">
                        <li>• 智能化處理能力</li>
                        <li>• 高效能運算</li>
                        <li>• 用戶友好介面</li>
                        <li>• 多語言支援</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-500 mb-2">詳細描述</p>
                  <p className="text-gray-700 leading-relaxed">
                    {app.description} 這個應用採用了最新的人工智能技術，
                    為用戶提供了卓越的體驗。無論是在處理複雜任務還是日常工作中，
                    都能展現出色的性能和可靠性。我們持續優化和改進， 確保為用戶帶來最佳的使用體驗。
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center space-x-4">
              <Button
                onClick={handleTryApp}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                立即體驗
              </Button>
              <FavoriteButton appId={app.id.toString()} size="default" showText={true} className="px-6" />
            </div>
          </TabsContent>

          <TabsContent value="statistics" className="space-y-6">
            {/* Usage Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">今日使用者</CardTitle>
                  <Users className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{usageStats.dailyUsers}</div>
                  <p className="text-xs text-muted-foreground">活躍用戶數</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">本週使用者</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{usageStats.weeklyUsers}</div>
                  <p className="text-xs text-muted-foreground">週活躍用戶</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">總使用次數</CardTitle>
                  <BarChart3 className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{usageStats.totalSessions.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">累計使用次數</p>
                </CardContent>
              </Card>
            </div>

            {/* Usage Trends with Date Range */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>使用趨勢</CardTitle>
                    <CardDescription>查看指定時間範圍內的使用者活躍度</CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-2">
                      <Label htmlFor="start-date" className="text-sm">
                        開始日期
                      </Label>
                      <Input
                        id="start-date"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-36"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Label htmlFor="end-date" className="text-sm">
                        結束日期
                      </Label>
                      <Input
                        id="end-date"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-36"
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Chart Container with Horizontal Scroll */}
                  <div className="w-full overflow-x-auto">
                    <div
                      className="h-80 relative bg-gray-50 rounded-lg p-4"
                      style={{
                        minWidth: `${Math.max(800, usageStats.trendData.length * 40)}px`, // Dynamic width based on data points
                      }}
                    >
                      {/* Month/Year Section Headers */}
                      <div className="absolute top-2 left-4 right-4 flex">
                        {(() => {
                          const sections = getDateSections(usageStats.trendData)
                          const totalBars = usageStats.trendData.length

                          return Object.entries(sections).map(([key, section]) => {
                            const width = ((section.endIndex - section.startIndex + 1) / totalBars) * 100
                            const left = (section.startIndex / totalBars) * 100

                            return (
                              <div
                                key={key}
                                className="absolute text-xs font-medium text-gray-600 bg-white/90 px-2 py-1 rounded shadow-sm border"
                                style={{
                                  left: `${left}%`,
                                  width: `${width}%`,
                                  textAlign: "center",
                                }}
                              >
                                {section.label}
                              </div>
                            )
                          })
                        })()}
                      </div>

                      {/* Chart Bars */}
                      <div className="h-full flex items-end justify-between space-x-2" style={{ paddingTop: "40px" }}>
                        {usageStats.trendData.map((day, index) => {
                          const maxUsers = Math.max(...usageStats.trendData.map((d) => d.users))
                          const minUsers = Math.min(...usageStats.trendData.map((d) => d.users))
                          const range = maxUsers - minUsers
                          const normalizedHeight = range > 0 ? ((day.users - minUsers) / range) * 70 + 15 : 40

                          const currentDate = new Date(day.date)
                          const prevDate = index > 0 ? new Date(usageStats.trendData[index - 1].date) : null

                          // Check if this is the start of a new month/year for divider
                          const isNewMonth =
                            !prevDate ||
                            currentDate.getMonth() !== prevDate.getMonth() ||
                            currentDate.getFullYear() !== prevDate.getFullYear()

                          return (
                            <div
                              key={day.date}
                              className="flex-1 flex flex-col items-center group relative"
                              style={{ minWidth: "32px" }}
                            >
                              {/* Month divider line */}
                              {isNewMonth && index > 0 && (
                                <div className="absolute left-0 top-0 bottom-8 w-px bg-gray-300 opacity-50" />
                              )}

                              <div
                                className="w-full flex flex-col items-center justify-end"
                                style={{ height: "200px" }}
                              >
                                <div
                                  className="w-full bg-gradient-to-t from-blue-500 to-purple-500 rounded-t-md transition-all duration-300 hover:from-blue-600 hover:to-purple-600 cursor-pointer relative"
                                  style={{ height: `${normalizedHeight}%` }}
                                >
                                  {/* Value label */}
                                  <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-600 bg-white/80 px-1 rounded">
                                    {day.users}
                                  </div>
                                </div>
                              </div>

                              {/* Consistent day-only labels */}
                              <div className="text-xs text-gray-500 mt-2 text-center">{currentDate.getDate()}日</div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Scroll Hint */}
                  {usageStats.trendData.length > 20 && (
                    <div className="text-xs text-gray-500 text-center">💡 提示：圖表可左右滑動查看更多數據</div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Department Usage */}
            <Card>
              <CardHeader>
                <CardTitle>部門使用分布</CardTitle>
                <CardDescription>各部門使用者比例</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {usageStats.topDepartments.map((dept) => (
                    <div key={dept.name} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />
                        <span className="font-medium">{dept.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">{dept.users} 人</span>
                        <span className="text-sm font-medium">{dept.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-6">
            <ReviewSystem
              appId={app.id.toString()}
              appName={app.name}
              currentRating={currentRating}
              onRatingUpdate={handleRatingUpdate}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
