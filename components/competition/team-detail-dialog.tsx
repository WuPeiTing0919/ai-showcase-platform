"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Users,
  Mail,
  Eye,
  Heart,
  Trophy,
  Star,
  MessageSquare,
  ImageIcon,
  Mic,
  TrendingUp,
  Brain,
  Zap,
  ExternalLink,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { LikeButton } from "@/components/like-button"
import { AppDetailDialog } from "@/components/app-detail-dialog"

interface TeamDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  team: any
}

// App data for team apps - empty for production
const getAppDetails = (appId: string) => {
  return {
    id: appId,
    name: "",
    type: "",
    description: "",
    icon: null,
    fullDescription: "",
    features: [],
    author: "",
    category: "",
    tags: [],
    demoUrl: "",
    sourceUrl: "",
  }
}

const getTypeColor = (type: string) => {
  const colors = {
    文字處理: "bg-blue-100 text-blue-800 border-blue-200",
    圖像生成: "bg-purple-100 text-purple-800 border-purple-200",
    語音辨識: "bg-green-100 text-green-800 border-green-200",
    推薦系統: "bg-orange-100 text-orange-800 border-orange-200",
  }
  return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800 border-gray-200"
}

export function TeamDetailDialog({ open, onOpenChange, team }: TeamDetailDialogProps) {
  const { getLikeCount, getViewCount, getAppRating } = useAuth()
  const [selectedTab, setSelectedTab] = useState("overview")
  const [selectedApp, setSelectedApp] = useState<any>(null)
  const [appDetailOpen, setAppDetailOpen] = useState(false)

  if (!team) return null

  const leader = team.members.find((m: any) => m.id === team.leader)

  const handleAppClick = (appId: string) => {
    const appDetails = getAppDetails(appId)
    // Create app object that matches AppDetailDialog interface
    const app = {
      id: Number.parseInt(appId),
      name: appDetails.name,
      type: appDetails.type,
      department: team.department, // Use team's department
      description: appDetails.description,
      icon: appDetails.icon,
      creator: appDetails.author,
      featured: false,
      judgeScore: 0,
    }
    setSelectedApp(app)
    setAppDetailOpen(true)
  }

  const totalLikes = team.apps.reduce((sum: number, appId: string) => sum + getLikeCount(appId), 0)
  const totalViews = team.apps.reduce((sum: number, appId: string) => sum + getViewCount(appId), 0)

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-green-500" />
              <span>{team.name}</span>
            </DialogTitle>
            <DialogDescription>團隊詳細資訊與成員介紹</DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Team Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">團隊概覽</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{team.members.length}</div>
                    <div className="text-sm text-gray-600">團隊成員</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{team.apps.length}</div>
                    <div className="text-sm text-gray-600">提交應用</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{totalLikes}</div>
                    <div className="text-sm text-gray-600">總按讚數</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{totalViews}</div>
                    <div className="text-sm text-gray-600">總瀏覽數</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tab Navigation */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              <Button
                variant={selectedTab === "overview" ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedTab("overview")}
                className="flex-1"
              >
                團隊資訊
              </Button>
              <Button
                variant={selectedTab === "members" ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedTab("members")}
                className="flex-1"
              >
                成員介紹
              </Button>
              <Button
                variant={selectedTab === "apps" ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedTab("apps")}
                className="flex-1"
              >
                提交應用
              </Button>
            </div>

            {/* Tab Content */}
            {selectedTab === "overview" && (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">基本資訊</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">團隊名稱</label>
                        <p className="text-gray-900">{team.name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">代表部門</label>
                        <Badge variant="outline" className="ml-2">
                          {team.department}
                        </Badge>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">團隊隊長</label>
                        <p className="text-gray-900">{leader?.name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">聯絡信箱</label>
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4 text-gray-500" />
                          <p className="text-gray-900">{team.contactEmail}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">競賽表現</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 border rounded-lg">
                        <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                        <div className="text-lg font-bold">{team.popularityScore}</div>
                        <div className="text-sm text-gray-600">人氣指數</div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <Eye className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                        <div className="text-lg font-bold">{totalViews}</div>
                        <div className="text-sm text-gray-600">總瀏覽數</div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <Heart className="w-8 h-8 text-red-500 mx-auto mb-2" />
                        <div className="text-lg font-bold">{totalLikes}</div>
                        <div className="text-sm text-gray-600">總按讚數</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {selectedTab === "members" && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">團隊成員 ({team.members.length}人)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {team.members.map((member: any, index: number) => (
                      <div key={member.id} className="flex items-center space-x-3 p-4 border rounded-lg">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={`/placeholder-40x40.png`} />
                          <AvatarFallback className="bg-green-100 text-green-700 font-medium">
                            {member.name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium">{member.name}</h4>
                            {member.id === team.leader && (
                              <Badge variant="default" className="bg-yellow-100 text-yellow-800 text-xs">
                                隊長
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{member.role}</p>
                          <p className="text-xs text-gray-500">{member.department}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {selectedTab === "apps" && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">提交應用 ({team.apps.length}個)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {team.apps.map((appId: string) => {
                      const app = getAppDetails(appId)
                      const IconComponent = app.icon
                      const likes = getLikeCount(appId)
                      const views = getViewCount(appId)
                      const rating = getAppRating(appId)

                      return (
                        <Card
                          key={appId}
                          className="hover:shadow-md transition-all duration-200 cursor-pointer group"
                          onClick={() => handleAppClick(appId)}
                        >
                          <CardContent className="p-4 flex flex-col h-full">
                            <div className="flex items-start space-x-3 mb-3">
                              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                                <IconComponent className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <h4 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                                    {app.name}
                                  </h4>
                                  <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-all" />
                                </div>
                                <Badge variant="outline" className={`${getTypeColor(app.type)} text-xs mt-1`}>
                                  {app.type}
                                </Badge>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{app.description}</p>
                            <div className="flex items-center justify-between mt-auto">
                              <div className="flex items-center space-x-3 text-xs text-gray-500">
                                <div className="flex items-center space-x-1">
                                  <Eye className="w-3 h-3" />
                                  <span>{views}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Star className="w-3 h-3 text-yellow-500" />
                                  <span>{rating.toFixed(1)}</span>
                                </div>
                              </div>
                              <div onClick={(e) => e.stopPropagation()}>
                                <LikeButton appId={appId} size="sm" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* App Detail Dialog */}
      {selectedApp && <AppDetailDialog open={appDetailOpen} onOpenChange={setAppDetailOpen} app={selectedApp} />}
    </>
  )
}
