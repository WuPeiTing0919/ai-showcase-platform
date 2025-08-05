"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CheckCircle, Edit, Loader2 } from "lucide-react"

export default function ScoringFormTestPage() {
  const [showScoringForm, setShowScoringForm] = useState(false)
  const [manualScoring, setManualScoring] = useState({
    judgeId: "judge1", 
    participantId: "app1", 
    scores: {
      "創新性": 0,
      "技術性": 0,
      "實用性": 0,
      "展示效果": 0,
      "影響力": 0
    }, 
    comments: ""
  })
  const [isLoading, setIsLoading] = useState(false)

  const scoringRules = [
    { name: "創新性", description: "技術創新程度和獨特性", weight: 25 },
    { name: "技術性", description: "技術實現的複雜度和穩定性", weight: 20 },
    { name: "實用性", description: "實際應用價值和用戶體驗", weight: 25 },
    { name: "展示效果", description: "演示效果和表達能力", weight: 15 },
    { name: "影響力", description: "對行業和社會的潛在影響", weight: 15 }
  ]

  const calculateTotalScore = (scores: Record<string, number>): number => {
    let totalScore = 0
    let totalWeight = 0
    
    scoringRules.forEach(rule => {
      const score = scores[rule.name] || 0
      const weight = rule.weight || 1
      totalScore += score * weight
      totalWeight += weight
    })
    
    return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0
  }

  const handleSubmitScore = async () => {
    setIsLoading(true)
    // 模擬提交
    setTimeout(() => {
      setIsLoading(false)
      setShowScoringForm(false)
    }, 2000)
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">評分表單測試</h1>
        <p className="text-gray-600">測試完整的評分表單功能</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>評分表單演示</CardTitle>
          <CardDescription>點擊按鈕查看完整的評分表單</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setShowScoringForm(true)} size="lg">
            <Edit className="w-5 h-5 mr-2" />
            開啟評分表單
          </Button>
        </CardContent>
      </Card>

      <Dialog open={showScoringForm} onOpenChange={setShowScoringForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Edit className="w-5 h-5" />
              <span>評分表單</span>
            </DialogTitle>
            <DialogDescription>
              為參賽者進行評分，請根據各項指標進行評分
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* 評分項目 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">評分項目</h3>
              {scoringRules.map((rule, index) => (
                <div key={index} className="space-y-4 p-6 border rounded-lg bg-white shadow-sm">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <Label className="text-lg font-semibold text-gray-900">{rule.name}</Label>
                      <p className="text-sm text-gray-600 mt-2 leading-relaxed">{rule.description}</p>
                      <p className="text-xs text-purple-600 mt-2 font-medium">權重：{rule.weight}%</p>
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
              ))}
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
                    {calculateTotalScore(manualScoring.scores)}
                  </span>
                  <span className="text-xl text-gray-500 font-medium">/ 10</span>
                </div>
              </div>
            </div>

            {/* 評審意見 */}
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
              onClick={() => setShowScoringForm(false)}
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
                  提交評分
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 