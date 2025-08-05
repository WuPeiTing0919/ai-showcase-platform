"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Star,
  Heart,
  TrendingUp,
  Bot,
  CheckCircle,
  Clock,
  MessageSquare,
  ExternalLink,
  AlertTriangle,
  X,
  Check,
  TrendingDown,
  Link,
  Zap,
  Brain,
  Mic,
  ImageIcon,
  FileText,
  BarChart3,
  Camera,
  Music,
  Video,
  Code,
  Database,
  Globe,
  Smartphone,
  Monitor,
  Headphones,
  Palette,
  Calculator,
  Shield,
  Settings,
  Lightbulb,
} from "lucide-react"

// Add available icons array after imports
const availableIcons = [
  { name: "Bot", icon: Bot, color: "from-blue-500 to-purple-500" },
  { name: "Brain", icon: Brain, color: "from-purple-500 to-pink-500" },
  { name: "Zap", icon: Zap, color: "from-yellow-500 to-orange-500" },
  { name: "Mic", icon: Mic, color: "from-green-500 to-teal-500" },
  { name: "ImageIcon", icon: ImageIcon, color: "from-pink-500 to-rose-500" },
  { name: "FileText", icon: FileText, color: "from-blue-500 to-cyan-500" },
  { name: "BarChart3", icon: BarChart3, color: "from-emerald-500 to-green-500" },
  { name: "Camera", icon: Camera, color: "from-indigo-500 to-purple-500" },
  { name: "Music", icon: Music, color: "from-violet-500 to-purple-500" },
  { name: "Video", icon: Video, color: "from-red-500 to-pink-500" },
  { name: "Code", icon: Code, color: "from-gray-500 to-slate-500" },
  { name: "Database", icon: Database, color: "from-cyan-500 to-blue-500" },
  { name: "Globe", icon: Globe, color: "from-blue-500 to-indigo-500" },
  { name: "Smartphone", icon: Smartphone, color: "from-slate-500 to-gray-500" },
  { name: "Monitor", icon: Monitor, color: "from-gray-600 to-slate-600" },
  { name: "Headphones", icon: Headphones, color: "from-purple-500 to-violet-500" },
  { name: "Palette", icon: Palette, color: "from-pink-500 to-purple-500" },
  { name: "Calculator", icon: Calculator, color: "from-orange-500 to-red-500" },
  { name: "Shield", icon: Shield, color: "from-green-500 to-emerald-500" },
  { name: "Settings", icon: Settings, color: "from-gray-500 to-zinc-500" },
  { name: "Lightbulb", icon: Lightbulb, color: "from-yellow-500 to-amber-500" },
]

// App data - empty for production
const mockApps: any[] = []

