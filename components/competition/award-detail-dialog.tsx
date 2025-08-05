"use client"

import { useState } from "react"
import { useCompetition } from "@/contexts/competition-context"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import {
  Target,
  Users,
  Lightbulb,
  Trophy,
  Crown,
  Award,
  Camera,
  ImageIcon,
  ChevronLeft,
  ChevronRight,
  X,
  Star,
  MessageSquare,
  BarChart3,
  ExternalLink,
  Eye,
  Link,
  FileText,
} from "lucide-react"
import type { Award as AwardType } from "@/types/competition"

interface AwardDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  award: AwardType
}

// Judge scoring data - empty for production
const getJudgeScores = (awardId: string) => {
  return []
}

// App links and reports data - empty for production
const getAppData = (awardId: string) => {
  return {
    appUrl: "",
    demoUrl: "",
    githubUrl: "",
    reports: [],
  }
}


export function AwardDetailDialog({ open, onOpenChange, award }: AwardDetailDialogProps) {
  const { competitions, judges, getTeamById, getProposalById } = useCompetition()
  const [activeTab, setActiveTab] = useState("overview")
  const [showPhotoGallery, setShowPhotoGallery] = useState(false)
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)

  const competition = competitions.find((c) => c.id === award.competitionId)
  const judgeScores = getJudgeScores(award.id)
  const appData = getAppData(award.id)

  // Competition photos - empty for production
  const getCompetitionPhotos = () => {
    return []
  }

  const competitionPhotos = getCompetitionPhotos()

  const getCompetitionTypeIcon = (type: string) => {
    switch (type) {
      case "individual":
        return <Target className="w-4 h-4" />
      case "team":
        return <Users className="w-4 h-4" />
      case "proposal":
        return <Lightbulb className="w-4 h-4" />
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
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getFileIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "pdf":
        return <FileText className="w-5 h-5 text-red-500" />
      case "pptx":
      case "ppt":
        return <FileText className="w-5 h-5 text-orange-500" />
      case "docx":
      case "doc":
        return <FileText className="w-5 h-5 text-blue-500" />
      default:
        return <FileText className="w-5 h-5 text-gray-500" />
    }
  }

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % competitionPhotos.length)
  }

  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev - 1 + competitionPhotos.length) % competitionPhotos.length)
  }

  const handlePreview = (report: any) => {
    // Open preview in new window
    window.open(report.previewUrl, "_blank")
  }

  const renderAwardOverview = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <div className="text-6xl">{award.icon}</div>
            <div className="flex-1">
              <CardTitle className="text-2xl">{award.awardName}</CardTitle>
              <CardDescription className="text-lg">
                {award.appName || award.proposalTitle || award.teamName}
              </CardDescription>
              <div className="flex items-center space-x-4 mt-2">
                <Badge variant="outline" className={getCompetitionTypeColor(award.competitionType)}>
                  {getCompetitionTypeIcon(award.competitionType)}
                  <span className="ml-1">{getCompetitionTypeText(award.competitionType)}</span>
                </Badge>
                <Badge
                  variant="secondary"
                  className={`${
                    award.awardType === "gold"
                      ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                      : award.awardType === "silver"
                        ? "bg-gray-100 text-gray-800 border-gray-200"
                        : award.awardType === "bronze"
                          ? "bg-orange-100 text-orange-800 border-orange-200"
                          : "bg-red-100 text-red-800 border-red-200"
                  }`}
                >
                  {award.awardName}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6 mb-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {award.awardType === "popular" && award.competitionType === "team"
                  ? `${award.score}`
                  : award.awardType === "popular"
                    ? `${award.score}`
                    : award.score}
              </div>
              <div className="text-sm text-gray-500">
                {award.competitionType === "proposal"
                  ? "評審評分"
                  : award.awardType === "popular"
                    ? award.competitionType === "team"
                      ? "人氣指數"
                      : "收藏數"
                    : "評審評分"}
              </div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {award.year}年{award.month}月
              </div>
              <div className="text-sm text-gray-500">獲獎時間</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-1">{award.creator}</div>
              <div className="text-sm text-gray-500">
                {award.competitionType === "team"
                  ? "團隊"
                  : award.competitionType === "proposal"
                    ? "提案團隊"
                    : "創作者"}
              </div>
            </div>
          </div>

          {competition && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
                <Trophy className="w-5 h-5 mr-2" />
                競賽資訊
              </h4>
              <div className="text-blue-800">
                <p className="mb-2">
                  <strong>競賽名稱：</strong>
                  {competition.name}
                </p>
                <p className="mb-2">
                  <strong>競賽描述：</strong>
                  {competition.description}
                </p>
                <p>
                  <strong>競賽期間：</strong>
                  {competition.startDate} ~ {competition.endDate}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* App Links Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Link className="w-5 h-5 text-green-500" />
            <span>應用連結</span>
          </CardTitle>
          <CardDescription>相關應用和資源連結</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {appData.appUrl && (
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <ExternalLink className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-800">正式應用</p>
                    <p className="text-xs text-green-600">生產環境</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-green-300 text-green-700 hover:bg-green-100 bg-transparent"
                  onClick={() => window.open(appData.appUrl, "_blank")}
                >
                  訪問
                </Button>
              </div>
            )}

            {appData.demoUrl && (
              <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Eye className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-blue-800">演示版本</p>
                    <p className="text-xs text-blue-600">體驗環境</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-blue-300 text-blue-700 hover:bg-blue-100 bg-transparent"
                  onClick={() => window.open(appData.demoUrl, "_blank")}
                >
                  體驗
                </Button>
              </div>
            )}

            {appData.githubUrl && (
              <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="font-medium text-gray-800">源碼倉庫</p>
                    <p className="text-xs text-gray-600">GitHub</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:bg-gray-100 bg-transparent"
                  onClick={() => window.open(appData.githubUrl, "_blank")}
                >
                  查看
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Reports Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-purple-500" />
            <span>相關報告</span>
          </CardTitle>
          <CardDescription>技術文檔和報告資料（僅供預覽）</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {appData.reports.map((report) => (
              <div
                key={report.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  {getFileIcon(report.type)}
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{report.name}</h4>
                    <p className="text-sm text-gray-600">{report.description}</p>
                    <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                      <span>大小：{report.size}</span>
                      <span>上傳：{report.uploadDate}</span>
                      <span className="uppercase">{report.type}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handlePreview(report)}
                    className="text-blue-600 border-blue-300 hover:bg-blue-50"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    預覽
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderCompetitionPhotos = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Camera className="w-5 h-5 text-purple-500" />
          <span>競賽照片</span>
        </CardTitle>
        <CardDescription>競賽當天的精彩瞬間</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {competitionPhotos.map((photo, index) => (
            <div
              key={index}
              className="relative group cursor-pointer overflow-hidden rounded-lg border hover:shadow-lg transition-all"
              onClick={() => {
                setCurrentPhotoIndex(index)
                setShowPhotoGallery(true)
              }}
            >
              <img
                src={photo.url || "/placeholder.svg"}
                alt={photo.title}
                className="w-full h-32 object-cover group-hover:scale-105 transition-transform"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                <ImageIcon className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2">
                <p className="text-white text-xs font-medium">{photo.title}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 text-center">
          <Button
            variant="outline"
            onClick={() => {
              setCurrentPhotoIndex(0)
              setShowPhotoGallery(true)
            }}
          >
            <Camera className="w-4 h-4 mr-2" />
            查看所有照片
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  const renderJudgePanel = () => {
    if (!competition) return null

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Crown className="w-5 h-5 text-purple-500" />
            <span>評審團</span>
          </CardTitle>
          <CardDescription>本次競賽的專業評審團隊</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {competition.judges.map((judgeId) => {
              const judge = judges.find((j) => j.id === judgeId)
              if (!judge) return null

              return (
                <div key={judge.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Avatar>
                    <AvatarImage src={judge.avatar || "/placeholder.svg?height=40&width=40"} />
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
              )
            })}
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderJudgeScores = () => (
    <div className="space-y-6">
      {/* Overall Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-blue-500" />
            <span>評分統計</span>
          </CardTitle>
          <CardDescription>評審團整體評分概況</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {(judgeScores.reduce((sum, score) => sum + score.overallScore, 0) / judgeScores.length).toFixed(1)}
              </div>
              <div className="text-sm text-blue-600">平均分數</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {Math.max(...judgeScores.map((s) => s.overallScore)).toFixed(1)}
              </div>
              <div className="text-sm text-green-600">最高分數</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {Math.min(...judgeScores.map((s) => s.overallScore)).toFixed(1)}
              </div>
              <div className="text-sm text-orange-600">最低分數</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{judgeScores.length}</div>
              <div className="text-sm text-purple-600">評審人數</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Individual Judge Scores */}
      {judgeScores.map((judgeScore, index) => (
        <Card key={judgeScore.judgeId}>
          <CardHeader>
            <div className="flex items-center space-x-4">
              <Avatar className="w-12 h-12">
                <AvatarImage src={judgeScore.judgeAvatar || "/placeholder.svg"} />
                <AvatarFallback className="bg-blue-100 text-blue-700">{judgeScore.judgeName[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <CardTitle className="text-lg">{judgeScore.judgeName}</CardTitle>
                <CardDescription>{judgeScore.judgeTitle}</CardDescription>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-1">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <span className="text-2xl font-bold text-gray-900">{judgeScore.overallScore}</span>
                  <span className="text-gray-500">/5.0</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">評分時間：{judgeScore.submittedAt}</div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Criteria Scores */}
            <div className="space-y-4 mb-6">
              <h4 className="font-semibold text-gray-900 flex items-center">
                <BarChart3 className="w-4 h-4 mr-2" />
                評分細項
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {judgeScore.criteria.map((criterion, criterionIndex) => (
                  <div key={criterionIndex} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">{criterion.name}</span>
                      <span className="text-sm text-gray-600">
                        {criterion.score}/{criterion.maxScore}
                      </span>
                    </div>
                    <Progress value={(criterion.score / criterion.maxScore) * 100} className="h-2" />
                  </div>
                ))}
              </div>
            </div>

            {/* Judge Comment */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900 flex items-center">
                <MessageSquare className="w-4 h-4 mr-2" />
                評審評語
              </h4>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-gray-700 leading-relaxed">{judgeScore.comment}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center space-x-2">
              <Award className="w-6 h-6 text-purple-500" />
              <span>得獎作品詳情</span>
            </DialogTitle>
            <DialogDescription>
              {competition?.name} - {award.awardName}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">獎項概覽</TabsTrigger>
                <TabsTrigger value="photos">競賽照片</TabsTrigger>
                <TabsTrigger value="judges">評審團</TabsTrigger>
                <TabsTrigger value="scores">評分詳情</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {renderAwardOverview()}
              </TabsContent>

              <TabsContent value="photos" className="space-y-6">
                {renderCompetitionPhotos()}
              </TabsContent>

              <TabsContent value="judges" className="space-y-6">
                {renderJudgePanel()}
              </TabsContent>

              <TabsContent value="scores" className="space-y-6">
                {renderJudgeScores()}
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>

      {/* Photo Gallery Modal */}
      <Dialog open={showPhotoGallery} onOpenChange={setShowPhotoGallery}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0">
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2 z-10 bg-black bg-opacity-50 text-white hover:bg-opacity-70"
              onClick={() => setShowPhotoGallery(false)}
            >
              <X className="w-4 h-4" />
            </Button>

            <div className="relative">
              <img
                src={competitionPhotos[currentPhotoIndex]?.url || "/placeholder.svg"}
                alt={competitionPhotos[currentPhotoIndex]?.title}
                className="w-full h-96 object-cover"
              />

              <Button
                variant="ghost"
                size="sm"
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white hover:bg-opacity-70"
                onClick={prevPhoto}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white hover:bg-opacity-70"
                onClick={nextPhoto}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>

              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                <h3 className="text-white text-lg font-semibold">{competitionPhotos[currentPhotoIndex]?.title}</h3>
                <p className="text-white text-sm opacity-90">{competitionPhotos[currentPhotoIndex]?.description}</p>
              </div>
            </div>

            <div className="p-4">
              <div className="flex items-center justify-center space-x-2">
                {competitionPhotos.map((_, index) => (
                  <button
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentPhotoIndex ? "bg-purple-600" : "bg-gray-300"
                    }`}
                    onClick={() => setCurrentPhotoIndex(index)}
                  />
                ))}
              </div>
              <div className="text-center text-sm text-gray-500 mt-2">
                {currentPhotoIndex + 1} / {competitionPhotos.length}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
