"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"
import { cn } from "@/lib/utils"

interface FavoriteButtonProps {
  appId: string
  initialFavorited?: boolean
  onToggle?: (appId: string, isFavorited: boolean) => void
  size?: "sm" | "md" | "lg"
  variant?: "default" | "ghost" | "outline"
}

export function FavoriteButton({
  appId,
  initialFavorited = false,
  onToggle,
  size = "md",
  variant = "ghost",
}: FavoriteButtonProps) {
  const [isFavorited, setIsFavorited] = useState(initialFavorited)
  const [isLoading, setIsLoading] = useState(false)

  const handleToggle = async () => {
    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 300))

      const newFavoriteState = !isFavorited
      setIsFavorited(newFavoriteState)

      // Call the callback if provided
      onToggle?.(appId, newFavoriteState)
    } catch (error) {
      console.error("Failed to toggle favorite:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-9 w-9",
    lg: "h-10 w-10",
  }

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  }

  return (
    <Button
      variant={variant}
      size="icon"
      className={cn(sizeClasses[size], "transition-all duration-200", isFavorited && "text-red-500 hover:text-red-600")}
      onClick={handleToggle}
      disabled={isLoading}
      title={isFavorited ? "取消收藏" : "加入收藏"}
    >
      <Heart
        className={cn(
          iconSizes[size],
          "transition-all duration-200",
          isFavorited && "fill-current",
          isLoading && "animate-pulse",
        )}
      />
    </Button>
  )
}
