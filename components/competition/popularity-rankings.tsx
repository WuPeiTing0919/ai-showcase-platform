"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useCompetition } from "@/contexts/competition-context"
import {
  Search,
  Heart,
  Eye,
  Trophy,
  Calendar,
  Users,
  Target,
  Lightbulb,
  MessageSquare,
  ImageIcon,
  Mic,
  TrendingUp,
  Brain,
  Zap,
  Crown,
  ChevronLeft,
  ChevronRight,
  ThumbsUp,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LikeButton } from "@/components/like-button"
import { AppDetailDialog } from "@/components/app-detail-dialog"
import { TeamDetailDialog } from "@/components/competition/team-detail-dialog"

// AI applications data - empty for production
const aiApps: any[] = []

// Teams data - empty for production
const mockTeams: any[] = []


export function PopularityRankings() {
  const { user, getLikeCount, getViewCount } = useAuth()
  const { competitions, currentCompetition, setCurrentCompetition, judges } = useCompetition()

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState("all")
  const [selectedType, setSelectedType] = useState("all")
  const [selectedCompetitionType, setSelectedCompetitionType] = useState("all")
  const [selectedApp, setSelectedApp] = useState<any>(null)
  const [showAppDetail, setShowAppDetail] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState<any>(null)
  const [showTeamDetail, setShowTeamDetail] = useState(false)
  const [individualCurrentPage, setIndividualCurrentPage] = useState(0)
  const [teamCurrentPage, setTeamCurrentPage] = useState(0)

  const ITEMS_PER_PAGE = 3

  // Filter apps based on search criteria
  const filteredApps = aiApps.filter((app) => {
    const matchesSearch =
      app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.creator.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDepartment = selectedDepartment === "all" || app.department === selectedDepartment
    const matchesType = selectedType === "all" || app.type === selectedType
    const matchesCompetitionType = selectedCompetitionType === "all" || app.competitionType === selectedCompetitionType

    return matchesSearch && matchesDepartment && matchesType && matchesCompetitionType
  })

  // Sort apps by like count (popularity) and group by competition type
  const sortedApps = filteredApps.sort((a, b) => {
    const likesA = getLikeCount(a.id.toString())
    const likesB = getLikeCount(b.id.toString())
    return likesB - likesA
  })

  // Group apps by competition type
  const individualApps = sortedApps.filter((app) => app.competitionType === "individual")
  const teamApps = sortedApps.filter((app) => app.competitionType === "team")

  const getTypeColor = (type: string) => {
    const colors = {
      文字處理: "bg-blue-100 text-blue-800 border-blue-200",
      圖像生成: "bg-purple-100 text-purple-800 border-purple-200",
      語音辨識: "bg-green-100 text-green-800 border-green-200",
      推薦系統: "bg-orange-100 text-orange-800 border-orange-200",
    }
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800 border-gray-200"
  }

  const getCompetitionTypeIcon = (type: string) => {
    switch (type) {
      case "individual":
        return <Target className="w-4 h-4" />
      case "team":
        return <Users className="w-4 h-4" />
      case "proposal":
        return <Lightbulb className="w-4 h-4" />
      case "mixed":
        return <Trophy className="w-4 h-4" />
      default:
        return <Trophy className="w-4 h-4" />
    }
  }

  const getCompetitionTypeText = (type: string) => {
    switch (type) {
      case "individual":
        return "個人賽"
      case "team":
        return "團隊賽"
      case "proposal":
        return "提案賽"
      case "mixed":
        return "混合賽"
      default:
        return "競賽"
    }
  }

  const getCompetitionTypeColor = (type: string) => {
    switch (type) {
      case "individual":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "team":
        return "bg-green-100 text-green-800 border-green-200"
      case "proposal":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "mixed":
        return "bg-gradient-to-r from-blue-100 via-green-100 to-purple-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const handleOpenAppDetail = (app: any) => {
    setSelectedApp(app)
    setShowAppDetail(true)
  }

  const handleOpenTeamDetail = (team: any) => {
    setSelectedTeam(team)
    setShowTeamDetail(true)
  }

  const renderCompetitionSection = (apps: any[], title: string, competitionType: string) => {
    if (apps.length === 0) {
      return null
    }

    const currentPage = competitionType === "individual" ? individualCurrentPage : teamCurrentPage
    const setCurrentPage = competitionType === "individual" ? setIndividualCurrentPage : setTeamCurrentPage
    const totalPages = Math.ceil(apps.length / ITEMS_PER_PAGE)
    const startIndex = currentPage * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    const currentApps = apps.slice(startIndex, endIndex)

    return (
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                {competitionType === "individual" ? (
                  <Target className="w-5 h-5 text-blue-500" />
                ) : (
                  <Users className="w-5 h-5 text-green-500" />
                )}
                <span>{title}</span>
              </CardTitle>
              <CardDescription>
                {currentCompetition?.name || "暫無進行中的競賽"} - {title}人氣排名 (共 {apps.length} 個應用)
              </CardDescription>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="outline" className={getCompetitionTypeColor(competitionType)}>
                {getCompetitionTypeIcon(competitionType)}
                <span className="ml-1">{getCompetitionTypeText(competitionType)}</span>
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Page indicator */}
            {totalPages > 1 && (
              <div className="text-center">
                <div className="text-sm text-gray-600">
                  顯示第 {startIndex + 1}-{Math.min(endIndex, apps.length)} 名，共 {apps.length} 個應用
                </div>
                <div className="flex justify-center items-center space-x-2 mt-2">
                  {Array.from({ length: totalPages }).map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-all duration-200 ${
                        index === currentPage ? "bg-blue-500 w-6" : "bg-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Carousel Container */}
            <div className="relative">
              {/* Left Arrow */}
              {totalPages > 1 && currentPage > 0 && (
                <button
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 z-10 w-12 h-12 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 hover:shadow-xl transition-all duration-200 group"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600 group-hover:text-gray-800" />
                </button>
              )}

              {/* Right Arrow */}
              {totalPages > 1 && currentPage < totalPages - 1 && (
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 z-10 w-12 h-12 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 hover:shadow-xl transition-all duration-200 group"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-gray-800" />
                </button>
              )}

              {/* Apps Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-8">
                {currentApps.map((app, index) => {
                  const likes = getLikeCount(app.id.toString())
                  const views = getViewCount(app.id.toString())
                  const globalRank = startIndex + index + 1

                  return (
                    <Card
                      key={app.id}
                      className="hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 flex flex-col"
                    >
                      <CardContent className="p-4 flex flex-col flex-1">
                        <div className="flex items-start space-x-3 mb-4">
                          {/* Numbered Badge */}
                          <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-md flex-shrink-0">
                            {globalRank}
                          </div>

                          {/* App Icon */}
                          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-gray-200 shadow-sm flex-shrink-0">
                            <MessageSquare className="w-5 h-5 text-blue-600" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-gray-900 mb-1 truncate">{app.name}</h4>
                            <p className="text-sm text-gray-600 mb-2">by {app.creator}</p>
                            <div className="flex flex-wrap gap-1">
                              <Badge variant="outline" className={`${getTypeColor(app.type)} text-xs`}>
                                {app.type}
                              </Badge>
                              <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-200 text-xs">
                                {app.department}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        {/* Description - flexible height */}
                        <div className="mb-4 flex-1">
                          <p className="text-sm text-gray-600 line-clamp-3">{app.description}</p>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Eye className="w-4 h-4" />
                              <span>{views} 次瀏覽</span>
                            </div>
                            {globalRank <= 3 && (
                              <div className="flex items-center space-x-1 text-orange-600 font-medium">
                                <Trophy className="w-4 h-4" />
                                <span>人氣冠軍</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons - Always at bottom with consistent positioning */}
                        <div className="flex items-center justify-between pt-3 border-t border-yellow-200 mt-auto">
                          {/* Enhanced Like Button */}
                          <div className="flex items-center">
                            <LikeButton appId={app.id.toString()} size="lg" />
                          </div>

                          {/* View Details Button */}
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-white hover:bg-gray-50 border-gray-300 shadow-sm"
                            onClick={() => handleOpenAppDetail(app)}
                          >
                            查看詳情
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderTeamCompetitionSection = (teams: any[], title: string) => {
    if (teams.length === 0) {
      return null
    }

    // Calculate team popularity score: total apps × highest like count
    const teamsWithScores = teams
      .map((team) => {
        const appLikes = team.apps.map((appId: string) => getLikeCount(appId))
        const maxLikes = Math.max(...appLikes, 0)
        const totalApps = team.apps.length
        const popularityScore = totalApps * maxLikes

        return {
          ...team,
          popularityScore,
          maxLikes,
          totalApps,
          totalViews: team.apps.reduce((sum: number, appId: string) => sum + getViewCount(appId), 0),
        }
      })
      .sort((a, b) => b.popularityScore - a.popularityScore)

    const currentPage = teamCurrentPage
    const setCurrentPage = setTeamCurrentPage
    const totalPages = Math.ceil(teamsWithScores.length / ITEMS_PER_PAGE)
    const startIndex = currentPage * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    const currentTeams = teamsWithScores.slice(startIndex, endIndex)

    return (
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-green-500" />
                <span>{title}</span>
              </CardTitle>
              <CardDescription>
                {currentCompetition?.name || "暫無進行中的競賽"} - {title}人氣排名 (共 {teamsWithScores.length} 個團隊)
              </CardDescription>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                <Users className="w-4 h-4" />
                <span className="ml-1">團隊賽</span>
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Page indicator */}
            {totalPages > 1 && (
              <div className="text-center">
                <div className="text-sm text-gray-600">
                  顯示第 {startIndex + 1}-{Math.min(endIndex, teamsWithScores.length)} 名，共 {teamsWithScores.length}{" "}
                  個團隊
                </div>
                <div className="flex justify-center items-center space-x-2 mt-2">
                  {Array.from({ length: totalPages }).map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-all duration-200 ${
                        index === currentPage ? "bg-green-500 w-6" : "bg-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Carousel Container */}
            <div className="relative">
              {/* Left Arrow */}
              {totalPages > 1 && currentPage > 0 && (
                <button
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 z-10 w-12 h-12 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 hover:shadow-xl transition-all duration-200 group"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600 group-hover:text-gray-800" />
                </button>
              )}

              {/* Right Arrow */}
              {totalPages > 1 && currentPage < totalPages - 1 && (
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 z-10 w-12 h-12 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 hover:shadow-xl transition-all duration-200 group"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-gray-800" />
                </button>
              )}

              {/* Teams Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-8">
                {currentTeams.map((team, index) => {
                  const globalRank = startIndex + index + 1
                  const leader = team.members.find((m: any) => m.id === team.leader)

                  return (
                    <Card
                      key={team.id}
                      className="hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-green-50 to-blue-50 border border-green-200 flex flex-col"
                    >
                      <CardContent className="p-4 flex flex-col flex-1">
                        <div className="flex items-start space-x-3 mb-4">
                          {/* Numbered Badge */}
                          <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-400 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-md flex-shrink-0">
                            {globalRank}
                          </div>

                          {/* Team Icon */}
                          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-gray-200 shadow-sm flex-shrink-0">
                            <Users className="w-5 h-5 text-green-600" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-gray-900 mb-1 truncate">{team.name}</h4>
                            <p className="text-sm text-gray-600 mb-2">隊長：{leader?.name}</p>
                            <div className="flex flex-wrap gap-1">
                              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 text-xs">
                                團隊賽
                              </Badge>
                              <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-200 text-xs">
                                {team.department}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        {/* Team Members */}
                        <div className="mb-4 flex-1">
                          <h5 className="text-sm font-medium text-gray-700 mb-2">團隊成員 ({team.members.length}人)</h5>
                          <div className="space-y-1">
                            {team.members.slice(0, 3).map((member: any) => (
                              <div key={member.id} className="flex items-center space-x-2 text-xs">
                                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-medium">
                                  {member.name[0]}
                                </div>
                                <span className="text-gray-600">{member.name}</span>
                                <span className="text-gray-400">({member.role})</span>
                              </div>
                            ))}
                            {team.members.length > 3 && (
                              <div className="text-xs text-gray-500 ml-8">還有 {team.members.length - 3} 位成員...</div>
                            )}
                          </div>
                        </div>

                        {/* Apps Info */}
                        <div className="mb-4">
                          <h5 className="text-sm font-medium text-gray-700 mb-2">提交應用</h5>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="bg-white p-2 rounded border">
                              <div className="font-bold text-blue-600">{team.totalApps}</div>
                              <div className="text-gray-500">應用數量</div>
                            </div>
                            <div className="bg-white p-2 rounded border">
                              <div className="font-bold text-red-600">{team.maxLikes}</div>
                              <div className="text-gray-500">最高按讚</div>
                            </div>
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Eye className="w-4 h-4" />
                              <span>{team.totalViews} 次瀏覽</span>
                            </div>
                            {globalRank <= 3 && (
                              <div className="flex items-center space-x-1 text-green-600 font-medium">
                                <Trophy className="w-4 h-4" />
                                <span>人氣前三</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Popularity Score */}
                        <div className="mb-4 p-3 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg">
                          <div className="text-center">
                            <div className="text-lg font-bold text-green-700">{team.popularityScore}</div>
                            <div className="text-xs text-green-600">人氣指數</div>
                            <div className="text-xs text-gray-500 mt-1">
                              {team.totalApps} 個應用 × {team.maxLikes} 最高按讚
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between pt-3 border-t border-green-200 mt-auto">
                          <div className="flex items-center space-x-2">
                            <ThumbsUp className="w-4 h-4 text-blue-500" />
                            <span className="text-sm font-medium">
                              {team.apps.reduce((sum: number, appId: string) => sum + getLikeCount(appId), 0)} 總按讚
                            </span>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-white hover:bg-gray-50 border-gray-300 shadow-sm"
                            onClick={() => handleOpenTeamDetail(team)}
                          >
                            查看團隊
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-8">
      {/* Competition Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <span>競賽人氣排行</span>
              </CardTitle>
              <CardDescription>
                {currentCompetition?.name || "暫無進行中的競賽"} - 基於用戶按讚數的即時人氣排名
              </CardDescription>
            </div>
            <div className="flex items-center space-x-3">
              <Select
                value={currentCompetition?.id || ""}
                onValueChange={(value) => {
                  const competition = competitions.find((c) => c.id === value)
                  setCurrentCompetition(competition || null)
                }}
              >
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="選擇競賽" />
                </SelectTrigger>
                <SelectContent>
                  {competitions.map((competition) => (
                    <SelectItem key={competition.id} value={competition.id}>
                      <div className="flex items-center space-x-2">
                        {getCompetitionTypeIcon(competition.type)}
                        <span>{competition.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        {currentCompetition && (
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-sm">
                  {currentCompetition.year}年{currentCompetition.month}月
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className={getCompetitionTypeColor(currentCompetition.type)}>
                  {getCompetitionTypeIcon(currentCompetition.type)}
                  <span className="ml-1">{getCompetitionTypeText(currentCompetition.type)}</span>
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-gray-500" />
                <span className="text-sm">{filteredApps.length} 個參賽應用</span>
              </div>
              <div className="flex items-center space-x-2">
                <Badge
                  variant={currentCompetition.status === "completed" ? "secondary" : "default"}
                  className={
                    currentCompetition.status === "completed"
                      ? "bg-green-100 text-green-800"
                      : currentCompetition.status === "judging"
                        ? "bg-orange-100 text-orange-800"
                        : currentCompetition.status === "active"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-purple-100 text-purple-800"
                  }
                >
                  {currentCompetition.status === "completed"
                    ? "已完成"
                    : currentCompetition.status === "judging"
                      ? "評審中"
                      : currentCompetition.status === "active"
                        ? "進行中"
                        : "即將開始"}
                </Badge>
              </div>
            </div>
            <p className="text-gray-600 mt-4">{currentCompetition.description}</p>
          </CardContent>
        )}
      </Card>

      {/* Judge Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Crown className="w-5 h-5 text-purple-500" />
            <span>評審團</span>
          </CardTitle>
          <CardDescription>專業評審團隊</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {judges.map((judge) => (
              <div key={judge.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Avatar>
                  <AvatarImage src={judge.avatar || "/placeholder.svg"} />
                  <AvatarFallback className="bg-purple-100 text-purple-700">{judge.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h4 className="font-medium">{judge.name}</h4>
                  <p className="text-sm text-gray-600">{judge.title}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {judge.expertise.slice(0, 2).map((skill) => (
                      <Badge key={skill} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Search and Filter Section */}
      <Card>
        <CardHeader>
          <CardTitle>篩選條件</CardTitle>
          <CardDescription>根據部門、應用類型、競賽類型或關鍵字篩選參賽應用</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="搜尋應用名稱、描述或創作者..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-3">
              <Select value={selectedCompetitionType} onValueChange={setSelectedCompetitionType}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="競賽類型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部類型</SelectItem>
                  <SelectItem value="individual">個人賽</SelectItem>
                  <SelectItem value="team">團隊賽</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="部門" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部部門</SelectItem>
                  <SelectItem value="HQBU">HQBU</SelectItem>
                  <SelectItem value="ITBU">ITBU</SelectItem>
                  <SelectItem value="MBU1">MBU1</SelectItem>
                  <SelectItem value="SBU">SBU</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="應用類型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部類型</SelectItem>
                  <SelectItem value="文字處理">文字處理</SelectItem>
                  <SelectItem value="圖像生成">圖像生成</SelectItem>
                  <SelectItem value="語音辨識">語音辨識</SelectItem>
                  <SelectItem value="推薦系統">推薦系統</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Competition Rankings */}
      {currentCompetition ? (
        <div className="space-y-8">
          {/* Individual Competition Section */}
          {(selectedCompetitionType === "all" || selectedCompetitionType === "individual") &&
            renderCompetitionSection(individualApps, "個人賽", "individual")}

          {/* Team Competition Section */}
          {(selectedCompetitionType === "all" || selectedCompetitionType === "team") &&
            renderTeamCompetitionSection(
              mockTeams.filter(
                (team) =>
                  team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  team.members.some((member: any) => member.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                  selectedDepartment === "all" ||
                  team.department === selectedDepartment,
              ),
              "團隊賽",
            )}

          {/* No Results */}
          {filteredApps.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">沒有找到符合條件的應用</h3>
                <p className="text-gray-500">請調整篩選條件或清除搜尋關鍵字</p>
                <Button
                  variant="outline"
                  className="mt-4 bg-transparent"
                  onClick={() => {
                    setSearchTerm("")
                    setSelectedDepartment("all")
                    setSelectedType("all")
                    setSelectedCompetitionType("all")
                  }}
                >
                  重置篩選條件
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">請選擇競賽</h3>
            <p className="text-gray-500">選擇一個競賽來查看人氣排行榜</p>
          </CardContent>
        </Card>
      )}

      {/* App Detail Dialog */}
      {selectedApp && <AppDetailDialog open={showAppDetail} onOpenChange={setShowAppDetail} app={selectedApp} />}

      {/* Team Detail Dialog */}
      {selectedTeam && <TeamDetailDialog open={showTeamDetail} onOpenChange={setShowTeamDetail} team={selectedTeam} />}
    </div>
  )
}
