"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Line,
  ComposedChart,
} from "recharts"
import { Users, Eye, Star, TrendingUp, Clock, Activity, Calendar, AlertTriangle } from "lucide-react"
import { useState } from "react"

export function AnalyticsDashboard() {
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [selectedDateRange, setSelectedDateRange] = useState("近7天")

  // 24小時使用數據 - 優化版本
  const hourlyData = [
    { hour: "00", users: 39, period: "深夜", intensity: "low", cpuUsage: 25, memoryUsage: 45 },
    { hour: "01", users: 62, period: "深夜", intensity: "normal", cpuUsage: 22, memoryUsage: 43 },
    { hour: "02", users: 24, period: "深夜", intensity: "low", cpuUsage: 20, memoryUsage: 41 },
    { hour: "03", users: 40, period: "深夜", intensity: "low", cpuUsage: 18, memoryUsage: 40 },
    { hour: "04", users: 40, period: "深夜", intensity: "low", cpuUsage: 17, memoryUsage: 39 },
    { hour: "05", users: 55, period: "清晨", intensity: "normal", cpuUsage: 19, memoryUsage: 41 },
    { hour: "06", users: 26, period: "清晨", intensity: "low", cpuUsage: 28, memoryUsage: 48 },
    { hour: "07", users: 67, period: "清晨", intensity: "normal", cpuUsage: 35, memoryUsage: 52 },
    { hour: "08", users: 26, period: "工作時間", intensity: "normal", cpuUsage: 42, memoryUsage: 58 },
    { hour: "09", users: 89, period: "工作時間", intensity: "high", cpuUsage: 58, memoryUsage: 68 },
    { hour: "10", users: 88, period: "工作時間", intensity: "high", cpuUsage: 65, memoryUsage: 72 },
    { hour: "11", users: 129, period: "工作時間", intensity: "peak", cpuUsage: 72, memoryUsage: 76 },
    { hour: "12", users: 106, period: "工作時間", intensity: "peak", cpuUsage: 62, memoryUsage: 70 },
    { hour: "13", users: 105, period: "工作時間", intensity: "peak", cpuUsage: 68, memoryUsage: 74 },
    { hour: "14", users: 81, period: "工作時間", intensity: "high", cpuUsage: 78, memoryUsage: 82 },
    { hour: "15", users: 119, period: "工作時間", intensity: "peak", cpuUsage: 74, memoryUsage: 79 },
    { hour: "16", users: 126, period: "工作時間", intensity: "peak", cpuUsage: 67, memoryUsage: 73 },
    { hour: "17", users: 112, period: "工作時間", intensity: "peak", cpuUsage: 59, memoryUsage: 67 },
    { hour: "18", users: 22, period: "晚間", intensity: "low", cpuUsage: 45, memoryUsage: 58 },
    { hour: "19", users: 60, period: "晚間", intensity: "normal", cpuUsage: 38, memoryUsage: 53 },
    { hour: "20", users: 32, period: "晚間", intensity: "low", cpuUsage: 33, memoryUsage: 50 },
    { hour: "21", users: 22, period: "晚間", intensity: "low", cpuUsage: 29, memoryUsage: 47 },
    { hour: "22", users: 36, period: "晚間", intensity: "low", cpuUsage: 26, memoryUsage: 46 },
    { hour: "23", users: 66, period: "晚間", intensity: "normal", cpuUsage: 24, memoryUsage: 44 },
  ]

  // 獲取顏色基於使用強度
  const getBarColor = (intensity: string) => {
    switch (intensity) {
      case "peak":
        return "#ef4444" // 紅色 - 高峰期
      case "high":
        return "#3b82f6" // 藍色 - 高使用期
      case "normal":
        return "#6b7280" // 灰藍色 - 正常期
      case "low":
        return "#9ca3af" // 灰色 - 低峰期
      default:
        return "#6b7280"
    }
  }

  // 近7天使用趨勢數據（動態日期）
  const getRecentDates = () => {
    const dates = []
    const today = new Date()
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(today.getDate() - i)
      dates.push({
        date: `${date.getMonth() + 1}/${date.getDate()}`,
        fullDate: date.toLocaleDateString("zh-TW"),
        dayName: ["日", "一", "二", "三", "四", "五", "六"][date.getDay()],
      })
    }
    return dates
  }

  const recentDates = getRecentDates()
  const dailyUsageData = [
    { ...recentDates[0], users: 245, sessions: 189, cpuPeak: 65, avgCpu: 45, memoryPeak: 58, requests: 1240 },
    { ...recentDates[1], users: 267, sessions: 203, cpuPeak: 68, avgCpu: 48, memoryPeak: 62, requests: 1356 },
    { ...recentDates[2], users: 289, sessions: 221, cpuPeak: 72, avgCpu: 52, memoryPeak: 65, requests: 1478 },
    { ...recentDates[3], users: 312, sessions: 245, cpuPeak: 75, avgCpu: 55, memoryPeak: 68, requests: 1589 },
    { ...recentDates[4], users: 298, sessions: 234, cpuPeak: 73, avgCpu: 53, memoryPeak: 66, requests: 1523 },
    { ...recentDates[5], users: 334, sessions: 267, cpuPeak: 78, avgCpu: 58, memoryPeak: 71, requests: 1678 },
    { ...recentDates[6], users: 356, sessions: 289, cpuPeak: 82, avgCpu: 62, memoryPeak: 75, requests: 1789 },
  ]

  const categoryData = [
    { name: "AI工具", value: 35, color: "#3b82f6", users: 3083, apps: 45 },
    { name: "數據分析", value: 25, color: "#ef4444", users: 1565, apps: 32 },
    { name: "自動化", value: 20, color: "#10b981", users: 856, apps: 25 },
    { name: "機器學習", value: 15, color: "#f59e0b", users: 743, apps: 19 },
    { name: "其他", value: 5, color: "#8b5cf6", users: 234, apps: 6 },
  ]

  const topApps = [
    { name: "智能客服助手", views: 1234, rating: 4.8, category: "AI工具" },
    { name: "數據視覺化平台", views: 987, rating: 4.6, category: "數據分析" },
    { name: "自動化工作流", views: 856, rating: 4.7, category: "自動化" },
    { name: "預測分析系統", views: 743, rating: 4.5, category: "機器學習" },
    { name: "文本分析工具", views: 692, rating: 4.4, category: "AI工具" },
  ]

  // 獲取歷史數據
  const getHistoricalData = (range: string) => {
    const baseData = [
      { date: "12/1", users: 180, cpuPeak: 55, fullDate: "2024/12/1" },
      { date: "12/8", users: 210, cpuPeak: 62, fullDate: "2024/12/8" },
      { date: "12/15", users: 245, cpuPeak: 68, fullDate: "2024/12/15" },
      { date: "12/22", users: 280, cpuPeak: 74, fullDate: "2024/12/22" },
      { date: "12/29", users: 320, cpuPeak: 78, fullDate: "2024/12/29" },
      { date: "1/5", users: 298, cpuPeak: 73, fullDate: "2025/1/5" },
      { date: "1/12", users: 334, cpuPeak: 79, fullDate: "2025/1/12" },
      { date: "1/19", users: 356, cpuPeak: 82, fullDate: "2025/1/19" },
    ]

    switch (range) {
      case "近7天":
        return dailyUsageData
      case "近30天":
        return baseData.slice(-4)
      case "近3個月":
        return baseData.slice(-6)
      case "近6個月":
        return baseData
      default:
        return dailyUsageData
    }
  }

  // 獲取歷史統計數據
  const getHistoricalStats = (range: string) => {
    const data = getHistoricalData(range)
    const users = data.map((d) => d.users)
    const cpus = data.map((d) => d.cpuPeak)

    return {
      avgUsers: Math.round(users.reduce((a, b) => a + b, 0) / users.length),
      maxUsers: Math.max(...users),
      avgCpu: Math.round(cpus.reduce((a, b) => a + b, 0) / cpus.length),
      maxCpu: Math.max(...cpus),
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">數據分析</h1>
        <Badge variant="outline" className="text-sm">
          <Activity className="w-4 h-4 mr-1" />
          即時更新
        </Badge>
      </div>

      {/* 關鍵指標卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">總用戶數</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,847</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12.5%</span> 較上月
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">今日活躍用戶</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">356</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+8.2%</span> 較昨日
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">平均評分</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.6</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+0.3</span> 較上週
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">應用總數</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">127</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+5</span> 本週新增
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 圖表區域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 近7天使用趨勢與系統負載 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                近7天使用趨勢與系統負載
              </CardTitle>
              <Button variant="outline" size="sm" onClick={() => setShowHistoryModal(true)}>
                <Calendar className="w-4 h-4 mr-1" />
                查看歷史
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">用戶活躍度與CPU使用率關聯分析</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <ComposedChart data={dailyUsageData}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  axisLine={{ stroke: "#e5e7eb" }}
                  tickLine={{ stroke: "#e5e7eb" }}
                />
                <YAxis
                  yAxisId="users"
                  orientation="left"
                  tick={{ fontSize: 12 }}
                  axisLine={{ stroke: "#e5e7eb" }}
                  tickLine={{ stroke: "#e5e7eb" }}
                  domain={[200, 400]}
                />
                <YAxis
                  yAxisId="cpu"
                  orientation="right"
                  tick={{ fontSize: 12 }}
                  axisLine={{ stroke: "#e5e7eb" }}
                  tickLine={{ stroke: "#e5e7eb" }}
                  domain={[40, 90]}
                />
                <Tooltip
                  formatter={(value, name, props) => {
                    if (name === "users") {
                      return [`${value} 人`, "活躍用戶"]
                    }
                    if (name === "cpuPeak") {
                      return [`${value}%`, "CPU峰值"]
                    }
                    return [value, name]
                  }}
                  labelFormatter={(label, payload) => {
                    if (payload && payload.length > 0) {
                      const data = payload[0].payload
                      return `${data.fullDate} (週${data.dayName})`
                    }
                    return label
                  }}
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    fontSize: "14px",
                  }}
                />
                <Bar yAxisId="users" dataKey="users" fill="url(#colorUsers)" radius={[4, 4, 0, 0]} opacity={0.7} />
                <Line
                  yAxisId="cpu"
                  type="monotone"
                  dataKey="cpuPeak"
                  stroke="#ef4444"
                  strokeWidth={3}
                  dot={{ fill: "#ef4444", strokeWidth: 2, r: 5 }}
                  activeDot={{ r: 7, stroke: "#ef4444", strokeWidth: 2 }}
                />
              </ComposedChart>
            </ResponsiveContainer>

            {/* 系統建議 */}
            <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-orange-800">系統負載建議</p>
                  <p className="text-sm text-orange-700 mt-1">
                    近7天CPU峰值達82%，當用戶數超過350時系統負載顯著增加。建議考慮硬體升級或負載均衡優化。
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 應用類別分布 */}
        <Card>
          <CardHeader>
            <CardTitle>應用類別分布</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  innerRadius={40}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name, props) => {
                    const data = props.payload
                    return [
                      [`${value}%`, "占比"],
                      [`${data.users?.toLocaleString()} 人`, "用戶數"],
                      [`${data.apps} 個`, "應用數量"],
                    ]
                  }}
                  labelFormatter={(label) => label}
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    fontSize: "14px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* 添加圖例說明 */}
            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
              {categoryData.map((category, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
                  <span className="text-gray-700">{category.name}</span>
                  <span className="font-medium text-gray-900">{category.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 24小時使用模式 - 優化版 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            24小時使用模式
          </CardTitle>
          <p className="text-sm text-muted-foreground">今日各時段用戶活躍度分析</p>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-wrap gap-2">
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
              <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
              高峰期 (80%+)
            </Badge>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
              高使用期
            </Badge>
            <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
              <div className="w-3 h-3 bg-gray-500 rounded mr-2"></div>
              正常期
            </Badge>
            <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-300">
              <div className="w-3 h-3 bg-gray-400 rounded mr-2"></div>
              低峰期
            </Badge>
          </div>

          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={hourlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="hour" tick={{ fontSize: 12 }} tickFormatter={(value) => `${value}:00`} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value, name, props) => {
                  const data = props.payload
                  const getIntensityText = (intensity: string) => {
                    switch (intensity) {
                      case "peak":
                        return "高峰期"
                      case "high":
                        return "高使用期"
                      case "normal":
                        return "正常期"
                      case "low":
                        return "低峰期"
                      default:
                        return "未知"
                    }
                  }

                  return [
                    [`${value} 人`, "同時在線用戶"],
                    [`${getIntensityText(data.intensity)}`, "時段分類"],
                    [`${data.cpuUsage}%`, "CPU使用率"],
                    [`${data.memoryUsage}%`, "記憶體使用率"],
                    [`${data.period}`, "時段特性"],
                  ]
                }}
                labelFormatter={(label) => `${label}:00 時段`}
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  fontSize: "14px",
                  minWidth: "220px",
                }}
              />
              <Bar dataKey="users" radius={[4, 4, 0, 0]} fill={(entry: any) => getBarColor(entry.intensity)}>
                {hourlyData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.intensity)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <strong>尖峰時段分析：</strong>工作時間 09:00-17:00 為主要使用時段，建議在此時段確保系統穩定性
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 熱門應用排行 */}
      <Card>
        <CardHeader>
          <CardTitle>熱門應用排行</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topApps.map((app, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="font-medium">{app.name}</h3>
                    <p className="text-sm text-muted-foreground">{app.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{app.views}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm">{app.rating}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 用戶回饋摘要 */}
      <Card>
        <CardHeader>
          <CardTitle>用戶回饋摘要</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">92%</div>
              <p className="text-sm text-muted-foreground">滿意度</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">4.6</div>
              <p className="text-sm text-muted-foreground">平均評分</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">156</div>
              <p className="text-sm text-muted-foreground">本週回饋</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 歷史數據查看模態框 */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">歷史數據查看</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowHistoryModal(false)}>
                ✕
              </Button>
            </div>

            {/* 日期範圍選擇 */}
            <div className="mb-6">
              <div className="flex gap-2 mb-4">
                {["近7天", "近30天", "近3個月", "近6個月"].map((range) => (
                  <Button
                    key={range}
                    variant={selectedDateRange === range ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedDateRange(range)}
                  >
                    {range}
                  </Button>
                ))}
              </div>
            </div>

            {/* 歷史數據圖表 */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>歷史使用趨勢 - {selectedDateRange}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <ComposedChart data={getHistoricalData(selectedDateRange)}>
                      <defs>
                        <linearGradient id="colorUsersHistory" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis yAxisId="users" orientation="left" tick={{ fontSize: 12 }} />
                      <YAxis yAxisId="cpu" orientation="right" tick={{ fontSize: 12 }} />
                      <Tooltip
                        formatter={(value, name, props) => {
                          if (name === "users") {
                            return [`${value} 人`, "活躍用戶"]
                          }
                          if (name === "cpuPeak") {
                            return [`${value}%`, "CPU峰值"]
                          }
                          return [value, name]
                        }}
                        labelFormatter={(label, payload) => {
                          if (payload && payload.length > 0) {
                            const data = payload[0].payload
                            return data.fullDate || label
                          }
                          return label
                        }}
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                          fontSize: "14px",
                        }}
                      />
                      <Bar
                        yAxisId="users"
                        dataKey="users"
                        fill="url(#colorUsersHistory)"
                        radius={[2, 2, 0, 0]}
                        opacity={0.7}
                      />
                      <Line
                        yAxisId="cpu"
                        type="monotone"
                        dataKey="cpuPeak"
                        stroke="#ef4444"
                        strokeWidth={2}
                        dot={{ fill: "#ef4444", strokeWidth: 1, r: 3 }}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* 歷史數據統計摘要 */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {getHistoricalStats(selectedDateRange).avgUsers}
                      </div>
                      <p className="text-sm text-muted-foreground">平均用戶數</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {getHistoricalStats(selectedDateRange).maxUsers}
                      </div>
                      <p className="text-sm text-muted-foreground">最高用戶數</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {getHistoricalStats(selectedDateRange).avgCpu}%
                      </div>
                      <p className="text-sm text-muted-foreground">平均CPU使用率</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {getHistoricalStats(selectedDateRange).maxCpu}%
                      </div>
                      <p className="text-sm text-muted-foreground">最高CPU使用率</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
