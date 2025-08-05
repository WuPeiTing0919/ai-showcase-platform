"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import {
  LayoutDashboard,
  Users,
  Bot,
  Trophy,
  BarChart3,
  Settings,
  Menu,
  X,
  Bell,
  Search,
  LogOut,
  User,
  UserPlus,
  FileText,
  AlertTriangle,
  Award,
  Info,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface AdminLayoutProps {
  children: React.ReactNode
  currentPage: string
  onPageChange: (page: string) => void
}

interface Notification {
  id: string
  type: "user_registration" | "app_submission" | "competition_update" | "system_alert" | "review_completed"
  title: string
  message: string
  timestamp: string
  read: boolean
}

interface SearchResult {
  id: string
  type: "user" | "app" | "competition"
  title: string
  subtitle: string
  avatar?: string
}

const menuItems = [
  { id: "dashboard", name: "儀表板", icon: LayoutDashboard },
  { id: "users", name: "用戶管理", icon: Users },
  { id: "apps", name: "應用管理", icon: Bot },
  { id: "competitions", name: "競賽管理", icon: Trophy },
  { id: "analytics", name: "數據分析", icon: BarChart3 },
  { id: "settings", name: "系統設定", icon: Settings },
]

// Notifications data - empty for production
const mockNotifications: Notification[] = []

// Search data - empty for production
const mockSearchData: SearchResult[] = []

