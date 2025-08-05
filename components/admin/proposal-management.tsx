"use client"

import { useState } from "react"
import { useCompetition } from "@/contexts/competition-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Lightbulb,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  FileText,
  Users,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Target,
  AlertCircle,
} from "lucide-react"
import type { Proposal } from "@/types/competition"

export function ProposalManagement() {
  const { proposals, addProposal, updateProposal, getProposalById, teams, getTeamById } = useCompetition()

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTeam, setSelectedTeam] = useState("all")
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null)
  const [showProposalDetail, setShowProposalDetail] = useState(false)
  const [showAddProposal, setShowAddProposal] = useState(false)
  const [showEditProposal, setShowEditProposal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")

  const [newProposal, setNewProposal] = useState({
    title: "",
    description: "",
    problemStatement: "",
    solution: "",
    expectedImpact: "",
    teamId: "",
    attachments: [] as string[],
  })

  const filteredProposals = proposals.filter((proposal) => {
    const team = getTeamById(proposal.teamId)
    const matchesSearch =
      proposal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proposal.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team?.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTeam = selectedTeam === "all" || proposal.teamId === selectedTeam
    return matchesSearch && matchesTeam
  })

  const handleViewProposal = (proposal: Proposal) => {
    setSelectedProposal(proposal)
    setShowProposalDetail(true)
  }

  const handleEditProposal = (proposal: Proposal) => {
    setSelectedProposal(proposal)
    setNewProposal({
      title: proposal.title,
      description: proposal.description,
      problemStatement: proposal.problemStatement,
      solution: proposal.solution,
      expectedImpact: proposal.expectedImpact,
      teamId: proposal.teamId,
      attachments: proposal.attachments || [],
    })
    setShowEditProposal(true)
  }

  const handleDeleteProposal = (proposal: Proposal) => {
    setSelectedProposal(proposal)
    setShowDeleteConfirm(true)
  }

  const confirmDeleteProposal = () => {
    if (selectedProposal) {
      // In a real app, you would call a delete function here
      setShowDeleteConfirm(false)
      setSelectedProposal(null)
      setSuccess("提案刪除成功！")
      setTimeout(() => setSuccess(""), 3000)
    }
  }

  const handleAddProposal = async () => {
    setError("")

    if (
      !newProposal.title ||
      !newProposal.description ||
      !newProposal.problemStatement ||
      !newProposal.solution ||
      !newProposal.expectedImpact ||
      !newProposal.teamId
    ) {
      setError("請填寫所有必填欄位")
      return
    }

    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))

    addProposal({
      ...newProposal,
      submittedAt: new Date().toISOString(),
    })

    setShowAddProposal(false)
    setNewProposal({
      title: "",
      description: "",
      problemStatement: "",
      solution: "",
      expectedImpact: "",
      teamId: "",
      attachments: [],
    })
    setSuccess("提案創建成功！")
    setIsLoading(false)
    setTimeout(() => setSuccess(""), 3000)
  }

  const handleUpdateProposal = async () => {
    if (!selectedProposal) return

    setError("")

    if (
      !newProposal.title ||
      !newProposal.description ||
      !newProposal.problemStatement ||
      !newProposal.solution ||
      !newProposal.expectedImpact ||
      !newProposal.teamId
    ) {
      setError("請填寫所有必填欄位")
      return
    }

    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))

    updateProposal(selectedProposal.id, newProposal)
    setShowEditProposal(false)
    setSelectedProposal(null)
    setSuccess("提案更新成功！")
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
          <h1 className="text-3xl font-bold text-gray-900">提案管理</h1>
          <p className="text-gray-600">管理創新提案和解決方案</p>
        </div>
        <Button
          onClick={() => setShowAddProposal(true)}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          新增提案
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">總提案數</p>
                <p className="text-2xl font-bold">{proposals.length}</p>
              </div>
              <Lightbulb className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">參與團隊</p>
                <p className="text-2xl font-bold">{new Set(proposals.map((p) => p.teamId)).size}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">本月提案</p>
                <p className="text-2xl font-bold">
                  {
                    proposals.filter((p) => {
                      const submittedDate = new Date(p.submittedAt)
                      const now = new Date()
                      return (
                        submittedDate.getMonth() === now.getMonth() && submittedDate.getFullYear() === now.getFullYear()
                      )
                    }).length
                  }
                </p>
              </div>
              <Calendar className="w-8 h-8 text-green-600" />
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
                placeholder="搜尋提案標題、描述或團隊名稱..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-3">
              <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="團隊" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部團隊</SelectItem>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Proposals Table */}
      <Card>
        <CardHeader>
          <CardTitle>提案列表 ({filteredProposals.length})</CardTitle>
          <CardDescription>管理所有創新提案</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>提案標題</TableHead>
                <TableHead>提案團隊</TableHead>
                <TableHead>問題領域</TableHead>
                <TableHead>提交日期</TableHead>
                <TableHead>附件</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProposals.map((proposal) => {
                const team = getTeamById(proposal.teamId)
                const submittedDate = new Date(proposal.submittedAt)

                return (
                  <TableRow key={proposal.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                          <Lightbulb className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium">{proposal.title}</p>
                          <p className="text-sm text-gray-500 line-clamp-1">{proposal.description}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-blue-500 rounded flex items-center justify-center">
                          <Users className="w-3 h-3 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{team?.name || "未知團隊"}</p>
                          <p className="text-xs text-gray-500">{team?.department}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        <p className="text-sm line-clamp-2">{proposal.problemStatement}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{submittedDate.toLocaleDateString()}</p>
                        <p className="text-gray-500">{submittedDate.toLocaleTimeString()}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <FileText className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">{proposal.attachments?.length || 0}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewProposal(proposal)}>
                            <Eye className="w-4 h-4 mr-2" />
                            查看詳情
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditProposal(proposal)}>
                            <Edit className="w-4 h-4 mr-2" />
                            編輯提案
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteProposal(proposal)}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            刪除提案
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

      {/* Add Proposal Dialog */}
      <Dialog open={showAddProposal} onOpenChange={setShowAddProposal}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>新增提案</DialogTitle>
            <DialogDescription>創建一個新的創新提案</DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="proposalTitle">提案標題 *</Label>
                  <Input
                    id="proposalTitle"
                    value={newProposal.title}
                    onChange={(e) => setNewProposal({ ...newProposal, title: e.target.value })}
                    placeholder="輸入提案標題"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="proposalTeam">提案團隊 *</Label>
                  <Select
                    value={newProposal.teamId}
                    onValueChange={(value) => setNewProposal({ ...newProposal, teamId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="選擇團隊" />
                    </SelectTrigger>
                    <SelectContent>
                      {teams.map((team) => (
                        <SelectItem key={team.id} value={team.id}>
                          {team.name} ({team.department})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="proposalDescription">提案描述 *</Label>
                <Textarea
                  id="proposalDescription"
                  value={newProposal.description}
                  onChange={(e) => setNewProposal({ ...newProposal, description: e.target.value })}
                  placeholder="簡要描述提案的核心內容"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="problemStatement">痛點描述 *</Label>
                <Textarea
                  id="problemStatement"
                  value={newProposal.problemStatement}
                  onChange={(e) => setNewProposal({ ...newProposal, problemStatement: e.target.value })}
                  placeholder="詳細描述要解決的問題或痛點"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="solution">解決方案 *</Label>
                <Textarea
                  id="solution"
                  value={newProposal.solution}
                  onChange={(e) => setNewProposal({ ...newProposal, solution: e.target.value })}
                  placeholder="描述您提出的解決方案"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expectedImpact">預期影響 *</Label>
                <Textarea
                  id="expectedImpact"
                  value={newProposal.expectedImpact}
                  onChange={(e) => setNewProposal({ ...newProposal, expectedImpact: e.target.value })}
                  placeholder="描述預期產生的商業和社會影響"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowAddProposal(false)}>
                取消
              </Button>
              <Button onClick={handleAddProposal} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    創建中...
                  </>
                ) : (
                  "創建提案"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Proposal Dialog */}
      <Dialog open={showEditProposal} onOpenChange={setShowEditProposal}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>編輯提案</DialogTitle>
            <DialogDescription>修改提案內容</DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editProposalTitle">提案標題 *</Label>
                  <Input
                    id="editProposalTitle"
                    value={newProposal.title}
                    onChange={(e) => setNewProposal({ ...newProposal, title: e.target.value })}
                    placeholder="輸入提案標題"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editProposalTeam">提案團隊 *</Label>
                  <Select
                    value={newProposal.teamId}
                    onValueChange={(value) => setNewProposal({ ...newProposal, teamId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="選擇團隊" />
                    </SelectTrigger>
                    <SelectContent>
                      {teams.map((team) => (
                        <SelectItem key={team.id} value={team.id}>
                          {team.name} ({team.department})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="editProposalDescription">提案描述 *</Label>
                <Textarea
                  id="editProposalDescription"
                  value={newProposal.description}
                  onChange={(e) => setNewProposal({ ...newProposal, description: e.target.value })}
                  placeholder="簡要描述提案的核心內容"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="editProblemStatement">痛點描述 *</Label>
                <Textarea
                  id="editProblemStatement"
                  value={newProposal.problemStatement}
                  onChange={(e) => setNewProposal({ ...newProposal, problemStatement: e.target.value })}
                  placeholder="詳細描述要解決的問題或痛點"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="editSolution">解決方案 *</Label>
                <Textarea
                  id="editSolution"
                  value={newProposal.solution}
                  onChange={(e) => setNewProposal({ ...newProposal, solution: e.target.value })}
                  placeholder="描述您提出的解決方案"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="editExpectedImpact">預期影響 *</Label>
                <Textarea
                  id="editExpectedImpact"
                  value={newProposal.expectedImpact}
                  onChange={(e) => setNewProposal({ ...newProposal, expectedImpact: e.target.value })}
                  placeholder="描述預期產生的商業和社會影響"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowEditProposal(false)}>
                取消
              </Button>
              <Button onClick={handleUpdateProposal} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    更新中...
                  </>
                ) : (
                  "更新提案"
                )}
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
            <DialogDescription>您確定要刪除提案「{selectedProposal?.title}」嗎？此操作無法復原。</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
              取消
            </Button>
            <Button variant="destructive" onClick={confirmDeleteProposal}>
              確認刪除
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Proposal Detail Dialog */}
      <Dialog open={showProposalDetail} onOpenChange={setShowProposalDetail}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>提案詳情</DialogTitle>
            <DialogDescription>查看提案的詳細資訊</DialogDescription>
          </DialogHeader>

          {selectedProposal && (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">提案概覽</TabsTrigger>
                <TabsTrigger value="details">詳細內容</TabsTrigger>
                <TabsTrigger value="team">提案團隊</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <Lightbulb className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold">{selectedProposal.title}</h3>
                    <p className="text-gray-600 mb-2">{selectedProposal.description}</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="bg-purple-100 text-purple-700">
                        提案賽
                      </Badge>
                      <Badge variant="outline" className="bg-gray-100 text-gray-700">
                        {getTeamById(selectedProposal.teamId)?.name || "未知團隊"}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">提案ID</p>
                    <p className="font-medium">{selectedProposal.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">提交時間</p>
                    <p className="font-medium">{new Date(selectedProposal.submittedAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">提案團隊</p>
                    <p className="font-medium">{getTeamById(selectedProposal.teamId)?.name || "未知團隊"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">附件數量</p>
                    <p className="font-medium">{selectedProposal.attachments?.length || 0} 個</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="details" className="space-y-6">
                <div className="space-y-6">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h5 className="font-semibold text-red-900 mb-2 flex items-center">
                      <AlertCircle className="w-5 h-5 mr-2" />
                      痛點描述
                    </h5>
                    <p className="text-red-800">{selectedProposal.problemStatement}</p>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h5 className="font-semibold text-green-900 mb-2 flex items-center">
                      <CheckCircle className="w-5 h-5 mr-2" />
                      解決方案
                    </h5>
                    <p className="text-green-800">{selectedProposal.solution}</p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h5 className="font-semibold text-blue-900 mb-2 flex items-center">
                      <Target className="w-5 h-5 mr-2" />
                      預期影響
                    </h5>
                    <p className="text-blue-800">{selectedProposal.expectedImpact}</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="team" className="space-y-4">
                {(() => {
                  const team = getTeamById(selectedProposal.teamId)
                  return team ? (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                          <Users className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-lg">{team.name}</h4>
                          <p className="text-gray-600">{team.department}</p>
                          <p className="text-sm text-gray-500">{team.contactEmail}</p>
                        </div>
                      </div>

                      <div>
                        <h5 className="font-medium mb-3">團隊成員</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {team.members.map((member) => (
                            <div key={member.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                <span className="text-green-700 font-medium text-sm">{member.name[0]}</span>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <span className="font-medium">{member.name}</span>
                                  {member.id === team.leader && (
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
                  ) : (
                    <div className="text-center py-8">
                      <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-600 mb-2">團隊資訊不存在</h3>
                      <p className="text-gray-500">無法找到相關的團隊資訊</p>
                    </div>
                  )
                })()}
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
