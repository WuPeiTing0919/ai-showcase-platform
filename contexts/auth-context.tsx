"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface User {
  id: string
  name: string
  email: string
  avatar?: string
  department: string
  role: "user" | "developer" | "admin"
  joinDate: string
  favoriteApps: string[]
  recentApps: string[]
  totalLikes: number
  totalViews: number
}

interface AppLike {
  appId: string
  userId: string
  likedAt: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  register: (userData: RegisterData) => Promise<boolean>
  logout: () => void
  updateProfile: (userData: Partial<User>) => Promise<boolean>
  toggleFavorite: (appId: string) => Promise<boolean>
  isFavorite: (appId: string) => boolean
  addToRecentApps: (appId: string) => void
  getAppLikes: (appId: string) => number
  incrementViewCount: (appId: string) => void
  getViewCount: (appId: string) => number
  updateAppRating: (appId: string, rating: number) => void
  getAppRating: (appId: string) => number
  canSubmitApp: () => boolean
  canAccessAdmin: () => boolean
  isLoading: boolean
  // New like functionality
  toggleLike: (appId: string) => Promise<boolean>
  hasLikedToday: (appId: string) => boolean
  getAppLikesInPeriod: (appId: string, startDate: string, endDate: string) => number
  getUserLikeHistory: () => Array<{ appId: string; date: string }>
  getLikeCount: (appId: string) => number
  likeApp: (appId: string) => Promise<boolean>
}

