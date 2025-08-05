"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Upload,
  FileText,
  Link,
  CheckCircle,
  Clock,
  Info,
  Lightbulb,
  Target,
  Zap,
  AlertTriangle,
  FileVideo,
  X,
} from "lucide-react"

interface AppSubmissionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AppSubmissionDialog({ open, onOpenChange }: AppSubmissionDialogProps) {
  const { user, canSubmitApp } = useAuth()
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    type: "文字處理",
    description: "",
    appUrl: "",
    demoFile: null as File | null,
    sourceCodeUrl: "",
    documentation: "",
    features: "",
    technicalDetails: "",
    requestFeatured: false,
    agreeTerms: false,
  })

  // 檢查用戶權限
  if (!user || !canSubmitApp()) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <span>權限不足</span>
            </DialogTitle>
            <DialogDescription>您目前沒有提交應用的權限</DialogDescription>
          </DialogHeader>
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">需要開發者權限</h3>
            <p className="text-gray-600 mb-4">
              只有開發者角色可以提交 AI 應用申請。您目前是{user?.role === "admin" ? "管理員" : "一般用戶"}身份。
            </p>
            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <div className="flex items-start space-x-3">
                <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-left">
                  <p className="text-sm font-medium text-blue-900">如何獲得開發者權限？</p>
                  <ul className="text-sm text-blue-700 mt-1 space-y-1">
                    <li>• 聯繫管理員申請角色升級</li>
                    <li>• 說明您的開發背景和需求</li>
                    <li>• 等待管理員審核和調整</li>
                  </ul>
                </div>
              </div>
            </div>
            <Button onClick={() => onOpenChange(false)} className="w-full">
              我知道了
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  const handleInputChange = (field: string, value: string | boolean | File | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    handleInputChange("demoFile", file)
  }

  const removeFile = () => {
    handleInputChange("demoFile", null)
  }

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1)
    }
  }

  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleSubmit = async () => {
    if (!user) {
      console.error('用戶未登入')
      return
    }

    setIsSubmitting(true)

    try {
      // 準備應用程式資料
      const appData = {
        name: formData.name,
        description: formData.description,
        type: mapTypeToApiType(formData.type),
        demoUrl: formData.appUrl || undefined,
        githubUrl: formData.sourceCodeUrl || undefined,
        docsUrl: formData.documentation || undefined,
        techStack: formData.technicalDetails ? [formData.technicalDetails] : undefined,
        tags: formData.features ? [formData.features] : undefined,
        version: '1.0.0'
      }

      // 調用 API 創建應用程式
      const token = localStorage.getItem('token')
      const response = await fetch('/api/apps', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(appData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '創建應用程式失敗')
      }

      const result = await response.json()
      console.log('應用程式創建成功:', result)

      setIsSubmitting(false)
      setIsSubmitted(true)

      // 3秒後關閉對話框
      setTimeout(() => {
        onOpenChange(false)
        setIsSubmitted(false)
        setStep(1)
        setFormData({
          name: "",
          type: "文字處理",
          description: "",
          appUrl: "",
          demoFile: null,
          sourceCodeUrl: "",
          documentation: "",
          features: "",
          technicalDetails: "",
          requestFeatured: false,
          agreeTerms: false,
        })
      }, 3000)

    } catch (error) {
      console.error('創建應用程式失敗:', error)
      setIsSubmitting(false)
      // 這裡可以添加錯誤提示
      alert(`創建應用程式失敗: ${error instanceof Error ? error.message : '未知錯誤'}`)
    }
  }

  // 將前端類型映射到 API 類型
  const mapTypeToApiType = (frontendType: string): string => {
    const typeMap: Record<string, string> = {
      '文字處理': 'productivity',
      '圖像生成': 'ai_model',
      '圖像處理': 'ai_model',
      '語音辨識': 'ai_model',
      '推薦系統': 'ai_model',
      '音樂生成': 'ai_model',
      '程式開發': 'automation',
      '影像處理': 'ai_model',
      '對話系統': 'ai_model',
      '數據分析': 'data_analysis',
      '設計工具': 'productivity',
      '語音技術': 'ai_model',
      '教育工具': 'educational',
      '健康醫療': 'healthcare',
      '金融科技': 'finance',
      '物聯網': 'iot_device',
      '區塊鏈': 'blockchain',
      'AR/VR': 'ar_vr',
      '機器學習': 'machine_learning',
      '電腦視覺': 'computer_vision',
      '自然語言處理': 'nlp',
      '機器人': 'robotics',
      '網路安全': 'cybersecurity',
      '雲端服務': 'cloud_service',
      '其他': 'other'
    }
    return typeMap[frontendType] || 'other'
  }

  const isStep1Valid = formData.name && formData.description && formData.appUrl
  const isStep2Valid = formData.features
  const isStep3Valid = formData.agreeTerms

  if (isSubmitted) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">提交成功！</h3>
            <p className="text-gray-600 mb-4">您的應用申請已成功提交，我們將在 1-3 個工作日內完成審核。</p>
            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <div className="flex items-start space-x-3">
                <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-left">
                  <p className="text-sm font-medium text-blue-900">後續流程</p>
                  <ul className="text-sm text-blue-700 mt-1 space-y-1">
                    <li>• 管理員將審核您的應用</li>
                    <li>• 審核結果將透過電子郵件通知</li>
                    <li>• 通過審核後應用將上線展示</li>
                  </ul>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-500">此對話框將自動關閉...</p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Upload className="w-5 h-5 text-blue-600" />
            <span>提交 AI 應用申請</span>
          </DialogTitle>
          <DialogDescription>分享您的 AI 創新成果，讓更多人體驗您的應用</DialogDescription>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center space-x-4 mb-6">
          {[1, 2, 3].map((stepNumber) => (
            <div key={stepNumber} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= stepNumber ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                }`}
              >
                {stepNumber}
              </div>
              {stepNumber < 3 && (
                <div className={`w-12 h-0.5 mx-2 ${step > stepNumber ? "bg-blue-600" : "bg-gray-200"}`} />
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2">
            {step === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="w-5 h-5" />
                    <span>基本資訊</span>
                  </CardTitle>
                  <CardDescription>請填寫您的 AI 應用基本資訊</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">應用名稱 *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        placeholder="輸入您的應用名稱"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type">應用類型 *</Label>
                      <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="文字處理">文字處理</SelectItem>
                          <SelectItem value="圖像生成">圖像生成</SelectItem>
                          <SelectItem value="圖像處理">圖像處理</SelectItem>
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
                          <SelectItem value="健康醫療">健康醫療</SelectItem>
                          <SelectItem value="金融科技">金融科技</SelectItem>
                          <SelectItem value="物聯網">物聯網</SelectItem>
                          <SelectItem value="區塊鏈">區塊鏈</SelectItem>
                          <SelectItem value="AR/VR">AR/VR</SelectItem>
                          <SelectItem value="機器學習">機器學習</SelectItem>
                          <SelectItem value="電腦視覺">電腦視覺</SelectItem>
                          <SelectItem value="自然語言處理">自然語言處理</SelectItem>
                          <SelectItem value="機器人">機器人</SelectItem>
                          <SelectItem value="網路安全">網路安全</SelectItem>
                          <SelectItem value="雲端服務">雲端服務</SelectItem>
                          <SelectItem value="其他">其他</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">應用描述 *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      placeholder="詳細描述您的應用功能、特色和創新點..."
                      rows={4}
                    />
                    <p className="text-xs text-gray-500">建議 100-500 字，清楚說明應用的核心功能和價值</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="appUrl">應用連結 *</Label>
                    <div className="relative">
                      <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="appUrl"
                        value={formData.appUrl}
                        onChange={(e) => handleInputChange("appUrl", e.target.value)}
                        placeholder="https://your-app.example.com"
                        className="pl-10"
                      />
                    </div>
                    <p className="text-xs text-gray-500">用戶將通過此連結訪問您的應用</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="demoFile">演示檔案（可選）</Label>
                    <div className="space-y-3">
                      {!formData.demoFile ? (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors">
                          <input
                            type="file"
                            id="demoFile"
                            accept="video/*,.mp4,.avi,.mov,.wmv,.flv,.webm"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                          <label htmlFor="demoFile" className="cursor-pointer">
                            <div className="flex flex-col items-center space-y-2">
                              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                                <FileVideo className="w-6 h-6 text-gray-400" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">點擊上傳演示檔案</p>
                                <p className="text-xs text-gray-500">支援 MP4, AVI, MOV, WMV 等格式，最大 100MB</p>
                              </div>
                            </div>
                          </label>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex items-center space-x-3">
                            <FileVideo className="w-5 h-5 text-blue-600" />
                            <div>
                              <p className="text-sm font-medium text-blue-900">{formData.demoFile.name}</p>
                              <p className="text-xs text-blue-700">
                                {(formData.demoFile.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={removeFile}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">上傳應用演示影片，幫助用戶更好地了解您的應用</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {step === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Zap className="w-5 h-5" />
                    <span>詳細資訊</span>
                  </CardTitle>
                  <CardDescription>提供更多應用細節，幫助審核和展示</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="features">主要功能特色 *</Label>
                    <Textarea
                      id="features"
                      value={formData.features}
                      onChange={(e) => handleInputChange("features", e.target.value)}
                      placeholder="列出應用的主要功能和特色，例如：&#10;• 支援多語言對話&#10;• 上下文理解能力&#10;• 個性化回應..."
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="technicalDetails">技術細節（可選）</Label>
                    <Textarea
                      id="technicalDetails"
                      value={formData.technicalDetails}
                      onChange={(e) => handleInputChange("technicalDetails", e.target.value)}
                      placeholder="技術架構、使用的 AI 模型、開發框架等..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sourceCodeUrl">原始碼連結（可選）</Label>
                    <div className="relative">
                      <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="sourceCodeUrl"
                        value={formData.sourceCodeUrl}
                        onChange={(e) => handleInputChange("sourceCodeUrl", e.target.value)}
                        placeholder="https://github.com/username/repo"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="documentation">說明文件連結（可選）</Label>
                    <div className="relative">
                      <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="documentation"
                        value={formData.documentation}
                        onChange={(e) => handleInputChange("documentation", e.target.value)}
                        placeholder="https://docs.your-app.com"
                        className="pl-10"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {step === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5" />
                    <span>確認提交</span>
                  </CardTitle>
                  <CardDescription>最後確認您的申請資訊</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Application Summary */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium mb-3">申請摘要</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">應用名稱：</span>
                        <span className="font-medium">{formData.name}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">應用類型：</span>
                        <Badge variant="outline">{formData.type}</Badge>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-500">申請人：</span>
                        <span className="font-medium">
                          {user?.name} ({user?.department})
                        </span>
                      </div>
                      {formData.demoFile && (
                        <div className="col-span-2">
                          <span className="text-gray-500">演示檔案：</span>
                          <span className="font-medium">{formData.demoFile.name}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Featured Request */}
                  <div className="flex items-center space-x-3 p-4 bg-yellow-50 rounded-lg">
                    <Switch
                      id="requestFeatured"
                      checked={formData.requestFeatured}
                      onCheckedChange={(checked) => handleInputChange("requestFeatured", checked)}
                    />
                    <div className="flex-1">
                      <Label htmlFor="requestFeatured" className="font-medium">
                        申請精選展示
                      </Label>
                      <p className="text-sm text-gray-600">
                        如果您認為您的應用具有創新性和實用性，可以申請在精選區域展示
                      </p>
                    </div>
                  </div>

                  {/* Terms Agreement */}
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3 p-4 border rounded-lg">
                      <Switch
                        id="agreeTerms"
                        checked={formData.agreeTerms}
                        onCheckedChange={(checked) => handleInputChange("agreeTerms", checked)}
                      />
                      <div className="flex-1">
                        <Label htmlFor="agreeTerms" className="font-medium">
                          我同意提交條款 *
                        </Label>
                        <div className="text-sm text-gray-600 mt-2 space-y-1">
                          <p>• 我確認提交的應用資訊真實有效</p>
                          <p>• 我同意平台對應用進行審核和展示</p>
                          <p>• 我理解審核可能需要 1-3 個工作日</p>
                          <p>• 我同意遵守平台的使用條款和社群規範</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Progress Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">提交進度</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className={`flex items-center space-x-3 ${step >= 1 ? "text-blue-600" : "text-gray-400"}`}>
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                      step >= 1 ? "bg-blue-600 text-white" : "bg-gray-200"
                    }`}
                  >
                    1
                  </div>
                  <span className="text-sm">基本資訊</span>
                </div>
                <div className={`flex items-center space-x-3 ${step >= 2 ? "text-blue-600" : "text-gray-400"}`}>
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                      step >= 2 ? "bg-blue-600 text-white" : "bg-gray-200"
                    }`}
                  >
                    2
                  </div>
                  <span className="text-sm">詳細資訊</span>
                </div>
                <div className={`flex items-center space-x-3 ${step >= 3 ? "text-blue-600" : "text-gray-400"}`}>
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                      step >= 3 ? "bg-blue-600 text-white" : "bg-gray-200"
                    }`}
                  >
                    3
                  </div>
                  <span className="text-sm">確認提交</span>
                </div>
              </CardContent>
            </Card>

            {/* Tips Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Lightbulb className="w-4 h-4" />
                  <span>提交建議</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {step === 1 && (
                  <>
                    <div className="flex items-start space-x-2">
                      <Target className="w-4 h-4 text-blue-500 mt-0.5" />
                      <p>應用名稱要簡潔明確，能體現核心功能</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Target className="w-4 h-4 text-blue-500 mt-0.5" />
                      <p>描述要突出創新點和實用價值</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Target className="w-4 h-4 text-blue-500 mt-0.5" />
                      <p>確保應用連結可正常訪問</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <FileVideo className="w-4 h-4 text-blue-500 mt-0.5" />
                      <p>演示檔案有助於展示應用功能</p>
                    </div>
                  </>
                )}
                {step === 2 && (
                  <>
                    <div className="flex items-start space-x-2">
                      <Zap className="w-4 h-4 text-green-500 mt-0.5" />
                      <p>詳細列出應用的核心功能特色</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Zap className="w-4 h-4 text-green-500 mt-0.5" />
                      <p>技術細節有助於審核人員理解</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Zap className="w-4 h-4 text-green-500 mt-0.5" />
                      <p>提供原始碼可增加可信度</p>
                    </div>
                  </>
                )}
                {step === 3 && (
                  <>
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-purple-500 mt-0.5" />
                      <p>仔細檢查所有資訊的準確性</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-purple-500 mt-0.5" />
                      <p>確認同意提交條款</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-purple-500 mt-0.5" />
                      <p>提交後將進入審核流程</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Review Process Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>審核流程</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <Upload className="w-3 h-3 text-blue-600" />
                  </div>
                  <span>提交申請</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Clock className="w-3 h-3 text-yellow-600" />
                  </div>
                  <span>管理員審核</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-3 h-3 text-green-600" />
                  </div>
                  <span>審核通過上線</span>
                </div>
                <Separator />
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-xs text-blue-700">
                    <strong>預計時間：</strong>1-3 個工作日
                    <br />
                    <strong>通知方式：</strong>電子郵件
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between pt-6 border-t">
          <Button variant="outline" onClick={handlePrevious} disabled={step === 1}>
            上一步
          </Button>

          <div className="flex space-x-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              取消
            </Button>

            {step < 3 ? (
              <Button
                onClick={handleNext}
                disabled={(step === 1 && !isStep1Valid) || (step === 2 && !isStep2Valid)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                下一步
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!isStep3Valid || isSubmitting}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                {isSubmitting ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    提交中...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    提交申請
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
