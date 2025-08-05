"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Copy, Users } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Judge {
  id: string
  name: string
  specialty: string
}

interface JudgeListDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  judges: Judge[]
}

export function JudgeListDialog({ open, onOpenChange, judges }: JudgeListDialogProps) {
  const { toast } = useToast()

  const handleCopyJudgeId = async (judgeId: string, judgeName: string) => {
    try {
      await navigator.clipboard.writeText(judgeId)
      toast({
        title: "ID已複製",
        description: `${judgeName}的ID已複製到剪貼簿`,
      })
    } catch (err) {
      toast({
        title: "複製失敗",
        description: "無法複製ID，請手動複製",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>評審清單</span>
          </DialogTitle>
          <DialogDescription>
            當前競賽的評審ID和基本資訊
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {judges.map((judge) => (
            <Card key={judge.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  {/* 左側：頭像和資訊 */}
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="text-sm font-semibold bg-gray-100">
                        {judge.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-lg">{judge.name}</h3>
                      <p className="text-sm text-gray-600">{judge.specialty}</p>
                    </div>
                  </div>

                  {/* 右側：ID和複製按鈕 */}
                  <div className="flex items-center space-x-3">
                    <div className="bg-gray-100 px-3 py-1 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">
                        ID: {judge.id}
                      </span>
                    </div>
                    <Button
                      onClick={() => handleCopyJudgeId(judge.id, judge.name)}
                      variant="outline"
                      size="sm"
                      className="flex items-center space-x-2"
                    >
                      <Copy className="w-4 h-4" />
                      <span>複製</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
} 