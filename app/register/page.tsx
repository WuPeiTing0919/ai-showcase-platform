"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Brain, User, Mail, Building, Lock, Loader2, CheckCircle, AlertTriangle, Shield, Code } from "lucide-react"

export default function RegisterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { register, isLoading } = useAuth()

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    department: "",
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 從 URL 參數獲取邀請資訊
  const invitationToken = searchParams.get("token")
  const invitedEmail = searchParams.get("email")
  const invitedRole = searchParams.get("role") || "user"
  const isInvitedUser = !!(invitationToken && invitedEmail)

  useEffect(() => {
    if (isInvitedUser) {
      setFormData((prev) => ({
        ...prev,
        email: decodeURIComponent(invitedEmail),
      }))
    }
  }, [isInvitedUser, invitedEmail])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError("")
  }

  const getRoleText = (role: string) => {
    switch (role) {
      case "admin":
        return "管理員"
      case "developer":
        return "開發者"
      case "user":
        return "一般用戶"
      default:
        return role
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Shield className="w-4 h-4 text-purple-600" />
      case "developer":
        return <Code className="w-4 h-4 text-green-600" />
      case "user":
        return <User className="w-4 h-4 text-blue-600" />
      default:
        return <User className="w-4 h-4 text-blue-600" />
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "developer":
        return "bg-green-100 text-green-800 border-green-200"
      case "user":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getRoleDescription = (role: string) => {
    switch (role) {
      case "admin":
        return "可以訪問管理後台，管理用戶和審核應用"
      case "developer":
        return "可以提交 AI 應用申請，參與平台建設"
      case "user":
        return "可以瀏覽和收藏應用，參與評價互動"
      default:
        return ""
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsSubmitting(true)

    // 表單驗證
    if (!formData.name || !formData.email || !formData.password || !formData.department) {
      setError("請填寫所有必填欄位")
      setIsSubmitting(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError("密碼確認不一致")
      setIsSubmitting(false)
      return
    }

    if (formData.password.length < 6) {
      setError("密碼長度至少需要 6 個字符")
      setIsSubmitting(false)
      return
    }

    try {
      const success = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        department: formData.department,
      })

      if (success) {
        setSuccess("註冊成功！正在跳轉...")
        setTimeout(() => {
          router.push("/")
        }, 2000)
      } else {
        setError("註冊失敗，請檢查資料或聯繫管理員")
      }
    } catch (err) {
      setError("註冊過程中發生錯誤，請稍後再試")
    }

    setIsSubmitting(false)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">註冊成功！</h3>
            <p className="text-gray-600 mb-4">歡迎加入強茂集團 AI 展示平台</p>
            <p className="text-sm text-gray-500">正在跳轉到首頁...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">強茂集團 AI 展示平台</h1>
            </div>
          </div>
          {isInvitedUser ? (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">完成註冊</h2>
              <p className="text-gray-600">您已受邀加入平台，請完成以下資訊</p>
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">建立帳戶</h2>
              <p className="text-gray-600">加入強茂集團 AI 展示平台</p>
            </div>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>註冊資訊</CardTitle>
            <CardDescription>
              {isInvitedUser ? "請填寫您的個人資訊完成註冊" : "請填寫以下資訊建立您的帳戶"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Invitation Info */}
            {isInvitedUser && (
              <div className="mb-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-medium text-blue-900 mb-2">邀請資訊</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-blue-700">電子郵件：</span>
                          <span className="text-sm font-medium text-blue-900">{invitedEmail}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-blue-700">預設角色：</span>
                          <Badge variant="outline" className={getRoleColor(invitedRole)}>
                            <div className="flex items-center space-x-1">
                              {getRoleIcon(invitedRole)}
                              <span>{getRoleText(invitedRole)}</span>
                            </div>
                          </Badge>
                        </div>
                        <div className="mt-3 pt-3 border-t border-blue-200">
                          <p className="text-xs text-blue-600">{getRoleDescription(invitedRole)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Error/Success Messages */}
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">姓名 *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="請輸入您的姓名"
                    className="pl-10"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">電子郵件 *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="請輸入電子郵件"
                    className="pl-10"
                    disabled={isSubmitting || isInvitedUser}
                    readOnly={isInvitedUser}
                  />
                </div>
                {isInvitedUser && <p className="text-xs text-gray-500">此電子郵件由邀請連結自動填入</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">部門 *</Label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 z-10" />
                  <Select
                    value={formData.department}
                    onValueChange={(value) => handleInputChange("department", value)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className="pl-10">
                      <SelectValue placeholder="請選擇您的部門" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="HQBU">HQBU</SelectItem>
                      <SelectItem value="ITBU">ITBU</SelectItem>
                      <SelectItem value="MBU1">MBU1</SelectItem>
                      <SelectItem value="SBU">SBU</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="password">密碼 *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    placeholder="請輸入密碼（至少 6 個字符）"
                    className="pl-10"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">確認密碼 *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    placeholder="請再次輸入密碼"
                    className="pl-10"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                disabled={isSubmitting || isLoading}
              >
                {isSubmitting || isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    註冊中...
                  </>
                ) : (
                  "完成註冊"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                已有帳戶？{" "}
                <Button
                  variant="link"
                  className="p-0 h-auto font-normal text-blue-600 hover:text-blue-700"
                  onClick={() => router.push("/")}
                >
                  返回首頁登入
                </Button>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Role Information */}
        {!isInvitedUser && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">角色說明</CardTitle>
              <CardDescription>了解不同角色的權限和功能</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3">
                <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                  <User className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">一般用戶</h4>
                    <p className="text-sm text-blue-700">可以瀏覽和收藏應用，參與評價互動</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                  <Code className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-green-900">開發者</h4>
                    <p className="text-sm text-green-700">可以提交 AI 應用申請，參與平台建設</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg">
                  <Shield className="w-5 h-5 text-purple-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-purple-900">管理員</h4>
                    <p className="text-sm text-purple-700">可以訪問管理後台，管理用戶和審核應用</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600">
                  <strong>注意：</strong>新註冊用戶預設為一般用戶角色。如需其他角色權限，請聯繫管理員進行調整。
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
