"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useCompetition } from "@/contexts/competition-context"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  Target,
  Users,
  Lightbulb,
  Star,
  Heart,
  Eye,
  Trophy,
  Crown,
  UserCheck,
  Building,
  Mail,
  Clock,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  ImageIcon,
  Mic,
  TrendingUp,
  Brain,
  Zap,
  Play,
} from "lucide-react"

// AI applications data - empty for production
const aiApps: any[] = []

interface CompetitionDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ranking: any
  competitionType: "individual" | "team" | "proposal"
}

export function CompetitionDetailDialog({
  open,
  onOpenChange,
  ranking,
  competitionType,
}: CompetitionDetailDialogProps) {
  const { user, getAppLikes, getViewCount, getAppRating, incrementViewCount, addToRecentApps } = useAuth()
  const { judges, getAppJudgeScores, getProposalJudgeScores, getTeamById, getProposalById, currentCompetition } =
    useCompetition()

  const [activeTab, setActiveTab] = useState("overview")

  const handleTryApp = (appId: string) => {
    incrementViewCount(appId)
    addToRecentApps(appId)
    console.log(`Opening app ${appId}`)
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

  const renderIndividualDetail = () => {
    const app = aiApps.find((a) => a.id === ranking.appId)
    const judgeScores = getAppJudgeScores(ranking.appId!)
    const likes = getAppLikes(ranking.appId!)
    const views = getViewCount(ranking.appId!)
    const rating = getAppRating(ranking.appId!)

    if (!app) return null

    const IconComponent = app.icon

    return (
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">應用概覽</TabsTrigger>
          <TabsTrigger value="scores">評審評分</TabsTrigger>
          <TabsTrigger value="experience">立即體驗</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <IconComponent className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-2xl">{app.name}</CardTitle>
                  <CardDescription className="text-lg">by {app.creator}</CardDescription>
                  <div className="flex items-center space-x-4 mt-2">
                    <Badge variant="outline" className={getTypeColor(app.type)}>
                      {app.type}
                    </Badge>
                    <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-200">
                      {app.department}
                    </Badge>
                    <div className="flex items-center space-x-1 text-2xl font-bold text-purple-600">
                      <Trophy className="w-6 h-6" />
                      <span>第 {ranking.rank} 名</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-6">{app.description}</p>

              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-center space-x-1 text-2xl font-bold text-purple-600">
                    <Star className="w-6 h-6" />
                    <span>{ranking.totalScore.toFixed(1)}</span>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">總評分</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-center space-x-1 text-2xl font-bold text-red-600">
                    <Heart className="w-6 h-6" />
                    <span>{likes}</span>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">收藏數</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-center space-x-1 text-2xl font-bold text-blue-600">
                    <Eye className="w-6 h-6" />
                    <span>{views}</span>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">瀏覽數</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-center space-x-1 text-2xl font-bold text-yellow-600">
                    <Star className="w-6 h-6" />
                    <span>{rating.toFixed(1)}</span>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">用戶評分</div>
                </div>
              </div>

              <div className="grid grid-cols-5 gap-4">
                {[
                  { key: "innovation", name: "創新性", icon: "💡", color: "text-yellow-600" },
                  { key: "technical", name: "技術性", icon: "⚙️", color: "text-blue-600" },
                  { key: "usability", name: "實用性", icon: "🎯", color: "text-green-600" },
                  { key: "presentation", name: "展示效果", icon: "🎨", color: "text-purple-600" },
                  { key: "impact", name: "影響力", icon: "🚀", color: "text-red-600" },
                ].map((category) => (
                  <div key={category.key} className="text-center p-4 bg-white border rounded-lg">
                    <div className="text-2xl mb-2">{category.icon}</div>
                    <div className={`text-xl font-bold ${category.color}`}>
                      {ranking.scores[category.key as keyof typeof ranking.scores].toFixed(1)}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">{category.name}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scores" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Crown className="w-5 h-5 text-purple-500" />
                <span>評審評分詳情</span>
              </CardTitle>
              <CardDescription>各位評審的詳細評分和評語</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {judgeScores.map((score) => {
                  const judge = judges.find((j) => j.id === score.judgeId)
                  if (!judge) return null

                  const totalScore = Object.values(score.scores).reduce((sum, s) => sum + s, 0) / 5

                  return (
                    <div key={score.judgeId} className="border rounded-lg p-6">
                      <div className="flex items-center space-x-4 mb-4">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={judge.avatar || "/placeholder.svg"} />
                          <AvatarFallback className="bg-purple-100 text-purple-700 text-lg">
                            {judge.name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg">{judge.name}</h4>
                          <p className="text-gray-600">{judge.title}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {judge.expertise.map((skill) => (
                              <Badge key={skill} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-purple-600">{totalScore.toFixed(1)}</div>
                          <div className="text-sm text-gray-500">總分</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-5 gap-3 mb-4">
                        {[
                          { key: "innovation", name: "創新性", icon: "💡" },
                          { key: "technical", name: "技術性", icon: "⚙️" },
                          { key: "usability", name: "實用性", icon: "🎯" },
                          { key: "presentation", name: "展示效果", icon: "🎨" },
                          { key: "impact", name: "影響力", icon: "🚀" },
                        ].map((category) => (
                          <div key={category.key} className="text-center p-3 bg-gray-50 rounded-lg">
                            <div className="text-lg">{category.icon}</div>
                            <div className="text-lg font-bold text-gray-900">
                              {score.scores[category.key as keyof typeof score.scores]}
                            </div>
                            <div className="text-xs text-gray-500">{category.name}</div>
                          </div>
                        ))}
                      </div>

                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h5 className="font-medium text-blue-900 mb-2">評審意見</h5>
                        <p className="text-blue-800">{score.comments}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="experience" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Play className="w-5 h-5 text-green-500" />
                <span>立即體驗應用</span>
              </CardTitle>
              <CardDescription>體驗這個獲獎的 AI 應用</CardDescription>
            </CardHeader>
            <CardContent className="text-center py-12">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mx-auto mb-6">
                <IconComponent className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">{app.name}</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">{app.description}</p>
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                onClick={() => handleTryApp(app.id)}
              >
                <Play className="w-5 h-5 mr-2" />
                立即體驗
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    )
  }

  const renderTeamDetail = () => {
    const team = getTeamById(ranking.teamId!)
    if (!team) return null

    return (
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">團隊概覽</TabsTrigger>
          <TabsTrigger value="members">團隊成員</TabsTrigger>
          <TabsTrigger value="apps">團隊應用</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-2xl">{team.name}</CardTitle>
                  <CardDescription className="text-lg">
                    隊長：{team.members.find((m) => m.id === team.leader)?.name}
                  </CardDescription>
                  <div className="flex items-center space-x-4 mt-2">
                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                      團隊賽
                    </Badge>
                    <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-200">
                      {team.department}
                    </Badge>
                    <div className="flex items-center space-x-1 text-2xl font-bold text-green-600">
                      <Trophy className="w-6 h-6" />
                      <span>第 {ranking.rank} 名</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-center space-x-1 text-2xl font-bold text-green-600">
                    <Star className="w-6 h-6" />
                    <span>{ranking.totalScore.toFixed(1)}</span>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">團隊評分</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{team.apps.length}</div>
                  <div className="text-sm text-gray-500 mt-1">提交應用</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{team.totalLikes}</div>
                  <div className="text-sm text-gray-500 mt-1">總按讚數</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{team.members.length}</div>
                  <div className="text-sm text-gray-500 mt-1">團隊成員</div>
                </div>
              </div>

              <div className="bg-white border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Building className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">{team.department}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">{team.contactEmail}</span>
                    </div>
                  </div>
                  <div className="text-sm text-green-600 font-medium">
                    人氣指數: {Math.round((team.totalLikes / team.apps.length) * 10) / 10}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="members" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <UserCheck className="w-5 h-5 text-green-500" />
                <span>團隊成員</span>
              </CardTitle>
              <CardDescription>團隊所有成員的詳細資訊</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {team.members.map((member) => (
                  <div
                    key={member.id}
                    className={`border rounded-lg p-4 ${
                      member.id === team.leader ? "border-green-300 bg-green-50" : "border-gray-200"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={`/placeholder-40x40.png?height=40&width=40&text=${member.name[0]}`} />
                        <AvatarFallback className="bg-green-100 text-green-700">{member.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-semibold">{member.name}</h4>
                          {member.id === team.leader && (
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              隊長
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{member.role}</p>
                        <Badge variant="outline" className="text-xs mt-1">
                          {member.department}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="apps" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Trophy className="w-5 h-5 text-blue-500" />
                <span>團隊應用</span>
              </CardTitle>
              <CardDescription>團隊提交的所有應用</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {team.apps.map((appId) => {
                  const app = aiApps.find((a) => a.id === appId)
                  if (!app) return null

                  const IconComponent = app.icon
                  const likes = getAppLikes(appId)
                  const views = getViewCount(appId)
                  const rating = getAppRating(appId)

                  return (
                    <Card key={appId} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                            <IconComponent className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{app.name}</CardTitle>
                            <CardDescription>by {app.creator}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600 mb-4">{app.description}</p>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Heart className="w-3 h-3" />
                              <span>{likes}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Eye className="w-3 h-3" />
                              <span>{views}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Star className="w-3 h-3 text-yellow-500" />
                              <span>{rating.toFixed(1)}</span>
                            </div>
                          </div>
                        </div>
                        <Button
                          className="w-full bg-transparent"
                          variant="outline"
                          onClick={() => handleTryApp(app.id)}
                        >
                          <Play className="w-4 h-4 mr-2" />
                          體驗應用
                        </Button>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    )
  }

  const renderProposalDetail = () => {
    const proposal = getProposalById(ranking.proposalId!)
    const team = ranking.team
    const judgeScores = getProposalJudgeScores(ranking.proposalId!)

    if (!proposal) return null

    return (
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">提案概覽</TabsTrigger>
          <TabsTrigger value="scores">評審評分</TabsTrigger>
          <TabsTrigger value="team">提案團隊</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <Lightbulb className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-2xl">{proposal.title}</CardTitle>
                  <CardDescription className="text-lg">提案團隊：{team?.name}</CardDescription>
                  <div className="flex items-center space-x-4 mt-2">
                    <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">
                      提案賽
                    </Badge>
                    <div className="flex items-center space-x-1 text-2xl font-bold text-purple-600">
                      <Trophy className="w-6 h-6" />
                      <span>第 {ranking.rank} 名</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-purple-600 mb-2">{ranking.totalScore.toFixed(1)}</div>
                <div className="text-gray-500">總評分</div>
              </div>

              <div className="space-y-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h5 className="font-semibold text-red-900 mb-2 flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    痛點描述
                  </h5>
                  <p className="text-red-800">{proposal.problemStatement}</p>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h5 className="font-semibold text-green-900 mb-2 flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    解決方案
                  </h5>
                  <p className="text-green-800">{proposal.solution}</p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h5 className="font-semibold text-blue-900 mb-2 flex items-center">
                    <Target className="w-5 h-5 mr-2" />
                    預期影響
                  </h5>
                  <p className="text-blue-800">{proposal.expectedImpact}</p>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="grid grid-cols-5 gap-4">
                {[
                  { key: "problemIdentification", name: "問題識別", icon: "🔍", color: "text-red-600" },
                  { key: "solutionFeasibility", name: "方案可行性", icon: "⚙️", color: "text-blue-600" },
                  { key: "innovation", name: "創新性", icon: "💡", color: "text-yellow-600" },
                  { key: "impact", name: "預期影響", icon: "🚀", color: "text-green-600" },
                  { key: "presentation", name: "展示效果", icon: "🎨", color: "text-purple-600" },
                ].map((category) => (
                  <div key={category.key} className="text-center p-4 bg-white border rounded-lg">
                    <div className="text-2xl mb-2">{category.icon}</div>
                    <div className={`text-xl font-bold ${category.color}`}>
                      {ranking.scores[category.key as keyof typeof ranking.scores].toFixed(1)}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">{category.name}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scores" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Crown className="w-5 h-5 text-purple-500" />
                <span>評審評分詳情</span>
              </CardTitle>
              <CardDescription>各位評審對提案的詳細評分和評語</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {judgeScores.map((score) => {
                  const judge = judges.find((j) => j.id === score.judgeId)
                  if (!judge) return null

                  const totalScore = Object.values(score.scores).reduce((sum, s) => sum + s, 0) / 5

                  return (
                    <div key={score.judgeId} className="border rounded-lg p-6">
                      <div className="flex items-center space-x-4 mb-4">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={judge.avatar || "/placeholder.svg"} />
                          <AvatarFallback className="bg-purple-100 text-purple-700 text-lg">
                            {judge.name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg">{judge.name}</h4>
                          <p className="text-gray-600">{judge.title}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {judge.expertise.map((skill) => (
                              <Badge key={skill} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-purple-600">{totalScore.toFixed(1)}</div>
                          <div className="text-sm text-gray-500">總分</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-5 gap-3 mb-4">
                        {[
                          { key: "problemIdentification", name: "問題識別", icon: "🔍" },
                          { key: "solutionFeasibility", name: "方案可行性", icon: "⚙️" },
                          { key: "innovation", name: "創新性", icon: "💡" },
                          { key: "impact", name: "預期影響", icon: "🚀" },
                          { key: "presentation", name: "展示效果", icon: "🎨" },
                        ].map((category) => (
                          <div key={category.key} className="text-center p-3 bg-gray-50 rounded-lg">
                            <div className="text-lg">{category.icon}</div>
                            <div className="text-lg font-bold text-gray-900">
                              {score.scores[category.key as keyof typeof score.scores]}
                            </div>
                            <div className="text-xs text-gray-500">{category.name}</div>
                          </div>
                        ))}
                      </div>

                      <div className="bg-purple-50 p-4 rounded-lg">
                        <h5 className="font-medium text-purple-900 mb-2">評審意見</h5>
                        <p className="text-purple-800">{score.comments}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="space-y-6">
          {team && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-green-500" />
                  <span>提案團隊</span>
                </CardTitle>
                <CardDescription>提案團隊的詳細資訊</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <h4 className="font-semibold text-lg mb-2">{team.name}</h4>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Building className="w-4 h-4" />
                      <span>{team.department}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Mail className="w-4 h-4" />
                      <span>{team.contactEmail}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>提交於 {new Date(proposal.submittedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {team.members.map((member) => (
                    <div
                      key={member.id}
                      className={`border rounded-lg p-4 ${
                        member.id === team.leader ? "border-green-300 bg-green-50" : "border-gray-200"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={`/placeholder-40x40.png?height=40&width=40&text=${member.name[0]}`} />
                          <AvatarFallback className="bg-green-100 text-green-700">{member.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-semibold">{member.name}</h4>
                            {member.id === team.leader && (
                              <Badge variant="secondary" className="bg-green-100 text-green-800">
                                隊長
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{member.role}</p>
                          <Badge variant="outline" className="text-xs mt-1">
                            {member.department}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {competitionType === "individual" && "個人賽詳情"}
            {competitionType === "team" && "團隊賽詳情"}
            {competitionType === "proposal" && "提案賽詳情"}
          </DialogTitle>
          <DialogDescription>
            {currentCompetition?.name} - 第 {ranking.rank} 名
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6">
          {competitionType === "individual" && renderIndividualDetail()}
          {competitionType === "team" && renderTeamDetail()}
          {competitionType === "proposal" && renderProposalDetail()}
        </div>
      </DialogContent>
    </Dialog>
  )
}
