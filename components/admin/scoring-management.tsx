"use client"

import { useState, useEffect } from "react"
import { useCompetition } from "@/contexts/competition-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { ScoringLinkDialog } from "./scoring-link-dialog"
import { JudgeListDialog } from "./judge-list-dialog"
import {
  Trophy, Plus, Edit, CheckCircle, AlertTriangle, ClipboardList, User, Users, Search, Loader2, BarChart3, ChevronLeft, ChevronRight, Link
} from "lucide-react"

interface ScoringRecord {
  id: string
  judgeId: string
  judgeName: string
  participantId: string
  participantName: string
  participantType: "individual" | "team"
  scores: Record<string, number>
  totalScore: number
  comments: string
  submittedAt: string
  status: "completed" | "pending" | "draft"
}

const mockIndividualApps: any[] = []

const initialTeams: any[] = []

export function ScoringManagement() {
  const { competitions, judges, judgeScores, submitJudgeScore } = useCompetition()

  const [selectedCompetition, setSelectedCompetition] = useState<any>(null)
  const [scoringRecords, setScoringRecords] = useState<ScoringRecord[]>([])
  const [showManualScoring, setShowManualScoring] = useState(false)
  const [showEditScoring, setShowEditScoring] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<ScoringRecord | null>(null)
  const [manualScoring, setManualScoring] = useState({
    judgeId: "", participantId: "", scores: {} as Record<string, number>, comments: ""
  })
  const [statusFilter, setStatusFilter] = useState<"all" | "completed" | "pending">("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")
  const [showScoringLink, setShowScoringLink] = useState(false)
  const [showJudgeList, setShowJudgeList] = useState(false)


  useEffect(() => {
    if (selectedCompetition) {
      loadScoringData()
    }
  }, [selectedCompetition])





  const loadScoringData = () => {
    if (!selectedCompetition) return

    const participants = [
      ...(selectedCompetition.participatingApps || []).map((appId: string) => {
        const app = mockIndividualApps.find(a => a.id === appId)
        return { id: appId, name: app?.name || `應用 ${appId}`, type: "individual" as const }
      }),
      ...(selectedCompetition.participatingTeams || []).map((teamId: string) => {
        const team = initialTeams.find(t => t.id === teamId)
        return { id: teamId, name: team?.name || `團隊 ${teamId}`, type: "team" as const }
      })
    ]

    const records: ScoringRecord[] = []
    participants.forEach(participant => {
      selectedCompetition.judges.forEach((judgeId: string) => {
        const judge = judges.find(j => j.id === judgeId)
        if (!judge) return

        const existingScore = judgeScores.find(score => 
          score.judgeId === judgeId && score.appId === participant.id
        )

        if (existingScore) {
          records.push({
            id: `${judgeId}-${participant.id}`,
            judgeId, judgeName: judge.name,
            participantId: participant.id, participantName: participant.name,
            participantType: participant.type, scores: existingScore.scores,
            totalScore: calculateTotalScore(existingScore.scores, selectedCompetition.rules || []),
            comments: existingScore.comments,
            submittedAt: existingScore.submittedAt || new Date().toISOString(),
            status: "completed" as const,
          })
        } else {
          // 初始化評分項目
          const initialScores: Record<string, number> = {}
          if (selectedCompetition.rules && selectedCompetition.rules.length > 0) {
            selectedCompetition.rules.forEach((rule: any) => {
              initialScores[rule.name] = 0
            })
          } else {
            // 預設評分項目
            initialScores.innovation = 0
            initialScores.technical = 0
            initialScores.usability = 0
            initialScores.presentation = 0
            initialScores.impact = 0
          }
          
          records.push({
            id: `${judgeId}-${participant.id}`,
            judgeId, judgeName: judge.name,
            participantId: participant.id, participantName: participant.name,
            participantType: participant.type, scores: initialScores,
            totalScore: 0, comments: "", submittedAt: "",
            status: "pending" as const,
          })
        }
      })
    })
    
    setScoringRecords(records)
  }

  const calculateTotalScore = (scores: Record<string, number>, rules: any[]): number => {
    if (rules.length === 0) {
      const values = Object.values(scores)
      return values.length > 0 ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0
    }
    
    let totalScore = 0
    let totalWeight = 0
    
    rules.forEach((rule: any) => {
      const score = scores[rule.name] || 0
      const weight = rule.weight || 1
      totalScore += score * weight
      totalWeight += weight
    })
    
    return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0
  }

  const getFilteredRecords = () => {
    let filtered = [...scoringRecords]
    if (statusFilter !== "all") {
      filtered = filtered.filter(record => record.status === statusFilter)
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      filtered = filtered.filter(record => 
        record.judgeName.toLowerCase().includes(query) ||
        record.participantName.toLowerCase().includes(query)
      )
    }
    return filtered
  }

  const handleManualScoring = () => {
    // 根據競賽規則初始化評分項目
    const initialScores: Record<string, number> = {}
    if (selectedCompetition?.rules && selectedCompetition.rules.length > 0) {
      selectedCompetition.rules.forEach((rule: any) => {
        initialScores[rule.name] = 0
      })
    } else {
      // 預設評分項目
      initialScores.innovation = 0
      initialScores.technical = 0
      initialScores.usability = 0
      initialScores.presentation = 0
      initialScores.impact = 0
    }
    
    setManualScoring({ 
      judgeId: "", 
      participantId: "", 
      scores: initialScores, 
      comments: "" 
    })
    setShowManualScoring(true)
  }

  const handleEditScoring = (record: ScoringRecord) => {
    setSelectedRecord(record)
    setManualScoring({
      judgeId: record.judgeId,
      participantId: record.participantId,
      scores: { ...record.scores },
      comments: record.comments,
    })
    setShowEditScoring(true)
  }

  const handleSubmitScore = async () => {
    setError("")
    if (!manualScoring.judgeId || !manualScoring.participantId) {
      setError("請選擇評審和參賽項目")
      return
    }
    
    // 檢查所有評分項目是否都已評分
    const scoringRules = selectedCompetition?.rules || []
    const defaultRules = [
      { name: "創新性" }, { name: "技術性" }, { name: "實用性" }, 
      { name: "展示效果" }, { name: "影響力" }
    ]
    const rules = scoringRules.length > 0 ? scoringRules : defaultRules
    
    const hasAllScores = rules.every((rule: any) => 
      manualScoring.scores[rule.name] && manualScoring.scores[rule.name] > 0
    )
    
    if (!hasAllScores) {
      setError("請為所有評分項目打分")
      return
    }
    
    if (!manualScoring.comments.trim()) {
      setError("請填寫評審意見")
      return
    }

    setIsLoading(true)
    try {
      await submitJudgeScore({
        judgeId: manualScoring.judgeId,
        appId: manualScoring.participantId,
        scores: manualScoring.scores,
        comments: manualScoring.comments.trim(),
      })
      setSuccess(showEditScoring ? "評分更新成功！" : "評分提交成功！")
      loadScoringData()
      setShowManualScoring(false)
      setShowEditScoring(false)
      setSelectedRecord(null)
    } catch (err) {
      setError("評分提交失敗，請重試")
    } finally {
      setIsLoading(false)
      setTimeout(() => setSuccess(""), 3000)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed": return <Badge className="bg-green-100 text-green-800">已完成</Badge>
      case "pending": return <Badge className="bg-orange-100 text-orange-800">待評分</Badge>
      default: return <Badge variant="outline">{status}</Badge>
    }
  }

  const getScoringProgress = () => {
    const total = scoringRecords.length
    const completed = scoringRecords.filter(r => r.status === "completed").length
    const pending = scoringRecords.filter(r => r.status === "pending").length
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0
    return { total, completed, pending, percentage }
  }

  const progress = getScoringProgress()

  return (
    <div className="space-y-6">
      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="w-5 h-5" />
            <span>選擇競賽</span>
          </CardTitle>
          <CardDescription>選擇要管理的競賽評分</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedCompetition?.id || ""} onValueChange={(value) => {
            const competition = competitions.find(c => c.id === value)
            setSelectedCompetition(competition)
          }}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="選擇競賽" />
            </SelectTrigger>
            <SelectContent>
              {competitions.map((competition) => (
                <SelectItem key={competition.id} value={competition.id}>
                  <div className="flex flex-col">
                    <span className="font-medium">{competition.name}</span>
                    <span className="text-xs text-gray-500">
                      {competition.year}年{competition.month}月 • {competition.type === "individual" ? "個人賽" : competition.type === "team" ? "團體賽" : "混合賽"}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedCompetition && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5" />
                <span>{selectedCompetition.name} - 評分概覽</span>
                <Badge variant="outline">
                  {selectedCompetition.type === "individual" ? "個人賽" : selectedCompetition.type === "team" ? "團體賽" : "混合賽"}
                </Badge>
              </CardTitle>
              <CardDescription>查看當前競賽的評分進度和詳情</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">{progress.completed}</p>
                        <p className="text-sm text-gray-600">已完成評分</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-orange-600">{progress.pending}</p>
                        <p className="text-sm text-gray-600">待評分</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">{progress.percentage}%</p>
                        <p className="text-sm text-gray-600">完成度</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-purple-600">{progress.total}</p>
                        <p className="text-sm text-gray-600">總評分項目</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>評分進度</span>
                    <span>{progress.completed} / {progress.total}</span>
                  </div>
                  <Progress value={progress.percentage} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center space-x-2">
                  <ClipboardList className="w-5 h-5" />
                  <span>評分管理</span>
                </CardTitle>
                                 <div className="flex space-x-2">
                   <Button 
                     onClick={() => setShowScoringLink(true)}
                     variant="outline"
                     className="border-blue-200 text-blue-600 hover:bg-blue-50"
                   >
                     <Link className="w-4 h-4 mr-2" />
                     評審連結
                   </Button>
                   <Button 
                     onClick={() => setShowJudgeList(true)}
                     variant="outline"
                   >
                     <Users className="w-4 h-4 mr-2" />
                     評審清單
                   </Button>
                   <Button onClick={handleManualScoring} variant="outline">
                     <Plus className="w-4 h-4 mr-2" />
                     手動輸入評分
                   </Button>
                 </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mb-6">
                <div className="flex flex-wrap gap-4 items-center">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">狀態：</span>
                    <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">全部</SelectItem>
                        <SelectItem value="completed">已完成</SelectItem>
                        <SelectItem value="pending">待評分</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="搜尋評審或參賽者..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                                 {(() => {
                   // 按評審分組
                   const groupedByJudge = getFilteredRecords().reduce((groups, record) => {
                     const judgeName = record.judgeName
                     if (!groups[judgeName]) {
                       groups[judgeName] = []
                     }
                     groups[judgeName].push(record)
                     return groups
                   }, {} as Record<string, ScoringRecord[]>)

                   

                   return Object.entries(groupedByJudge).map(([judgeName, records]) => {
                    const completedCount = records.filter(r => r.status === "completed").length
                    const totalCount = records.length
                    const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

                    return (
                      <Card key={judgeName} className="border-l-4 border-l-blue-500">
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-3">
                              <Avatar className="w-10 h-10">
                                <AvatarFallback className="text-sm font-semibold">
                                  {judgeName.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h3 className="text-lg font-semibold">{judgeName}</h3>
                                <p className="text-sm text-gray-600">
                                  評分進度：{completedCount} / {totalCount} 項
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-4">
                              <div className="text-right">
                                <div className="text-2xl font-bold text-blue-600">{progressPercentage}%</div>
                                <div className="text-xs text-gray-500">完成度</div>
                              </div>
                              <div className="w-16 h-16 relative">
                                <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                                  <path
                                    className="text-gray-200"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    fill="none"
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                  />
                                  <path
                                    className="text-blue-600"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    fill="none"
                                    strokeDasharray={`${progressPercentage}, 100`}
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                  />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <span className="text-xs font-semibold">{progressPercentage}%</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                                                 <CardContent>
                           <div className="relative px-6">
                                                           {/* 左滑動箭頭 */}
                              {records.length > 4 && (
                                <button
                                  onClick={() => {
                                    const container = document.getElementById(`scroll-${judgeName}`)
                                    if (container) {
                                      container.scrollLeft -= 280 // 滑動一個卡片的寬度
                                    }
                                  }}
                                  className="absolute -left-6 top-1/2 transform -translate-y-1/2 z-10 bg-white border border-gray-300 rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-200 hover:bg-gray-50"
                                >
                                  <ChevronLeft className="w-4 h-4 text-gray-600" />
                                </button>
                              )}
                              
                              {/* 右滑動箭頭 */}
                              {records.length > 4 && (
                                <button
                                  onClick={() => {
                                    const container = document.getElementById(`scroll-${judgeName}`)
                                    if (container) {
                                      container.scrollLeft += 280 // 滑動一個卡片的寬度
                                    }
                                  }}
                                  className="absolute -right-6 top-1/2 transform -translate-y-1/2 z-10 bg-white border border-gray-300 rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-200 hover:bg-gray-50"
                                >
                                  <ChevronRight className="w-4 h-4 text-gray-600" />
                                </button>
                              )}
                             
                                                           <div 
                                id={`scroll-${judgeName}`}
                                className="flex space-x-4 overflow-x-auto scrollbar-hide pb-2 scroll-smooth"
                                style={{ 
                                  scrollbarWidth: 'none', 
                                  msOverflowStyle: 'none',
                                  maxWidth: 'calc(4 * 256px + 3 * 16px)' // 4個卡片 + 3個間距
                                }}
                              >
                                {records.map((record) => (
                                  <div
                                    key={record.id}
                                    className="flex-shrink-0 w-64 bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-200"
                                  >
                                   <div className="space-y-3">
                                     {/* 項目標題和類型 */}
                                     <div className="flex items-center justify-between">
                                       <div className="flex items-center space-x-2">
                                         {record.participantType === "individual" ? (
                                           <User className="w-4 h-4 text-blue-600" />
                                         ) : (
                                           <Users className="w-4 h-4 text-green-600" />
                                         )}
                                         <span className="font-medium text-sm truncate">{record.participantName}</span>
                                       </div>
                                       <Badge variant="outline" className="text-xs">
                                         {record.participantType === "individual" ? "個人" : "團隊"}
                                       </Badge>
                                     </div>
                                     
                                     {/* 評分狀態 */}
                                     <div className="flex items-center justify-between">
                                       <div className="text-center">
                                         <div className="flex items-center space-x-1">
                                           <span className="font-bold text-lg">{record.totalScore}</span>
                                           <span className="text-gray-500 text-sm">/ 10</span>
                                         </div>
                                       </div>
                                       <div className="flex flex-col items-end space-y-1">
                                         {getStatusBadge(record.status)}
                                         {record.submittedAt && (
                                           <span className="text-xs text-gray-500">
                                             {new Date(record.submittedAt).toLocaleDateString()}
                                           </span>
                                         )}
                                       </div>
                                     </div>
                                     
                                     {/* 操作按鈕 */}
                                     <div className="flex justify-center pt-2">
                                       <Button
                                         variant="outline"
                                         size="sm"
                                         onClick={() => handleEditScoring(record)}
                                         className="w-full"
                                       >
                                         {record.status === "completed" ? (
                                           <>
                                             <Edit className="w-4 h-4 mr-2" />
                                             編輯評分
                                           </>
                                         ) : (
                                           <>
                                             <Plus className="w-4 h-4 mr-2" />
                                             開始評分
                                           </>
                                         )}
                                       </Button>
                                     </div>
                                   </div>
                                 </div>
                               ))}
                             </div>
                             
                             
                           </div>
                         </CardContent>
                      </Card>
                    )
                  })
                })()}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      <Dialog open={showManualScoring || showEditScoring} onOpenChange={(open) => {
        if (!open) {
          setShowManualScoring(false)
          setShowEditScoring(false)
          setSelectedRecord(null)
          setManualScoring({ 
            judgeId: "", 
            participantId: "", 
            scores: {} as Record<string, number>, 
            comments: "" 
          })
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Edit className="w-5 h-5" />
              <span>{showEditScoring ? "編輯評分" : "手動輸入評分"}</span>
            </DialogTitle>
            <DialogDescription>
              {showEditScoring ? "修改現有評分記錄" : "為參賽者手動輸入評分"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>選擇評審 *</Label>
                <Select
                  value={manualScoring.judgeId}
                  onValueChange={(value) => setManualScoring({ ...manualScoring, judgeId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="選擇評審" />
                  </SelectTrigger>
                  <SelectContent>
                    {judges.map((judge) => (
                      <SelectItem key={judge.id} value={judge.id}>
                        {judge.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>選擇參賽者 *</Label>
                <Select
                  value={manualScoring.participantId}
                  onValueChange={(value) => setManualScoring({ ...manualScoring, participantId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="選擇參賽者" />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      ...(selectedCompetition?.participatingApps || []).map((appId: string) => {
                        const app = mockIndividualApps.find(a => a.id === appId)
                        return { id: appId, name: app?.name || `應用 ${appId}`, type: "individual" }
                      }),
                      ...(selectedCompetition?.participatingTeams || []).map((teamId: string) => {
                        const team = initialTeams.find(t => t.id === teamId)
                        return { id: teamId, name: team?.name || `團隊 ${teamId}`, type: "team" }
                      })
                    ].map((participant) => (
                      <SelectItem key={participant.id} value={participant.id}>
                        <div className="flex items-center space-x-2">
                          {participant.type === "individual" ? (
                            <User className="w-4 h-4 text-blue-600" />
                          ) : (
                            <Users className="w-4 h-4 text-green-600" />
                          )}
                          <span>{participant.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {participant.type === "individual" ? "個人" : "團隊"}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 動態評分項目 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">評分項目</h3>
              {(() => {
                const scoringRules = selectedCompetition?.rules || []
                const defaultRules = [
                  { name: "創新性", description: "創新程度和獨特性", weight: 25 },
                  { name: "技術性", description: "技術實現的複雜度和品質", weight: 30 },
                  { name: "實用性", description: "實際應用價值和用戶體驗", weight: 20 },
                  { name: "展示效果", description: "展示的清晰度和吸引力", weight: 15 },
                  { name: "影響力", description: "對行業或社會的潛在影響", weight: 10 }
                ]
                
                const rules = scoringRules.length > 0 ? scoringRules : defaultRules
                
                return rules.map((rule: any, index: number) => (
                  <div key={index} className="space-y-4 p-6 border rounded-lg bg-white shadow-sm">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <Label className="text-lg font-semibold text-gray-900">{rule.name}</Label>
                        <p className="text-sm text-gray-600 mt-2 leading-relaxed">{rule.description}</p>
                        {rule.weight && (
                          <p className="text-xs text-purple-600 mt-2 font-medium">權重：{rule.weight}%</p>
                        )}
                      </div>
                      <div className="text-right ml-4">
                        <span className="text-2xl font-bold text-blue-600">
                          {manualScoring.scores[rule.name] || 0} / 10
                        </span>
                      </div>
                    </div>
                    
                    {/* 評分按鈕 */}
                    <div className="flex flex-wrap gap-3">
                      {Array.from({ length: 10 }, (_, i) => i + 1).map((score) => (
                        <button
                          key={score}
                          type="button"
                          onClick={() => setManualScoring({
                            ...manualScoring,
                            scores: { ...manualScoring.scores, [rule.name]: score }
                          })}
                          className={`w-12 h-12 rounded-lg border-2 font-semibold text-lg transition-all duration-200 ${
                            (manualScoring.scores[rule.name] || 0) === score
                              ? 'bg-blue-600 text-white border-blue-600 shadow-lg scale-105'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50 hover:scale-105'
                          }`}
                        >
                          {score}
                        </button>
                      ))}
                    </div>
                  </div>
                ))
              })()}
            </div>

            {/* 總分顯示 */}
            <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-xl font-bold text-gray-900">總分</span>
                  <p className="text-sm text-gray-600 mt-1">根據權重計算的綜合評分</p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-4xl font-bold text-blue-600">
                    {calculateTotalScore(manualScoring.scores, selectedCompetition?.rules || [])}
                  </span>
                  <span className="text-xl text-gray-500 font-medium">/ 10</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-lg font-semibold">評審意見 *</Label>
              <Textarea
                placeholder="請詳細填寫評審意見、優點分析、改進建議等..."
                value={manualScoring.comments}
                onChange={(e) => setManualScoring({ ...manualScoring, comments: e.target.value })}
                rows={6}
                className="min-h-[120px] resize-none"
              />
              <p className="text-xs text-gray-500">請提供具體的評審意見，包括項目的優點、不足之處和改進建議</p>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => {
                setShowManualScoring(false)
                setShowEditScoring(false)
                setSelectedRecord(null)
              }}
              className="px-8"
            >
              取消
            </Button>
            <Button 
              onClick={handleSubmitScore}
              disabled={isLoading}
              size="lg"
              className="px-8 bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  提交中...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  {showEditScoring ? "更新評分" : "提交評分"}
                </>
              )}
            </Button>
          </div>
                 </DialogContent>
       </Dialog>

       {/* 評分連結對話框 */}
       <ScoringLinkDialog
         open={showScoringLink}
         onOpenChange={setShowScoringLink}
         currentCompetition={selectedCompetition}
       />

       {/* 評審清單對話框 */}
       <JudgeListDialog
         open={showJudgeList}
         onOpenChange={setShowJudgeList}
         judges={selectedCompetition ? 
           judges
             .filter(judge => selectedCompetition.judges.includes(judge.id))
             .map(judge => ({
               id: judge.id,
               name: judge.name,
               specialty: "評審專家"
             })) : []
         }
       />
     </div>
   )
}  