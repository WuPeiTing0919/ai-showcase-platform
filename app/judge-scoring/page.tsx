"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { AlertTriangle, CheckCircle, User, Trophy, LogIn, Loader2 } from "lucide-react"

interface Judge {
  id: string
  name: string
  specialty: string
}

interface ScoringItem {
  id: string
  name: string
  type: "individual" | "team"
  status: "pending" | "completed"
  score?: number
  submittedAt?: string
}

export default function JudgeScoringPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [judgeId, setJudgeId] = useState("")
  const [accessCode, setAccessCode] = useState("")
  const [currentJudge, setCurrentJudge] = useState<Judge | null>(null)
  const [scoringItems, setScoringItems] = useState<ScoringItem[]>([])
  const [selectedItem, setSelectedItem] = useState<ScoringItem | null>(null)
  const [showScoringDialog, setShowScoringDialog] = useState(false)
  const [scores, setScores] = useState<Record<string, number>>({})
  const [comments, setComments] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Judge data - empty for production
  const mockJudges: Judge[] = []

  // Scoring items - empty for production
  const mockScoringItems: ScoringItem[] = []

  const handleLogin = () => {
    setError("")
    
    if (!judgeId.trim() || !accessCode.trim()) {
      setError("請填寫評審ID和存取碼")
      return
    }

    if (accessCode !== "judge2024") {
      setError("存取碼錯誤")
      return
    }

    const judge = mockJudges.find(j => j.id === judgeId)
    if (!judge) {
      setError("評審ID不存在")
      return
    }

    setCurrentJudge(judge)
    setScoringItems(mockScoringItems)
    setIsLoggedIn(true)
    setSuccess("登入成功！")
    setTimeout(() => setSuccess(""), 3000)
  }

  const handleStartScoring = (item: ScoringItem) => {
    setSelectedItem(item)
    setScores({})
    setComments("")
    setShowScoringDialog(true)
  }

  const handleSubmitScore = async () => {
    if (!selectedItem) return

    setIsSubmitting(true)
    
    // 模擬提交評分
    setTimeout(() => {
      setScoringItems(prev => prev.map(item => 
        item.id === selectedItem.id 
          ? { ...item, status: "completed", score: Object.values(scores).reduce((a, b) => a + b, 0) / Object.values(scores).length, submittedAt: new Date().toISOString() }
          : item
      ))
      
      setShowScoringDialog(false)
      setSelectedItem(null)
      setScores({})
      setComments("")
      setIsSubmitting(false)
      setSuccess("評分提交成功！")
      setTimeout(() => setSuccess(""), 3000)
    }, 1000)
  }

  const getProgress = () => {
    const total = scoringItems.length
    const completed = scoringItems.filter(item => item.status === "completed").length
    return { total, completed, percentage: total > 0 ? Math.round((completed / total) * 100) : 0 }
  }

  const progress = getProgress()

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Trophy className="w-8 h-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">評審評分系統</CardTitle>
            <CardDescription>
              請輸入您的評審ID和存取碼進行登入
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="judgeId">評審ID</Label>
              <Input
                id="judgeId"
                placeholder="例如：j1"
                value={judgeId}
                onChange={(e) => setJudgeId(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="accessCode">存取碼</Label>
              <Input
                id="accessCode"
                type="password"
                placeholder="請輸入存取碼"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
              />
            </div>

            <Button 
              onClick={handleLogin}
              className="w-full"
              size="lg"
            >
              <LogIn className="w-4 h-4 mr-2" />
              登入評分系統
            </Button>

            <div className="text-center text-sm text-gray-500">
              <p>評審ID範例：j1, j2, j3, j4, j5</p>
              <p>存取碼：judge2024</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* 成功訊息 */}
        {success && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        {/* 評審資訊 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Avatar className="w-12 h-12">
                  <AvatarFallback className="text-lg font-semibold">
                    {currentJudge?.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-2xl font-bold">{currentJudge?.name}</h1>
                  <p className="text-gray-600">{currentJudge?.specialty}</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                onClick={() => setIsLoggedIn(false)}
              >
                登出
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* 評分進度 */}
        <Card>
          <CardHeader>
            <CardTitle>評分進度</CardTitle>
            <CardDescription>
              您的評分任務進度概覽
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>完成進度</span>
                <span>{progress.completed} / {progress.total}</span>
              </div>
              <Progress value={progress.percentage} className="h-2" />
              <div className="text-center">
                <span className="text-2xl font-bold text-blue-600">{progress.percentage}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 評分項目列表 */}
        <Card>
          <CardHeader>
            <CardTitle>評分項目</CardTitle>
            <CardDescription>
              請為以下項目進行評分
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {scoringItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {item.type === "individual" ? (
                        <User className="w-4 h-4 text-blue-600" />
                      ) : (
                        <div className="flex space-x-1">
                          <User className="w-4 h-4 text-green-600" />
                          <User className="w-4 h-4 text-green-600" />
                        </div>
                      )}
                      <span className="font-medium">{item.name}</span>
                      <Badge variant="outline">
                        {item.type === "individual" ? "個人" : "團隊"}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    {item.status === "completed" ? (
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">{item.score}</div>
                        <div className="text-xs text-gray-500">/ 10</div>
                        <div className="text-xs text-gray-500">{item.submittedAt}</div>
                      </div>
                    ) : (
                      <Button
                        onClick={() => handleStartScoring(item)}
                        variant="outline"
                        size="sm"
                      >
                        開始評分
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 評分對話框 */}
      <Dialog open={showScoringDialog} onOpenChange={setShowScoringDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>評分項目：{selectedItem?.name}</DialogTitle>
            <DialogDescription>
              請為此項目進行評分，滿分為10分
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* 評分項目 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">評分項目</h3>
              {[
                { name: "創新性", description: "創新程度和獨特性" },
                { name: "技術性", description: "技術實現的複雜度和品質" },
                { name: "實用性", description: "實際應用價值和用戶體驗" },
                { name: "展示效果", description: "展示的清晰度和吸引力" },
                { name: "影響力", description: "對行業或社會的潛在影響" }
              ].map((criterion, index) => (
                <div key={index} className="space-y-2">
                  <Label>{criterion.name}</Label>
                  <p className="text-sm text-gray-600">{criterion.description}</p>
                  <div className="flex space-x-2">
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((score) => (
                      <button
                        key={score}
                        type="button"
                        onClick={() => setScores(prev => ({ ...prev, [criterion.name]: score }))}
                        className={`w-10 h-10 rounded border-2 font-semibold transition-all ${
                          scores[criterion.name] === score
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                        }`}
                      >
                        {score}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* 評審意見 */}
            <div className="space-y-2">
              <Label>評審意見</Label>
              <Textarea
                placeholder="請詳細填寫評審意見、優點分析、改進建議等..."
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                rows={4}
              />
            </div>

            {/* 總分顯示 */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-semibold">總分</span>
                <span className="text-2xl font-bold text-blue-600">
                  {Object.values(scores).length > 0 
                    ? Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / Object.values(scores).length)
                    : 0
                  } / 10
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t">
            <Button
              variant="outline"
              onClick={() => setShowScoringDialog(false)}
            >
              取消
            </Button>
            <Button
              onClick={handleSubmitScore}
              disabled={isSubmitting || Object.keys(scores).length < 5 || !comments.trim()}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  提交中...
                </>
              ) : (
                "提交評分"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
