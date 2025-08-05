"use client"
import { useAuth } from "@/contexts/auth-context"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { BarChart3, Clock, Heart, ImageIcon, MessageSquare, FileText, TrendingUp } from "lucide-react"

interface ActivityRecordsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Recent apps data - empty for production
const recentApps: any[] = []

// Category data - empty for production
const categoryData: any[] = []

export function ActivityRecordsDialog({ open, onOpenChange }: ActivityRecordsDialogProps) {
  const { user } = useAuth()

  if (!user) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="w-6 h-6" />
            活動紀錄
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="recent" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="recent">最近使用</TabsTrigger>
            <TabsTrigger value="statistics">個人統計</TabsTrigger>
          </TabsList>

          <TabsContent value="recent" className="space-y-4 max-h-[60vh] overflow-y-auto">
            <div>
              <h3 className="text-lg font-semibold mb-2">最近使用的應用</h3>
              <p className="text-sm text-muted-foreground mb-4">您最近體驗過的 AI 應用</p>

              <div className="grid gap-4">
                {recentApps.map((app) => {
                  const IconComponent = app.icon
                  return (
                    <Card key={app.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="flex items-center justify-between p-4">
                        <div className="flex items-center space-x-4">
                          <div className={`p-3 rounded-lg ${app.color}`}>
                            <IconComponent className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h4 className="font-semibold">{app.name}</h4>
                            <p className="text-sm text-muted-foreground">by {app.author}</p>
                            <div className="flex items-center gap-4 mt-1">
                              <Badge variant="secondary" className="text-xs">
                                {app.category}
                              </Badge>
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <BarChart3 className="w-3 h-3" />
                                使用 {app.usageCount} 次
                              </span>
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {app.timeSpent}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground mb-2">{app.lastUsed}</p>
                          <Button size="sm" variant="outline">
                            再次體驗
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="statistics" className="space-y-6 max-h-[60vh] overflow-y-auto">
            <div>
              <h3 className="text-lg font-semibold mb-2">個人統計</h3>
              <p className="text-sm text-muted-foreground mb-4">您在平台上的活動概覽</p>

              {/* Statistics Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">總使用次數</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">41</div>
                    <p className="text-xs text-muted-foreground">比上週增加 12%</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">使用時長</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">9.2小時</div>
                    <p className="text-xs text-muted-foreground">本月累計</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">收藏應用</CardTitle>
                    <Heart className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">6</div>
                    <p className="text-xs text-muted-foreground">個人收藏</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">加入天數</CardTitle>
                    <CardDescription>天</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">0</div>
                  </CardContent>
                </Card>
              </div>

              {/* Category Usage */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">最常使用的類別</CardTitle>
                  <CardDescription>根據您的使用頻率統計的應用類別分布</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {categoryData.map((category, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${category.color}`} />
                          <span className="font-medium">{category.name}</span>
                        </div>
                        <span className="text-muted-foreground">{category.usage}%</span>
                      </div>
                      <Progress value={category.usage} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
