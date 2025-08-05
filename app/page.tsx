"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useCompetition } from "@/contexts/competition-context"
import {
  Search,
  Star,
  Heart,
  Eye,
  Brain,
  MessageSquare,
  ImageIcon,
  Mic,
  TrendingUp,
  Zap,
  Settings,
  Trophy,
  ChevronLeft,
  ChevronRight,
  Award,
  Medal,
  Target,
  Users,
  Lightbulb,
  ArrowLeft,
  Plus,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LoginDialog } from "@/components/auth/login-dialog"
import { RegisterDialog } from "@/components/auth/register-dialog"
import { UserMenu } from "@/components/auth/user-menu"
import { FavoriteButton } from "@/components/favorite-button"
import { FavoritesPage } from "@/components/favorites-page"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AppDetailDialog } from "@/components/app-detail-dialog"
import { ForgotPasswordDialog } from "@/components/auth/forgot-password-dialog"
import { PopularityRankings } from "@/components/competition/popularity-rankings"
import { CompetitionDetailDialog } from "@/components/competition/competition-detail-dialog"
import { AwardDetailDialog } from "@/components/competition/award-detail-dialog"

import { LikeButton } from "@/components/like-button"

// AI applications data - empty for production
const aiApps: any[] = []

// Pagination component
interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const getVisiblePages = () => {
    const delta = 2
    const range = []
    const rangeWithDots = []

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i)
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, "...")
    } else {
      rangeWithDots.push(1)
    }

    rangeWithDots.push(...range)

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push("...", totalPages)
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages)
    }

    return rangeWithDots
  }

  const visiblePages = getVisiblePages()

  return (
    <div className="flex items-center justify-center space-x-2 mt-8">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3"
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>

      {visiblePages.map((page, index) => (
        <div key={index}>
          {page === "..." ? (
            <span className="px-3 py-2 text-gray-500">...</span>
          ) : (
            <Button
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              onClick={() => onPageChange(page as number)}
              className={`px-3 ${
                currentPage === page ? "bg-blue-600 text-white hover:bg-blue-700" : "hover:bg-gray-50"
              }`}
            >
              {page}
            </Button>
          )}
        </div>
      ))}

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3"
      >
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  )
}

