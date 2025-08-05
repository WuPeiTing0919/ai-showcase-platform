"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Settings,
  Shield,
  Mail,
  Server,
  Users,
  Bell,
  Save,
  TestTube,
  CheckCircle,
  HardDrive,
  Clock,
  Globe,
} from "lucide-react"

export function SystemSettings() {
  const [settings, setSettings] = useState({
    // 一般設定
    siteName: "AI應用展示平台",
    siteDescription: "展示和分享AI應用的專業平台",
    timezone: "Asia/Taipei",
    language: "zh-TW",
    maintenanceMode: false,

    // 安全設定
    twoFactorAuth: true,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    passwordMinLength: 8,

    // 郵件設定
    smtpHost: "smtp.gmail.com",
    smtpPort: "587",
    smtpUser: "",
    smtpPassword: "",
    smtpEncryption: "tls",

    // 系統性能
    cacheEnabled: true,
    cacheTimeout: 3600,
    maxFileSize: 10,
    maxUploadSize: 50,

    // 用戶管理
    allowRegistration: true,
    emailVerification: true,
    defaultUserRole: "user",

    // 通知設定
    systemNotifications: true,
    emailNotifications: true,
    slackWebhook: "",
    notificationFrequency: "immediate",
  })

  const [activeTab, setActiveTab] = useState("general")
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle")

  const handleSave = async () => {
    setSaveStatus("saving")
    // 模擬保存過程
    setTimeout(() => {
      setSaveStatus("saved")
      setTimeout(() => setSaveStatus("idle"), 2000)
    }, 1000)
  }

  const handleTestEmail = () => {
    // 測試郵件功能
    alert("測試郵件已發送！")
  }

  const updateSetting = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Settings className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold">系統設定</h1>
            <p className="text-muted-foreground">管理平台的各項系統配置</p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saveStatus === "saving"}>
          <Save className="w-4 h-4 mr-2" />
          {saveStatus === "saving" ? "保存中..." : saveStatus === "saved" ? "已保存" : "保存設定"}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            一般設定
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            安全設定
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            郵件設定
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <Server className="w-4 h-4" />
            系統性能
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            用戶管理
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            通知設定
          </TabsTrigger>
        </TabsList>

        {/* 一般設定 */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                網站基本資訊
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="siteName">網站名稱</Label>
                  <Input
                    id="siteName"
                    value={settings.siteName}
                    onChange={(e) => updateSetting("siteName", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">時區</Label>
                  <Select value={settings.timezone} onValueChange={(value) => updateSetting("timezone", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asia/Taipei">台北 (UTC+8)</SelectItem>
                      <SelectItem value="Asia/Tokyo">東京 (UTC+9)</SelectItem>
                      <SelectItem value="UTC">UTC (UTC+0)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="siteDescription">網站描述</Label>
                <Textarea
                  id="siteDescription"
                  value={settings.siteDescription}
                  onChange={(e) => updateSetting("siteDescription", e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <Label>維護模式</Label>
                  <p className="text-sm text-muted-foreground">啟用後，一般用戶將無法訪問網站</p>
                </div>
                <Switch
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) => updateSetting("maintenanceMode", checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 安全設定 */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                安全配置
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <Label>雙因素驗證</Label>
                  <p className="text-sm text-muted-foreground">為管理員帳戶啟用額外的安全層</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={settings.twoFactorAuth ? "default" : "secondary"}>
                    {settings.twoFactorAuth ? "已啟用" : "已停用"}
                  </Badge>
                  <Switch
                    checked={settings.twoFactorAuth}
                    onCheckedChange={(checked) => updateSetting("twoFactorAuth", checked)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">會話超時 (分鐘)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={settings.sessionTimeout}
                    onChange={(e) => updateSetting("sessionTimeout", Number.parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxLoginAttempts">最大登入嘗試次數</Label>
                  <Input
                    id="maxLoginAttempts"
                    type="number"
                    value={settings.maxLoginAttempts}
                    onChange={(e) => updateSetting("maxLoginAttempts", Number.parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 text-green-800">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">安全狀態：良好</span>
                </div>
                <p className="text-sm text-green-700 mt-1">所有安全設定均已正確配置</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 郵件設定 */}
        <TabsContent value="email" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                SMTP 配置
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtpHost">SMTP 主機</Label>
                  <Input
                    id="smtpHost"
                    value={settings.smtpHost}
                    onChange={(e) => updateSetting("smtpHost", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpPort">SMTP 端口</Label>
                  <Input
                    id="smtpPort"
                    value={settings.smtpPort}
                    onChange={(e) => updateSetting("smtpPort", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtpUser">SMTP 用戶名</Label>
                  <Input
                    id="smtpUser"
                    value={settings.smtpUser}
                    onChange={(e) => updateSetting("smtpUser", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpPassword">SMTP 密碼</Label>
                  <Input
                    id="smtpPassword"
                    type="password"
                    value={settings.smtpPassword}
                    onChange={(e) => updateSetting("smtpPassword", e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Button onClick={handleTestEmail} variant="outline">
                  <TestTube className="w-4 h-4 mr-2" />
                  測試郵件發送
                </Button>
                <Badge variant="outline" className="text-green-600 border-green-600">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  連接正常
                </Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 系統性能 */}
        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="w-5 h-5" />
                性能優化
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <Label>快取系統</Label>
                  <p className="text-sm text-muted-foreground">啟用快取以提升系統響應速度</p>
                </div>
                <Switch
                  checked={settings.cacheEnabled}
                  onCheckedChange={(checked) => updateSetting("cacheEnabled", checked)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxFileSize">單檔案大小限制 (MB)</Label>
                  <Input
                    id="maxFileSize"
                    type="number"
                    value={settings.maxFileSize}
                    onChange={(e) => updateSetting("maxFileSize", Number.parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxUploadSize">總上傳大小限制 (MB)</Label>
                  <Input
                    id="maxUploadSize"
                    type="number"
                    value={settings.maxUploadSize}
                    onChange={(e) => updateSetting("maxUploadSize", Number.parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 text-blue-800 mb-2">
                  <HardDrive className="w-5 h-5" />
                  <span className="font-medium">儲存使用情況</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>已使用空間</span>
                    <span>2.3 GB / 10 GB</span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: "23%" }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 用戶管理 */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                用戶設定
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <Label>允許用戶註冊</Label>
                  <p className="text-sm text-muted-foreground">新用戶可以自行註冊帳戶</p>
                </div>
                <Switch
                  checked={settings.allowRegistration}
                  onCheckedChange={(checked) => updateSetting("allowRegistration", checked)}
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <Label>郵箱驗證</Label>
                  <p className="text-sm text-muted-foreground">新用戶需要驗證郵箱才能使用</p>
                </div>
                <Switch
                  checked={settings.emailVerification}
                  onCheckedChange={(checked) => updateSetting("emailVerification", checked)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="defaultUserRole">預設用戶角色</Label>
                <Select
                  value={settings.defaultUserRole}
                  onValueChange={(value) => updateSetting("defaultUserRole", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">一般用戶</SelectItem>
                    <SelectItem value="contributor">貢獻者</SelectItem>
                    <SelectItem value="moderator">版主</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">2,847</div>
                  <p className="text-sm text-muted-foreground">總用戶數</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">356</div>
                  <p className="text-sm text-muted-foreground">活躍用戶</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">23</div>
                  <p className="text-sm text-muted-foreground">本週新增</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 通知設定 */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                通知配置
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <Label>系統通知</Label>
                  <p className="text-sm text-muted-foreground">接收系統重要通知</p>
                </div>
                <Switch
                  checked={settings.systemNotifications}
                  onCheckedChange={(checked) => updateSetting("systemNotifications", checked)}
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <Label>郵件通知</Label>
                  <p className="text-sm text-muted-foreground">通過郵件發送通知</p>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => updateSetting("emailNotifications", checked)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slackWebhook">Slack Webhook URL</Label>
                <Input
                  id="slackWebhook"
                  placeholder="https://hooks.slack.com/services/..."
                  value={settings.slackWebhook}
                  onChange={(e) => updateSetting("slackWebhook", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notificationFrequency">通知頻率</Label>
                <Select
                  value={settings.notificationFrequency}
                  onValueChange={(value) => updateSetting("notificationFrequency", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">即時</SelectItem>
                    <SelectItem value="hourly">每小時</SelectItem>
                    <SelectItem value="daily">每日</SelectItem>
                    <SelectItem value="weekly">每週</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2 text-yellow-800 mb-2">
                  <Clock className="w-5 h-5" />
                  <span className="font-medium">通知歷史</span>
                </div>
                <p className="text-sm text-yellow-700">最近24小時內發送了 12 條通知</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {saveStatus === "saved" && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          設定已成功保存！
        </div>
      )}
    </div>
  )
}
