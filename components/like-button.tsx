"use client"

import type React from "react"

import { useState } from "react"
import { ThumbsUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface LikeButtonProps {
  appId: string
  size?: "sm" | "default" | "lg"
  className?: string
  showCount?: boolean
}

export function LikeButton({ appId, size = "default", className, showCount = true }: LikeButtonProps) {
  const { user, likeApp, getAppLikes, hasLikedToday } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const likeCount = getAppLikes(appId)
  const hasLiked = user ? hasLikedToday(appId) : false

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation()

    if (!user) {
      toast({
        title: "請先登入",
        description: "您需要登入才能為應用按讚",
        variant: "destructive",
      })
      return
    }

    if (hasLiked) {
      toast({
        title: "今日已按讚",
        description: "您今天已經為這個應用按過讚了",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      await likeApp(appId)
      toast({
        title: "按讚成功！",
        description: "感謝您的支持",
      })
    } catch (error) {
      toast({
        title: "按讚失敗",
        description: "請稍後再試",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const sizeClasses = {
    sm: "h-6 px-2 text-xs gap-1",
    default: "h-8 px-3 text-sm gap-1.5",
    lg: "h-10 px-4 text-base gap-2",
  }

  const iconSizes = {
    sm: "w-3 h-3",
    default: "w-4 h-4",
    lg: "w-5 h-5",
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLike}
      disabled={isLoading}
      className={cn(
        sizeClasses[size],
        "flex items-center",
        hasLiked
          ? "text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          : "text-gray-500 hover:text-blue-600 hover:bg-blue-50",
        "transition-all duration-200",
        className,
      )}
    >
      <ThumbsUp className={cn(iconSizes[size], hasLiked ? "fill-current" : "")} />
      {showCount && <span>{likeCount}</span>}
    </Button>
  )
}