export function AppManagement() {
  const [apps, setApps] = useState(mockApps)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedApp, setSelectedApp] = useState<any>(null)
  const [showAppDetail, setShowAppDetail] = useState(false)
  const [showAddApp, setShowAddApp] = useState(false)
  const [showEditApp, setShowEditApp] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showApprovalDialog, setShowApprovalDialog] = useState(false)
  const [approvalAction, setApprovalAction] = useState<"approve" | "reject">("approve")
  const [approvalReason, setApprovalReason] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalApps, setTotalApps] = useState(0)
  const [stats, setStats] = useState({
    published: 0,
    pending: 0,
    draft: 0,
    rejected: 0
  })
  const itemsPerPage = 10
  const [newApp, setNewApp] = useState({
    name: "",
    type: "文字處理",
    department: "HQBU",
    creator: "",
    description: "",
    appUrl: "",
    icon: "Bot",
    iconColor: "from-blue-500 to-purple-500",
  })

  // 載入應用程式
  useEffect(() => {
    const loadApps = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem('token')
        
        if (!token) {
          console.log('未找到 token，跳過載入應用程式')
          setLoading(false)
          return
        }

        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: itemsPerPage.toString()
        })
        
        if (searchTerm) {
          params.append('search', searchTerm)
        }
        if (selectedType !== 'all') {
          params.append('type', mapTypeToApiType(selectedType))
        }
        if (selectedStatus !== 'all') {
          params.append('status', selectedStatus)
        }
        
        const response = await fetch(`/api/apps?${params.toString()}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (!response.ok) {
          throw new Error(`載入應用程式失敗: ${response.status}`)
        }

        const data = await response.json()
        console.log('載入的應用程式:', data)
        
        // 轉換 API 資料格式為前端期望的格式
        const formattedApps = (data.apps || []).map((app: any) => ({
          ...app,
          creator: app.creator?.name || '未知',
          department: app.creator?.department || '未知',
          views: app.viewsCount || 0,
          likes: app.likesCount || 0,
          appUrl: app.demoUrl || '',
          type: mapApiTypeToDisplayType(app.type), // 將 API 類型轉換為中文顯示
          icon: 'Bot',
          iconColor: 'from-blue-500 to-purple-500',
          reviews: 0, // API 中沒有評論數，設為 0
          createdAt: app.createdAt ? new Date(app.createdAt).toLocaleDateString() : '未知'
        }))
        
        console.log('格式化後的應用程式:', formattedApps)
        setApps(formattedApps)
        
        // 更新分頁資訊和統計
        if (data.pagination) {
          setTotalPages(data.pagination.totalPages)
          setTotalApps(data.pagination.total)
        }
        if (data.stats) {
          setStats(data.stats)
        }
      } catch (error) {
        console.error('載入應用程式失敗:', error)
      } finally {
        setLoading(false)
      }
    }

    loadApps()
  }, [currentPage, searchTerm, selectedType, selectedStatus])

  // 當過濾條件改變時，重置到第一頁
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedType, selectedStatus])

  // 使用從 API 返回的應用程式，因為過濾已在服務器端完成
  const filteredApps = apps

  const handleViewApp = (app: any) => {
    setSelectedApp(app)
    setShowAppDetail(true)
  }

  const handleEditApp = (app: any) => {
    setSelectedApp(app)
    setNewApp({
      name: app.name,
      type: app.type,
      department: app.department,
      creator: app.creator,
      description: app.description,
      appUrl: app.appUrl,
      icon: app.icon || "Bot",
      iconColor: app.iconColor || "from-blue-500 to-purple-500",
    })
    setShowEditApp(true)
  }

  const handleDeleteApp = (app: any) => {
    setSelectedApp(app)
    setShowDeleteConfirm(true)
  }

  const confirmDeleteApp = () => {
    if (selectedApp) {
      setApps(apps.filter((app) => app.id !== selectedApp.id))
      setShowDeleteConfirm(false)
      setSelectedApp(null)
    }
  }

  const handleToggleAppStatus = (appId: string) => {
    setApps(
      apps.map((app) =>
        app.id === appId
          ? {
              ...app,
              status: app.status === "published" ? "draft" : "published",
            }
          : app,
      ),
    )
  }

  const handleApprovalAction = (app: any, action: "approve" | "reject") => {
    setSelectedApp(app)
    setApprovalAction(action)
    setApprovalReason("")
    setShowApprovalDialog(true)
  }

  const confirmApproval = async () => {
    if (selectedApp) {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          throw new Error('未找到認證 token，請重新登入')
        }

        // 準備更新資料
        const updateData = {
          status: approvalAction === "approve" ? "published" : "rejected"
        }

        // 如果有備註或原因，可以添加到描述中或創建一個新的欄位
        if (approvalReason.trim()) {
          // 這裡可以根據需要添加備註欄位
          console.log(`${approvalAction === "approve" ? "批准備註" : "拒絕原因"}:`, approvalReason)
        }

        const response = await fetch(`/api/apps/${selectedApp.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(updateData)
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || `更新失敗: ${response.status}`)
        }

        // 更新本地狀態
        setApps(
          apps.map((app) =>
            app.id === selectedApp.id
              ? {
                  ...app,
                  status: approvalAction === "approve" ? "published" : "rejected",
                }
              : app,
          ),
        )

        // 顯示成功訊息
        alert(`應用程式已${approvalAction === "approve" ? "批准" : "拒絕"}`)
        
        setShowApprovalDialog(false)
        setSelectedApp(null)
        setApprovalReason("")
      } catch (error) {
        console.error('更新應用程式狀態失敗:', error)
        const errorMessage = error instanceof Error ? error.message : '未知錯誤'
        alert(`更新失敗: ${errorMessage}`)
      }
    }
  }

  const handleAddApp = async () => {
    try {
      // 準備應用程式資料
      const appData = {
        name: newApp.name,
        description: newApp.description,
        type: mapTypeToApiType(newApp.type),
        demoUrl: newApp.appUrl || undefined,
        version: '1.0.0'
      }

      console.log('準備提交的應用資料:', appData)

      // 調用 API 創建應用程式
      const token = localStorage.getItem('token')
      console.log('Token:', token ? '存在' : '不存在')

      if (!token) {
        throw new Error('未找到認證 token，請重新登入')
      }

      const response = await fetch('/api/apps', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(appData)
      })

      console.log('API 回應狀態:', response.status, response.statusText)

      if (!response.ok) {
        const errorData = await response.json()
        console.error('API 錯誤詳情:', errorData)
        throw new Error(errorData.error || `API 錯誤: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()
      console.log('應用程式創建成功:', result)

      // 更新本地狀態
      const app = {
        id: result.appId || Date.now().toString(),
        ...newApp,
        status: result.app?.status || "draft", // 使用 API 返回的狀態
        createdAt: new Date().toISOString().split("T")[0],
        views: 0,
        likes: 0,
        rating: 0,
        reviews: 0,
      }
      setApps([...apps, app])
      setNewApp({
        name: "",
        type: "文字處理",
        department: "HQBU",
        creator: "",
        description: "",
        appUrl: "",
        icon: "Bot",
        iconColor: "from-blue-500 to-purple-500",
      })
      setShowAddApp(false)

    } catch (error) {
      console.error('創建應用程式失敗:', error)
      const errorMessage = error instanceof Error ? error.message : '未知錯誤'
      alert(`創建應用程式失敗: ${errorMessage}`)
    }
  }

  // 將前端類型映射到 API 類型
  const mapTypeToApiType = (frontendType: string): string => {
    const typeMap: Record<string, string> = {
      '文字處理': 'productivity',
      '圖像生成': 'ai_model',
      '圖像處理': 'ai_model',
      '語音辨識': 'ai_model',
      '推薦系統': 'ai_model',
      '音樂生成': 'ai_model',
      '程式開發': 'automation',
      '影像處理': 'ai_model',
      '對話系統': 'ai_model',
      '數據分析': 'data_analysis',
      '設計工具': 'productivity',
      '語音技術': 'ai_model',
      '教育工具': 'educational',
      '健康醫療': 'healthcare',
      '金融科技': 'finance',
      '物聯網': 'iot_device',
      '區塊鏈': 'blockchain',
      'AR/VR': 'ar_vr',
      '機器學習': 'machine_learning',
      '電腦視覺': 'computer_vision',
      '自然語言處理': 'nlp',
      '機器人': 'robotics',
      '網路安全': 'cybersecurity',
      '雲端服務': 'cloud_service',
      '其他': 'other'
    }
    return typeMap[frontendType] || 'other'
  }

  // 將 API 類型映射到前端顯示的中文類型
  const mapApiTypeToDisplayType = (apiType: string): string => {
    const typeMap: Record<string, string> = {
      'productivity': '文字處理',
      'ai_model': '圖像生成',
      'automation': '程式開發',
      'data_analysis': '數據分析',
      'educational': '教育工具',
      'healthcare': '健康醫療',
      'finance': '金融科技',
      'iot_device': '物聯網',
      'blockchain': '區塊鏈',
      'ar_vr': 'AR/VR',
      'machine_learning': '機器學習',
      'computer_vision': '電腦視覺',
      'nlp': '自然語言處理',
      'robotics': '機器人',
      'cybersecurity': '網路安全',
      'cloud_service': '雲端服務',
      'other': '其他'
    }
    return typeMap[apiType] || '其他'
  }

  const handleUpdateApp = () => {
    if (selectedApp) {
      setApps(
        apps.map((app) =>
          app.id === selectedApp.id
            ? {
                ...app,
                ...newApp,
              }
            : app,
        ),
      )
      setShowEditApp(false)
      setSelectedApp(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800 border-green-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "draft":
        return "bg-gray-100 text-gray-800 border-gray-200"
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getTypeColor = (type: string) => {
    const colors = {
      文字處理: "bg-blue-100 text-blue-800 border-blue-200",
      圖像生成: "bg-purple-100 text-purple-800 border-purple-200",
      圖像處理: "bg-purple-100 text-purple-800 border-purple-200",
      語音辨識: "bg-green-100 text-green-800 border-green-200",
      推薦系統: "bg-orange-100 text-orange-800 border-orange-200",
      音樂生成: "bg-pink-100 text-pink-800 border-pink-200",
      程式開發: "bg-indigo-100 text-indigo-800 border-indigo-200",
      影像處理: "bg-purple-100 text-purple-800 border-purple-200",
      對話系統: "bg-teal-100 text-teal-800 border-teal-200",
      數據分析: "bg-cyan-100 text-cyan-800 border-cyan-200",
      設計工具: "bg-blue-100 text-blue-800 border-blue-200",
      語音技術: "bg-green-100 text-green-800 border-green-200",
      教育工具: "bg-emerald-100 text-emerald-800 border-emerald-200",
      健康醫療: "bg-red-100 text-red-800 border-red-200",
      金融科技: "bg-yellow-100 text-yellow-800 border-yellow-200",
      物聯網: "bg-slate-100 text-slate-800 border-slate-200",
      區塊鏈: "bg-violet-100 text-violet-800 border-violet-200",
      'AR/VR': "bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200",
      機器學習: "bg-rose-100 text-rose-800 border-rose-200",
      電腦視覺: "bg-purple-100 text-purple-800 border-purple-200",
      自然語言處理: "bg-teal-100 text-teal-800 border-teal-200",
      機器人: "bg-gray-100 text-gray-800 border-gray-200",
      網路安全: "bg-red-100 text-red-800 border-red-200",
      雲端服務: "bg-sky-100 text-sky-800 border-sky-200",
      其他: "bg-gray-100 text-gray-800 border-gray-200"
    }
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800 border-gray-200"
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "published":
        return "已發布"
      case "pending":
        return "待審核"
      case "draft":
        return "草稿"
      case "rejected":
        return "已拒絕"
      default:
        return status
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">應用管理</h1>
          <p className="text-gray-600">管理平台上的所有 AI 應用</p>
        </div>
        <Button
          onClick={() => setShowAddApp(true)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          新增應用
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">總應用數</p>
                <p className="text-2xl font-bold">{totalApps}</p>
              </div>
              <Bot className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">已發布</p>
                <p className="text-2xl font-bold">{stats.published}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">待審核</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
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
                placeholder="搜尋應用名稱或創建者..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-3">
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="類型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部類型</SelectItem>
                  <SelectItem value="文字處理">文字處理</SelectItem>
                  <SelectItem value="圖像生成">圖像生成</SelectItem>
                  <SelectItem value="圖像處理">圖像處理</SelectItem>
                  <SelectItem value="語音辨識">語音辨識</SelectItem>
                  <SelectItem value="推薦系統">推薦系統</SelectItem>
                  <SelectItem value="音樂生成">音樂生成</SelectItem>
                  <SelectItem value="程式開發">程式開發</SelectItem>
                  <SelectItem value="影像處理">影像處理</SelectItem>
                  <SelectItem value="對話系統">對話系統</SelectItem>
                  <SelectItem value="數據分析">數據分析</SelectItem>
                  <SelectItem value="設計工具">設計工具</SelectItem>
                  <SelectItem value="語音技術">語音技術</SelectItem>
                  <SelectItem value="教育工具">教育工具</SelectItem>
                  <SelectItem value="健康醫療">健康醫療</SelectItem>
                  <SelectItem value="金融科技">金融科技</SelectItem>
                  <SelectItem value="物聯網">物聯網</SelectItem>
                  <SelectItem value="區塊鏈">區塊鏈</SelectItem>
                  <SelectItem value="AR/VR">AR/VR</SelectItem>
                  <SelectItem value="機器學習">機器學習</SelectItem>
                  <SelectItem value="電腦視覺">電腦視覺</SelectItem>
                  <SelectItem value="自然語言處理">自然語言處理</SelectItem>
                  <SelectItem value="機器人">機器人</SelectItem>
                  <SelectItem value="網路安全">網路安全</SelectItem>
                  <SelectItem value="雲端服務">雲端服務</SelectItem>
                  <SelectItem value="其他">其他</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="狀態" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部狀態</SelectItem>
                  <SelectItem value="published">已發布</SelectItem>
                  <SelectItem value="pending">待審核</SelectItem>
                  <SelectItem value="draft">草稿</SelectItem>
                  <SelectItem value="rejected">已拒絕</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Apps Table */}
      <Card>
        <CardHeader>
          <CardTitle>應用列表 ({totalApps})</CardTitle>
          <CardDescription>管理所有 AI 應用</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>應用名稱</TableHead>
                <TableHead>類型</TableHead>
                <TableHead>創建者</TableHead>
                <TableHead>狀態</TableHead>
                <TableHead>統計</TableHead>
                <TableHead>評分</TableHead>
                <TableHead>創建日期</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      <span className="text-gray-600">載入應用程式中...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredApps.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="text-gray-500">
                      <Bot className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium">尚無應用程式</p>
                      <p className="text-sm">點擊右上角的「新增應用」按鈕來創建第一個應用程式</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredApps.map((app) => (
                <TableRow key={app.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-8 h-8 bg-gradient-to-r ${app.iconColor} rounded-lg flex items-center justify-center`}
                      >
                        {(() => {
                          const IconComponent = availableIcons.find((icon) => icon.name === app.icon)?.icon || Bot
                          return <IconComponent className="w-4 h-4 text-white" />
                        })()}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="font-medium">{app.name}</p>
                          {app.appUrl && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => window.open(app.appUrl, "_blank")}
                              title="開啟應用"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getTypeColor(app.type)}>
                      {app.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{app.creator}</p>
                      <p className="text-sm text-gray-500">{app.department}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusColor(app.status)}>
                      {getStatusText(app.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="flex items-center space-x-1">
                        <Eye className="w-3 h-3" />
                        <span>{app.views}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Heart className="w-3 h-3" />
                        <span>{app.likes}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="font-medium">{app.rating}</span>
                      <span className="text-sm text-gray-500">({app.reviews})</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">{app.createdAt}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewApp(app)}>
                          <Eye className="w-4 h-4 mr-2" />
                          查看詳情
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditApp(app)}>
                          <Edit className="w-4 h-4 mr-2" />
                          編輯應用
                        </DropdownMenuItem>
                        {app.appUrl && (
                          <DropdownMenuItem onClick={() => window.open(app.appUrl, "_blank")}>
                            <ExternalLink className="w-4 h-4 mr-2" />
                            開啟應用
                          </DropdownMenuItem>
                        )}
                        {app.status === "pending" && (
                          <>
                            <DropdownMenuItem onClick={() => handleApprovalAction(app, "approve")}>
                              <Check className="w-4 h-4 mr-2" />
                              批准發布
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleApprovalAction(app, "reject")}>
                              <X className="w-4 h-4 mr-2" />
                              拒絕申請
                            </DropdownMenuItem>
                          </>
                        )}
                        {app.status !== "pending" && (
                          <DropdownMenuItem onClick={() => handleToggleAppStatus(app.id)}>
                            {app.status === "published" ? (
                              <>
                                <TrendingDown className="w-4 h-4 mr-2" />
                                下架應用
                              </>
                            ) : (
                              <>
                                <TrendingUp className="w-4 h-4 mr-2" />
                                發布應用
                              </>
                            )}
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteApp(app)}>
                          <Trash2 className="w-4 h-4 mr-2" />
                          刪除應用
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                顯示第 {((currentPage - 1) * itemsPerPage) + 1} 到 {Math.min(currentPage * itemsPerPage, totalApps)} 筆，共 {totalApps} 筆
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  上一頁
                </Button>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + 1
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className="w-8 h-8"
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  下一頁
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add App Dialog */}
      <Dialog open={showAddApp} onOpenChange={setShowAddApp}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>新增 AI 應用</DialogTitle>
            <DialogDescription>創建一個新的 AI 應用</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">應用名稱 *</Label>
                <Input
                  id="name"
                  value={newApp.name}
                  onChange={(e) => setNewApp({ ...newApp, name: e.target.value })}
                  placeholder="輸入應用名稱"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="creator">創建者 *</Label>
                <Input
                  id="creator"
                  value={newApp.creator}
                  onChange={(e) => setNewApp({ ...newApp, creator: e.target.value })}
                  placeholder="輸入創建者姓名"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">應用類型</Label>
                <Select value={newApp.type} onValueChange={(value) => setNewApp({ ...newApp, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="文字處理">文字處理</SelectItem>
                    <SelectItem value="圖像生成">圖像生成</SelectItem>
                    <SelectItem value="圖像處理">圖像處理</SelectItem>
                    <SelectItem value="語音辨識">語音辨識</SelectItem>
                    <SelectItem value="推薦系統">推薦系統</SelectItem>
                    <SelectItem value="音樂生成">音樂生成</SelectItem>
                    <SelectItem value="程式開發">程式開發</SelectItem>
                    <SelectItem value="影像處理">影像處理</SelectItem>
                    <SelectItem value="對話系統">對話系統</SelectItem>
                    <SelectItem value="數據分析">數據分析</SelectItem>
                    <SelectItem value="設計工具">設計工具</SelectItem>
                    <SelectItem value="語音技術">語音技術</SelectItem>
                    <SelectItem value="教育工具">教育工具</SelectItem>
                    <SelectItem value="健康醫療">健康醫療</SelectItem>
                    <SelectItem value="金融科技">金融科技</SelectItem>
                    <SelectItem value="物聯網">物聯網</SelectItem>
                    <SelectItem value="區塊鏈">區塊鏈</SelectItem>
                    <SelectItem value="AR/VR">AR/VR</SelectItem>
                    <SelectItem value="機器學習">機器學習</SelectItem>
                    <SelectItem value="電腦視覺">電腦視覺</SelectItem>
                    <SelectItem value="自然語言處理">自然語言處理</SelectItem>
                    <SelectItem value="機器人">機器人</SelectItem>
                    <SelectItem value="網路安全">網路安全</SelectItem>
                    <SelectItem value="雲端服務">雲端服務</SelectItem>
                    <SelectItem value="其他">其他</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">所屬部門</Label>
                <Select
                  value={newApp.department}
                  onValueChange={(value) => setNewApp({ ...newApp, department: value })}
                >
                  <SelectTrigger>
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
              <Label htmlFor="icon">應用圖示</Label>
              <div className="grid grid-cols-7 gap-2 p-4 border rounded-lg max-h-60 overflow-y-auto bg-gray-50">
                {availableIcons.map((iconOption) => {
                  const IconComponent = iconOption.icon
                  return (
                    <button
                      key={iconOption.name}
                      type="button"
                      onClick={() => {
                        setNewApp({
                          ...newApp,
                          icon: iconOption.name,
                          iconColor: iconOption.color,
                        })
                      }}
                      className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all hover:scale-105 ${
                        newApp.icon === iconOption.name
                          ? `bg-gradient-to-r ${iconOption.color} shadow-lg ring-2 ring-blue-500`
                          : `bg-gradient-to-r ${iconOption.color} opacity-70 hover:opacity-100`
                      }`}
                      title={iconOption.name}
                    >
                      <IconComponent className="w-6 h-6 text-white" />
                    </button>
                  )
                })}
              </div>
              <p className="text-xs text-gray-500">選擇一個代表您應用的圖示</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="appUrl">應用連結</Label>
              <div className="relative">
                <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="appUrl"
                  value={newApp.appUrl}
                  onChange={(e) => setNewApp({ ...newApp, appUrl: e.target.value })}
                  placeholder="https://your-app.example.com"
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-gray-500">用戶點擊應用時將跳轉到此連結</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">應用描述 *</Label>
              <Textarea
                id="description"
                value={newApp.description}
                onChange={(e) => setNewApp({ ...newApp, description: e.target.value })}
                placeholder="描述應用的功能和特色"
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowAddApp(false)}>
                取消
              </Button>
              <Button onClick={handleAddApp} disabled={!newApp.name || !newApp.creator || !newApp.description}>
                創建應用
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit App Dialog */}
      <Dialog open={showEditApp} onOpenChange={setShowEditApp}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>編輯應用</DialogTitle>
            <DialogDescription>修改應用資訊</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">應用名稱 *</Label>
                <Input
                  id="edit-name"
                  value={newApp.name}
                  onChange={(e) => setNewApp({ ...newApp, name: e.target.value })}
                  placeholder="輸入應用名稱"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-creator">創建者 *</Label>
                <Input
                  id="edit-creator"
                  value={newApp.creator}
                  onChange={(e) => setNewApp({ ...newApp, creator: e.target.value })}
                  placeholder="輸入創建者姓名"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-type">應用類型</Label>
                <Select value={newApp.type} onValueChange={(value) => setNewApp({ ...newApp, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="文字處理">文字處理</SelectItem>
                    <SelectItem value="圖像生成">圖像生成</SelectItem>
                    <SelectItem value="語音辨識">語音辨識</SelectItem>
                    <SelectItem value="推薦系統">推薦系統</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-department">所屬部門</Label>
                <Select
                  value={newApp.department}
                  onValueChange={(value) => setNewApp({ ...newApp, department: value })}
                >
                  <SelectTrigger>
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
              <Label htmlFor="icon">應用圖示</Label>
              <div className="grid grid-cols-7 gap-2 p-4 border rounded-lg max-h-60 overflow-y-auto bg-gray-50">
                {availableIcons.map((iconOption) => {
                  const IconComponent = iconOption.icon
                  return (
                    <button
                      key={iconOption.name}
                      type="button"
                      onClick={() => {
                        setNewApp({
                          ...newApp,
                          icon: iconOption.name,
                          iconColor: iconOption.color,
                        })
                      }}
                      className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all hover:scale-105 ${
                        newApp.icon === iconOption.name
                          ? `bg-gradient-to-r ${iconOption.color} shadow-lg ring-2 ring-blue-500`
                          : `bg-gradient-to-r ${iconOption.color} opacity-70 hover:opacity-100`
                      }`}
                      title={iconOption.name}
                    >
                      <IconComponent className="w-6 h-6 text-white" />
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-appUrl">應用連結</Label>
              <div className="relative">
                <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="edit-appUrl"
                  value={newApp.appUrl}
                  onChange={(e) => setNewApp({ ...newApp, appUrl: e.target.value })}
                  placeholder="https://your-app.example.com"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">應用描述 *</Label>
              <Textarea
                id="edit-description"
                value={newApp.description}
                onChange={(e) => setNewApp({ ...newApp, description: e.target.value })}
                placeholder="描述應用的功能和特色"
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowEditApp(false)}>
                取消
              </Button>
              <Button onClick={handleUpdateApp} disabled={!newApp.name || !newApp.creator || !newApp.description}>
                更新應用
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <span>確認刪除</span>
            </DialogTitle>
            <DialogDescription>您確定要刪除應用「{selectedApp?.name}」嗎？此操作無法復原。</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
              取消
            </Button>
            <Button variant="destructive" onClick={confirmDeleteApp}>
              確認刪除
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Approval Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              {approvalAction === "approve" ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <X className="w-5 h-5 text-red-500" />
              )}
              <span>{approvalAction === "approve" ? "批准應用" : "拒絕應用"}</span>
            </DialogTitle>
            <DialogDescription>
              {approvalAction === "approve"
                ? `確認批准應用「${selectedApp?.name}」並發布到平台？`
                : `確認拒絕應用「${selectedApp?.name}」的發布申請？`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="approval-reason">
                {approvalAction === "approve" ? "批准備註（可選）" : "拒絕原因 *"}
              </Label>
              <Textarea
                id="approval-reason"
                value={approvalReason}
                onChange={(e) => setApprovalReason(e.target.value)}
                placeholder={approvalAction === "approve" ? "輸入批准備註..." : "請說明拒絕原因，以便開發者了解並改進"}
                rows={3}
              />
            </div>
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowApprovalDialog(false)}>
                取消
              </Button>
              <Button
                onClick={confirmApproval}
                variant={approvalAction === "approve" ? "default" : "destructive"}
                disabled={approvalAction === "reject" && !approvalReason.trim()}
              >
                {approvalAction === "approve" ? "確認批准" : "確認拒絕"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* App Detail Dialog */}
      <Dialog open={showAppDetail} onOpenChange={setShowAppDetail}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>應用詳情</DialogTitle>
            <DialogDescription>查看應用的詳細資訊和統計數據</DialogDescription>
          </DialogHeader>

          {selectedApp && (
            <Tabs defaultValue="info" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="info">基本資訊</TabsTrigger>
                <TabsTrigger value="stats">統計數據</TabsTrigger>
                <TabsTrigger value="reviews">評價管理</TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div
                    className={`w-16 h-16 bg-gradient-to-r ${selectedApp.iconColor} rounded-xl flex items-center justify-center`}
                  >
                    {(() => {
                      const IconComponent = availableIcons.find((icon) => icon.name === selectedApp.icon)?.icon || Bot
                      return <IconComponent className="w-8 h-8 text-white" />
                    })()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-xl font-semibold">{selectedApp.name}</h3>
                      {selectedApp.appUrl && (
                        <Button variant="outline" size="sm" onClick={() => window.open(selectedApp.appUrl, "_blank")}>
                          <ExternalLink className="w-4 h-4 mr-2" />
                          開啟應用
                        </Button>
                      )}
                    </div>
                    <p className="text-gray-600 mb-2">{selectedApp.description}</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className={getTypeColor(selectedApp.type)}>
                        {selectedApp.type}
                      </Badge>
                      <Badge variant="outline" className="bg-gray-100 text-gray-700">
                        {selectedApp.department}
                      </Badge>
                      <Badge variant="outline" className={getStatusColor(selectedApp.status)}>
                        {getStatusText(selectedApp.status)}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">創建者</p>
                    <p className="font-medium">{selectedApp.creator}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">創建日期</p>
                    <p className="font-medium">{selectedApp.createdAt}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">應用ID</p>
                    <p className="font-medium">{selectedApp.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">所屬部門</p>
                    <p className="font-medium">{selectedApp.department}</p>
                  </div>
                </div>

                {selectedApp.appUrl && (
                  <div>
                    <p className="text-sm text-gray-500">應用連結</p>
                    <div className="flex items-center space-x-2">
                      <p className="font-medium text-blue-600">{selectedApp.appUrl}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigator.clipboard.writeText(selectedApp.appUrl)}
                      >
                        複製
                      </Button>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="stats" className="space-y-4">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">{selectedApp.views}</p>
                        <p className="text-sm text-gray-600">總瀏覽量</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-red-600">{selectedApp.likes}</p>
                        <p className="text-sm text-gray-600">收藏數</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-yellow-600">{selectedApp.rating}</p>
                        <p className="text-sm text-gray-600">平均評分</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">{selectedApp.reviews}</p>
                        <p className="text-sm text-gray-600">評價數量</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="space-y-4">
                <div className="text-center py-8">
                  <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">評價管理</h3>
                  <p className="text-gray-500">此功能將顯示應用的所有評價和管理選項</p>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