export function AdminLayout({ children, currentPage, onPageChange }: AdminLayoutProps) {
  const { user, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // Search state
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [showSearchResults, setShowSearchResults] = useState(false)

  // Notification state
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)
  const [showNotifications, setShowNotifications] = useState(false)

  // Logout confirmation state
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)

  // Handle search
  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = mockSearchData.filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.subtitle.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setSearchResults(filtered.slice(0, 8)) // Limit to 8 results
      setShowSearchResults(true)
    } else {
      setSearchResults([])
      setShowSearchResults(false)
    }
  }, [searchQuery])

  // Get unread notification count
  const unreadCount = notifications.filter((n) => !n.read).length

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "剛剛"
    if (diffInMinutes < 60) return `${diffInMinutes} 分鐘前`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} 小時前`
    return `${Math.floor(diffInMinutes / 1440)} 天前`
  }

  // Get notification icon and color
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "user_registration":
        return <UserPlus className="w-4 h-4 text-blue-500" />
      case "app_submission":
        return <FileText className="w-4 h-4 text-green-500" />
      case "competition_update":
        return <Trophy className="w-4 h-4 text-purple-500" />
      case "system_alert":
        return <AlertTriangle className="w-4 h-4 text-orange-500" />
      case "review_completed":
        return <Award className="w-4 h-4 text-emerald-500" />
      default:
        return <Info className="w-4 h-4 text-gray-500" />
    }
  }

  // Get search result icon
  const getSearchIcon = (type: string) => {
    switch (type) {
      case "user":
        return <User className="w-4 h-4 text-blue-500" />
      case "app":
        return <Bot className="w-4 h-4 text-green-500" />
      case "competition":
        return <Trophy className="w-4 h-4 text-purple-500" />
      default:
        return <Info className="w-4 h-4 text-gray-500" />
    }
  }

  // Mark notification as read
  const markAsRead = (notificationId: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)))
  }

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  // Handle logout with improved UX
  const handleLogout = () => {
    logout()
    setShowLogoutDialog(false)

    // Check if this is a popup/new tab opened from main site
    if (typeof window !== 'undefined' && window.opener && !window.opener.closed) {
      // If opened from another window, close this tab and focus parent
      window.opener.focus()
      window.close()
    } else {
      // If this is the main window or standalone, redirect to homepage
      window.location.href = "/"
    }
  }

  // Handle search result click
  const handleSearchResultClick = (result: SearchResult) => {
    setSearchQuery("")
    setShowSearchResults(false)

    // Navigate based on result type
    switch (result.type) {
      case "user":
        onPageChange("users")
        break
      case "app":
        onPageChange("apps")
        break
      case "competition":
        onPageChange("competitions")
        break
    }
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">存取被拒</h2>
            <p className="text-gray-600 mb-4">您沒有管理員權限訪問此頁面</p>
            <div className="space-x-3">
              <Button onClick={() => (window.location.href = "/")} variant="outline">
                返回首頁
              </Button>
              {typeof window !== 'undefined' && window.opener && !window.opener.closed && (
                <Button
                  onClick={() => {
                    window.opener.focus()
                    window.close()
                  }}
                  variant="default"
                >
                  關閉頁面
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? "w-64" : "w-16"} bg-white shadow-lg transition-all duration-300 flex flex-col`}>
        {/* Logo */}
        <div className="p-4 border-b">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Settings className="w-5 h-5 text-white" />
            </div>
            {sidebarOpen && (
              <div>
                <h1 className="font-bold text-gray-900">管理後台</h1>
                <p className="text-xs text-gray-500">AI 展示平台</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const IconComponent = item.icon
              const isActive = currentPage === item.id
              return (
                <li key={item.id}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={`w-full h-12 ${sidebarOpen ? "justify-start px-4" : "justify-center px-0"} ${
                      isActive
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                    onClick={() => onPageChange(item.id)}
                  >
                    <div className="flex items-center justify-center w-5 h-5">
                      <IconComponent className="w-4 h-4" />
                    </div>
                    {sidebarOpen && <span className="ml-3 text-sm font-medium">{item.name}</span>}
                  </Button>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* User Info */}
        <div className="p-4 border-t">
          <div className="flex items-center space-x-3">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm">
                {user.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            {sidebarOpen && (
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">管理員</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(!sidebarOpen)}>
                {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </Button>
              <h2 className="text-xl font-semibold text-gray-900">
                {menuItems.find((item) => item.id === currentPage)?.name || "管理後台"}
              </h2>
            </div>

            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="搜尋..."
                    className="pl-10 w-64"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => searchQuery && setShowSearchResults(true)}
                    onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
                  />
                </div>

                {/* Search Results Dropdown */}
                {showSearchResults && searchResults.length > 0 && (
                  <Card className="absolute top-full mt-1 w-full z-50 shadow-lg">
                    <CardContent className="p-0">
                      <div className="max-h-80 overflow-y-auto">
                        {searchResults.map((result) => (
                          <div
                            key={result.id}
                            className="flex items-center space-x-3 p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                            onClick={() => handleSearchResultClick(result)}
                          >
                            {result.avatar ? (
                              <Avatar className="w-8 h-8">
                                <img
                                  src={result.avatar || "/placeholder.svg"}
                                  alt={result.title}
                                  className="w-8 h-8 rounded-full"
                                />
                                <AvatarFallback>{result.title[0]}</AvatarFallback>
                              </Avatar>
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                                {getSearchIcon(result.type)}
                              </div>
                            )}
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">{result.title}</p>
                              <p className="text-xs text-gray-500">{result.subtitle}</p>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {result.type === "user" ? "用戶" : result.type === "app" ? "應用" : "競賽"}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* No results message */}
                {showSearchResults && searchResults.length === 0 && searchQuery.trim() && (
                  <Card className="absolute top-full mt-1 w-full z-50 shadow-lg">
                    <CardContent className="p-4 text-center text-gray-500 text-sm">沒有找到相關結果</CardContent>
                  </Card>
                )}
              </div>

              {/* Notifications */}
              <DropdownMenu open={showNotifications} onOpenChange={setShowNotifications}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="relative">
                    <Bell className="w-4 h-4" />
                    {unreadCount > 0 && (
                      <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs bg-red-500">
                        {unreadCount}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel className="flex items-center justify-between">
                    <span>通知</span>
                    {unreadCount > 0 && (
                      <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs">
                        全部標為已讀
                      </Button>
                    )}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">暫無通知</p>
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <DropdownMenuItem
                          key={notification.id}
                          className="p-0"
                          onClick={() => markAsRead(notification.id)}
                        >
                          <div className={`w-full p-3 ${!notification.read ? "bg-blue-50" : ""}`}>
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0 mt-0.5">{getNotificationIcon(notification.type)}</div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <p className="text-sm font-medium text-gray-900 truncate">{notification.title}</p>
                                  {!notification.read && (
                                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 ml-2" />
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                                <p className="text-xs text-gray-400 mt-1">{formatTimestamp(notification.timestamp)}</p>
                              </div>
                            </div>
                          </div>
                        </DropdownMenuItem>
                      ))
                    )}
                  </div>
                  {notifications.length > 0 && <DropdownMenuSeparator />}
                  <div className="p-2">
                    <Button variant="ghost" size="sm" className="w-full text-xs">
                      查看所有通知
                    </Button>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Logout */}
              <Button variant="ghost" size="sm" onClick={() => setShowLogoutDialog(true)}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>

      {/* Logout Confirmation Dialog */}
      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <LogOut className="w-5 h-5 text-red-500" />
              <span>確認登出</span>
            </DialogTitle>
            <DialogDescription>您確定要登出管理後台嗎？登出後將返回首頁或關閉此頁面。</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-3 mt-6">
            <Button variant="outline" onClick={() => setShowLogoutDialog(false)}>
              取消
            </Button>
            <Button variant="destructive" onClick={handleLogout}>
              確認登出
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Click outside to close search results */}
      {showSearchResults && <div className="fixed inset-0 z-40" onClick={() => setShowSearchResults(false)} />}
    </div>
  )
}
