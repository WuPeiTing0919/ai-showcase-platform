"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Search,
  MoreHorizontal,
  UserPlus,
  Edit,
  Trash2,
  Shield,
  Eye,
  Calendar,
  Activity,
  User,
  Mail,
  Building,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Clock,
  RefreshCw,
  Copy,
  Link,
  ExternalLink,
  Code,
  Users,
} from "lucide-react"

// User data - empty for production
const initialMockUsers: any[] = []

export function UserManagement() {
  const [users, setUsers] = useState(initialMockUsers)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState("all")
  const [selectedRole, setSelectedRole] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [showUserDetail, setShowUserDetail] = useState(false)
  const [showInviteUser, setShowInviteUser] = useState(false)
  const [showEditUser, setShowEditUser] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showInvitationLink, setShowInvitationLink] = useState(false)
  const [userToDelete, setUserToDelete] = useState<any>(null)
  const [generatedInvitation, setGeneratedInvitation] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")
  const [stats, setStats] = useState({
    total: 0,
    admin: 0,
    developer: 0,
    user: 0,
    today: 0,
    totalApps: 0,
    totalReviews: 0
  })

  // 載入用戶資料
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true)
        
        // 獲取用戶列表
        const usersResponse = await fetch('/api/users', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
        
        if (usersResponse.ok) {
          const usersData = await usersResponse.json()
          setUsers(usersData.users || [])
        } else {
          console.error('獲取用戶列表失敗')
        }

        // 獲取統計資料
        const statsResponse = await fetch('/api/users/stats', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
        
        if (statsResponse.ok) {
          const statsData = await statsResponse.json()
          setStats(statsData)
        } else {
          console.error('獲取統計資料失敗')
        }
      } catch (error) {
        console.error('載入資料失敗:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUsers()
  }, [])

  // 重新獲取統計數據的函數
  const refreshStats = async () => {
    try {
      const statsResponse = await fetch('/api/users/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      }
    } catch (error) {
      console.error('重新獲取統計資料失敗:', error)
    }
  }

  // 邀請用戶表單狀態 - 包含電子郵件和預設角色
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState("user")

  // 編輯用戶表單狀態
  const [editUser, setEditUser] = useState({
    id: "",
    name: "",
    email: "",
    department: "",
    role: "",
    status: "",
  })

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDepartment = selectedDepartment === "all" || user.department === selectedDepartment
    const matchesRole =
      selectedRole === "all" ||
      user.role === selectedRole ||
      (user.status === "invited" && (user as any).invitedRole === selectedRole)
    const matchesStatus = selectedStatus === "all" || user.status === selectedStatus

    return matchesSearch && matchesDepartment && matchesRole && matchesStatus
  })

  const handleViewUser = async (user: any) => {
    setIsLoading(true)
    
    try {
      const response = await fetch(`/api/users/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        const userData = await response.json()
        
        // 獲取用戶活動記錄
        const activityResponse = await fetch(`/api/users/${user.id}/activity`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
        
        let activityData = []
        if (activityResponse.ok) {
          activityData = await activityResponse.json()
        }
        
        // 合併用戶資料和活動記錄
        const userWithActivity = {
          ...userData,
          activities: activityData
        }
        
        setSelectedUser(userWithActivity)
        setShowUserDetail(true)
      } else {
        const errorData = await response.json()
        setError(errorData.error || "獲取用戶詳情失敗")
        setTimeout(() => setError(""), 3000)
      }
    } catch (error) {
      console.error('Error fetching user details:', error)
      setError("獲取用戶詳情失敗")
      setTimeout(() => setError(""), 3000)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditUser = (user: any) => {
    setEditUser({
      id: user.id,
      name: user.name,
      email: user.email,
      department: user.department,
      role: user.role,
      status: user.status,
    })
    setShowEditUser(true)
  }

  const handleDeleteUser = (user: any) => {
    setUserToDelete(user)
    setShowDeleteConfirm(true)
  }

  const handleToggleUserStatus = async (userId: string) => {
    setIsLoading(true)

    try {
      const newStatus = users.find(user => user.id === userId)?.status === "active" ? "inactive" : "active"
      
      const response = await fetch(`/api/users/${userId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        setUsers(
          users.map((user) =>
            user.id === userId ? { ...user, status: newStatus } : user,
          ),
        )
        setSuccess("用戶狀態更新成功！")
        setTimeout(() => setSuccess(""), 3000)
        refreshStats() // 更新統計數據
      } else {
        const errorData = await response.json()
        setError(errorData.error || "更新用戶狀態失敗")
        setTimeout(() => setError(""), 3000)
      }
    } catch (error) {
      console.error('Error updating user status:', error)
      setError("更新用戶狀態失敗")
      setTimeout(() => setError(""), 3000)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChangeUserRole = async (userId: string, newRole: string) => {
    setIsLoading(true)

    // 模擬 API 調用
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setUsers(users.map((user) => (user.id === userId ? { ...user, role: newRole } : user)))

    setIsLoading(false)
    setSuccess(`用戶權限已更新為${getRoleText(newRole)}！`)
    setTimeout(() => setSuccess(""), 3000)
    refreshStats() // 更新統計數據
  }

  const handleGenerateInvitation = async () => {
    setError("")

    // 驗證表單
    if (!inviteEmail) {
      setError("請輸入電子郵件")
      return
    }

    // 檢查電子郵件格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(inviteEmail)) {
      setError("請輸入有效的電子郵件格式")
      return
    }

    // 檢查電子郵件是否已存在
    if (users.some((user) => user.email === inviteEmail)) {
      setError("此電子郵件已被使用或已發送邀請")
      return
    }

    setIsLoading(true)

    // 模擬生成邀請連結
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // 生成邀請 token（實際應用中會由後端生成）
    const invitationToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    const invitationLink = `${window.location.origin}/register?token=${invitationToken}&email=${encodeURIComponent(inviteEmail)}&role=${inviteRole}`

    const newInvitation = {
      id: Date.now().toString(),
      name: "",
      email: inviteEmail,
      department: "",
      role: "",
      status: "invited",
      joinDate: "",
      lastLogin: "",
      totalApps: 0,
      totalReviews: 0,
      totalLikes: 0,
      invitationSentAt: new Date().toLocaleString("zh-TW", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }),
      invitationLink: invitationLink,
      invitedRole: inviteRole, // 記錄邀請時的預設角色
    }

    setUsers([...users, newInvitation])
    setGeneratedInvitation(newInvitation)
    setInviteEmail("")
    setInviteRole("user")
    setIsLoading(false)
    setShowInviteUser(false)
    setShowInvitationLink(true)
  }

  const handleCopyInvitationLink = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link)
      setSuccess("邀請連結已複製到剪貼簿！")
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      setError("複製失敗，請手動複製連結")
      setTimeout(() => setError(""), 3000)
    }
  }

  const handleRegenerateInvitation = async (userId: string, email: string) => {
    setIsLoading(true)

    // 模擬重新生成邀請連結
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const newToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    const user = users.find((u) => u.id === userId)
    const role = (user as any)?.invitedRole || "user"
    const newInvitationLink = `${window.location.origin}/register?token=${newToken}&email=${encodeURIComponent(email)}&role=${role}`

    setUsers(
      users.map((user) =>
        user.id === userId
          ? {
              ...user,
              invitationLink: newInvitationLink,
              invitationSentAt: new Date().toLocaleString("zh-TW", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              }),
            }
          : user,
      ),
    )

    setIsLoading(false)
    setSuccess(`${email} 的邀請連結已重新生成！`)
    setTimeout(() => setSuccess(""), 3000)
  }

  const handleUpdateUser = async () => {
    setError("")

    if (!editUser.name || !editUser.email) {
      setError("請填寫所有必填欄位")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`/api/users/${editUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name: editUser.name,
          email: editUser.email,
          department: editUser.department,
          role: editUser.role
        })
      })

      if (response.ok) {
        const result = await response.json()
        setUsers(users.map((user) => (user.id === editUser.id ? { ...user, ...editUser } : user)))
        setShowEditUser(false)
        setSuccess("用戶資料更新成功！")
        setTimeout(() => setSuccess(""), 3000)
        refreshStats() // 更新統計數據
      } else {
        const errorData = await response.json()
        setError(errorData.error || "更新用戶資料失敗")
        setTimeout(() => setError(""), 3000)
      }
    } catch (error) {
      console.error('Error updating user:', error)
      setError("更新用戶資料失敗")
      setTimeout(() => setError(""), 3000)
    } finally {
      setIsLoading(false)
    }
  }

  const confirmDeleteUser = async () => {
    if (!userToDelete) return

    setIsLoading(true)

    try {
      const response = await fetch(`/api/users/${userToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        setUsers(users.filter((user) => user.id !== userToDelete.id))
        setShowDeleteConfirm(false)
        setUserToDelete(null)
        setSuccess("用戶刪除成功！")
        setTimeout(() => setSuccess(""), 3000)
        refreshStats() // 更新統計數據
      } else {
        const errorData = await response.json()
        setError(errorData.error || "刪除用戶失敗")
        setTimeout(() => setError(""), 3000)
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      setError("刪除用戶失敗")
      setTimeout(() => setError(""), 3000)
    } finally {
      setIsLoading(false)
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200"
      case "inactive":
        return "bg-gray-100 text-gray-800 border-gray-200"
      case "invited":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "活躍"
      case "inactive":
        return "非活躍"
      case "invited":
        return "已邀請"
      default:
        return status
    }
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
        return "待設定"
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Shield className="w-3 h-3" />
      case "developer":
        return <Code className="w-3 h-3" />
      case "user":
        return <User className="w-3 h-3" />
      default:
        return <User className="w-3 h-3" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Success/Error Messages */}
      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">用戶管理</h1>
          <p className="text-gray-600">管理平台用戶和權限</p>
        </div>
        <Button
          onClick={() => setShowInviteUser(true)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          邀請用戶
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-8 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">總用戶數</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="w-4 h-4 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">活躍用戶</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Activity className="w-4 h-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">管理員</p>
                <p className="text-2xl font-bold">{stats.admin}</p>
              </div>
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <Shield className="w-4 h-4 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">開發者</p>
                <p className="text-2xl font-bold">{stats.developer}</p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Code className="w-4 h-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">一般用戶</p>
                <p className="text-2xl font-bold">{stats.user}</p>
              </div>
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">今日新增</p>
                <p className="text-2xl font-bold">{stats.today}</p>
              </div>
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <UserPlus className="w-4 h-4 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">應用</p>
                <p className="text-2xl font-bold">{stats.totalApps}</p>
              </div>
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                <Code className="w-4 h-4 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">評價</p>
                <p className="text-2xl font-bold">{stats.totalReviews}</p>
              </div>
              <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
                <Activity className="w-4 h-4 text-pink-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="搜尋用戶姓名或電子郵件..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-3">
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="部門" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部部門</SelectItem>
                  <SelectItem value="HQBU">HQBU</SelectItem>
                  <SelectItem value="ITBU">ITBU</SelectItem>
                  <SelectItem value="MBU1">MBU1</SelectItem>
                  <SelectItem value="SBU">SBU</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="角色" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部角色</SelectItem>
                  <SelectItem value="admin">管理員</SelectItem>
                  <SelectItem value="developer">開發者</SelectItem>
                  <SelectItem value="user">一般用戶</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="狀態" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部狀態</SelectItem>
                  <SelectItem value="active">活躍</SelectItem>
                  <SelectItem value="inactive">非活躍</SelectItem>
                  <SelectItem value="invited">已邀請</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>用戶列表 ({filteredUsers.length})</CardTitle>
          <CardDescription>管理所有平台用戶</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-600">載入用戶資料中...</span>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">沒有找到用戶</p>
              <p className="text-sm text-gray-500 mt-1">嘗試調整搜尋條件或篩選器</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>用戶</TableHead>
                  <TableHead>部門</TableHead>
                  <TableHead>角色</TableHead>
                  <TableHead>狀態</TableHead>
                  <TableHead>加入日期</TableHead>
                  <TableHead>最後登入</TableHead>
                  <TableHead>統計</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm">
                          {user.name ? user.name.charAt(0) : user.email.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.name || "待註冊"}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        {user.status === "invited" && user.invitationSentAt && (
                          <p className="text-xs text-yellow-600">邀請已生成：{user.invitationSentAt}</p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-gray-100 text-gray-700">
                      {user.department || "待設定"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getRoleColor(user.role || (user as any).invitedRole)}>
                      <div className="flex items-center space-x-1">
                        {getRoleIcon(user.role || (user as any).invitedRole)}
                        <span>{getRoleText(user.role || (user as any).invitedRole)}</span>
                      </div>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusColor(user.status)}>
                      {getStatusText(user.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">{user.joinDate || "-"}</TableCell>
                  <TableCell className="text-sm text-gray-600">{user.lastLogin || "-"}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>{user.totalApps} 應用</p>
                      <p className="text-gray-500">{user.totalReviews} 評價</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" disabled={isLoading}>
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewUser(user)}>
                          <Eye className="w-4 h-4 mr-2" />
                          查看詳情
                        </DropdownMenuItem>
                        {user.status !== "invited" && (
                          <DropdownMenuItem onClick={() => handleEditUser(user)}>
                            <Edit className="w-4 h-4 mr-2" />
                            編輯用戶
                          </DropdownMenuItem>
                        )}
                        {user.status === "invited" && user.invitationLink && (
                          <>
                            <DropdownMenuItem onClick={() => handleCopyInvitationLink(user.invitationLink)}>
                              <Copy className="w-4 h-4 mr-2" />
                              複製邀請連結
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleRegenerateInvitation(user.id, user.email)}>
                              <RefreshCw className="w-4 h-4 mr-2" />
                              重新生成連結
                            </DropdownMenuItem>
                          </>
                        )}
                        {user.status !== "invited" && user.role && (
                          <DropdownMenuItem onClick={() => handleToggleUserStatus(user.id)}>
                            <Activity className="w-4 h-4 mr-2" />
                            {user.status === "active" ? "停用用戶" : "啟用用戶"}
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => handleDeleteUser(user)} className="text-red-600">
                          <Trash2 className="w-4 h-4 mr-2" />
                          刪除用戶
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          )}
        </CardContent>
      </Card>

      {/* Invite User Dialog - 包含角色選擇 */}
      <Dialog open={showInviteUser} onOpenChange={setShowInviteUser}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>邀請用戶</DialogTitle>
            <DialogDescription>生成邀請連結，手動分享給新用戶</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">電子郵件 *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="email"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="請輸入電子郵件"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">預設角色 *</Label>
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-blue-600" />
                      <span>一般用戶</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="developer">
                    <div className="flex items-center space-x-2">
                      <Code className="w-4 h-4 text-green-600" />
                      <span>開發者</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="admin">
                    <div className="flex items-center space-x-2">
                      <Shield className="w-4 h-4 text-purple-600" />
                      <span>管理員</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">用戶註冊時將自動設定為此角色</p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-start space-x-2">
                <Link className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">邀請流程說明：</p>
                  <p>
                    系統將生成專屬邀請連結，您可以複製連結並手動分享給用戶。用戶點擊連結後可自行設定姓名、部門、密碼並完成註冊。
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-1">角色權限說明：</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>
                      <strong>一般用戶：</strong>只能瀏覽和收藏應用
                    </li>
                    <li>
                      <strong>開發者：</strong>可以提交應用申請
                    </li>
                    <li>
                      <strong>管理員：</strong>可以訪問管理後台
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowInviteUser(false)} disabled={isLoading}>
                取消
              </Button>
              <Button onClick={handleGenerateInvitation} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    生成中...
                  </>
                ) : (
                  <>
                    <Link className="w-4 h-4 mr-2" />
                    生成邀請連結
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Invitation Link Dialog */}
      <Dialog open={showInvitationLink} onOpenChange={setShowInvitationLink}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span>邀請連結已生成</span>
            </DialogTitle>
            <DialogDescription>請複製以下連結並分享給用戶</DialogDescription>
          </DialogHeader>

          {generatedInvitation && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>邀請用戶</Label>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                      {generatedInvitation.email.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{generatedInvitation.email}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="outline" className={getRoleColor(generatedInvitation.invitedRole)}>
                        <div className="flex items-center space-x-1">
                          {getRoleIcon(generatedInvitation.invitedRole)}
                          <span>{getRoleText(generatedInvitation.invitedRole)}</span>
                        </div>
                      </Badge>
                      <p className="text-sm text-gray-500">生成時間：{generatedInvitation.invitationSentAt}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>邀請連結</Label>
                <div className="flex items-center space-x-2">
                  <Input value={generatedInvitation.invitationLink} readOnly className="font-mono text-sm" />
                  <Button
                    size="sm"
                    onClick={() => handleCopyInvitationLink(generatedInvitation.invitationLink)}
                    className="flex-shrink-0"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium mb-1">注意事項：</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>請將此連結安全地分享給指定用戶</li>
                      <li>連結包含用戶的電子郵件和角色資訊</li>
                      <li>用戶將自動設定為{getRoleText(generatedInvitation.invitedRole)}角色</li>
                      <li>如需重新生成連結，可在用戶列表中操作</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={() => window.open(generatedInvitation.invitationLink, "_blank")}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  預覽連結
                </Button>
                <Button onClick={() => setShowInvitationLink(false)}>完成</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={showEditUser} onOpenChange={setShowEditUser}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>編輯用戶</DialogTitle>
            <DialogDescription>修改用戶資料和權限</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editName">姓名 *</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="editName"
                  value={editUser.name}
                  onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="editEmail">電子郵件 *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="editEmail"
                  type="email"
                  value={editUser.email}
                  onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editDepartment">部門</Label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 z-10" />
                  <Select
                    value={editUser.department}
                    onValueChange={(value) => setEditUser({ ...editUser, department: value })}
                  >
                    <SelectTrigger className="pl-10">
                      <SelectValue />
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

              <div className="space-y-2">
                <Label htmlFor="editRole">角色</Label>
                <Select value={editUser.role} onValueChange={(value) => setEditUser({ ...editUser, role: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-blue-600" />
                        <span>一般用戶</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="developer">
                      <div className="flex items-center space-x-2">
                        <Code className="w-4 h-4 text-green-600" />
                        <span>開發者</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="admin">
                      <div className="flex items-center space-x-2">
                        <Shield className="w-4 h-4 text-purple-600" />
                        <span>管理員</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="editStatus">狀態</Label>
              <Select value={editUser.status} onValueChange={(value) => setEditUser({ ...editUser, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">活躍</SelectItem>
                  <SelectItem value="inactive">非活躍</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowEditUser(false)} disabled={isLoading}>
                取消
              </Button>
              <Button onClick={handleUpdateUser} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    更新中...
                  </>
                ) : (
                  "更新用戶"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600">確認刪除用戶</DialogTitle>
            <DialogDescription>
              此操作無法復原。確定要刪除用戶「{userToDelete?.name || userToDelete?.email}」嗎？
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)} disabled={isLoading}>
              取消
            </Button>
            <Button variant="destructive" onClick={confirmDeleteUser} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  刪除中...
                </>
              ) : (
                "確認刪除"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* User Detail Dialog */}
      <Dialog open={showUserDetail} onOpenChange={setShowUserDetail}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>用戶詳情</DialogTitle>
            <DialogDescription>查看用戶的詳細資訊和活動記錄</DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <Tabs defaultValue="info" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="info">基本資訊</TabsTrigger>
                <TabsTrigger value="activity">活動記錄</TabsTrigger>
                <TabsTrigger value="stats">統計數據</TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="w-16 h-16">
                    <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xl">
                      {selectedUser.name ? selectedUser.name.charAt(0) : selectedUser.email.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold">{selectedUser.name || "待註冊用戶"}</h3>
                    <p className="text-gray-600">{selectedUser.email}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge
                        variant="outline"
                        className={getRoleColor(selectedUser.role || (selectedUser as any).invitedRole)}
                      >
                        <div className="flex items-center space-x-1">
                          {getRoleIcon(selectedUser.role || (selectedUser as any).invitedRole)}
                          <span>{getRoleText(selectedUser.role || (selectedUser as any).invitedRole)}</span>
                        </div>
                      </Badge>
                      <Badge variant="outline" className={getStatusColor(selectedUser.status)}>
                        {getStatusText(selectedUser.status)}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">部門</p>
                    <p className="font-medium">{selectedUser.department || "待設定"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">加入日期</p>
                    <p className="font-medium">{selectedUser.joinDate || "尚未註冊"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">最後登入</p>
                    <p className="font-medium">{selectedUser.lastLogin || "尚未登入"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">用戶ID</p>
                    <p className="font-medium">{selectedUser.id}</p>
                  </div>
                  {selectedUser.status === "invited" && selectedUser.invitationSentAt && (
                    <>
                      <div>
                        <p className="text-sm text-gray-500">邀請生成時間</p>
                        <p className="font-medium">{selectedUser.invitationSentAt}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">邀請狀態</p>
                        <p className="font-medium text-yellow-600">等待用戶註冊</p>
                      </div>
                    </>
                  )}
                </div>

                {selectedUser.status === "invited" && selectedUser.invitationLink && (
                  <div className="space-y-2">
                    <Label>邀請連結</Label>
                    <div className="flex items-center space-x-2">
                      <Input value={selectedUser.invitationLink} readOnly className="font-mono text-sm" />
                      <Button
                        size="sm"
                        onClick={() => handleCopyInvitationLink(selectedUser.invitationLink)}
                        className="flex-shrink-0"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="activity" className="space-y-4">
                {selectedUser.status === "invited" ? (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">用戶尚未註冊，暫無活動記錄</p>
                  </div>
                ) : selectedUser.activities && selectedUser.activities.length > 0 ? (
                  <div className="space-y-3">
                    {selectedUser.activities.map((activity: any, index: number) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        {activity.type === 'login' ? (
                          <Calendar className="w-4 h-4 text-blue-600" />
                        ) : activity.type === 'view_app' ? (
                          <Eye className="w-4 h-4 text-green-600" />
                        ) : activity.type === 'create_app' ? (
                          <Code className="w-4 h-4 text-purple-600" />
                        ) : activity.type === 'review' ? (
                          <Activity className="w-4 h-4 text-orange-600" />
                        ) : (
                          <Activity className="w-4 h-4 text-gray-600" />
                        )}
                        <div>
                          <p className="text-sm font-medium">{activity.description}</p>
                          <p className="text-xs text-gray-500">{activity.timestamp}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">暫無活動記錄</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="stats" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">{selectedUser.totalApps}</p>
                        <p className="text-sm text-gray-600">創建應用</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">{selectedUser.totalReviews}</p>
                        <p className="text-sm text-gray-600">撰寫評價</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-purple-600">{selectedUser.totalLikes}</p>
                        <p className="text-sm text-gray-600">獲得讚數</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-orange-600">
                          {selectedUser.status === "invited" ? 0 : (selectedUser.loginDays || 0)}
                        </p>
                        <p className="text-sm text-gray-600">登入天數</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
