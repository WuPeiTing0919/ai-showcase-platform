"use client"

import { useState } from "react"
import { useCompetition } from "@/contexts/competition-context"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Slider } from "@/components/ui/slider"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Star, User, Award, MessageSquare, CheckCircle } from "lucide-react"

interface JudgeScoringDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  appId: string
  appName: string
  judgeId: string
}

export function JudgeScoringDialog({ open, onOpenChange, appId, appName, judgeId }: JudgeScoringDialogProps) {
  const { judges, submitJudgeScore, getAppJudgeScores } = useCompetition()

  const judge = judges.find((j) => j.id === judgeId)
  const existingScore = getAppJudgeScores(appId).find((s) => s.judgeId === judgeId)

  const [scores, setScores] = useState({
    innovation: existingScore?.scores.innovation || 8,
    technical: existingScore?.scores.technical || 8,
    usability: existingScore?.scores.usability || 8,
    presentation: existingScore?.scores.presentation || 8,
    impact: existingScore?.scores.impact || 8,
  })

  const [comments, setComments] = useState(existingScore?.comments || "")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  if (!judge) return null

  const handleScoreChange = (category: keyof typeof scores, value: number[]) => {
    setScores((prev) => ({
      ...prev,
      [category]: value[0],
    }))
  }

  const handleSubmit = async () => {
    if (!comments.trim()) {
      return
    }

    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    submitJudgeScore({
      judgeId,
      appId,
      scores,
      comments: comments.trim(),
    })

    setIsSubmitting(false)
    setIsSubmitted(true)

    // Auto close after success
    setTimeout(() => {
      setIsSubmitted(false)
      onOpenChange(false)
    }, 2000)
  }

  const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0)
  const averageScore = (totalScore / 5).toFixed(1)

  const scoreCategories = [
    {
      key: "innovation" as const,
      name: "創新性",
      description: "技術創新程度和獨特性",
      icon: "💡",
    },
    {
      key: "technical" as const,
      name: "技術性",
      description: "技術實現難度和完成度",
      icon: "⚙️",
    },
    {
      key: "usability" as const,
      name: "實用性",
      description: "實際應用價值和用戶體驗",
      icon: "🎯",
    },
    {
      key: "presentation" as const,
      name: "展示效果",
      description: "介面設計和展示完整性",
      icon: "🎨",
    },
    {
      key: "impact" as const,
      name: "影響力",
      description: "對業務和用戶的潛在影響",
      icon: "🚀",
    },
  ]

  if (isSubmitted) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center space-y-4 py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">評分提交成功！</h3>
              <p className="text-gray-600">您對「{appName}」的評分已成功提交</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-purple-600" />
            <span>評審評分</span>
          </DialogTitle>
          <DialogDescription>為「{appName}」進行專業評分</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Judge Info */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src={judge.avatar || "/placeholder.svg"} />
                  <AvatarFallback className="bg-purple-100 text-purple-700">{judge.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-semibold">{judge.name}</h4>
                  <p className="text-sm text-gray-600">{judge.title}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {judge.expertise.map((skill) => (
                      <Badge key={skill} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Scoring Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>評分項目</span>
                <div className="text-right">
                  <div className="text-2xl font-bold text-purple-600">{averageScore}</div>
                  <div className="text-sm text-gray-500">平均分數</div>
                </div>
              </CardTitle>
              <CardDescription>請根據各項目標準進行評分（1-10分）</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {scoreCategories.map((category) => (
                <div key={category.key} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{category.icon}</span>
                      <div>
                        <h4 className="font-medium">{category.name}</h4>
                        <p className="text-sm text-gray-600">{category.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-purple-600">{scores[category.key]}</div>
                      <div className="flex">
                        {[...Array(scores[category.key])].map((_, i) => (
                          <Star key={i} className="w-3 h-3 text-yellow-400 fill-current" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <Slider
                    value={[scores[category.key]]}
                    onValueChange={(value) => handleScoreChange(category.key, value)}
                    max={10}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>1分 (差)</span>
                    <span>5分 (普通)</span>
                    <span>10分 (優秀)</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Comments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="w-4 h-4" />
                <span>評審意見</span>
              </CardTitle>
              <CardDescription>請提供詳細的評審意見和建議</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="請分享您對此應用的專業評價、優點、改進建議等..."
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                rows={4}
                maxLength={1000}
              />
              <div className="text-xs text-gray-500 mt-2">{comments.length}/1000 字元</div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex space-x-3">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !comments.trim()}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {isSubmitting ? "提交中..." : existingScore ? "更新評分" : "提交評分"}
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              取消
            </Button>
          </div>

          {existingScore && (
            <Alert>
              <User className="h-4 w-4" />
              <AlertDescription>您已經為此應用評分過，提交將更新您的評分。</AlertDescription>
            </Alert>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
