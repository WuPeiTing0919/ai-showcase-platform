"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Copy, Link } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ScoringLinkDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentCompetition?: any
}

export function ScoringLinkDialog({ open, onOpenChange, currentCompetition }: ScoringLinkDialogProps) {
  const { toast } = useToast()
  
  // 生成評分連結URL
  const scoringUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/judge-scoring`
    : "https://preview-fork-of-ai-app-design-ieqe9ld0z64vdugqt.vusercontent.net/judge-scoring"
  
  const accessCode = "judge2024"
  const competitionName = currentCompetition?.name || "2024年第四季綜合AI競賽"

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(scoringUrl)
      toast({
        title: "連結已複製",
        description: "評分系統連結已複製到剪貼簿",
      })
    } catch (err) {
      toast({
        title: "複製失敗",
        description: "無法複製連結，請手動複製",
        variant: "destructive",
      })
    }
  }

  const handleCopyAccessCode = async () => {
    try {
      await navigator.clipboard.writeText(accessCode)
      toast({
        title: "存取碼已複製",
        description: "評審存取碼已複製到剪貼簿",
      })
    } catch (err) {
      toast({
        title: "複製失敗",
        description: "無法複製存取碼，請手動複製",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Link className="w-5 h-5" />
            <span>評審連結管理</span>
          </DialogTitle>
          <DialogDescription>
            管理評審評分系統的存取連結和資訊
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* 評審評分系統連結 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Link className="w-5 h-5 text-blue-600" />
                <span>評審評分系統連結</span>
              </CardTitle>
              <CardDescription>
                評審可以通過此連結進入評分系統
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2">
                <Input
                  value={scoringUrl}
                  readOnly
                  className="flex-1"
                />
                <Button
                  onClick={handleCopyUrl}
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <Copy className="w-4 h-4" />
                  <span>複製</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 存取資訊 */}
          <Card>
            <CardHeader>
              <CardTitle>存取資訊</CardTitle>
              <CardDescription>
                評審登入所需的資訊
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 存取碼 */}
              <div className="space-y-2">
                <Label>存取碼</Label>
                <div className="flex space-x-2">
                  <Input
                    value={accessCode}
                    readOnly
                    className="flex-1"
                  />
                  <Button
                    onClick={handleCopyAccessCode}
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-2"
                  >
                    <Copy className="w-4 h-4" />
                    <span>複製</span>
                  </Button>
                </div>
              </div>

              {/* 當前競賽 */}
              <div className="space-y-2">
                <Label>當前競賽</Label>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">
                    {competitionName}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
} 