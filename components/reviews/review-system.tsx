"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Star, MessageSquare, ThumbsUp, ThumbsDown, Edit, Trash2, MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface Review {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  userDepartment: string
  rating: number
  comment: string
  createdAt: string
  updatedAt?: string
  helpful: number
  notHelpful: number
  userHelpfulVotes: string[] // user IDs who voted helpful
  userNotHelpfulVotes: string[] // user IDs who voted not helpful
}

interface ReviewSystemProps {
  appId: string
  appName: string
  currentRating: number
  onRatingUpdate: (newRating: number, reviewCount: number) => void
}

export function ReviewSystem({ appId, appName, currentRating, onRatingUpdate }: ReviewSystemProps) {
  const { user, updateAppRating } = useAuth()

  // Load reviews from localStorage
  const [reviews, setReviews] = useState<Review[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(`reviews_${appId}`)
      return saved ? JSON.parse(saved) : []
    }
    return []
  })

  const [showReviewForm, setShowReviewForm] = useState(false)
  const [newRating, setNewRating] = useState(5)
  const [newComment, setNewComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingReview, setEditingReview] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "helpful">("newest")

  const userReview = reviews.find((review) => review.userId === user?.id)
  const canReview = user && !userReview

  // Save reviews to localStorage and update app rating
  const saveReviews = (updatedReviews: Review[]) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(`reviews_${appId}`, JSON.stringify(updatedReviews))
    }
    setReviews(updatedReviews)

    // Calculate new average rating and update in context
    if (updatedReviews.length > 0) {
      const avgRating = updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length
      const newAvgRating = Number(avgRating.toFixed(1))
      updateAppRating(appId, newAvgRating)
      onRatingUpdate(newAvgRating, updatedReviews.length)
    } else {
      updateAppRating(appId, 0)
      onRatingUpdate(0, 0)
    }
  }

  const handleSubmitReview = async () => {
    if (!user || !newComment.trim()) return

    setIsSubmitting(true)

    const review: Review = {
      id: `r${Date.now()}`,
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      userDepartment: user.department,
      rating: newRating,
      comment: newComment.trim(),
      createdAt: new Date().toISOString(),
      helpful: 0,
      notHelpful: 0,
      userHelpfulVotes: [],
      userNotHelpfulVotes: [],
    }

    const updatedReviews = [...reviews, review]
    saveReviews(updatedReviews)

    setNewComment("")
    setNewRating(5)
    setShowReviewForm(false)
    setIsSubmitting(false)
  }

  const handleEditReview = async (reviewId: string) => {
    if (!user || !newComment.trim()) return

    setIsSubmitting(true)

    const updatedReviews = reviews.map((review) =>
      review.id === reviewId
        ? {
            ...review,
            rating: newRating,
            comment: newComment.trim(),
            updatedAt: new Date().toISOString(),
          }
        : review,
    )

    saveReviews(updatedReviews)

    setEditingReview(null)
    setNewComment("")
    setNewRating(5)
    setIsSubmitting(false)
  }

  const handleDeleteReview = async (reviewId: string) => {
    const updatedReviews = reviews.filter((review) => review.id !== reviewId)
    saveReviews(updatedReviews)
  }

  const handleHelpfulVote = (reviewId: string, isHelpful: boolean) => {
    if (!user) return

    const updatedReviews = reviews.map((review) => {
      if (review.id !== reviewId) return review

      const helpfulVotes = [...review.userHelpfulVotes]
      const notHelpfulVotes = [...review.userNotHelpfulVotes]

      if (isHelpful) {
        if (helpfulVotes.includes(user.id)) {
          // Remove helpful vote
          const index = helpfulVotes.indexOf(user.id)
          helpfulVotes.splice(index, 1)
        } else {
          // Add helpful vote and remove not helpful if exists
          helpfulVotes.push(user.id)
          const notHelpfulIndex = notHelpfulVotes.indexOf(user.id)
          if (notHelpfulIndex > -1) {
            notHelpfulVotes.splice(notHelpfulIndex, 1)
          }
        }
      } else {
        if (notHelpfulVotes.includes(user.id)) {
          // Remove not helpful vote
          const index = notHelpfulVotes.indexOf(user.id)
          notHelpfulVotes.splice(index, 1)
        } else {
          // Add not helpful vote and remove helpful if exists
          notHelpfulVotes.push(user.id)
          const helpfulIndex = helpfulVotes.indexOf(user.id)
          if (helpfulIndex > -1) {
            helpfulVotes.splice(helpfulIndex, 1)
          }
        }
      }

      return {
        ...review,
        helpful: helpfulVotes.length,
        notHelpful: notHelpfulVotes.length,
        userHelpfulVotes: helpfulVotes,
        userNotHelpfulVotes: notHelpfulVotes,
      }
    })

    saveReviews(updatedReviews)
  }

  const startEdit = (review: Review) => {
    setEditingReview(review.id)
    setNewRating(review.rating)
    setNewComment(review.comment)
    setShowReviewForm(true)
  }

  const cancelEdit = () => {
    setEditingReview(null)
    setNewComment("")
    setNewRating(5)
    setShowReviewForm(false)
  }

  const sortedReviews = [...reviews].sort((a, b) => {
    switch (sortBy) {
      case "oldest":
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      case "helpful":
        return b.helpful - a.helpful
      case "newest":
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }
  })

  const getInitials = (name: string) => {
    return name.split("").slice(0, 2).join("").toUpperCase()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("zh-TW", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const renderStars = (rating: number, interactive = false, onRate?: (rating: number) => void) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? "text-yellow-400 fill-current" : "text-gray-300"
            } ${interactive ? "cursor-pointer hover:text-yellow-400" : ""}`}
            onClick={() => interactive && onRate && onRate(star)}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Review Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5" />
            <span>用戶評價</span>
          </CardTitle>
          <CardDescription>
            {reviews.length > 0 ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  {renderStars(Math.round(currentRating))}
                  <span className="font-semibold">{currentRating}</span>
                  <span className="text-gray-500">({reviews.length} 則評價)</span>
                </div>
              </div>
            ) : (
              "尚無評價，成為第一個評價的用戶！"
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Rating Distribution */}
          {reviews.length > 0 && (
            <div className="space-y-2 mb-6">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = reviews.filter((r) => r.rating === rating).length
                const percentage = (count / reviews.length) * 100
                return (
                  <div key={rating} className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1 w-12">
                      <span className="text-sm">{rating}</span>
                      <Star className="w-3 h-3 text-yellow-400 fill-current" />
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-500 w-8">{count}</span>
                  </div>
                )
              })}
            </div>
          )}

          {/* Add Review Button */}
          {canReview && (
            <Button
              onClick={() => setShowReviewForm(true)}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Star className="w-4 h-4 mr-2" />
              撰寫評價
            </Button>
          )}

          {userReview && (
            <Alert>
              <MessageSquare className="h-4 w-4" />
              <AlertDescription>您已經評價過此應用。您可以編輯或刪除您的評價。</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Review Form */}
      <Dialog open={showReviewForm} onOpenChange={setShowReviewForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingReview ? "編輯評價" : "撰寫評價"}</DialogTitle>
            <DialogDescription>分享您對 {appName} 的使用體驗</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">評分</label>
              {renderStars(newRating, true, setNewRating)}
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">評價內容</label>
              <Textarea
                placeholder="請分享您的使用體驗..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={4}
                maxLength={500}
              />
              <div className="text-xs text-gray-500 mt-1">{newComment.length}/500 字元</div>
            </div>

            <div className="flex space-x-3">
              <Button
                onClick={editingReview ? () => handleEditReview(editingReview) : handleSubmitReview}
                disabled={isSubmitting || !newComment.trim()}
                className="flex-1"
              >
                {isSubmitting ? "提交中..." : editingReview ? "更新評價" : "提交評價"}
              </Button>
              <Button variant="outline" onClick={cancelEdit}>
                取消
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reviews List */}
      {reviews.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>所有評價 ({reviews.length})</CardTitle>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">排序：</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="text-sm border rounded px-2 py-1"
                >
                  <option value="newest">最新</option>
                  <option value="oldest">最舊</option>
                  <option value="helpful">最有幫助</option>
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {sortedReviews.map((review, index) => (
                <div key={review.id}>
                  <div className="flex items-start space-x-4">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={review.userAvatar || "/placeholder.svg"} alt={review.userName} />
                      <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                        {getInitials(review.userName)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="font-medium">{review.userName}</span>
                          <Badge variant="secondary" className="text-xs">
                            {review.userDepartment}
                          </Badge>
                          {renderStars(review.rating)}
                        </div>

                        {user?.id === review.userId && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => startEdit(review)}>
                                <Edit className="w-4 h-4 mr-2" />
                                編輯
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDeleteReview(review.id)} className="text-red-600">
                                <Trash2 className="w-4 h-4 mr-2" />
                                刪除
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>

                      <p className="text-gray-700">{review.comment}</p>

                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center space-x-4">
                          <span>
                            {formatDate(review.createdAt)}
                            {review.updatedAt && " (已編輯)"}
                          </span>
                        </div>

                        {user && user.id !== review.userId && (
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleHelpfulVote(review.id, true)}
                              className={`text-xs ${
                                review.userHelpfulVotes.includes(user.id)
                                  ? "text-green-600 bg-green-50"
                                  : "text-gray-500"
                              }`}
                            >
                              <ThumbsUp className="w-3 h-3 mr-1" />
                              有幫助 ({review.helpful})
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleHelpfulVote(review.id, false)}
                              className={`text-xs ${
                                review.userNotHelpfulVotes.includes(user.id)
                                  ? "text-red-600 bg-red-50"
                                  : "text-gray-500"
                              }`}
                            >
                              <ThumbsDown className="w-3 h-3 mr-1" />
                              沒幫助 ({review.notHelpful})
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {index < sortedReviews.length - 1 && <Separator className="mt-6" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