export default function AIShowcasePlatform() {
  const {
    user,
    addToRecentApps,
    getAppLikes,
    incrementViewCount,
    getViewCount,
    getAppRating,
    canAccessAdmin,
  } = useAuth()
  
  const { competitions, awards, getAwardsByYear, getCompetitionRankings } = useCompetition()

  const [showLogin, setShowLogin] = useState(false)
  const [showRegister, setShowRegister] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState("all")
  const [selectedType, setSelectedType] = useState("all")
  const [showFavorites, setShowFavorites] = useState(false)
  const [selectedApp, setSelectedApp] = useState<any>(null)
  const [showAppDetail, setShowAppDetail] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [showCompetition, setShowCompetition] = useState(false)
  const appsPerPage = 6

  // Competition page states
  const [selectedCompetitionTypeFilter, setSelectedCompetitionTypeFilter] = useState("all")
  const [selectedMonthFilter, setSelectedMonthFilter] = useState("all")
  const [selectedAwardCategory, setSelectedAwardCategory] = useState("all")
  const [selectedYear, setSelectedYear] = useState(2024)
  const [searchQuery, setSearchQuery] = useState("")
  const [showCompetitionDetail, setShowCompetitionDetail] = useState(false)
  const [selectedRanking, setSelectedRanking] = useState<any>(null)
  const [selectedCompetitionType, setSelectedCompetitionType] = useState<"individual" | "team" | "proposal">(
    "individual",
  )
  const [showAwardDetail, setShowAwardDetail] = useState(false)
  const [selectedAward, setSelectedAward] = useState<any>(null)

  const filteredApps = aiApps.filter((app) => {
    const matchesSearch =
      app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDepartment = selectedDepartment === "all" || app.department === selectedDepartment
    const matchesType = selectedType === "all" || app.type === selectedType

    return matchesSearch && matchesDepartment && matchesType
  })

  // Pagination logic
  const totalPages = Math.ceil(filteredApps.length / appsPerPage)
  const startIndex = (currentPage - 1) * appsPerPage
  const endIndex = startIndex + appsPerPage
  const currentApps = filteredApps.slice(startIndex, endIndex)

  // Reset to first page when filters change
  const handleFilterChange = (filterType: string, value: string) => {
    setCurrentPage(1)
    if (filterType === "department") {
      setSelectedDepartment(value)
    } else if (filterType === "type") {
      setSelectedType(value)
    }
  }

  const handleSearchChange = (value: string) => {
    setCurrentPage(1)
    setSearchTerm(value)
  }

  const getTypeColor = (type: string) => {
    const colors = {
      文字處理: "bg-blue-100 text-blue-800 border-blue-200",
      圖像生成: "bg-purple-100 text-purple-800 border-purple-200",
      語音辨識: "bg-green-100 text-green-800 border-green-200",
      推薦系統: "bg-orange-100 text-orange-800 border-orange-200",
      音樂生成: "bg-pink-100 text-pink-800 border-pink-200",
      程式開發: "bg-indigo-100 text-indigo-800 border-indigo-200",
      影像處理: "bg-cyan-100 text-cyan-800 border-cyan-200",
      對話系統: "bg-teal-100 text-teal-800 border-teal-200",
      數據分析: "bg-yellow-100 text-yellow-800 border-yellow-200",
      設計工具: "bg-rose-100 text-rose-800 border-rose-200",
      語音技術: "bg-emerald-100 text-emerald-800 border-emerald-200",
      教育工具: "bg-violet-100 text-violet-800 border-violet-200",
    }
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800 border-gray-200"
  }

  const handleOpenAppDetail = (app: any) => {
    setSelectedApp(app)
    setShowAppDetail(true)
  }

  const handleSwitchToForgotPassword = () => {
    setShowLogin(false)
    setShowForgotPassword(true)
  }

  const handleBackToLogin = () => {
    setShowForgotPassword(false)
    setShowLogin(true)
  }

  const handleTryApp = (appId: string) => {
    incrementViewCount(appId)
    addToRecentApps(appId)
    console.log(`Opening app ${appId}`)
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

  const handleShowCompetitionDetail = (ranking: any, type: "individual" | "team" | "proposal") => {
    setSelectedRanking(ranking)
    setSelectedCompetitionType(type)
    setShowCompetitionDetail(true)
  }

  const handleShowAwardDetail = (award: any) => {
    setSelectedAward(award)
    setShowAwardDetail(true)
  }

  const getFilteredAwards = () => {
    let filteredAwards = getAwardsByYear(selectedYear)

    // 搜索功能 - 按应用名称、创作者或奖项名称搜索
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      filteredAwards = filteredAwards.filter((award) => {
        return (
          award.appName?.toLowerCase().includes(query) ||
          award.creator?.toLowerCase().includes(query) ||
          award.awardName?.toLowerCase().includes(query)
        )
      })
    }

    if (selectedCompetitionTypeFilter !== "all") {
      filteredAwards = filteredAwards.filter((award) => award.competitionType === selectedCompetitionTypeFilter)
    }

    if (selectedMonthFilter !== "all") {
      filteredAwards = filteredAwards.filter((award) => award.month === Number.parseInt(selectedMonthFilter))
    }

    if (selectedAwardCategory !== "all") {
      if (selectedAwardCategory === "ranking") {
        filteredAwards = filteredAwards.filter((award) => award.rank > 0 && award.rank <= 3)
      } else if (selectedAwardCategory === "popular") {
        filteredAwards = filteredAwards.filter((award) => award.awardType === "popular")
      } else {
        filteredAwards = filteredAwards.filter((award) => award.category === selectedAwardCategory)
      }
    }

    return filteredAwards.sort((a, b) => {
      // Sort by month first, then by rank
      if (a.month !== b.month) return b.month - a.month
      if (a.rank !== b.rank) {
        if (a.rank === 0) return 1
        if (b.rank === 0) return -1
        return a.rank - b.rank
      }
      return 0
    })
  }

  const filteredAwards = getFilteredAwards()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setShowCompetition(false)}>
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">強茂集團 AI 展示平台</h1>
                  <p className="text-xs text-gray-500">PANJIT SEMICONDUCTOR AI SHOWCASE</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Competition Link */}
              <Button
                variant={showCompetition ? "default" : "ghost"}
                size="sm"
                onClick={() => setShowCompetition(!showCompetition)}
                className={`${
                  showCompetition 
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700" 
                    : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                }`}
              >
                <Trophy className="w-4 h-4 mr-2" />
                競賽專區
              </Button>

              {user ? (
                <>
                  <Button variant="ghost" size="sm" onClick={() => setShowFavorites(true)}>
                    <Heart className="w-4 h-4 mr-2" />
                    我的收藏
                  </Button>
                  <UserMenu />
                </>
              ) : (
                <>
                  <Button variant="ghost" size="sm" onClick={() => setShowLogin(true)}>
                    登入
                  </Button>
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    onClick={() => setShowRegister(true)}
                  >
                    註冊
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
              </header>

        <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showCompetition ? (
          // Competition Content
          <>
            {/* Hero Section */}
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">AI 創新競賽</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                展示最優秀的 AI 應用作品，見證創新技術的競技與榮耀
              </p>
            </div>

            <Tabs defaultValue="rankings" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="rankings" className="flex items-center space-x-2">
                  <Trophy className="w-4 h-4" />
                  <span>競賽排行</span>
                </TabsTrigger>
                <TabsTrigger value="awards" className="flex items-center space-x-2">
                  <Award className="w-4 h-4" />
                  <span>得獎作品</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="rankings">
                <PopularityRankings />
              </TabsContent>

              <TabsContent value="awards">
                <div className="space-y-8">
                  {/* Enhanced Filter Section */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center space-x-2">
                          <Medal className="w-5 h-5 text-purple-500" />
                          <span>得獎作品展示</span>
                        </CardTitle>
                        <div className="flex items-center space-x-3">
                          <Select
                            value={selectedYear.toString()}
                            onValueChange={(value) => setSelectedYear(Number.parseInt(value))}
                          >
                            <SelectTrigger className="w-24">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="2024">2024年</SelectItem>
                              <SelectItem value="2023">2023年</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <p className="text-gray-600">展示 {selectedYear} 年度各項競賽的得獎作品</p>
                          {searchQuery && (
                            <div className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                              搜尋關鍵字：「{searchQuery}」
                            </div>
                          )}
                        </div>

                        {/* Search and Filter Controls */}
                        <div className="space-y-4">
                          {/* Search Bar */}
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Search className="h-4 w-4 text-gray-400" />
                            </div>
                            <Input
                              type="text"
                              placeholder="搜尋應用名稱、創作者或獎項名稱..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="pl-10 pr-10 w-full md:w-96"
                            />
                            {searchQuery && (
                              <button
                                onClick={() => setSearchQuery("")}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            )}
                          </div>

                          {/* Filter Controls */}
                          <div className="flex flex-wrap gap-4 items-center">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-gray-700">競賽類型：</span>
                              <Select value={selectedCompetitionTypeFilter} onValueChange={setSelectedCompetitionTypeFilter}>
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="all">全部類型</SelectItem>
                                  <SelectItem value="individual">個人賽</SelectItem>
                                  <SelectItem value="team">團隊賽</SelectItem>
                                  <SelectItem value="proposal">提案賽</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-700">月份：</span>
                            <Select value={selectedMonthFilter} onValueChange={setSelectedMonthFilter}>
                              <SelectTrigger className="w-24">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">全部</SelectItem>
                                <SelectItem value="1">1月</SelectItem>
                                <SelectItem value="2">2月</SelectItem>
                                <SelectItem value="3">3月</SelectItem>
                                <SelectItem value="4">4月</SelectItem>
                                <SelectItem value="5">5月</SelectItem>
                                <SelectItem value="6">6月</SelectItem>
                                <SelectItem value="7">7月</SelectItem>
                                <SelectItem value="8">8月</SelectItem>
                                <SelectItem value="9">9月</SelectItem>
                                <SelectItem value="10">10月</SelectItem>
                                <SelectItem value="11">11月</SelectItem>
                                <SelectItem value="12">12月</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-700">獎項類型：</span>
                            <Select value={selectedAwardCategory} onValueChange={setSelectedAwardCategory}>
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">全部獎項</SelectItem>
                                <SelectItem value="ranking">前三名</SelectItem>
                                <SelectItem value="popular">人氣獎</SelectItem>
                                <SelectItem value="innovation">創新類</SelectItem>
                                <SelectItem value="technical">技術類</SelectItem>
                                <SelectItem value="practical">實用類</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Clear Filters Button */}
                          {(searchQuery || selectedCompetitionTypeFilter !== "all" || selectedMonthFilter !== "all" || selectedAwardCategory !== "all") && (
                            <div className="flex items-center">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSearchQuery("")
                                  setSelectedCompetitionTypeFilter("all")
                                  setSelectedMonthFilter("all")
                                  setSelectedAwardCategory("all")
                                }}
                                className="text-gray-600 hover:text-gray-800"
                              >
                                <X className="w-4 h-4 mr-1" />
                                清除所有篩選
                              </Button>
                            </div>
                          )}
                        </div>
                        </div>

                        {/* Statistics */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                          <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <div className="text-lg font-bold text-blue-600">{filteredAwards.length}</div>
                            <div className="text-xs text-blue-600">總獎項數</div>
                          </div>
                          <div className="text-center p-3 bg-yellow-50 rounded-lg">
                            <div className="text-lg font-bold text-yellow-600">
                              {filteredAwards.filter((a) => a.rank > 0 && a.rank <= 3).length}
                            </div>
                            <div className="text-xs text-yellow-600">前三名獎項</div>
                          </div>
                          <div className="text-center p-3 bg-red-50 rounded-lg">
                            <div className="text-lg font-bold text-red-600">
                              {filteredAwards.filter((a) => a.awardType === "popular").length}
                            </div>
                            <div className="text-xs text-red-600">人氣獎項</div>
                          </div>
                          <div className="text-center p-3 bg-green-50 rounded-lg">
                            <div className="text-lg font-bold text-green-600">
                              {new Set(filteredAwards.map((a) => `${a.year}-${a.month}`)).size}
                            </div>
                            <div className="text-xs text-green-600">競賽場次</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Awards Grid with Enhanced Display */}
                  {filteredAwards.length > 0 ? (
                    <div className="space-y-8">
                      {/* Group awards by month */}
                      {Array.from(new Set(filteredAwards.map((award) => award.month)))
                        .sort((a, b) => b - a)
                        .map((month) => {
                          const monthAwards = filteredAwards.filter((award) => award.month === month)
                          const competition = competitions.find((c) => c.month === month && c.year === selectedYear)

                          return (
                            <div key={month} className="space-y-4">
                              <div className="flex items-center space-x-4">
                                <h3 className="text-xl font-bold text-gray-900">
                                  {selectedYear}年{month}月競賽得獎作品
                                </h3>
                                {competition && (
                                  <Badge variant="outline" className={getCompetitionTypeColor(competition.type)}>
                                    {getCompetitionTypeIcon(competition.type)}
                                    <span className="ml-1">{getCompetitionTypeText(competition.type)}</span>
                                  </Badge>
                                )}
                                <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                                  {monthAwards.length} 個獎項
                                </Badge>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {monthAwards.map((award) => (
                                  <Card
                                    key={award.id}
                                    className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 hover:shadow-xl transition-shadow cursor-pointer"
                                    onClick={() => handleShowAwardDetail(award)}
                                  >
                                    {/* Rank Badge */}
                                    {award.rank > 0 && award.rank <= 3 && (
                                      <div className="absolute top-2 left-2 z-10">
                                        <div
                                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                                            award.rank === 1
                                              ? "bg-yellow-500"
                                              : award.rank === 2
                                                ? "bg-gray-400"
                                                : award.rank === 3
                                                  ? "bg-orange-600"
                                                  : ""
                                          }`}
                                        >
                                          {award.rank}
                                        </div>
                                      </div>
                                    )}

                                    <div className="absolute top-4 right-4 text-3xl">{award.icon}</div>

                                    <CardHeader className="pb-3 pt-12">
                                      <div className="space-y-2">
                                        <div className="flex flex-wrap gap-2">
                                          <Badge
                                            variant="secondary"
                                            className={`w-fit ${
                                              award.awardType === "popular"
                                                ? "bg-red-100 text-red-800 border-red-200"
                                                : award.rank === 1
                                                  ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                                                  : award.rank === 2
                                                    ? "bg-gray-100 text-gray-800 border-gray-200"
                                                    : award.rank === 3
                                                      ? "bg-orange-100 text-orange-800 border-orange-200"
                                                      : "bg-blue-100 text-blue-800 border-blue-200"
                                            }`}
                                          >
                                            {award.awardName}
                                          </Badge>
                                          <Badge
                                            variant="outline"
                                            className={getCompetitionTypeColor(award.competitionType)}
                                          >
                                            {getCompetitionTypeIcon(award.competitionType)}
                                            <span className="ml-1">{getCompetitionTypeText(award.competitionType)}</span>
                                          </Badge>
                                        </div>

                                        <CardTitle className="text-lg line-clamp-2">
                                          {award.appName || award.awardName}
                                        </CardTitle>
                                        <p className="text-sm text-gray-500">by {award.creator}</p>
                                        <div className="text-xs text-gray-400">
                                          {award.year}年{award.month}月
                                        </div>
                                      </div>
                                    </CardHeader>

                                    <CardContent className="pt-0">
                                      <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                          <span className="text-sm text-gray-600">
                                            {award.awardType === "popular"
                                              ? award.competitionType === "team"
                                                ? "人氣指數"
                                                : "收藏數"
                                              : "評審評分"}
                                          </span>
                                          <span className="font-bold text-lg text-gray-900">
                                            {award.awardType === "popular" && award.competitionType === "team"
                                              ? `${award.score}`
                                              : award.awardType === "popular"
                                                ? `${award.score}`
                                                : award.score}
                                          </span>
                                        </div>

                                        <Button
                                          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            handleShowAwardDetail(award)
                                          }}
                                        >
                                          查看得獎詳情
                                        </Button>
                                      </div>
                                    </CardContent>
                                  </Card>
                                ))}
                              </div>
                            </div>
                          )
                        })}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="text-center py-12">
                        <div className="space-y-4">
                          {searchQuery ? (
                            <Search className="w-16 h-16 text-gray-400 mx-auto" />
                          ) : (
                            <Medal className="w-16 h-16 text-gray-400 mx-auto" />
                          )}
                          <div>
                            <h3 className="text-xl font-semibold text-gray-600 mb-2">
                              {searchQuery ? (
                                <>找不到包含「{searchQuery}」的得獎作品</>
                              ) : (
                                <>
                                  {selectedYear}年{selectedMonthFilter !== "all" ? `${selectedMonthFilter}月` : ""}
                                  暫無符合條件的得獎作品
                                </>
                              )}
                            </h3>
                            <p className="text-gray-500">
                              {searchQuery
                                ? "嘗試使用其他關鍵字或調整篩選條件"
                                : "請調整篩選條件查看其他得獎作品"}
                            </p>
                          </div>
                          <div className="flex justify-center gap-2">
                            <Button
                              variant="outline"
                              className="bg-transparent"
                              onClick={() => {
                                setSearchQuery("")
                                setSelectedCompetitionTypeFilter("all")
                                setSelectedMonthFilter("all")
                                setSelectedAwardCategory("all")
                              }}
                            >
                              <X className="w-4 h-4 mr-1" />
                              清除所有篩選
                            </Button>
                            {searchQuery && (
                              <Button
                                variant="outline"
                                className="bg-transparent"
                                onClick={() => setSearchQuery("")}
                              >
                                清除搜尋
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            {/* Competition Detail Dialog */}
            {selectedRanking && (
              <CompetitionDetailDialog
                open={showCompetitionDetail}
                onOpenChange={setShowCompetitionDetail}
                ranking={selectedRanking}
                competitionType={selectedCompetitionType}
              />
            )}

            {/* Award Detail Dialog */}
            {selectedAward && (
              <AwardDetailDialog open={showAwardDetail} onOpenChange={setShowAwardDetail} award={selectedAward} />
            )}
          </>
        ) : (
          // Main Content
          <>
            {/* Hero Section */}
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">探索 AI 的無限可能</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                發現、體驗和分享最前沿的人工智能應用，讓創新科技為您的工作和生活帶來全新體驗
              </p>
            </div>

            {/* Search and Filter Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
              <div className="flex flex-col lg:flex-row gap-4 items-center">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="搜尋 AI 應用..."
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-3">
                  <Select value={selectedDepartment} onValueChange={(value) => handleFilterChange("department", value)}>
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

                  <Select value={selectedType} onValueChange={(value) => handleFilterChange("type", value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="類型" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部類型</SelectItem>
                      <SelectItem value="文字處理">文字處理</SelectItem>
                      <SelectItem value="圖像生成">圖像生成</SelectItem>
                      <SelectItem value="語音辨識">語音辨識</SelectItem>
                      <SelectItem value="推薦系統">推薦系統</SelectItem>
                      <SelectItem value="音樂生成">音樂生成</SelectItem>
                      <SelectItem value="程式開發">程式開發</SelectItem>
                      <SelectItem value="影像處理">影像處理</SelectItem>
                      <SelectItem value="對話系統">對話系統</SelectItem>
                      <SelectItem value="數據分析">數據分析</SelectItem>
                      <SelectItem value="設計工具">設計工具</SelectItem>
                      <SelectItem value="語音技術">語音技術</SelectItem>
                      <SelectItem value="教育工具">教育工具</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Results summary */}
              <div className="mt-4 text-sm text-gray-600">
                找到 {filteredApps.length} 個應用，第 {currentPage} 頁，共 {totalPages} 頁
              </div>
            </div>

            {/* All Apps with Pagination */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">所有應用 ({filteredApps.length})</h3>

              {currentApps.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {currentApps.map((app) => {
                      const IconComponent = app.icon
                      const likes = getAppLikes(app.id.toString())
                      const views = getViewCount(app.id.toString())
                      const rating = getAppRating(app.id.toString())

                      return (
                        <Card key={app.id} className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md">
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                                  <IconComponent className="w-5 h-5 text-gray-600" />
                                </div>
                                <div>
                                  <CardTitle className="text-base group-hover:text-blue-600 transition-colors">
                                    {app.name}
                                  </CardTitle>
                                  <p className="text-xs text-gray-500">by {app.creator}</p>
                                </div>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <CardDescription className="text-gray-600 mb-4 line-clamp-2 text-sm">
                              {app.description}
                            </CardDescription>
                            <div className="flex flex-wrap gap-2 mb-4">
                              <Badge variant="outline" className={`${getTypeColor(app.type)} text-xs`}>
                                {app.type}
                              </Badge>
                              <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-200 text-xs">
                                {app.department}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3 text-xs text-gray-500">
                                <LikeButton appId={app.id.toString()} size="sm" />
                                <div className="flex items-center space-x-1">
                                  <Eye className="w-3 h-3" />
                                  <span>{views}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Star className="w-3 h-3 text-yellow-500" />
                                  <span>{rating.toFixed(1)}</span>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <FavoriteButton appId={app.id.toString()} />
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-xs bg-transparent"
                                  onClick={() => handleOpenAppDetail(app)}
                                >
                                  查看詳情
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <Search className="w-16 h-16 mx-auto" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">找不到符合條件的應用</h3>
                  <p className="text-gray-500">請嘗試調整搜尋條件或篩選器</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* App Detail Dialog */}
        {selectedApp && <AppDetailDialog open={showAppDetail} onOpenChange={setShowAppDetail} app={selectedApp} />}

        {/* Favorites Dialog */}
        <Dialog open={showFavorites} onOpenChange={setShowFavorites}>
          <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">我的收藏</DialogTitle>
              <DialogDescription>您收藏的 AI 應用</DialogDescription>
            </DialogHeader>
            <FavoritesPage />
          </DialogContent>
        </Dialog>

        {/* App Submission Dialog */}


        {/* Authentication Dialogs */}
        <LoginDialog
          open={showLogin}
          onOpenChange={setShowLogin}
          onSwitchToRegister={() => {
            setShowLogin(false)
            setShowRegister(true)
          }}
          onSwitchToForgotPassword={handleSwitchToForgotPassword}
        />
        <RegisterDialog
          open={showRegister}
          onOpenChange={setShowRegister}
        />
        <ForgotPasswordDialog
          open={showForgotPassword}
          onOpenChange={setShowForgotPassword}
          onBackToLogin={handleBackToLogin}
        />
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-gray-500 mb-4 md:mb-0">
              © 2025 強茂集團. 保留所有權利.
            </div>
            <div className="text-sm text-gray-500">
              <span className="font-medium">聯絡我們：</span>
              <span>強茂應用系統部</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
