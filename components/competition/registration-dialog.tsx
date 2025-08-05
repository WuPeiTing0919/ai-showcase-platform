"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useCompetition } from "@/contexts/competition-context"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ChevronLeft, ChevronRight, Trophy, Users, FileText, CheckCircle, Target, Award, Loader2 } from "lucide-react"

interface RegistrationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface RegistrationData {
  // 應用資訊
  appName: string
  appDescription: string
  appType: string
  techStack: string
  mainFeatures: string

  // 團隊資訊
  teamName: string
  teamSize: string
  contactName: string
  contactEmail: string
  contactPhone: string
  department: string

  // 參賽動機
  motivation: string
  expectedOutcome: string
  agreeTerms: boolean
}

export function RegistrationDialog({ open, onOpenChange }: RegistrationDialogProps) {
  const { user } = useAuth()
  const { currentCompetition } = useCompetition()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [applicationId, setApplicationId] = useState("")

  const [formData, setFormData] = useState<RegistrationData>({
    appName: "",
    appDescription: "",
    appType: "",
    techStack: "",
    mainFeatures: "",
    teamName: "",
    teamSize: "1",
    contactName: user?.name || "",
    contactEmail: user?.email || "",
    contactPhone: "",
    department: "",
    motivation: "",
    expectedOutcome: "",
    agreeTerms: false,
  })

  const totalSteps = 3
  const progress = (currentStep / totalSteps) * 100

  const handleInputChange = (field: keyof RegistrationData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.appName && formData.appDescription && formData.appType && formData.techStack)
      case 2:
        return !!(formData.teamName && formData.contactName && formData.contactEmail && formData.department)
      case 3:
        return !!(formData.motivation && formData.agreeTerms)
      default:
        return false
    }
  }

  const handleNext = () => {
    if (validateStep(currentStep) && currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const handleSubmit = async () => {
    if (!validateStep(3)) return

    setIsSubmitting(true)

    // 模擬提交過程
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // 生成申請編號
    const id = `REG${Date.now().toString().slice(-6)}`
    setApplicationId(id)
    setIsSubmitted(true)
    setIsSubmitting(false)
  }

  const handleClose = () => {
    if (isSubmitted) {
      // 重置表單
      setCurrentStep(1)
      setIsSubmitted(false)
      setApplicationId("")
      setFormData({
        appName: "",
        appDescription: "",
        appType: "",
        techStack: "",
        mainFeatures: "",
        teamName: "",
        teamSize: "1",
        contactName: user?.name || "",
        contactEmail: user?.email || "",
        contactPhone: "",
        department: "",
        motivation: "",
        expectedOutcome: "",
        agreeTerms: false,
      })
    }
    onOpenChange(false)
  }

  const renderStepContent = () => {
    if (isSubmitted) {
      return (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">報名成功！</h3>
          <p className="text-gray-600 mb-4">您的競賽報名已成功提交</p>
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600 mb-1">申請編號</p>
            <p className="text-lg font-mono font-semibold text-gray-900">{applicationId}</p>
          </div>
          <div className="text-sm text-gray-500 space-y-1">
            <p>• 我們將在 3-5 個工作日內審核您的申請</p>
            <p>• 審核結果將通過郵件通知您</p>
            <p>• 如有疑問，請聯繫管理員</p>
          </div>
        </div>
      )
    }

    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <FileText className="w-12 h-12 text-blue-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold">應用資訊</h3>
              <p className="text-sm text-gray-600">請填寫您要參賽的 AI 應用基本資訊</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="appName">應用名稱 *</Label>
                <Input
                  id="appName"
                  value={formData.appName}
                  onChange={(e) => handleInputChange("appName", e.target.value)}
                  placeholder="請輸入應用名稱"
                />
              </div>

              <div>
                <Label htmlFor="appDescription">應用描述 *</Label>
                <Textarea
                  id="appDescription"
                  value={formData.appDescription}
                  onChange={(e) => handleInputChange("appDescription", e.target.value)}
                  placeholder="請簡要描述您的應用功能和特色"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="appType">應用類型 *</Label>
                <Select value={formData.appType} onValueChange={(value) => handleInputChange("appType", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="選擇應用類型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="文字處理">文字處理</SelectItem>
                    <SelectItem value="圖像生成">圖像生成</SelectItem>
                    <SelectItem value="語音辨識">語音辨識</SelectItem>
                    <SelectItem value="推薦系統">推薦系統</SelectItem>
                    <SelectItem value="數據分析">數據分析</SelectItem>
                    <SelectItem value="自動化工具">自動化工具</SelectItem>
                    <SelectItem value="其他">其他</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="techStack">技術架構 *</Label>
                <Input
                  id="techStack"
                  value={formData.techStack}
                  onChange={(e) => handleInputChange("techStack", e.target.value)}
                  placeholder="例如：Python, TensorFlow, React, Node.js"
                />
              </div>

              <div>
                <Label htmlFor="mainFeatures">主要功能</Label>
                <Textarea
                  id="mainFeatures"
                  value={formData.mainFeatures}
                  onChange={(e) => handleInputChange("mainFeatures", e.target.value)}
                  placeholder="請列出應用的主要功能特色"
                  rows={2}
                />
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Users className="w-12 h-12 text-green-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold">團隊與聯絡資訊</h3>
              <p className="text-sm text-gray-600">請提供團隊資料和聯絡方式</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="teamName">團隊名稱 *</Label>
                <Input
                  id="teamName"
                  value={formData.teamName}
                  onChange={(e) => handleInputChange("teamName", e.target.value)}
                  placeholder="請輸入團隊名稱"
                />
              </div>

              <div>
                <Label htmlFor="teamSize">團隊人數</Label>
                <Select value={formData.teamSize} onValueChange={(value) => handleInputChange("teamSize", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 人</SelectItem>
                    <SelectItem value="2">2 人</SelectItem>
                    <SelectItem value="3">3 人</SelectItem>
                    <SelectItem value="4">4 人</SelectItem>
                    <SelectItem value="5+">5 人以上</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div>
                <Label htmlFor="contactName">聯絡人姓名 *</Label>
                <Input
                  id="contactName"
                  value={formData.contactName}
                  onChange={(e) => handleInputChange("contactName", e.target.value)}
                  placeholder="請輸入聯絡人姓名"
                />
              </div>

              <div>
                <Label htmlFor="contactEmail">聯絡人信箱 *</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => handleInputChange("contactEmail", e.target.value)}
                  placeholder="請輸入聯絡人信箱"
                />
              </div>

              <div>
                <Label htmlFor="contactPhone">聯絡電話</Label>
                <Input
                  id="contactPhone"
                  value={formData.contactPhone}
                  onChange={(e) => handleInputChange("contactPhone", e.target.value)}
                  placeholder="請輸入聯絡電話"
                />
              </div>

              <div>
                <Label htmlFor="department">所屬部門 *</Label>
                <Select value={formData.department} onValueChange={(value) => handleInputChange("department", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="選擇所屬部門" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HQBU">HQBU</SelectItem>
                    <SelectItem value="ITBU">ITBU</SelectItem>
                    <SelectItem value="MBU1">MBU1</SelectItem>
                    <SelectItem value="SBU">SBU</SelectItem>
                    <SelectItem value="其他">其他</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Target className="w-12 h-12 text-purple-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold">參賽動機與確認</h3>
              <p className="text-sm text-gray-600">最後一步，請確認參賽資訊</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="motivation">參賽動機 *</Label>
                <Textarea
                  id="motivation"
                  value={formData.motivation}
                  onChange={(e) => handleInputChange("motivation", e.target.value)}
                  placeholder="請分享您參加此次競賽的動機和期望"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="expectedOutcome">期望成果</Label>
                <Textarea
                  id="expectedOutcome"
                  value={formData.expectedOutcome}
                  onChange={(e) => handleInputChange("expectedOutcome", e.target.value)}
                  placeholder="您希望通過此次競賽達成什麼目標？"
                  rows={2}
                />
              </div>

              {/* 競賽資訊確認 */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center space-x-2">
                    <Trophy className="w-4 h-4 text-yellow-600" />
                    <span>競賽資訊確認</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">競賽名稱</span>
                    <span className="text-sm font-medium">{currentCompetition?.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">競賽時間</span>
                    <span className="text-sm font-medium">
                      {currentCompetition?.year}年{currentCompetition?.month}月
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">競賽狀態</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {currentCompetition?.status === "active" ? "進行中" : "即將開始"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* 條款同意 */}
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="agreeTerms"
                  checked={formData.agreeTerms}
                  onCheckedChange={(checked) => handleInputChange("agreeTerms", checked as boolean)}
                />
                <Label htmlFor="agreeTerms" className="text-sm leading-relaxed">
                  我已閱讀並同意競賽規則與條款，確認提交的資訊真實有效，並同意主辦方使用相關資料進行競賽管理和宣傳用途。
                </Label>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-yellow-600" />
            <span>競賽報名</span>
          </DialogTitle>
          <DialogDescription>{currentCompetition?.name}</DialogDescription>
        </DialogHeader>

        {!isSubmitted && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">
                步驟 {currentStep} / {totalSteps}
              </span>
              <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        <div className="min-h-[400px]">{renderStepContent()}</div>

        {!isSubmitted && (
          <div className="flex justify-between pt-6 border-t">
            <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 1}>
              <ChevronLeft className="w-4 h-4 mr-2" />
              上一步
            </Button>

            {currentStep < totalSteps ? (
              <Button onClick={handleNext} disabled={!validateStep(currentStep)}>
                下一步
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!validateStep(3) || isSubmitting}
                className="bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    提交中...
                  </>
                ) : (
                  <>
                    <Award className="w-4 h-4 mr-2" />
                    提交報名
                  </>
                )}
              </Button>
            )}
          </div>
        )}

        {isSubmitted && (
          <div className="flex justify-center pt-6 border-t">
            <Button onClick={handleClose} className="w-full">
              完成
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
