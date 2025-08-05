"use client"

import { useState } from "react"
import { useCompetition } from "@/contexts/competition-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Users,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  UserPlus,
  UserMinus,
  Crown,
  CheckCircle,
  AlertTriangle,
  Loader2,
} from "lucide-react"
import type { Team, TeamMember } from "@/types/competition"

export function TeamManagement() {
  const { teams, addTeam, updateTeam, getTeamById } = useCompetition()

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState("all")
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const [showTeamDetail, setShowTeamDetail] = useState(false)
  const [showAddTeam, setShowAddTeam] = useState(false)
  const [showEditTeam, setShowEditTeam] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")

  const [newTeam, setNewTeam] = useState({
    name: "",
    department: "HQBU",
    contactEmail: "",
    members: [] as TeamMember[],
    leader: "",
    apps: [] as string[],
    totalLikes: 0,
  })

  const [newMember, setNewMember] = useState({
    name: "",
    department: "HQBU",
    role: "成員",
  })

  const filteredTeams = teams.filter((team) => {
    const matchesSearch =
      team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.members.some((member) => member.name.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesDepartment = selectedDepartment === "all" || team.department === selectedDepartment
    return matchesSearch && matchesDepartment
  })

  const handleViewTeam = (team: Team) => {
    setSelectedTeam(team)
    setShowTeamDetail(true)
  }

  const handleEditTeam = (team: Team) => {
    setSelectedTeam(team)
    setNewTeam({
      name: team.name,
      department: team.department,
      contactEmail: team.contactEmail,
      members: [...team.members],
      leader: team.leader,
      apps: [...team.apps],
      totalLikes: team.totalLikes,
    })
    setShowEditTeam(true)
  }

  const handleDeleteTeam = (team: Team) => {
    setSelectedTeam(team)
    setShowDeleteConfirm(true)
  }

  const confirmDeleteTeam = () => {
    if (selectedTeam) {
      // In a real app, you would call a delete function here
      setShowDeleteConfirm(false)
      setSelectedTeam(null)
      setSuccess("團隊刪除成功！")
      setTimeout(() => setSuccess(""), 3000)
    }
  }

  const handleAddMember = () => {
    if (!newMember.name.trim()) {
      setError("請輸入成員姓名")
      return
    }

    const member: TeamMember = {
      id: `m${Date.now()}`,
      name: newMember.name,
      department: newMember.department,
      role: newMember.role,
    }

    setNewTeam({
      ...newTeam,
      members: [...newTeam.members, member],
    })

    // Set as leader if it's the first member
    if (newTeam.members.length === 0) {
      setNewTeam((prev) => ({
        ...prev,
        leader: member.id,
        members: [...prev.members, { ...member, role: "隊長" }],
      }))
    }

    setNewMember({
      name: "",
      department: "HQBU",
      role: "成員",
    })
    setError("")
  }

  const handleRemoveMember = (memberId: string) => {
    const updatedMembers = newTeam.members.filter((m) => m.id !== memberId)
    let newLeader = newTeam.leader

    // If removing the leader, assign leadership to the first remaining member
    if (memberId === newTeam.leader && updatedMembers.length > 0) {
      newLeader = updatedMembers[0].id
      updatedMembers[0].role = "隊長"
    }

    setNewTeam({
      ...newTeam,
      members: updatedMembers,
      leader: newLeader,
    })
  }

  const handleSetLeader = (memberId: string) => {
    const updatedMembers = newTeam.members.map((member) => ({
      ...member,
      role: member.id === memberId ? "隊長" : "成員",
    }))

    setNewTeam({
      ...newTeam,
      members: updatedMembers,
      leader: memberId,
    })
  }

  const handleAddTeam = async () => {
    setError("")

    if (!newTeam.name || !newTeam.contactEmail || newTeam.members.length === 0) {
      setError("請填寫所有必填欄位並至少添加一名成員")
      return
    }

    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))

    addTeam(newTeam)
    setShowAddTeam(false)
    setNewTeam({
      name: "",
      department: "HQBU",
      contactEmail: "",
      members: [],
      leader: "",
      apps: [],
      totalLikes: 0,
    })
    setSuccess("團隊創建成功！")
    setIsLoading(false)
    setTimeout(() => setSuccess(""), 3000)
  }

  const handleUpdateTeam = async () => {
    if (!selectedTeam) return

    setError("")

    if (!newTeam.name || !newTeam.contactEmail || newTeam.members.length === 0) {
      setError("請填寫所有必填欄位並至少添加一名成員")
      return
    }

    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))

    updateTeam(selectedTeam.id, newTeam)
    setShowEditTeam(false)
    setSelectedTeam(null)
    setSuccess("團隊更新成功！")
    setIsLoading(false)
    setTimeout(() => setSuccess(""), 3000)
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
          <h1 className="text-3xl font-bold text-gray-900">團隊管理</h1>
          <p className="text-gray-600">管理競賽團隊和成員資訊</p>
        </div>
        <Button
          onClick={() => setShowAddTeam(true)}
          className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          新增團隊
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">總團隊數</p>
                <p className="text-2xl font-bold">{teams.length}</p>
              </div>
              <Users className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">總成員數</p>
                <p className="text-2xl font-bold">{teams.reduce((sum, team) => sum + team.members.length, 0)}</p>
              </div>
              <UserPlus className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">平均團隊規模</p>
                <p className="text-2xl font-bold">
                  {teams.length > 0
                    ? Math.round((teams.reduce((sum, team) => sum + team.members.length, 0) / teams.length) * 10) / 10
                    : 0}
                </p>
              </div>
              <Crown className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="flex-1 relative">
              <Input
                placeholder="搜尋團隊名稱或成員姓名..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Teams Table */}
      <Card>
        <CardHeader>
          <CardTitle>團隊列表 ({filteredTeams.length})</CardTitle>
          <CardDescription>管理所有競賽團隊</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>團隊名稱</TableHead>
                <TableHead>隊長</TableHead>
                <TableHead>部門</TableHead>
                <TableHead>成員數</TableHead>
                <TableHead>應用數</TableHead>
                <TableHead>總按讚數</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTeams.map((team) => {
                const leader = team.members.find((m) => m.id === team.leader)

                return (
                  <TableRow key={team.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                          <Users className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium">{team.name}</p>
                          <p className="text-sm text-gray-500">{team.contactEmail}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Avatar className="w-6 h-6">
                          <AvatarFallback className="bg-green-100 text-green-700 text-xs">
                            {leader?.name[0] || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{leader?.name || "未設定"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-gray-100 text-gray-700">
                        {team.department}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <UserPlus className="w-4 h-4 text-blue-500" />
                        <span>{team.members.length}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{team.apps.length}</span>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-red-600">{team.totalLikes}</span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewTeam(team)}>
                            <Eye className="w-4 h-4 mr-2" />
                            查看詳情
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditTeam(team)}>
                            <Edit className="w-4 h-4 mr-2" />
                            編輯團隊
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteTeam(team)}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            刪除團隊
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Team Dialog */}
      <Dialog open={showAddTeam} onOpenChange={setShowAddTeam}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>新增團隊</DialogTitle>
            <DialogDescription>創建一個新的競賽團隊</DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">基本資訊</TabsTrigger>
              <TabsTrigger value="members">團隊成員</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="teamName">團隊名稱 *</Label>
                  <Input
                    id="teamName"
                    value={newTeam.name}
                    onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                    placeholder="輸入團隊名稱"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="teamDepartment">主要部門</Label>
                  <Select
                    value={newTeam.department}
                    onValueChange={(value) => setNewTeam({ ...newTeam, department: value })}
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
                <Label htmlFor="contactEmail">聯絡信箱 *</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={newTeam.contactEmail}
                  onChange={(e) => setNewTeam({ ...newTeam, contactEmail: e.target.value })}
                  placeholder="team@company.com"
                />
              </div>
            </TabsContent>

            <TabsContent value="members" className="space-y-4">
              <div className="space-y-4">
                <h4 className="font-semibold">新增成員</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="memberName">成員姓名</Label>
                    <Input
                      id="memberName"
                      value={newMember.name}
                      onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                      placeholder="輸入成員姓名"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="memberDepartment">部門</Label>
                    <Select
                      value={newMember.department}
                      onValueChange={(value) => setNewMember({ ...newMember, department: value })}
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
                  <div className="space-y-2">
                    <Label htmlFor="memberRole">角色</Label>
                    <Input
                      id="memberRole"
                      value={newMember.role}
                      onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                      placeholder="例如：開發工程師"
                    />
                  </div>
                </div>
                <Button onClick={handleAddMember} variant="outline" className="w-full bg-transparent">
                  <UserPlus className="w-4 h-4 mr-2" />
                  新增成員
                </Button>
              </div>

              {newTeam.members.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-semibold">團隊成員 ({newTeam.members.length})</h4>
                  <div className="space-y-2">
                    {newTeam.members.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="bg-green-100 text-green-700 text-sm">
                              {member.name[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">{member.name}</span>
                              {member.id === newTeam.leader && (
                                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                                  隊長
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-gray-600">
                              {member.department} • {member.role}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {member.id !== newTeam.leader && (
                            <Button variant="outline" size="sm" onClick={() => handleSetLeader(member.id)}>
                              <Crown className="w-4 h-4 mr-1" />
                              設為隊長
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveMember(member.id)}
                            className="text-red-600 border-red-300 hover:bg-red-50"
                          >
                            <UserMinus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>

          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setShowAddTeam(false)}>
              取消
            </Button>
            <Button onClick={handleAddTeam} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  創建中...
                </>
              ) : (
                "創建團隊"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Team Dialog */}
      <Dialog open={showEditTeam} onOpenChange={setShowEditTeam}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>編輯團隊</DialogTitle>
            <DialogDescription>修改團隊資訊和成員</DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">基本資訊</TabsTrigger>
              <TabsTrigger value="members">團隊成員</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editTeamName">團隊名稱 *</Label>
                  <Input
                    id="editTeamName"
                    value={newTeam.name}
                    onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                    placeholder="輸入團隊名稱"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editTeamDepartment">主要部門</Label>
                  <Select
                    value={newTeam.department}
                    onValueChange={(value) => setNewTeam({ ...newTeam, department: value })}
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
                <Label htmlFor="editContactEmail">聯絡信箱 *</Label>
                <Input
                  id="editContactEmail"
                  type="email"
                  value={newTeam.contactEmail}
                  onChange={(e) => setNewTeam({ ...newTeam, contactEmail: e.target.value })}
                  placeholder="team@company.com"
                />
              </div>
            </TabsContent>

            <TabsContent value="members" className="space-y-4">
              <div className="space-y-4">
                <h4 className="font-semibold">新增成員</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="editMemberName">成員姓名</Label>
                    <Input
                      id="editMemberName"
                      value={newMember.name}
                      onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                      placeholder="輸入成員姓名"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editMemberDepartment">部門</Label>
                    <Select
                      value={newMember.department}
                      onValueChange={(value) => setNewMember({ ...newMember, department: value })}
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
                  <div className="space-y-2">
                    <Label htmlFor="editMemberRole">角色</Label>
                    <Input
                      id="editMemberRole"
                      value={newMember.role}
                      onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                      placeholder="例如：開發工程師"
                    />
                  </div>
                </div>
                <Button onClick={handleAddMember} variant="outline" className="w-full bg-transparent">
                  <UserPlus className="w-4 h-4 mr-2" />
                  新增成員
                </Button>
              </div>

              {newTeam.members.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-semibold">團隊成員 ({newTeam.members.length})</h4>
                  <div className="space-y-2">
                    {newTeam.members.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="bg-green-100 text-green-700 text-sm">
                              {member.name[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">{member.name}</span>
                              {member.id === newTeam.leader && (
                                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                                  隊長
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-gray-600">
                              {member.department} • {member.role}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {member.id !== newTeam.leader && (
                            <Button variant="outline" size="sm" onClick={() => handleSetLeader(member.id)}>
                              <Crown className="w-4 h-4 mr-1" />
                              設為隊長
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveMember(member.id)}
                            className="text-red-600 border-red-300 hover:bg-red-50"
                          >
                            <UserMinus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>

          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setShowEditTeam(false)}>
              取消
            </Button>
            <Button onClick={handleUpdateTeam} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  更新中...
                </>
              ) : (
                "更新團隊"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <span>確認刪除團隊</span>
            </DialogTitle>
            <DialogDescription>
              您確定要刪除團隊「{selectedTeam?.name}」嗎？
              <br />
              <span className="text-red-600 font-medium">此操作無法復原，將會永久刪除團隊的所有資料。</span>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-3 mt-6">
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
              取消
            </Button>
            <Button variant="destructive" onClick={confirmDeleteTeam}>
              <Trash2 className="w-4 h-4 mr-2" />
              確認刪除
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Team Detail Dialog */}
      <Dialog open={showTeamDetail} onOpenChange={setShowTeamDetail}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>團隊詳情</DialogTitle>
            <DialogDescription>查看團隊的詳細資訊</DialogDescription>
          </DialogHeader>

          {selectedTeam && (
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{selectedTeam.name}</h3>
                  <p className="text-gray-600 mb-2">{selectedTeam.contactEmail}</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="bg-gray-100 text-gray-700">
                      {selectedTeam.department}
                    </Badge>
                    <Badge variant="outline" className="bg-blue-100 text-blue-700">
                      {selectedTeam.members.length} 名成員
                    </Badge>
                    <Badge variant="outline" className="bg-green-100 text-green-700">
                      {selectedTeam.apps.length} 個應用
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">團隊ID</p>
                  <p className="font-medium">{selectedTeam.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">總按讚數</p>
                  <p className="font-medium text-red-600">{selectedTeam.totalLikes}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">團隊成員</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedTeam.members.map((member) => (
                    <div key={member.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-green-100 text-green-700">{member.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{member.name}</span>
                          {member.id === selectedTeam.leader && (
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                              隊長
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-gray-600">
                          {member.department} • {member.role}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
