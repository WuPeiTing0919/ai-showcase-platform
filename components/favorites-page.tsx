"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Heart, ExternalLink } from "lucide-react"

// Favorite apps data - empty for production
const mockFavoriteApps: any[] = []

export function FavoritesPage() {
  const { user } = useAuth()
  const [sortBy, setSortBy] = useState("name")
  const [filterDepartment, setFilterDepartment] = useState("all")

  const handleUseApp = (app: any) => {
    // Open app in new tab
    window.open(app.url, "_blank")
    console.log(`Opening app: ${app.name}`)
  }

  const filteredAndSortedApps = mockFavoriteApps
    .filter((app) => filterDepartment === "all" || app.department === filterDepartment)
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name)
        case "creator":
          return a.creator.localeCompare(b.creator)
        case "department":
          return a.department.localeCompare(b.department)
        default:
          return 0
      }
    })

  return (
    <div className="space-y-6">
      {/* Filter and Sort Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-3">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="排序方式" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">名稱</SelectItem>
              <SelectItem value="creator">開發者</SelectItem>
              <SelectItem value="department">部門</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterDepartment} onValueChange={setFilterDepartment}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="部門篩選" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部部門</SelectItem>
              <SelectItem value="HQBU">HQBU</SelectItem>
              <SelectItem value="ITBU">ITBU</SelectItem>
              <SelectItem value="MBU1">MBU1</SelectItem>
              <SelectItem value="SBU">SBU</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="text-sm text-gray-500">共 {filteredAndSortedApps.length} 個收藏應用</div>
      </div>

      {/* Favorites Grid */}
      {filteredAndSortedApps.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedApps.map((app) => (
            <Card key={app.id} className="h-full flex flex-col hover:shadow-lg transition-shadow">
              <CardContent className="p-6 flex flex-col h-full">
                {/* Header with heart icon */}
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex-1 pr-2">{app.name}</h3>
                  <Heart className="w-5 h-5 text-red-500 fill-current flex-shrink-0" />
                </div>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-grow">{app.description}</p>

                {/* Developer and Department */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-700">開發者: {app.creator}</span>
                  <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-200">
                    {app.department}
                  </Badge>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-6 flex-grow">
                  {app.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* Action Button */}
                <div className="mt-auto flex-shrink-0">
                  <Button className="w-full bg-black hover:bg-gray-800 text-white" onClick={() => handleUseApp(app)}>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    使用應用
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">暫無收藏應用</h3>
          <p className="text-gray-500">
            {filterDepartment !== "all"
              ? "該部門暫無收藏的應用，請嘗試其他篩選條件"
              : "您還沒有收藏任何應用，快去探索並收藏您喜歡的 AI 應用吧！"}
          </p>
        </div>
      )}
    </div>
  )
}
