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
    type: "",
    department: "",
    creator: "",
    description: "",
    appUrl: "",
    icon: "",
    iconColor: "",
  })

  // 重置 newApp 狀態到初始值
  const resetNewApp = () => {
    setNewApp({
      name: "",
      type: "",
      department: "",
      creator: "",
      description: "",
      appUrl: "",
      icon: "",
      iconColor: "",
    })
  }

  // 優化：為匿名用戶提供更靈活的部門處理
  // 部門信息不再完全依賴用戶帳戶，允許匿名用戶查看和過濾
  const getDepartmentOptions = () => {
    return [
      { value: "HQBU", label: "HQBU" },
      { value: "ITBU", label: "ITBU" },
      { value: "MBU1", label: "MBU1" },
      { value: "SBU", label: "SBU" },
      { value: "其他", label: "其他" } // 新增選項，適合匿名用戶
    ]
  }

  // 載入應用程式
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
        views: app.viewsCount || 0,
        likes: app.likesCount || 0,
        appUrl: app.demoUrl || '',
        type: mapApiTypeToDisplayType(app.type), // 將 API 類型轉換為中文顯示
        icon: app.icon || 'Bot',
        iconColor: app.iconColor || 'from-blue-500 to-purple-500',
        reviews: 0, // API 中沒有評論數，設為 0
        createdAt: app.createdAt ? new Date(app.createdAt).toLocaleDateString() : '未知',
        // 處理 creator 物件，確保正確顯示創建者名稱
        creator: typeof app.creator === 'object' ? app.creator.name : app.creator,
        department: typeof app.creator === 'object' ? app.creator.department : app.department
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

  useEffect(() => {
    loadApps()
  }, [currentPage, searchTerm, selectedType, selectedStatus])

  // 當過濾條件改變時，重置到第一頁
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedType, selectedStatus])

  // Debug: Monitor edit dialog state
  useEffect(() => {
    if (showEditApp) {
      console.log('Edit dialog opened - newApp:', newApp)
    }
  }, [showEditApp, newApp])

  // 使用從 API 返回的應用程式，因為過濾已在服務器端完成
  const filteredApps = apps

  const handleViewApp = async (app: any) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('未找到認證 token，請重新登入')
      }

      // Fetch detailed app information from API
      const response = await fetch(`/api/apps/${app.id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `獲取應用詳情失敗: ${response.status}`)
      }

      const detailedApp = await response.json()
      setSelectedApp(detailedApp)
      setShowAppDetail(true)
    } catch (error) {
      console.error('獲取應用詳情失敗:', error)
      const errorMessage = error instanceof Error ? error.message : '未知錯誤'
      alert(`獲取應用詳情失敗: ${errorMessage}`)
    }
  }

  const handleEditApp = (app: any) => {
    console.log('=== handleEditApp Debug ===')
    console.log('Input app:', app)
    console.log('app.type:', app.type)
    console.log('app.department:', app.department)
    console.log('app.creator:', app.creator)
    console.log('app.icon:', app.icon)
    console.log('app.iconColor:', app.iconColor)
    
    setSelectedApp(app)
    
    // 處理類型轉換：如果類型是英文的，轉換為中文
    let displayType = app.type
    if (app.type && !['文字處理', '圖像生成', '程式開發', '數據分析', '教育工具', '健康醫療', '金融科技', '物聯網', '區塊鏈', 'AR/VR', '機器學習', '電腦視覺', '自然語言處理', '機器人', '網路安全', '雲端服務', '其他'].includes(app.type)) {
      displayType = mapApiTypeToDisplayType(app.type)
    }
    
    // 處理部門和創建者資料
    let department = app.department
    let creator = app.creator
    
    // 如果 app.creator 是物件（來自詳細 API），提取名稱
    if (app.creator && typeof app.creator === 'object') {
      creator = app.creator.name || ""
      // 優先使用應用程式的部門，而不是創建者的部門
      department = app.department || app.creator.department || ""
    }
    
    const newAppData = {
      name: app.name || "",
      type: displayType || "文字處理",
      department: department || "",
      creator: creator || "",
      description: app.description || "",
      appUrl: app.appUrl || app.demoUrl || "",
      icon: app.icon || "",
      iconColor: app.iconColor || "",
    }
    
    console.log('newAppData:', newAppData)
    setNewApp(newAppData)
    setShowEditApp(true)
  }

  const handleDeleteApp = (app: any) => {
    setSelectedApp(app)
    setShowDeleteConfirm(true)
  }

  const confirmDeleteApp = async () => {
    if (selectedApp) {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          throw new Error('未找到認證 token，請重新登入')
        }

        const response = await fetch(`/api/apps/${selectedApp.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || `刪除失敗: ${response.status}`)
        }

        // Remove from local state
        setApps(apps.filter((app) => app.id !== selectedApp.id))
        setShowDeleteConfirm(false)
        setSelectedApp(null)
        
        // Reload apps to update statistics
        loadApps()
        
        alert('應用程式刪除成功')
      } catch (error) {
        console.error('刪除應用程式失敗:', error)
        const errorMessage = error instanceof Error ? error.message : '未知錯誤'
        alert(`刪除失敗: ${errorMessage}`)
      }
    }
  }

  const handleToggleAppStatus = async (appId: string) => {
    try {
      const app = apps.find(a => a.id === appId)
      if (!app) return

      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('未找到認證 token，請重新登入')
      }

      const newStatus = app.status === "published" ? "draft" : "published"
      
      const response = await fetch(`/api/apps/${appId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: newStatus
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `狀態更新失敗: ${response.status}`)
      }

      // Update local state
      setApps(
        apps.map((app) =>
          app.id === appId
            ? { ...app, status: newStatus }
            : app,
        ),
      )

      // Reload apps to update statistics
      loadApps()
      
      alert(`應用程式已${newStatus === "published" ? "發布" : "下架"}`)
    } catch (error) {
      console.error('更新應用狀態失敗:', error)
      const errorMessage = error instanceof Error ? error.message : '未知錯誤'
      alert(`狀態更新失敗: ${errorMessage}`)
    }
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
        version: '1.0.0',
        creator: newApp.creator || undefined,
        department: newApp.department || undefined,
        icon: newApp.icon || 'Bot',
        iconColor: newApp.iconColor || 'from-blue-500 to-purple-500'
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
      // 處理舊的英文類型，確保它們都轉換為中文
      'web_app': '文字處理',
      'mobile_app': '文字處理',
      'desktop_app': '文字處理',
      'api_service': '程式開發',
      'other': '其他'
    }
    return typeMap[apiType] || '其他'
  }

  const handleUpdateApp = async () => {
    if (selectedApp) {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          throw new Error('未找到認證 token，請重新登入')
        }

        // Prepare update data
        const updateData = {
          name: newApp.name,
          description: newApp.description,
          type: mapTypeToApiType(newApp.type),
          demoUrl: newApp.appUrl || undefined,
          icon: newApp.icon, // 新增：更新圖示
          iconColor: newApp.iconColor, // 新增：更新圖示顏色
          department: newApp.department, // 新增：更新部門
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

        // Update local state
        setApps(
          apps.map((app) =>
            app.id === selectedApp.id
              ? {
                  ...app,
                  ...newApp,
                  type: mapTypeToApiType(newApp.type),
                  demoUrl: newApp.appUrl,
                  icon: newApp.icon, // 新增：更新圖示
                  iconColor: newApp.iconColor, // 新增：更新圖示顏色
                  department: newApp.department, // 新增：更新部門
                }
              : app,
          ),
        )
        
        setShowEditApp(false)
        setSelectedApp(null)
        
        alert('應用程式更新成功')
      } catch (error) {
        console.error('更新應用程式失敗:', error)
        const errorMessage = error instanceof Error ? error.message : '未知錯誤'
        alert(`更新失敗: ${errorMessage}`)
      }
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
          onClick={() => {
            resetNewApp() // 重置表單數據
            setShowAddApp(true)
          }}
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
                      <p className="font-medium">{typeof app.creator === 'object' ? app.creator.name : app.creator}</p>
                      <p className="text-sm text-gray-500">{typeof app.creator === 'object' ? app.creator.department : app.department}</p>
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
      <Dialog open={showAddApp} onOpenChange={(open) => {
        setShowAddApp(open)
        if (!open) {
          resetNewApp() // 當對話框關閉時也重置表單
        }
      }}>
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
                    {getDepartmentOptions().map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
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
                <Select value={newApp.type} onValueChange={(value) => {
                  console.log('Type changed to:', value)
                  setNewApp({ ...newApp, type: value })
                }}>
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
                <Label htmlFor="edit-department">所屬部門</Label>
                <Select
                  value={newApp.department}
                  onValueChange={(value) => setNewApp({ ...newApp, department: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {getDepartmentOptions().map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
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
                <TabsTrigger value="technical">技術詳情</TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">應用名稱</Label>
                    <p className="text-sm text-gray-900">{selectedApp.name}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">應用類型</Label>
                    <Badge className={getTypeColor(mapApiTypeToDisplayType(selectedApp.type))}>
                      {mapApiTypeToDisplayType(selectedApp.type)}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">創建者</Label>
                    <p className="text-sm text-gray-900">{selectedApp.creator?.name || '未知'}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">所屬部門</Label>
                    <p className="text-sm text-gray-900">{selectedApp.creator?.department || '未知'}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">當前狀態</Label>
                    <Badge className={getStatusColor(selectedApp.status)}>
                      {getStatusText(selectedApp.status)}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">版本</Label>
                    <p className="text-sm text-gray-900">{selectedApp.version || '1.0.0'}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">應用描述</Label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                    {selectedApp.description}
                  </p>
                </div>

                {selectedApp.demoUrl && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">演示連結</Label>
                    <div className="flex items-center space-x-2">
                      <Link className="w-4 h-4 text-blue-500" />
                      <a
                        href={selectedApp.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800 underline"
                      >
                        {selectedApp.demoUrl}
                      </a>
                    </div>
                  </div>
                )}

                {selectedApp.githubUrl && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">GitHub 連結</Label>
                    <div className="flex items-center space-x-2">
                      <Code className="w-4 h-4 text-gray-500" />
                      <a
                        href={selectedApp.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-gray-600 hover:text-gray-800 underline"
                      >
                        {selectedApp.githubUrl}
                      </a>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">創建時間</Label>
                    <p className="text-sm text-gray-900">
                      {selectedApp.createdAt ? new Date(selectedApp.createdAt).toLocaleString() : '未知'}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">最後更新</Label>
                    <p className="text-sm text-gray-900">
                      {selectedApp.updatedAt ? new Date(selectedApp.updatedAt).toLocaleString() : '未知'}
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="stats" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">瀏覽次數</p>
                          <p className="text-2xl font-bold">{selectedApp.viewsCount || 0}</p>
                        </div>
                        <Eye className="w-8 h-8 text-blue-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">按讚數</p>
                          <p className="text-2xl font-bold">{selectedApp.likesCount || 0}</p>
                        </div>
                        <Heart className="w-8 h-8 text-red-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">評分</p>
                          <p className="text-2xl font-bold">{selectedApp.rating || 0}</p>
                        </div>
                        <Star className="w-8 h-8 text-yellow-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">收藏數</p>
                          <p className="text-2xl font-bold">{selectedApp.favoritesCount || 0}</p>
                        </div>
                        <Heart className="w-8 h-8 text-purple-600" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {selectedApp.techStack && selectedApp.techStack.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">技術棧</Label>
                    <div className="flex flex-wrap gap-2">
                      {selectedApp.techStack.map((tech: string, index: number) => (
                        <Badge key={index} variant="outline">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {selectedApp.tags && selectedApp.tags.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">標籤</Label>
                    <div className="flex flex-wrap gap-2">
                      {selectedApp.tags.map((tag: string, index: number) => (
                        <Badge key={index} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="technical" className="space-y-4">
                <div className="space-y-4">
                  {selectedApp.team && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">開發團隊</Label>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-900">
                          <strong>團隊名稱：</strong>{selectedApp.team.name}
                        </p>
                        <p className="text-sm text-gray-900">
                          <strong>所屬部門：</strong>{selectedApp.team.department}
                        </p>
                        {selectedApp.team.contactEmail && (
                          <p className="text-sm text-gray-900">
                            <strong>聯絡郵箱：</strong>{selectedApp.team.contactEmail}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedApp.filePath && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">檔案路徑</Label>
                      <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded font-mono">
                        {selectedApp.filePath}
                      </p>
                    </div>
                  )}

                  {selectedApp.screenshots && selectedApp.screenshots.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">應用截圖</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedApp.screenshots.map((screenshot: string, index: number) => (
                          <img
                            key={index}
                            src={screenshot}
                            alt={`Screenshot ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowAppDetail(false)}>
              關閉
            </Button>
            {selectedApp && (
              <>
                <Button onClick={() => {
                  setShowAppDetail(false)
                  handleEditApp(selectedApp)
                }}>
                  <Edit className="w-4 h-4 mr-2" />
                  編輯應用
                </Button>
                {selectedApp.demoUrl && (
                  <Button onClick={() => window.open(selectedApp.demoUrl, "_blank")}>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    開啟應用
                  </Button>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