interface RegisterData {
  name: string
  email: string
  password: string
  department: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Mock users data with new role system
const mockUsers: User[] = []

// Global app likes counter - in a real app this would be in a database
const appLikesCounter: Record<string, number> = {}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // View count state with localStorage persistence
  const [appViews, setAppViews] = useState<Record<string, number>>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("appViews")
      return saved ? JSON.parse(saved) : {}
    }
    return {}
  })

  // App ratings state with localStorage persistence
  const [appRatings, setAppRatings] = useState<Record<string, number>>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("appRatings")
      return saved ? JSON.parse(saved) : {}
    }
    return {}
  })

  const [appLikes, setAppLikes] = useState<Record<string, AppLike[]>>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("appLikes")
      return saved ? JSON.parse(saved) : {}
    }
    return {}
  })

  // New like system state with localStorage persistence
  const [userLikes, setUserLikes] = useState<Record<string, Array<{ appId: string; date: string }>>>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("userLikes")
      return saved ? JSON.parse(saved) : {}
    }
    return {}
  })

  // App likes with date tracking
  const [appLikesOld, setAppLikesOld] = useState<Record<string, Array<{ userId: string; date: string }>>>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("appLikesOld")
      return saved ? JSON.parse(saved) : {}
    }
    return {}
  })

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  // Save likes to localStorage when they change
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("userLikes", JSON.stringify(userLikes))
      localStorage.setItem("appLikesOld", JSON.stringify(appLikesOld))
    }
  }, [userLikes, appLikesOld])

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok && data.user) {
        setUser(data.user)
        localStorage.setItem("user", JSON.stringify(data.user))
        localStorage.setItem("token", data.token)
        setIsLoading(false)
        return true
      } else {
        console.error('登入失敗:', data.error)
        setIsLoading(false)
        return false
      }
    } catch (error) {
      console.error('登入錯誤:', error)
      setIsLoading(false)
      return false
    }
  }

  const register = async (userData: RegisterData): Promise<boolean> => {
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })

      const data = await response.json()

      if (response.ok && data.user) {
        setUser(data.user)
        localStorage.setItem("user", JSON.stringify(data.user))
        setIsLoading(false)
        return true
      } else {
        console.error('註冊失敗:', data.error)
        setIsLoading(false)
        return false
      }
    } catch (error) {
      console.error('註冊錯誤:', error)
      setIsLoading(false)
      return false
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
  }

  const updateProfile = async (userData: Partial<User>): Promise<boolean> => {
    if (!user) return false

    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const updatedUser = { ...user, ...userData }
    setUser(updatedUser)
    localStorage.setItem("user", JSON.stringify(updatedUser))

    // Update in mock data
    const userIndex = mockUsers.findIndex((u) => u.id === user.id)
    if (userIndex !== -1) {
      mockUsers[userIndex] = updatedUser
    }

    setIsLoading(false)
    return true
  }

  const toggleFavorite = async (appId: string): Promise<boolean> => {
    if (!user) return false

    const isFavorited = user.favoriteApps.includes(appId)
    const updatedFavorites = isFavorited
      ? user.favoriteApps.filter((id) => id !== appId)
      : [...user.favoriteApps, appId]

    // Update global likes counter (keeping for backward compatibility)
    if (isFavorited) {
      appLikesCounter[appId] = Math.max(0, appLikesCounter[appId] - 1)
    } else {
      appLikesCounter[appId] = (appLikesCounter[appId] || 0) + 1
    }

    const success = await updateProfile({
      favoriteApps: updatedFavorites,
    })

    return success
  }

  const isFavorite = (appId: string): boolean => {
    return user?.favoriteApps.includes(appId) || false
  }

  const addToRecentApps = (appId: string): void => {
    if (!user) return

    const updatedRecent = [appId, ...user.recentApps.filter((id) => id !== appId)].slice(0, 10)
    updateProfile({
      recentApps: updatedRecent,
    })
  }

  const getAppLikes = (appId: string): number => {
    return appLikesCounter[appId] || 0
  }

  // New like functionality
  const toggleLike = async (appId: string): Promise<boolean> => {
    if (!user) return false

    const today = new Date().toISOString().split("T")[0]
    const userLikeHistory = userLikes[user.id] || []

    // Check if user has already liked this app today
    const hasLikedTodayOld = userLikeHistory.some((like) => like.appId === appId && like.date === today)

    if (hasLikedTodayOld) {
      return false // Cannot like again today
    }

    // Add like to user's history
    const updatedUserLikes = {
      ...userLikes,
      [user.id]: [...userLikeHistory, { appId, date: today }],
    }
    setUserLikes(updatedUserLikes)

    // Add like to app's likes
    const appLikeHistory = appLikesOld[appId] || []
    const updatedAppLikes = {
      ...appLikesOld,
      [appId]: [...appLikeHistory, { userId: user.id, date: today }],
    }
    setAppLikesOld(updatedAppLikes)

    return true
  }

  const hasLikedTodayOld = (appId: string): boolean => {
    if (!user) return false

    const today = new Date().toISOString().split("T")[0]
    const userLikeHistory = userLikes[user.id] || []

    return userLikeHistory.some((like) => like.appId === appId && like.date === today)
  }

  const getAppLikesInPeriod = (appId: string, startDate: string, endDate: string): number => {
    const appLikeHistory = appLikesOld[appId] || []
    return appLikeHistory.filter((like) => {
      return like.date >= startDate && like.date <= endDate
    }).length
  }

  const getUserLikeHistory = (): Array<{ appId: string; date: string }> => {
    if (!user) return []
    return userLikes[user.id] || []
  }

  // View count functionality
  const incrementViewCount = (appId: string): void => {
    setAppViews((prev) => {
      const newViews = { ...prev, [appId]: (prev[appId] || 0) + 1 }
      if (typeof window !== "undefined") {
        localStorage.setItem("appViews", JSON.stringify(newViews))
      }
      return newViews
    })
  }

  const getViewCount = (appId: string): number => {
    return appViews[appId] || 0
  }

  // Rating functionality
  const updateAppRating = (appId: string, rating: number): void => {
    setAppRatings((prev) => {
      const newRatings = { ...prev, [appId]: rating }
      if (typeof window !== "undefined") {
        localStorage.setItem("appRatings", JSON.stringify(newRatings))
      }
      return newRatings
    })
  }

  const getAppRating = (appId: string): number => {
    return appRatings[appId] || 0
  }

  const getLikeCount = (appId: string): number => {
    return appLikes[appId]?.length || 0
  }

  const hasLikedToday = (appId: string): boolean => {
    if (!user) return false

    const today = new Date().toISOString().split("T")[0]
    return appLikes[appId]?.some((like) => like.userId === user.id && like.likedAt.startsWith(today)) || false
  }

  const likeApp = async (appId: string): Promise<boolean> => {
    if (!user) return false

    const today = new Date().toISOString().split("T")[0]

    // Check if user already liked today
    if (hasLikedToday(appId)) return false

    const newLike: AppLike = {
      appId,
      userId: user.id,
      likedAt: new Date().toISOString(),
    }

    setAppLikes((prev) => {
      const updatedLikes = { ...prev }
      if (!updatedLikes[appId]) {
        updatedLikes[appId] = []
      }
      updatedLikes[appId] = [...updatedLikes[appId], newLike]

      if (typeof window !== "undefined") {
        localStorage.setItem("appLikes", JSON.stringify(updatedLikes))
      }

      return updatedLikes
    })

    return true
  }

  // Permission check functions
  const canSubmitApp = (): boolean => {
    return user?.role === "developer"
  }

  const canAccessAdmin = (): boolean => {
    return user?.role === "admin"
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        updateProfile,
        toggleFavorite,
        isFavorite,
        addToRecentApps,
        getAppLikes,
        incrementViewCount,
        getViewCount,
        updateAppRating,
        getAppRating,
        canSubmitApp,
        canAccessAdmin,
        isLoading,
        // New like functionality
        toggleLike,
        hasLikedTodayOld,
        getAppLikesInPeriod,
        getUserLikeHistory,
        getLikeCount,
        hasLikedToday,
        likeApp,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
