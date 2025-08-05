"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, ArrowLeft, CheckCircle } from "lucide-react"

interface ForgotPasswordDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onBackToLogin: () => void
}

export function ForgotPasswordDialog({ open, onOpenChange, onBackToLogin }: ForgotPasswordDialogProps) {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email) {
      setError("請輸入電子郵件地址")
      return
    }

    if (!email.includes("@")) {
      setError("請輸入有效的電子郵件地址")
      return
    }

    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setIsLoading(false)
    setIsSuccess(true)
  }

  const handleClose = () => {
    setEmail("")
    setError("")
    setIsSuccess(false)
    onOpenChange(false)
  }

  const handleResend = async () => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsLoading(false)
  }

  if (isSuccess) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <DialogTitle className="text-2xl font-bold text-center">重設密碼郵件已發送</DialogTitle>
              <DialogDescription className="text-center">我們已將重設密碼的連結發送到您的電子郵件</DialogDescription>
            </div>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800 mb-2">請檢查您的電子郵件：</p>
              <p className="text-sm text-blue-700 font-medium">{email}</p>
            </div>

            <div className="text-sm text-gray-600 space-y-2">
              <p>• 請檢查您的收件匣和垃圾郵件資料夾</p>
              <p>• 重設連結將在 24 小時後過期</p>
              <p>• 如果您沒有收到郵件，請點擊下方重新發送</p>
            </div>

            <div className="flex space-x-3">
              <Button onClick={onBackToLogin} variant="outline" className="flex-1 bg-transparent">
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回登入
              </Button>
              <Button onClick={handleResend} disabled={isLoading} className="flex-1">
                {isLoading ? "發送中..." : "重新發送"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">忘記密碼</DialogTitle>
          <DialogDescription className="text-center">
            請輸入您的電子郵件地址，我們將發送重設密碼的連結給您
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reset-email">電子郵件</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="reset-email"
                type="email"
                placeholder="請輸入您的電子郵件"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex space-x-3">
            <Button type="button" onClick={onBackToLogin} variant="outline" className="flex-1 bg-transparent">
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回登入
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? "發送中..." : "發送重設連結"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
