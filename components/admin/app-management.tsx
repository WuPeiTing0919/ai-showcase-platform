"use client"

import { useState } from "react"
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

  const filteredApps = apps.filter((app) => {
    const matchesSearch =
      app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.creator.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = selectedType === "all" || app.type === selectedType
    const matchesStatus = selectedStatus === "all" || app.status === selectedStatus

    return matchesSearch && matchesType && matchesStatus
  })

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

  const confirmApproval = () => {
    if (selectedApp) {
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
      setShowApprovalDialog(false)
      setSelectedApp(null)
      setApprovalReason("")
    }
  }

  const handleAddApp = () => {
    const app = {
      id: Date.now().toString(),
      ...newApp,
      status: "pending",
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
      語音辨識: "bg-green-100 text-green-800 border-green-200",
      推薦系統: "bg-orange-100 text-orange-800 border-orange-200",
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
                <p className="text-2xl font-bold">{apps.length}</p>
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
                <p className="text-2xl font-bold">{apps.filter((a) => a.status === "published").length}</p>
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
                <p className="text-2xl font-bold">{apps.filter((a) => a.status === "pending").length}</p>
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
                  <SelectItem value="語音辨識">語音辨識</SelectItem>
                  <SelectItem value="推薦系統">推薦系統</SelectItem>
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
          <CardTitle>應用列表 ({filteredApps.length})</CardTitle>
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
              {filteredApps.map((app) => (
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
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

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
                    <SelectItem value="語音辨識">語音辨識</SelectItem>
                    <SelectItem value="推薦系統">推薦系統</SelectItem>
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
