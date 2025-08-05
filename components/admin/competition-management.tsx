"use client"

import { useState } from "react"
import { useCompetition } from "@/contexts/competition-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import {
  Trophy,
  Plus,
  Award,
  MoreHorizontal,
  Edit,
  Play,
  CheckCircle,
  AlertTriangle,
  Crown,
  UserPlus,
  Loader2,
  Star,
  StarOff,
  Users,
  Settings,
  ClipboardList,
  Link,
  UserCheck,
  Upload,
  Filter,
  User,
  Mail,
  Trash2,
  Eye,
  Search,
  X,
} from "lucide-react"
import type { CompetitionRule, CompetitionAwardType } from "@/types/competition"
import { ScoringManagement } from "./scoring-management"

// Competition data - empty for production
const mockIndividualApps: any[] = []

// Teams data - empty for production
const initialTeams: any[] = []

export function CompetitionManagement() {
  const {
    competitions,
    currentCompetition,
    setCurrentCompetition,
    addCompetition,
    updateCompetition,
    deleteCompetition,
    judges,
    addJudge,
    updateJudge,
    deleteJudge,
    awards,
    addAward,
    getAppDetailedScores,
    judgeScores,
    getAppJudgeScores,
    submitJudgeScore,
  } = useCompetition()

  // Teams state - managed locally for now
  const [teams, setTeams] = useState(initialTeams)

  const [showCreateCompetition, setShowCreateCompetition] = useState(false)
  const [showAddJudge, setShowAddJudge] = useState(false)
  const [showCreateAward, setShowCreateAward] = useState(false)
  const [showScoringManagement, setShowScoringManagement] = useState(false)
  const [showJudgeLinks, setShowJudgeLinks] = useState(false)
  const [showManualScoring, setShowManualScoring] = useState(false)
  const [showCreateTeam, setShowCreateTeam] = useState(false)

  const [showTeamDetail, setShowTeamDetail] = useState(false)
  const [showDeleteTeamConfirm, setShowDeleteTeamConfirm] = useState(false)
  const [selectedCompetition, setSelectedCompetition] = useState<any>(null)
  const [selectedTeam, setSelectedTeam] = useState<any>(null)
  const [teamToDelete, setTeamToDelete] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")

  const [showCompetitionDetail, setShowCompetitionDetail] = useState(false)

  const [showDeleteCompetitionConfirm, setShowDeleteCompetitionConfirm] = useState(false)
  const [showChangeStatusDialog, setShowChangeStatusDialog] = useState(false)
  const [selectedCompetitionForAction, setSelectedCompetitionForAction] = useState<any>(null)
  const [newStatus, setNewStatus] = useState("")

  // 奖项搜索和筛选状态
  const [awardSearchQuery, setAwardSearchQuery] = useState("")
  const [awardYearFilter, setAwardYearFilter] = useState("all")
  const [awardMonthFilter, setAwardMonthFilter] = useState("all")
  const [awardTypeFilter, setAwardTypeFilter] = useState("all")
  const [awardCompetitionTypeFilter, setAwardCompetitionTypeFilter] = useState("all")

  // 当筛选条件改变时重置分页
  const resetAwardPagination = () => {
    setAwardCurrentPage(1)
  }

  // Manual scoring states
  const [manualScoring, setManualScoring] = useState({
    judgeId: "",
    participantId: "",
    participantType: "individual" as "individual" | "team",
    scores: {} as Record<string, number>,
    comments: "",
  })
  
  // 混合賽的參賽者類型選擇
  const [selectedParticipantType, setSelectedParticipantType] = useState<"individual" | "team">("individual")

  // Form states - Updated for mixed competition support
  const [newCompetition, setNewCompetition] = useState({
    name: "",
    type: "individual" as "individual" | "team" | "mixed",
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    startDate: "",
    endDate: "",
    description: "",
    status: "upcoming" as const,
    // For individual and team competitions
    judges: [] as string[],
    participatingApps: [] as string[],
    participatingTeams: [] as string[],
    evaluationFocus: "",
    rules: [] as CompetitionRule[],
    awardTypes: [] as CompetitionAwardType[],
    // For mixed competitions - separate configurations
    individualConfig: {
      judges: [] as string[],
      rules: [] as CompetitionRule[],
      awardTypes: [] as CompetitionAwardType[],
      evaluationFocus: "",
    },
    teamConfig: {
      judges: [] as string[],
      rules: [] as CompetitionRule[],
      awardTypes: [] as CompetitionAwardType[],
      evaluationFocus: "",
    },
  })

  const [newJudge, setNewJudge] = useState({
    name: "",
    title: "",
    department: "",
    expertise: "",
  })

  const [newAward, setNewAward] = useState({
    competitionId: "",
    participantId: "",
    participantType: "individual" as "individual" | "team",
    awardType: "custom" as const,
    awardName: "",
    customAwardTypeId: "",
    description: "",
    score: 0,
    category: "innovation" as const,
    rank: 0,
    applicationLinks: {
      production: "",
      demo: "",
      github: "",
    },
    documents: [] as { id: string; name: string; type: string; size: string; uploadDate: string; url: string }[],
    judgeComments: "",
    photos: [] as { id: string; name: string; url: string; caption: string; uploadDate: string; size: string }[],
  })

  // Team form states
  const [newTeam, setNewTeam] = useState({
    name: "",
    leader: "",
    department: "HQBU",
    contactEmail: "",
    leaderPhone: "",
    description: "",
    members: [] as Array<{ id: string; name: string; department: string; role: string }>,
    apps: [] as string[],
    appLinks: [] as string[],
    submittedAppCount: 0,
  })

  const [newMember, setNewMember] = useState({
    name: "",
    department: "HQBU",
    role: "成員",
  })

  const [newApp, setNewApp] = useState({
    name: "",
    link: "",
  })

  const [createError, setCreateError] = useState("")

  // Participant selection states - separate for mixed competitions
  const [participantSearchTerm, setParticipantSearchTerm] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState<string>("all")
  const [individualParticipantSearchTerm, setIndividualParticipantSearchTerm] = useState("")
  const [teamParticipantSearchTerm, setTeamParticipantSearchTerm] = useState("")
  const [individualDepartmentFilter, setIndividualDepartmentFilter] = useState<string>("all")
  const [teamDepartmentFilter, setTeamDepartmentFilter] = useState<string>("all")

  // Get participants based on competition type
  const [selectedJudge, setSelectedJudge] = useState<any>(null)
  const [showJudgeDetail, setShowJudgeDetail] = useState(false)

  const [showDeleteJudgeConfirm, setShowDeleteJudgeConfirm] = useState(false)

  // 獎項相關狀態
  const [showAwardDetail, setShowAwardDetail] = useState(false)
  const [selectedAward, setSelectedAward] = useState<any>(null)
  const [showDeleteAwardConfirm, setShowDeleteAwardConfirm] = useState(false)
  const [awardToDelete, setAwardToDelete] = useState<any>(null)
  
  // 評審分頁和篩選狀態
  const [judgeCurrentPage, setJudgeCurrentPage] = useState(1)
  const [judgeSearchTerm, setJudgeSearchTerm] = useState("")
  const [judgeDepartmentFilter, setJudgeDepartmentFilter] = useState<string>("all")
  const [judgeExpertiseFilter, setJudgeExpertiseFilter] = useState<string>("all")
  const judgesPerPage = 6

  // 團隊分頁和篩選狀態
  const [teamCurrentPage, setTeamCurrentPage] = useState(1)
  const [teamSearchTerm, setTeamSearchTerm] = useState("")
  const teamsPerPage = 6

  // 獎項分頁狀態
  const [awardCurrentPage, setAwardCurrentPage] = useState(1)
  const awardsPerPage = 6

  // Get participants based on competition type
  const getParticipants = (competitionType: string) => {
    switch (competitionType) {
      case "individual":
        return mockIndividualApps
      case "team":
        return teams
      default:
        return []
    }
  }

  // Filter participants - updated for mixed competitions
  const getFilteredParticipants = (competitionType: string) => {
    const participants = getParticipants(competitionType)
    let searchTerm = participantSearchTerm
    let departmentFilterValue = departmentFilter

    // Use separate search terms for mixed competitions
    if (newCompetition.type === "mixed") {
      searchTerm = competitionType === "individual" ? individualParticipantSearchTerm : teamParticipantSearchTerm
      departmentFilterValue = competitionType === "individual" ? individualDepartmentFilter : teamDepartmentFilter
    }

    return participants.filter((participant) => {
      const searchField = competitionType === "team" ? participant.name : participant.name
      const creatorField = competitionType === "team" ? participant.leader : participant.creator

      const matchesSearch =
        searchField.toLowerCase().includes(searchTerm.toLowerCase()) ||
        creatorField.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesDepartment = departmentFilterValue === "all" || participant.department === departmentFilterValue
      return matchesSearch && matchesDepartment
    })
  }

  const resetForm = () => {
    setNewCompetition({
      name: "",
      type: "individual",
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      startDate: "",
      endDate: "",
      description: "",
      status: "upcoming",
      judges: [],
      participatingApps: [],
      participatingTeams: [],
      evaluationFocus: "",
      rules: [],
      awardTypes: [],
      individualConfig: {
        judges: [],
        rules: [],
        awardTypes: [],
        evaluationFocus: "",
      },
      teamConfig: {
        judges: [],
        rules: [],
        awardTypes: [],
        evaluationFocus: "",
      },
    })
    // Reset search terms
    setParticipantSearchTerm("")
    setDepartmentFilter("all")
    setIndividualParticipantSearchTerm("")
    setTeamParticipantSearchTerm("")
    setIndividualDepartmentFilter("all")
    setTeamDepartmentFilter("all")
  }

  const resetTeamForm = () => {
    setNewTeam({
      name: "",
      leader: "",
      department: "HQBU",
      contactEmail: "",
      leaderPhone: "",
      description: "",
      members: [],
      apps: [],
      appLinks: [],
      submittedAppCount: 0,
    })
    setNewMember({
      name: "",
      department: "HQBU",
      role: "成員",
    })
    setNewApp({
      name: "",
      link: "",
    })
  }

  const handleCreateCompetition = async () => {
    setCreateError("")

    if (!newCompetition.name || !newCompetition.startDate || !newCompetition.endDate) {
      setCreateError("請填寫所有必填欄位")
      return
    }

    // Validation for mixed competitions
    if (newCompetition.type === "mixed") {
      if (newCompetition.individualConfig.judges.length === 0 && newCompetition.teamConfig.judges.length === 0) {
        setCreateError("混合賽至少需要為個人賽或團體賽選擇評審")
        return
      }

      // Check if at least one competition type has participants
      const hasParticipants =
        newCompetition.participatingApps.length > 0 || newCompetition.participatingTeams.length > 0
      if (!hasParticipants) {
        setCreateError("請至少選擇一個個人賽應用或團隊賽團隊")
        return
      }

      // Validate individual rules if there are individual participants and judges
      if (newCompetition.participatingApps.length > 0 && newCompetition.individualConfig.judges.length > 0) {
        if (newCompetition.individualConfig.rules.length > 0) {
          const individualTotalWeight = newCompetition.individualConfig.rules.reduce(
            (sum, rule) => sum + rule.weight,
            0,
          )
          if (individualTotalWeight !== 100) {
            setCreateError("個人賽評比標準權重總和必須為 100%")
            return
          }
        }
      }

      // Validate team rules if there are team participants and judges
      if (newCompetition.participatingTeams.length > 0 && newCompetition.teamConfig.judges.length > 0) {
        if (newCompetition.teamConfig.rules.length > 0) {
          const teamTotalWeight = newCompetition.teamConfig.rules.reduce((sum, rule) => sum + rule.weight, 0)
          if (teamTotalWeight !== 100) {
            setCreateError("團體賽評比標準權重總和必須為 100%")
            return
          }
        }
      }
    } else {
      // Validation for single type competitions
      if (newCompetition.judges.length === 0) {
        setCreateError("請至少選擇一位評審")
        return
      }

      const hasParticipants =
        (newCompetition.type === "individual" && newCompetition.participatingApps.length > 0) ||
        (newCompetition.type === "team" && newCompetition.participatingTeams.length > 0)

      if (!hasParticipants) {
        setCreateError("請至少選擇一個參賽項目")
        return
      }

      if (newCompetition.rules.length > 0) {
        const totalWeight = newCompetition.rules.reduce((sum, rule) => sum + rule.weight, 0)
        if (totalWeight !== 100) {
          setCreateError("評比標準權重總和必須為 100%")
          return
        }

        const hasEmptyRule = newCompetition.rules.some((rule) => !rule.name.trim() || !rule.description.trim())
        if (hasEmptyRule) {
          setCreateError("請填寫所有評比標準的名稱和描述")
          return
        }
      }

      if (newCompetition.awardTypes.length > 0) {
        const hasEmptyAwardType = newCompetition.awardTypes.some(
          (awardType) => !awardType.name.trim() || !awardType.description.trim(),
        )
        if (hasEmptyAwardType) {
          setCreateError("請填寫所有獎項類型的名稱和描述")
          return
        }
      }
    }

    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))

    if (selectedCompetitionForAction) {
      // 編輯模式 - 更新現有競賽
      updateCompetition(selectedCompetitionForAction.id, newCompetition)
      setSuccess("競賽更新成功！")
    } else {
      // 創建模式 - 新增競賽
      const competitionWithId = {
        ...newCompetition,
        id: `c${Date.now()}`,
        createdAt: new Date().toISOString(),
      }
      addCompetition(competitionWithId)
      setSuccess("競賽創建成功！")
    }

    setShowCreateCompetition(false)
    setSelectedCompetitionForAction(null)
    setCreateError("")
    resetForm()
    setIsLoading(false)
    setTimeout(() => setSuccess(""), 3000)
  }

  const handleCreateTeam = async () => {
    setCreateError("")

    if (!newTeam.name || !newTeam.leader || !newTeam.contactEmail) {
      setCreateError("請填寫團隊名稱、隊長和聯絡信箱")
      return
    }

    if (newTeam.members.length === 0) {
      setCreateError("請至少添加一名團隊成員")
      return
    }

    // Check if leader is in members list
    const leaderInMembers = newTeam.members.some((member) => member.name === newTeam.leader)
    if (!leaderInMembers) {
      setCreateError("隊長必須在團隊成員列表中")
      return
    }

    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))

    if (selectedTeam) {
      // 編輯模式 - 更新現有團隊
      const updatedTeam = {
        ...selectedTeam,
        ...newTeam,
        memberCount: newTeam.members.length,
        submittedAppCount: newTeam.apps.length,
      }
      const updatedTeams = teams.map(team => 
        team.id === selectedTeam.id ? updatedTeam : team
      )
      setTeams(updatedTeams)
      setSuccess("團隊更新成功！")
    } else {
      // 創建模式 - 新增團隊
    const team = {
      id: `t${Date.now()}`,
      ...newTeam,
      memberCount: newTeam.members.length,
      submissionDate: new Date().toISOString().split("T")[0],
      submittedAppCount: newTeam.apps.length,
    }
    setTeams([...teams, team])
      setSuccess("團隊創建成功！")
    }

    setShowCreateTeam(false)
    setSelectedTeam(null)
    resetTeamForm()
    setIsLoading(false)
    setTimeout(() => setSuccess(""), 3000)
  }

  const handleEditTeam = (team: any) => {
    setSelectedTeam(team)
    setNewTeam({
      name: team.name,
      leader: team.leader,
      department: team.department,
      contactEmail: team.contactEmail,
      leaderPhone: team.leaderPhone || "",
      description: team.description,
      members: [...team.members],
      apps: [...team.apps],
      appLinks: [...team.appLinks],
      submittedAppCount: team.submittedAppCount,
    })
    setShowCreateTeam(true) // 使用創建團隊對話框
  }



  const handleDeleteTeam = (team: any) => {
    setTeamToDelete(team)
    setShowDeleteTeamConfirm(true)
  }

  const handleConfirmDeleteTeam = async () => {
    if (!teamToDelete) return

    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 500))

    setTeams(teams.filter((team) => team.id !== teamToDelete.id))
    setShowDeleteTeamConfirm(false)
    setTeamToDelete(null)
    setSuccess("團隊刪除成功！")
    setIsLoading(false)
    setTimeout(() => setSuccess(""), 3000)
  }

  const handleAddMember = () => {
    if (!newMember.name.trim()) {
      setCreateError("請輸入成員姓名")
      return
    }

    const member = {
      id: `m${Date.now()}`,
      name: newMember.name,
      department: newMember.department,
      role: newMember.role,
    }

    setNewTeam({
      ...newTeam,
      members: [...newTeam.members, member],
    })

    setNewMember({
      name: "",
      department: "HQBU",
      role: "成員",
    })
    setCreateError("")
  }

  const handleRemoveMember = (memberId: string) => {
    setNewTeam({
      ...newTeam,
      members: newTeam.members.filter((m) => m.id !== memberId),
    })
  }

  const handleAddApp = () => {
    if (!newApp.name.trim()) {
      setCreateError("請輸入應用名稱")
      return
    }

    setNewTeam({
      ...newTeam,
      apps: [...newTeam.apps, newApp.name],
      appLinks: [...newTeam.appLinks, newApp.link],
    })

    setNewApp({
      name: "",
      link: "",
    })
    setCreateError("")
  }

  const handleRemoveApp = (index: number) => {
    const newApps = [...newTeam.apps]
    const newAppLinks = [...newTeam.appLinks]
    newApps.splice(index, 1)
    newAppLinks.splice(index, 1)

    setNewTeam({
      ...newTeam,
      apps: newApps,
      appLinks: newAppLinks,
    })
  }

  const handleAddJudge = async () => {
    setError("")

    if (!newJudge.name || !newJudge.title || !newJudge.department) {
      setError("請填寫所有必填欄位")
      return
    }

    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))

    if (selectedJudge) {
      // 編輯模式 - 更新現有評審
      updateJudge(selectedJudge.id, {
        ...newJudge,
        expertise: newJudge.expertise
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      })
      setSuccess("評審更新成功！")
    } else {
      // 新增模式 - 新增評審
    addJudge({
      ...newJudge,
      expertise: newJudge.expertise
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    })
      setSuccess("評審新增成功！")
    }

    setShowAddJudge(false)
    setSelectedJudge(null)
    setNewJudge({
      name: "",
      title: "",
      department: "",
      expertise: "",
    })
    setIsLoading(false)
    setTimeout(() => setSuccess(""), 3000)
  }

  const handleEditJudge = (judge: any) => {
    setSelectedJudge(judge)
    setNewJudge({
      name: judge.name,
      title: judge.title,
      department: judge.department,
      expertise: judge.expertise.join(", "),
    })
    setShowAddJudge(true) // 使用新增評審對話框
  }

  const handleDeleteJudge = (judge: any) => {
    setSelectedJudge(judge)
    setShowDeleteJudgeConfirm(true)
  }



  const confirmDeleteJudge = async () => {
    if (!selectedJudge) return

    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 500))

    deleteJudge(selectedJudge.id)
    setShowDeleteJudgeConfirm(false)
    setSelectedJudge(null)
    setSuccess("評審刪除成功！")
    setIsLoading(false)
    setTimeout(() => setSuccess(""), 3000)
  }

  const handleCreateAward = async () => {
    setError("")

    if (!newAward.competitionId || !newAward.participantId || !newAward.awardName) {
      setError("請填寫所有必填欄位")
      return
    }

    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const competition = competitions.find((c) => c.id === newAward.competitionId)
    let participant: any = null
    let participantName = ""
    let creatorName = ""

    // Get participant based on type
    if (newAward.participantType === "individual") {
      // 示例個人應用數據
      const mockIndividualApps = [
        { id: "app1", name: "智能客服系統", creator: "張小明", department: "ITBU" },
        { id: "app2", name: "數據分析平台", creator: "李美華", department: "研發部" },
      ]
      participant = mockIndividualApps.find((a) => a.id === newAward.participantId)
      participantName = participant?.name || ""
      creatorName = participant?.creator || ""
    } else if (newAward.participantType === "team") {
      participant = teams.find((t) => t.id === newAward.participantId)
      participantName = participant?.name || ""
      creatorName = participant?.leader || ""
    }

    if (competition && participant) {
      // 根據獎項類型設定圖標
      let icon = "🏆"
      switch (newAward.awardType) {
        case "gold": icon = "🥇"; break;
        case "silver": icon = "🥈"; break;
        case "bronze": icon = "🥉"; break;
        case "popular": icon = "👥"; break;
        case "innovation": icon = "💡"; break;
        case "technical": icon = "⚙️"; break;
        default: icon = "🏆"; break;
      }

      const award = {
        id: `award_${Date.now()}`,
        competitionId: newAward.competitionId,
        appId: newAward.participantType === "individual" ? newAward.participantId : undefined,
        teamId: newAward.participantType === "team" ? newAward.participantId : undefined,
        appName: newAward.participantType === "individual" ? participantName : undefined,
        creator: creatorName,
        awardType: newAward.awardType,
        awardName: newAward.awardName,
        score: newAward.score,
        year: competition.year,
        month: competition.month,
        icon,
        rank: newAward.rank,
        category: newAward.category,
        competitionType: newAward.participantType,
        description: newAward.description,
        judgeComments: newAward.judgeComments,
        applicationLinks: newAward.applicationLinks,
        documents: newAward.documents,
        photos: newAward.photos,
      }

      addAward(award)
    }

    setShowCreateAward(false)
    setNewAward({
      competitionId: "",
      participantId: "",
      participantType: "individual",
      awardType: "custom",
      awardName: "",
      customAwardTypeId: "",
      description: "",
      score: 0,
      category: "innovation",
      rank: 0,
      applicationLinks: {
        production: "",
        demo: "",
        github: "",
      },
      documents: [],
      judgeComments: "",
      photos: [],
    })
    setSuccess(selectedAward ? "獎項更新成功！" : "獎項創建成功！")
    setIsLoading(false)
    setTimeout(() => setSuccess(""), 3000)
  }

  const handleViewAward = (award: any) => {
    setSelectedAward(award)
    setShowAwardDetail(true)
  }

  const handleEditAward = (award: any) => {
    setSelectedAward(award)
    setNewAward({
      competitionId: award.competitionId,
      participantId: award.appId || award.teamId || "",
      participantType: award.competitionType,
      awardType: award.awardType,
      awardName: award.awardName,
      customAwardTypeId: award.customAwardTypeId || "",
      description: (award as any).description || "",
      score: award.score,
      category: award.category,
      rank: award.rank,
      applicationLinks: (award as any).applicationLinks || {
        production: "",
        demo: "",
        github: "",
      },
      documents: (award as any).documents || [],
      judgeComments: (award as any).judgeComments || "",
      photos: (award as any).photos || [],
    })
    setShowCreateAward(true)
  }

  const handleDeleteAward = (award: any) => {
    setAwardToDelete(award)
    setShowDeleteAwardConfirm(true)
  }

  const confirmDeleteAward = async () => {
    if (!awardToDelete) return

    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 500))

    // 這裡應該調用 context 中的刪除函數
    // deleteAward(awardToDelete.id)
    
    setShowDeleteAwardConfirm(false)
    setAwardToDelete(null)
    setSuccess("獎項刪除成功！")
    setIsLoading(false)
    setTimeout(() => setSuccess(""), 3000)
  }

  const handleManualScoring = (competition: any) => {
    setSelectedCompetition(competition)
    
    // 設定初始參賽者類型
    if (competition.type === "mixed") {
      setSelectedParticipantType("individual") // 混合賽預設從個人賽開始
    } else {
      setSelectedParticipantType(competition.type)
    }
    
    // 初始化評分項目
    const initialScores = getInitialScores(competition, competition.type === "mixed" ? "individual" : competition.type)
    
    setManualScoring({
      judgeId: "",
      participantId: "",
      participantType: competition.type || "individual",
      scores: initialScores,
      comments: "",
    })
    setShowManualScoring(true)
  }
  
  // 獲取初始評分項目的輔助函數
  const getInitialScores = (competition: any, participantType: "individual" | "team") => {
    const initialScores: Record<string, number> = {}
    
    if (competition.type === "mixed") {
      // 混合賽：根據參賽者類型選擇對應的評分規則
      const config = participantType === "individual" ? competition.individualConfig : competition.teamConfig
      if (config && config.rules && config.rules.length > 0) {
        config.rules.forEach((rule: any) => {
          initialScores[rule.name] = 0
        })
      } else {
        // 預設評分項目
        getDefaultScoringItems(participantType).forEach(item => {
          initialScores[item.name] = 0
        })
      }
    } else {
      // 單一類型競賽
      if (competition.rules && competition.rules.length > 0) {
        competition.rules.forEach((rule: any) => {
          initialScores[rule.name] = 0
        })
      } else {
        // 預設評分項目
        getDefaultScoringItems(participantType).forEach(item => {
          initialScores[item.name] = 0
        })
      }
    }
    
    return initialScores
  }
  
  // 獲取預設評分項目
  const getDefaultScoringItems = (participantType: "individual" | "team") => {
    if (participantType === "team") {
      return [
        { name: '團隊合作', description: '團隊協作和溝通能力' },
        { name: '創新性', description: '創新程度和獨特性' },
        { name: '技術性', description: '技術實現的複雜度和品質' },
        { name: '實用性', description: '實際應用價值和用戶體驗' },
        { name: '展示效果', description: '團隊展示的清晰度和吸引力' }
      ]
    } else {
      return [
        { name: '創新性', description: '創新程度和獨特性' },
        { name: '技術性', description: '技術實現的複雜度和品質' },
        { name: '實用性', description: '實際應用價值和用戶體驗' },
        { name: '展示效果', description: '展示的清晰度和吸引力' },
        { name: '影響力', description: '對行業或社會的潛在影響' }
      ]
    }
  }
  
  // 處理參賽者類型變更（僅針對混合賽）
  const handleParticipantTypeChange = (newType: "individual" | "team") => {
    setSelectedParticipantType(newType)
    
    // 重新初始化評分項目
    const newScores = getInitialScores(selectedCompetition, newType)
    setManualScoring({
      ...manualScoring,
      participantId: "", // 清空選擇的參賽者
      scores: newScores,
    })
  }

  const handleSubmitManualScore = async () => {
    setError("")

    if (!manualScoring.judgeId || !manualScoring.participantId) {
      setError("請選擇評審和參賽項目")
      return
    }

    const hasAllScores = Object.values(manualScoring.scores).every((score) => score > 0)
    if (!hasAllScores) {
      setError("請為所有評分項目打分")
      return
    }

    if (!manualScoring.comments.trim()) {
      setError("請填寫評審意見")
      return
    }

    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))

    submitJudgeScore({
      judgeId: manualScoring.judgeId,
      appId: manualScoring.participantId, // Using appId field for all participant types
      scores: manualScoring.scores,
      comments: manualScoring.comments.trim(),
    })

    setManualScoring({
      judgeId: "",
      participantId: "",
      participantType: "individual",
      scores: {
        innovation: 0,
        technical: 0,
        usability: 0,
        presentation: 0,
        impact: 0,
      },
      comments: "",
    })

    setSuccess("評分提交成功！")
    setIsLoading(false)
    setTimeout(() => setSuccess(""), 3000)
  }

  const handleViewCompetition = (competition: any) => {
    setSelectedCompetitionForAction(competition)
    setShowCompetitionDetail(true)
  }

  const handleEditCompetition = (competition: any) => {
    setSelectedCompetitionForAction(competition)
    setNewCompetition({
      name: competition.name,
      type: competition.type,
      year: competition.year,
      month: competition.month,
      startDate: competition.startDate,
      endDate: competition.endDate,
      description: competition.description,
      status: competition.status,
      judges: competition.judges || [],
      participatingApps: competition.participatingApps || [],
      participatingTeams: competition.participatingTeams || [],
      evaluationFocus: competition.evaluationFocus || "",
      rules: competition.rules || [],
      awardTypes: competition.awardTypes || [],
      individualConfig: competition.individualConfig || {
        judges: [],
        rules: [],
        awardTypes: [],
        evaluationFocus: "",
      },
      teamConfig: competition.teamConfig || {
        judges: [],
        rules: [],
        awardTypes: [],
        evaluationFocus: "",
      },
    })
    setShowCreateCompetition(true) // 使用創建競賽對話框
  }

  const handleDeleteCompetition = (competition: any) => {
    setSelectedCompetitionForAction(competition)
    setShowDeleteCompetitionConfirm(true)
  }

  const handleChangeStatus = (competition: any) => {
    setSelectedCompetitionForAction(competition)
    setNewStatus(competition.status)
    setShowChangeStatusDialog(true)
  }



  const confirmDeleteCompetition = async () => {
    if (!selectedCompetitionForAction) return

    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 500))

    deleteCompetition(selectedCompetitionForAction.id)
    setShowDeleteCompetitionConfirm(false)
    setSelectedCompetitionForAction(null)
    setSuccess("競賽刪除成功！")
    setIsLoading(false)
    setTimeout(() => setSuccess(""), 3000)
  }

  const handleUpdateStatus = async () => {
    if (!selectedCompetitionForAction) return

    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 500))

    updateCompetition(selectedCompetitionForAction.id, {
      ...selectedCompetitionForAction,
      status: newStatus,
    })

    setShowChangeStatusDialog(false)
    setSelectedCompetitionForAction(null)
    setSuccess("競賽狀態更新成功！")
    setIsLoading(false)
    setTimeout(() => setSuccess(""), 3000)
  }

  const getCompetitionTypeIcon = (type: string) => {
    switch (type) {
      case "individual":
        return <User className="w-4 h-4" />
      case "team":
        return <Users className="w-4 h-4" />
      case "mixed":
        return <Trophy className="w-4 h-4" />
      default:
        return <Trophy className="w-4 h-4" />
    }
  }

  const getScoreLabelText = (key: string) => {
    switch (key) {
      case "innovation":
        return "創新性"
      case "technical":
        return "技術性"
      case "usability":
        return "實用性"
      case "presentation":
        return "展示性"
      case "impact":
        return "影響力"
      default:
        return key
    }
  }

  const getCompetitionTypeText = (type: string) => {
    switch (type) {
      case "individual":
        return "個人賽"
      case "team":
        return "團體賽"
      case "mixed":
        return "混合賽"
      default:
        return "未知類型"
    }
  }

  const getParticipantCount = (competition: any) => {
    switch (competition.type) {
      case "individual":
        return competition.participatingApps?.length || 0
      case "team":
        return competition.participatingTeams?.length || 0
      case "mixed":
        return (competition.participatingApps?.length || 0) + (competition.participatingTeams?.length || 0)
      default:
        return 0
    }
  }

  const getScoringProgress = (competitionId: string) => {
    const competition = competitions.find((c) => c.id === competitionId)
    if (!competition) return { completed: 0, total: 0, percentage: 0 }

    const participantCount = getParticipantCount(competition)
    const totalExpected = competition.judges.length * participantCount
    const completed = judgeScores.filter((score) => {
      const individualParticipants = competition.participatingApps || []
      const teamParticipants = competition.participatingTeams || []
      const allParticipants = [...individualParticipants, ...teamParticipants]
      return allParticipants.includes(score.appId) && competition.judges.includes(score.judgeId)
    }).length

    return {
      completed,
      total: totalExpected,
      percentage: totalExpected > 0 ? Math.round((completed / totalExpected) * 100) : 0,
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200"
      case "active":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "judging":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "upcoming":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "已完成"
      case "active":
        return "進行中"
      case "judging":
        return "評審中"
      case "upcoming":
        return "即將開始"
      default:
        return status
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setSuccess("連結已複製到剪貼簿！")
    setTimeout(() => setSuccess(""), 3000)
  }

  // 获取筛选后的奖项
  const getFilteredAwards = () => {
    let filteredAwards = [...awards]

    // 搜索功能 - 按应用名称、创作者或奖项名称搜索
    if (awardSearchQuery.trim()) {
      const query = awardSearchQuery.toLowerCase().trim()
      filteredAwards = filteredAwards.filter((award) => {
        return (
          award.appName?.toLowerCase().includes(query) ||
          award.creator?.toLowerCase().includes(query) ||
          award.awardName?.toLowerCase().includes(query)
        )
      })
    }

    // 年份筛选
    if (awardYearFilter !== "all") {
      filteredAwards = filteredAwards.filter((award) => award.year === Number.parseInt(awardYearFilter))
    }

    // 月份筛选
    if (awardMonthFilter !== "all") {
      filteredAwards = filteredAwards.filter((award) => award.month === Number.parseInt(awardMonthFilter))
    }

    // 奖项类型筛选
    if (awardTypeFilter !== "all") {
      if (awardTypeFilter === "ranking") {
        filteredAwards = filteredAwards.filter((award) => award.rank > 0 && award.rank <= 3)
      } else if (awardTypeFilter === "popular") {
        filteredAwards = filteredAwards.filter((award) => award.awardType === "popular")
      } else {
        filteredAwards = filteredAwards.filter((award) => award.awardType === awardTypeFilter)
      }
    }

    // 竞赛类型筛选
    if (awardCompetitionTypeFilter !== "all") {
      filteredAwards = filteredAwards.filter((award) => award.competitionType === awardCompetitionTypeFilter)
    }

    return filteredAwards.sort((a, b) => {
      // 按年份、月份、排名排序
      if (a.year !== b.year) return b.year - a.year
      if (a.month !== b.month) return b.month - a.month
      if (a.rank !== b.rank) {
        if (a.rank === 0) return 1
        if (b.rank === 0) return -1
        return a.rank - b.rank
      }
      return 0
    })
  }

  const judgeScoringUrl = typeof window !== "undefined" ? `${window.location.origin}/judge-scoring` : "/judge-scoring"

  // Filter out proposal competitions from display
  const displayCompetitions = competitions.filter((competition) => competition.type !== "proposal")

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
          <h1 className="text-3xl font-bold text-gray-900">競賽管理</h1>
          <p className="text-gray-600">管理個人賽、團體賽、混合賽競賽活動</p>
          {currentCompetition && (
            <div className="flex items-center mt-2 text-sm text-purple-600">
              <Star className="w-4 h-4 mr-1" />
              當前競賽：{currentCompetition.name} ({getCompetitionTypeText(currentCompetition.type)})
            </div>
          )}
        </div>
        <div className="flex space-x-3">
          <Button
            onClick={() => setShowCreateCompetition(true)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            創建競賽
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">總競賽數</p>
                <p className="text-2xl font-bold">{displayCompetitions.length}</p>
              </div>
              <Trophy className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">進行中</p>
                <p className="text-2xl font-bold">{displayCompetitions.filter((c) => c.status === "active").length}</p>
              </div>
              <Play className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">評審團</p>
                <p className="text-2xl font-bold">{judges.length}</p>
              </div>
              <Crown className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">已頒獎項</p>
                <p className="text-2xl font-bold">{awards.length}</p>
              </div>
              <Award className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="competitions" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="competitions">競賽列表</TabsTrigger>
          <TabsTrigger value="teams">團隊管理</TabsTrigger>
          <TabsTrigger value="judges">評審管理</TabsTrigger>
          <TabsTrigger value="scoring">評分管理</TabsTrigger>
          <TabsTrigger value="awards">獎項管理</TabsTrigger>
        </TabsList>

        <TabsContent value="competitions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>競賽列表</CardTitle>
              <CardDescription>管理所有競賽活動</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>競賽名稱</TableHead>
                    <TableHead>類型</TableHead>
                    <TableHead>時間</TableHead>
                    <TableHead>狀態</TableHead>
                    <TableHead>參賽項目</TableHead>
                    <TableHead>評分進度</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayCompetitions.map((competition) => {
                    const isCurrentCompetition = currentCompetition?.id === competition.id
                    const scoringProgress = getScoringProgress(competition.id)
                    const participantCount = getParticipantCount(competition)

                    return (
                      <TableRow key={competition.id} className={isCurrentCompetition ? "bg-purple-50" : ""}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {isCurrentCompetition && <Star className="w-4 h-4 text-purple-600 fill-current" />}
                            <div>
                              <p className="font-medium">{competition.name}</p>
                              <p className="text-sm text-gray-500">{competition.description}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getCompetitionTypeIcon(competition.type)}
                            <Badge variant="outline" className="text-xs">
                              {getCompetitionTypeText(competition.type)}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p>
                              {competition.year}年{competition.month}月
                            </p>
                            <p className="text-gray-500">
                              {competition.startDate} ~ {competition.endDate}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getStatusColor(competition.status)}>
                            {getStatusText(competition.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            {getCompetitionTypeIcon(competition.type)}
                            <span>{participantCount} 個</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <Progress value={scoringProgress.percentage} className="w-16 h-2" />
                              <span className="text-xs text-gray-500">
                                {scoringProgress.completed}/{scoringProgress.total}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500">{scoringProgress.percentage}% 完成</p>
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
                              <DropdownMenuItem onClick={() => handleViewCompetition(competition)}>
                                <Eye className="w-4 h-4 mr-2" />
                                查看詳情
                              </DropdownMenuItem>

                              <DropdownMenuItem onClick={() => handleEditCompetition(competition)}>
                                <Edit className="w-4 h-4 mr-2" />
                                編輯競賽
                              </DropdownMenuItem>

                              <DropdownMenuItem onClick={() => handleChangeStatus(competition)}>
                                <Settings className="w-4 h-4 mr-2" />
                                修改狀態
                              </DropdownMenuItem>

                              <DropdownMenuItem onClick={() => handleManualScoring(competition)}>
                                <ClipboardList className="w-4 h-4 mr-2" />
                                手動評分
                              </DropdownMenuItem>

                              {!isCurrentCompetition && (
                                <DropdownMenuItem onClick={() => setCurrentCompetition(competition)}>
                                  <Star className="w-4 h-4 mr-2" />
                                  設為當前競賽
                                </DropdownMenuItem>
                              )}

                              {isCurrentCompetition && (
                                <DropdownMenuItem onClick={() => setCurrentCompetition(null)}>
                                  <StarOff className="w-4 h-4 mr-2" />
                                  取消當前競賽
                                </DropdownMenuItem>
                              )}

                              <DropdownMenuItem
                                onClick={() => handleDeleteCompetition(competition)}
                                className="text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                刪除競賽
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
        </TabsContent>

        <TabsContent value="teams" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">團隊管理</h3>
            <Button
              onClick={() => setShowCreateTeam(true)}
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              創建團隊
            </Button>
          </div>

          {/* 搜索和篩選區域 */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 搜索框 */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="搜索團隊名稱、隊長姓名..."
                  value={teamSearchTerm}
                  onChange={(e) => {
                    setTeamSearchTerm(e.target.value)
                    setTeamCurrentPage(1) // 重置到第一頁
                  }}
                  className="pl-10"
                />
              </div>

              {/* 部門篩選 */}
              <Select value={teamDepartmentFilter} onValueChange={(value) => {
                setTeamDepartmentFilter(value)
                setTeamCurrentPage(1)
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="部門篩選" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有部門</SelectItem>
                  <SelectItem value="HQBU">HQBU</SelectItem>
                  <SelectItem value="ITBU">ITBU</SelectItem>
                  <SelectItem value="MBU1">MBU1</SelectItem>
                  <SelectItem value="MBU2">MBU2</SelectItem>
                  <SelectItem value="SBU">SBU</SelectItem>
                  <SelectItem value="研發部">研發部</SelectItem>
                  <SelectItem value="產品部">產品部</SelectItem>
                  <SelectItem value="技術部">技術部</SelectItem>
                  <SelectItem value="其他">其他</SelectItem>
                </SelectContent>
              </Select>

              {/* 清除篩選按鈕 */}
              <Button 
                variant="outline" 
                onClick={() => {
                  setTeamSearchTerm("")
                  setTeamDepartmentFilter("all")
                  setTeamCurrentPage(1)
                }}
                className="flex items-center space-x-2"
              >
                <Filter className="w-4 h-4" />
                <span>清除篩選</span>
              </Button>
            </div>

            {/* 結果統計 */}
            <div className="text-sm text-gray-600">
              共找到 {(() => {
                const filtered = teams.filter(team => {
                  const matchesSearch = teamSearchTerm === "" || 
                    team.name.toLowerCase().includes(teamSearchTerm.toLowerCase()) ||
                    team.leader.toLowerCase().includes(teamSearchTerm.toLowerCase())

                  const matchesDepartment = teamDepartmentFilter === "all" ||
                    (teamDepartmentFilter === "其他" 
                      ? !["HQBU", "ITBU", "MBU1", "MBU2", "SBU", "研發部", "產品部", "技術部"].includes(team.department)
                      : team.department === teamDepartmentFilter)

                  return matchesSearch && matchesDepartment
                })
                return filtered.length
              })()} 個團隊
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 min-h-[400px]" style={{ gridAutoRows: 'max-content' }}>
            {(() => {
              // 篩選邏輯
              const filtered = teams.filter(team => {
                const matchesSearch = teamSearchTerm === "" || 
                  team.name.toLowerCase().includes(teamSearchTerm.toLowerCase()) ||
                  team.leader.toLowerCase().includes(teamSearchTerm.toLowerCase())

                const matchesDepartment = teamDepartmentFilter === "all" ||
                  (teamDepartmentFilter === "其他" 
                    ? !["HQBU", "ITBU", "MBU1", "MBU2", "SBU", "研發部", "產品部", "技術部"].includes(team.department)
                    : team.department === teamDepartmentFilter)

                return matchesSearch && matchesDepartment
              })

              // 分頁邏輯
              const startIndex = (teamCurrentPage - 1) * teamsPerPage
              const endIndex = startIndex + teamsPerPage
              const paginatedTeams = filtered.slice(startIndex, endIndex)

              // 如果沒有找到任何團隊
              if (filtered.length === 0) {
                return (
                  <div className="col-span-full flex flex-col items-center justify-center py-12 text-gray-500 min-h-[300px]">
                    <Users className="w-12 h-12 mb-4 text-gray-300" />
                    <p className="text-lg font-medium mb-2">沒有找到團隊</p>
                    <p className="text-sm">
                      {teamSearchTerm || teamDepartmentFilter !== "all"
                        ? "請調整搜索條件或篩選條件" 
                        : "點擊「創建團隊」按鈕來添加第一個團隊"}
                    </p>
                  </div>
                )
              }

              return paginatedTeams.map((team) => (
              <Card key={team.id} className="relative h-fit">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-lg">{team.name}</h4>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <User className="w-3 h-3" />
                          <span>隊長：{team.leader}</span>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {team.department}
                      </Badge>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Mail className="w-3 h-3" />
                        <span>{team.contactEmail}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Users className="w-3 h-3" />
                        <span>{team.memberCount} 名成員</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Trophy className="w-3 h-3" />
                        <span>{team.submittedAppCount} 個應用</span>
                      </div>
                    </div>

                    <p className="text-sm text-gray-500 line-clamp-2">{team.description}</p>

                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedTeam(team)
                          setShowTeamDetail(true)
                        }}
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        查看
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleEditTeam(team)}>
                        <Edit className="w-3 h-3 mr-1" />
                        編輯
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteTeam(team)}
                        className="text-red-600 border-red-300 hover:bg-red-50"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              ))
            })()}
          </div>

          {/* 分頁組件 */}
          {(() => {
            const filtered = teams.filter(team => {
              const matchesSearch = teamSearchTerm === "" || 
                team.name.toLowerCase().includes(teamSearchTerm.toLowerCase()) ||
                team.leader.toLowerCase().includes(teamSearchTerm.toLowerCase())

              const matchesDepartment = teamDepartmentFilter === "all" ||
                (teamDepartmentFilter === "其他" 
                  ? !["HQBU", "ITBU", "MBU1", "MBU2", "SBU", "研發部", "產品部", "技術部"].includes(team.department)
                  : team.department === teamDepartmentFilter)

              return matchesSearch && matchesDepartment
            })

            const totalPages = Math.ceil(filtered.length / teamsPerPage)

            // 如果當前頁面超出總頁數，重置到第一頁
            if (teamCurrentPage > totalPages && totalPages > 0) {
              setTeamCurrentPage(1)
            }

            if (totalPages <= 1) return null

            return (
              <div className="flex flex-col items-center space-y-4 mt-6">
                <div className="text-sm text-gray-600">
                  第 {teamCurrentPage} 頁，共 {totalPages} 頁
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setTeamCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={teamCurrentPage === 1}
                    className="flex items-center space-x-1"
                  >
                    <span>‹</span>
                    <span>上一頁</span>
                  </Button>
                  
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      let page;
                      if (totalPages <= 5) {
                        page = i + 1;
                      } else if (teamCurrentPage <= 3) {
                        page = i + 1;
                      } else if (teamCurrentPage >= totalPages - 2) {
                        page = totalPages - 4 + i;
                      } else {
                        page = teamCurrentPage - 2 + i;
                      }
                      
                      return (
                        <Button
                          key={page}
                          variant={teamCurrentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setTeamCurrentPage(page)}
                          className="w-10 h-10 p-0"
                        >
                          {page}
                        </Button>
                      )
                    })}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setTeamCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={teamCurrentPage === totalPages}
                    className="flex items-center space-x-1"
                  >
                    <span>下一頁</span>
                    <span>›</span>
                  </Button>
                </div>
              </div>
            )
          })()}
        </TabsContent>

        <TabsContent value="judges" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">評審管理</h3>
            <Button onClick={() => setShowAddJudge(true)} variant="outline">
              <UserPlus className="w-4 h-4 mr-2" />
              新增評審
            </Button>
          </div>

          {/* 搜索和篩選區域 */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* 搜索框 */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="搜索評審姓名、職稱..."
                  value={judgeSearchTerm}
                  onChange={(e) => {
                    setJudgeSearchTerm(e.target.value)
                    setJudgeCurrentPage(1) // 重置到第一頁
                  }}
                  className="pl-10"
                />
              </div>

              {/* 部門篩選 */}
              <Select value={judgeDepartmentFilter} onValueChange={(value) => {
                setJudgeDepartmentFilter(value)
                setJudgeCurrentPage(1)
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="部門篩選" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有部門</SelectItem>
                  <SelectItem value="HQBU">HQBU</SelectItem>
                  <SelectItem value="ITBU">ITBU</SelectItem>
                  <SelectItem value="MBU1">MBU1</SelectItem>
                  <SelectItem value="MBU2">MBU2</SelectItem>
                  <SelectItem value="SBU">SBU</SelectItem>
                  <SelectItem value="研發部">研發部</SelectItem>
                  <SelectItem value="產品部">產品部</SelectItem>
                  <SelectItem value="技術部">技術部</SelectItem>
                  <SelectItem value="其他">其他</SelectItem>
                </SelectContent>
              </Select>

              {/* 專業領域篩選 */}
              <Select value={judgeExpertiseFilter} onValueChange={(value) => {
                setJudgeExpertiseFilter(value)
                setJudgeCurrentPage(1)
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="專業領域篩選" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有領域</SelectItem>
                  <SelectItem value="機器學習">機器學習</SelectItem>
                  <SelectItem value="深度學習">深度學習</SelectItem>
                  <SelectItem value="自然語言處理">自然語言處理</SelectItem>
                  <SelectItem value="計算機視覺">計算機視覺</SelectItem>
                  <SelectItem value="數據科學">數據科學</SelectItem>
                  <SelectItem value="人工智能">人工智能</SelectItem>
                  <SelectItem value="雲端計算">雲端計算</SelectItem>
                  <SelectItem value="網路安全">網路安全</SelectItem>
                  <SelectItem value="軟體工程">軟體工程</SelectItem>
                  <SelectItem value="用戶體驗">用戶體驗</SelectItem>
                </SelectContent>
              </Select>

              {/* 清除篩選按鈕 */}
              <Button 
                variant="outline" 
                onClick={() => {
                  setJudgeSearchTerm("")
                  setJudgeDepartmentFilter("all")
                  setJudgeExpertiseFilter("all")
                  setJudgeCurrentPage(1)
                }}
                className="flex items-center space-x-2"
              >
                <Filter className="w-4 h-4" />
                <span>清除篩選</span>
              </Button>
            </div>

            {/* 結果統計 */}
            <div className="text-sm text-gray-600">
              共找到 {(() => {
                const filtered = judges.filter(judge => {
                  const matchesSearch = judgeSearchTerm === "" || 
                    judge.name.toLowerCase().includes(judgeSearchTerm.toLowerCase()) ||
                    judge.title.toLowerCase().includes(judgeSearchTerm.toLowerCase())

                  const matchesDepartment = judgeDepartmentFilter === "all" ||
                    (judgeDepartmentFilter === "其他" 
                      ? !["HQBU", "ITBU", "MBU1", "MBU2", "SBU", "研發部", "產品部", "技術部"].includes(judge.department)
                      : judge.department === judgeDepartmentFilter)

                  const matchesExpertise = judgeExpertiseFilter === "all" ||
                    judge.expertise.some(exp => exp.includes(judgeExpertiseFilter))

                  return matchesSearch && matchesDepartment && matchesExpertise
                })
                return filtered.length
              })()} 位評審
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 min-h-[400px]" style={{ gridAutoRows: 'max-content' }}>
            {(() => {
              // 篩選邏輯
              const filtered = judges.filter(judge => {
                const matchesSearch = judgeSearchTerm === "" || 
                  judge.name.toLowerCase().includes(judgeSearchTerm.toLowerCase()) ||
                  judge.title.toLowerCase().includes(judgeSearchTerm.toLowerCase())

                const matchesDepartment = judgeDepartmentFilter === "all" ||
                  (judgeDepartmentFilter === "其他" 
                    ? !["HQBU", "ITBU", "MBU1", "MBU2", "SBU", "研發部", "產品部", "技術部"].includes(judge.department)
                    : judge.department === judgeDepartmentFilter)

                const matchesExpertise = judgeExpertiseFilter === "all" ||
                  judge.expertise.some(exp => exp.includes(judgeExpertiseFilter))

                return matchesSearch && matchesDepartment && matchesExpertise
              })

              // 分頁邏輯
              const startIndex = (judgeCurrentPage - 1) * judgesPerPage
              const endIndex = startIndex + judgesPerPage
              const paginatedJudges = filtered.slice(startIndex, endIndex)

              // 如果沒有找到任何評審
              if (filtered.length === 0) {
                return (
                  <div className="col-span-full flex flex-col items-center justify-center py-12 text-gray-500 min-h-[300px]">
                    <Users className="w-12 h-12 mb-4 text-gray-300" />
                    <p className="text-lg font-medium mb-2">沒有找到評審</p>
                    <p className="text-sm">
                      {judgeSearchTerm || judgeDepartmentFilter !== "all" || judgeExpertiseFilter !== "all" 
                        ? "請調整搜索條件或篩選條件" 
                        : "點擊「新增評審」按鈕來添加第一位評審"}
                    </p>
                  </div>
                )
              }

              return paginatedJudges.map((judge) => (
              <Card key={judge.id} className="h-fit">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <Avatar>
                      <AvatarImage src={judge.avatar || "/placeholder.svg"} />
                      <AvatarFallback className="bg-purple-100 text-purple-700">{judge.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h4 className="font-medium">{judge.name}</h4>
                      <p className="text-sm text-gray-600">{judge.title}</p>
                      <p className="text-xs text-gray-500">{judge.department}</p>
                      <p className="text-xs text-blue-600 mt-1">ID: {judge.id}</p>
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="flex flex-wrap gap-1">
                      {judge.expertise.slice(0, 3).map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {judge.expertise.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{judge.expertise.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedJudge(judge)
                        setShowJudgeDetail(true)
                      }}
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      查看
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleEditJudge(judge)}>
                      <Edit className="w-3 h-3 mr-1" />
                      編輯
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteJudge(judge)}
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
              ))
            })()}
          </div>

          {/* 分頁組件 */}
          {(() => {
            const filtered = judges.filter(judge => {
              const matchesSearch = judgeSearchTerm === "" || 
                judge.name.toLowerCase().includes(judgeSearchTerm.toLowerCase()) ||
                judge.title.toLowerCase().includes(judgeSearchTerm.toLowerCase())

              const matchesDepartment = judgeDepartmentFilter === "all" ||
                (judgeDepartmentFilter === "其他" 
                  ? !["HQBU", "ITBU", "MBU1", "MBU2", "SBU", "研發部", "產品部", "技術部"].includes(judge.department)
                  : judge.department === judgeDepartmentFilter)

              const matchesExpertise = judgeExpertiseFilter === "all" ||
                judge.expertise.some(exp => exp.includes(judgeExpertiseFilter))

              return matchesSearch && matchesDepartment && matchesExpertise
            })

            const totalPages = Math.ceil(filtered.length / judgesPerPage)

            // 如果當前頁面超出總頁數，重置到第一頁
            if (judgeCurrentPage > totalPages && totalPages > 0) {
              setJudgeCurrentPage(1)
            }

            if (totalPages <= 1) return null

            return (
              <div className="flex flex-col items-center space-y-4 mt-6">
                <div className="text-sm text-gray-600">
                  第 {judgeCurrentPage} 頁，共 {totalPages} 頁
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setJudgeCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={judgeCurrentPage === 1}
                    className="flex items-center space-x-1"
                  >
                    <span>‹</span>
                    <span>上一頁</span>
                  </Button>
                  
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      let page;
                      if (totalPages <= 5) {
                        page = i + 1;
                      } else if (judgeCurrentPage <= 3) {
                        page = i + 1;
                      } else if (judgeCurrentPage >= totalPages - 2) {
                        page = totalPages - 4 + i;
                      } else {
                        page = judgeCurrentPage - 2 + i;
                      }
                      
                      return (
                        <Button
                          key={page}
                          variant={judgeCurrentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setJudgeCurrentPage(page)}
                          className="w-10 h-10 p-0"
                        >
                          {page}
                        </Button>
                      )
                    })}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setJudgeCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={judgeCurrentPage === totalPages}
                    className="flex items-center space-x-1"
                  >
                    <span>下一頁</span>
                    <span>›</span>
                  </Button>
                </div>
              </div>
            )
          })()}
        </TabsContent>

        <TabsContent value="scoring" className="space-y-4">
          <ScoringManagement />
        </TabsContent>

        <TabsContent value="awards" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">獎項管理</h3>
            <Button onClick={() => setShowCreateAward(true)} variant="outline">
              <Award className="w-4 h-4 mr-2" />
              創建獎項
            </Button>
          </div>

          {/* 搜索和筛选控件 */}
          {awards.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <div className="space-y-4">
                  {/* 搜索栏 */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <Input
                      type="text"
                      placeholder="搜尋應用名稱、創作者或獎項名稱..."
                      value={awardSearchQuery}
                      onChange={(e) => {
                        setAwardSearchQuery(e.target.value)
                        resetAwardPagination()
                      }}
                      className="pl-10 pr-10 w-full md:w-96"
                    />
                    {awardSearchQuery && (
                      <button
                        onClick={() => setAwardSearchQuery("")}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {/* 筛选控件 */}
                  <div className="flex flex-wrap gap-4 items-center">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-700">年份：</span>
                      <Select value={awardYearFilter} onValueChange={(value) => {
                        setAwardYearFilter(value)
                        resetAwardPagination()
                      }}>
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">全部</SelectItem>
                          <SelectItem value="2024">2024年</SelectItem>
                          <SelectItem value="2023">2023年</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-700">月份：</span>
                      <Select value={awardMonthFilter} onValueChange={(value) => {
                        setAwardMonthFilter(value)
                        resetAwardPagination()
                      }}>
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">全部</SelectItem>
                          <SelectItem value="1">1月</SelectItem>
                          <SelectItem value="2">2月</SelectItem>
                          <SelectItem value="3">3月</SelectItem>
                          <SelectItem value="4">4月</SelectItem>
                          <SelectItem value="5">5月</SelectItem>
                          <SelectItem value="6">6月</SelectItem>
                          <SelectItem value="7">7月</SelectItem>
                          <SelectItem value="8">8月</SelectItem>
                          <SelectItem value="9">9月</SelectItem>
                          <SelectItem value="10">10月</SelectItem>
                          <SelectItem value="11">11月</SelectItem>
                          <SelectItem value="12">12月</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-700">獎項類型：</span>
                      <Select value={awardTypeFilter} onValueChange={(value) => {
                        setAwardTypeFilter(value)
                        resetAwardPagination()
                      }}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">全部獎項</SelectItem>
                          <SelectItem value="ranking">前三名</SelectItem>
                          <SelectItem value="popular">人氣獎</SelectItem>
                          <SelectItem value="gold">金牌</SelectItem>
                          <SelectItem value="silver">銀牌</SelectItem>
                          <SelectItem value="bronze">銅牌</SelectItem>
                          <SelectItem value="innovation">創新獎</SelectItem>
                          <SelectItem value="technical">技術獎</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-700">競賽類型：</span>
                      <Select value={awardCompetitionTypeFilter} onValueChange={(value) => {
                        setAwardCompetitionTypeFilter(value)
                        resetAwardPagination()
                      }}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">全部類型</SelectItem>
                          <SelectItem value="individual">個人賽</SelectItem>
                          <SelectItem value="team">團隊賽</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* 清除筛选按钮 */}
                    {(awardSearchQuery || awardYearFilter !== "all" || awardMonthFilter !== "all" || awardTypeFilter !== "all" || awardCompetitionTypeFilter !== "all") && (
                      <div className="flex items-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setAwardSearchQuery("")
                            setAwardYearFilter("all")
                            setAwardMonthFilter("all")
                            setAwardTypeFilter("all")
                            setAwardCompetitionTypeFilter("all")
                          }}
                          className="text-gray-600 hover:text-gray-800"
                        >
                          <X className="w-4 h-4 mr-1" />
                          清除所有篩選
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* 统计信息 */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-lg font-bold text-blue-600">{getFilteredAwards().length}</div>
                      <div className="text-xs text-blue-600">篩選結果</div>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                      <div className="text-lg font-bold text-yellow-600">
                        {getFilteredAwards().filter((a) => a.rank > 0 && a.rank <= 3).length}
                      </div>
                      <div className="text-xs text-yellow-600">前三名獎項</div>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <div className="text-lg font-bold text-red-600">
                        {getFilteredAwards().filter((a) => a.awardType === "popular").length}
                      </div>
                      <div className="text-xs text-red-600">人氣獎項</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-lg font-bold text-green-600">
                        {new Set(getFilteredAwards().map((a) => `${a.year}-${a.month}`)).size}
                      </div>
                      <div className="text-xs text-green-600">競賽場次</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {awards.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Award className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">尚未頒發任何獎項</h3>
              <p className="text-gray-500 mb-4">為競賽參賽者創建獎項，展示他們的成就</p>
              <Button onClick={() => setShowCreateAward(true)} className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700">
                <Award className="w-4 h-4 mr-2" />
                創建首個獎項
              </Button>
            </div>
          ) : (
            <>
              {(() => {
                const filteredAwards = getFilteredAwards()
                
                if (filteredAwards.length === 0) {
                  return (
                    <Card>
                      <CardContent className="text-center py-12">
                        <div className="space-y-4">
                          {awardSearchQuery ? (
                            <Search className="w-16 h-16 text-gray-400 mx-auto" />
                          ) : (
                            <Award className="w-16 h-16 text-gray-400 mx-auto" />
                          )}
                          <div>
                            <h3 className="text-xl font-semibold text-gray-600 mb-2">
                              {awardSearchQuery ? (
                                <>找不到包含「{awardSearchQuery}」的獎項</>
                              ) : (
                                <>暫無符合篩選條件的獎項</>
                              )}
                            </h3>
                            <p className="text-gray-500">
                              {awardSearchQuery
                                ? "嘗試使用其他關鍵字或調整篩選條件"
                                : "請調整篩選條件查看其他獎項"}
                            </p>
                          </div>
                          <div className="flex justify-center gap-2">
                            <Button
                              variant="outline"
                              className="bg-transparent"
                              onClick={() => {
                                setAwardSearchQuery("")
                                setAwardYearFilter("all")
                                setAwardMonthFilter("all")
                                setAwardTypeFilter("all")
                                setAwardCompetitionTypeFilter("all")
                              }}
                            >
                              <X className="w-4 h-4 mr-1" />
                              清除所有篩選
                            </Button>
                            {awardSearchQuery && (
                              <Button
                                variant="outline"
                                className="bg-transparent"
                                onClick={() => setAwardSearchQuery("")}
                              >
                                清除搜尋
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                }

                const startIndex = (awardCurrentPage - 1) * awardsPerPage
                const endIndex = startIndex + awardsPerPage
                const paginatedAwards = filteredAwards.slice(startIndex, endIndex)

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 min-h-[400px]" style={{ gridAutoRows: 'max-content' }}>
                    {paginatedAwards.map((award) => (
                <Card key={award.id} className="relative overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="absolute top-4 right-4 text-2xl">{award.icon}</div>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {/* 獎項基本資訊 */}
                      <div className="space-y-2">
                        <Badge
                          variant="secondary"
                          className={`w-fit ${
                            award.awardType === "gold"
                              ? "bg-yellow-100 text-yellow-800"
                              : award.awardType === "silver"
                                ? "bg-gray-100 text-gray-800"
                                : award.awardType === "bronze"
                                  ? "bg-orange-100 text-orange-800"
                                  : award.awardType === "popular"
                                    ? "bg-purple-100 text-purple-800"
                                    : award.awardType === "innovation"
                                      ? "bg-green-100 text-green-800"
                                      : award.awardType === "technical"
                                        ? "bg-indigo-100 text-indigo-800"
                                        : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {award.awardName}
                        </Badge>
                        <h4 className="font-semibold text-lg pr-8">{award.appName || "團隊作品"}</h4>
                        <p className="text-sm text-gray-600">by {award.creator}</p>
                        
                        {/* 評分顯示 */}
                        {award.score > 0 && (
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center space-x-1">
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                              <span className="font-semibold text-orange-600">{award.score.toFixed(1)}</span>
                            </div>
                            <span className="text-xs text-gray-500">評審評分</span>
                          </div>
                        )}

                        {/* 獎項排名 */}
                        {award.rank > 0 && (
                          <Badge variant="outline" className="w-fit">
                            第 {award.rank} 名
                          </Badge>
                        )}
                      </div>

                      {/* 競賽資訊 */}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">
                          {award.year}年{award.month}月
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {getCompetitionTypeText(award.competitionType)}
                        </Badge>
                      </div>

                      {/* 應用連結摘要 */}
                      {(award as any).applicationLinks && (
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-gray-700">應用連結</p>
                          <div className="flex items-center space-x-2">
                            {(award as any).applicationLinks.production && (
                              <div className="w-2 h-2 bg-green-500 rounded-full" title="生產環境"></div>
                            )}
                            {(award as any).applicationLinks.demo && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full" title="演示版本"></div>
                            )}
                            {(award as any).applicationLinks.github && (
                              <div className="w-2 h-2 bg-gray-800 rounded-full" title="源碼倉庫"></div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* 相關文檔摘要 */}
                      {(award as any).documents && (award as any).documents.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-gray-700">相關文檔</p>
                          <div className="flex items-center space-x-1">
                            <span className="text-xs text-gray-600">
                              {(award as any).documents.length} 個文檔
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {(award as any).documents.map((doc: any) => doc.type).join(", ")}
                            </Badge>
                          </div>
                        </div>
                      )}

                      {/* 得獎照片摘要 */}
                      {(award as any).photos && (award as any).photos.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-gray-700">得獎照片</p>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-600">
                              {(award as any).photos.length} 張照片
                            </span>
                            <div className="flex items-center space-x-1">
                              {(award as any).photos.slice(0, 3).map((photo: any, index: number) => (
                                <div key={index} className="w-4 h-4 bg-gray-200 rounded border"></div>
                              ))}
                              {(award as any).photos.length > 3 && (
                                <span className="text-xs text-gray-500">+{(award as any).photos.length - 3}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 獎項描述 */}
                      {(award as any).description && (
                        <p className="text-xs text-gray-600 line-clamp-2">
                          {(award as any).description}
                        </p>
                      )}

                      {/* 操作按鈕 */}
                      <div className="flex items-center justify-between pt-2 border-t">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">
                            {(award as any).category || "innovation"}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-1">
                                                  <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewAward(award)}
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          查看
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditAward(award)}
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          編輯
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteAward(award)}
                          className="text-red-600 border-red-300 hover:bg-red-50"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                        </div>
                                              </div>
                      </div>
                    </CardContent>
                  </Card>
                  ))}
                  </div>
                )
              })()}

              {/* 分頁組件 */}
              {(() => {
                const filteredAwards = getFilteredAwards()
                const totalPages = Math.ceil(filteredAwards.length / awardsPerPage)

                // 如果當前頁面超出總頁數，重置到第一頁
                if (awardCurrentPage > totalPages && totalPages > 0) {
                  setAwardCurrentPage(1)
                }

                if (totalPages <= 1) return null

                return (
                  <div className="flex flex-col items-center space-y-4 mt-6">
                    <div className="text-sm text-gray-600">
                      第 {awardCurrentPage} 頁，共 {totalPages} 頁 • 篩選結果 {filteredAwards.length} 個獎項
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setAwardCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={awardCurrentPage === 1}
                        className="flex items-center space-x-1"
                      >
                        <span>‹</span>
                        <span>上一頁</span>
                      </Button>
                      
                      <div className="flex items-center space-x-1">
                        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                          let page;
                          if (totalPages <= 5) {
                            page = i + 1;
                          } else if (awardCurrentPage <= 3) {
                            page = i + 1;
                          } else if (awardCurrentPage >= totalPages - 2) {
                            page = totalPages - 4 + i;
                          } else {
                            page = awardCurrentPage - 2 + i;
                          }
                          
                          return (
                            <Button
                              key={page}
                              variant={awardCurrentPage === page ? "default" : "outline"}
                              size="sm"
                              onClick={() => setAwardCurrentPage(page)}
                              className="w-10 h-10 p-0"
                            >
                              {page}
                            </Button>
                          )
                        })}
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setAwardCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={awardCurrentPage === totalPages}
                        className="flex items-center space-x-1"
                      >
                        <span>下一頁</span>
                        <span>›</span>
                      </Button>
                    </div>
                  </div>
                )
              })()}
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Competition Dialog - Enhanced for Mixed Competitions */}
      <Dialog
        open={showCreateCompetition}
        onOpenChange={(open) => {
          setShowCreateCompetition(open)
          if (!open) {
            setCreateError("")
            setSelectedCompetitionForAction(null) // 清除編輯狀態
            resetForm() // 重置表單
          }
        }}
      >
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedCompetitionForAction ? '編輯競賽' : '創建新競賽'}</DialogTitle>
            <DialogDescription>{selectedCompetitionForAction ? '修改競賽的基本資訊、類型和評比規則' : '設定競賽的基本資訊、類型和評比規則'}</DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {createError && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{createError}</AlertDescription>
              </Alert>
            )}

            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                基本資訊
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">競賽名稱 *</Label>
                  <Input
                    id="name"
                    value={newCompetition.name}
                    onChange={(e) => setNewCompetition({ ...newCompetition, name: e.target.value })}
                    placeholder="輸入競賽名稱"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">競賽類型 *</Label>
                  <Select
                    value={newCompetition.type}
                    onValueChange={(value: any) =>
                      setNewCompetition({
                        ...newCompetition,
                        type: value,
                        participatingApps: [],
                        participatingTeams: [],
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individual">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4" />
                          <span>個人賽</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="team">
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4" />
                          <span>團體賽</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="mixed">
                        <div className="flex items-center space-x-2">
                          <Trophy className="w-4 h-4" />
                          <span>混合賽</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">開始日期 *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={newCompetition.startDate}
                    onChange={(e) => setNewCompetition({ ...newCompetition, startDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">結束日期 *</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={newCompetition.endDate}
                    onChange={(e) => setNewCompetition({ ...newCompetition, endDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">競賽描述</Label>
                <Textarea
                  id="description"
                  value={newCompetition.description}
                  onChange={(e) => setNewCompetition({ ...newCompetition, description: e.target.value })}
                  placeholder="描述競賽的目標和規則"
                  rows={3}
                />
              </div>
            </div>

            <Separator />

            {/* Mixed Competition Configuration */}
            {newCompetition.type === "mixed" ? (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold flex items-center">
                  <Trophy className="w-5 h-5 mr-2" />
                  混合賽配置
                </h3>

                <Tabs defaultValue="individual" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="individual" className="flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span>個人賽設定</span>
                    </TabsTrigger>
                    <TabsTrigger value="team" className="flex items-center space-x-2">
                      <Users className="w-4 h-4" />
                      <span>團體賽設定</span>
                    </TabsTrigger>
                  </TabsList>

                  {/* Individual Competition Configuration */}
                  <TabsContent value="individual" className="space-y-6">
                    <div className="border rounded-lg p-6 bg-blue-50">
                      <h4 className="text-lg font-semibold mb-4 flex items-center">
                        <User className="w-5 h-5 mr-2 text-blue-600" />
                        個人賽配置
                      </h4>

                      {/* Individual Judge Selection */}
                      <div className="space-y-4 mb-6">
                        <h5 className="font-semibold flex items-center">
                          <UserCheck className="w-4 h-4 mr-2" />
                          個人賽評審選擇
                        </h5>
                        <div className="grid grid-cols-2 gap-4">
                          {judges.map((judge) => (
                            <div key={judge.id} className="flex items-center space-x-3 p-3 border rounded-lg bg-white">
                              <Checkbox
                                id={`individual-judge-${judge.id}`}
                                checked={newCompetition.individualConfig.judges.includes(judge.id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setNewCompetition({
                                      ...newCompetition,
                                      individualConfig: {
                                        ...newCompetition.individualConfig,
                                        judges: [...newCompetition.individualConfig.judges, judge.id],
                                      },
                                    })
                                  } else {
                                    setNewCompetition({
                                      ...newCompetition,
                                      individualConfig: {
                                        ...newCompetition.individualConfig,
                                        judges: newCompetition.individualConfig.judges.filter((id) => id !== judge.id),
                                      },
                                    })
                                  }
                                }}
                              />
                              <Avatar className="w-8 h-8">
                                <AvatarImage src={judge.avatar || "/placeholder.svg"} />
                                <AvatarFallback className="bg-blue-100 text-blue-700 text-sm">
                                  {judge.name[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <p className="font-medium text-sm">{judge.name}</p>
                                <p className="text-xs text-gray-600">{judge.title}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                        {newCompetition.individualConfig.judges.length > 0 && (
                          <p className="text-sm text-blue-600">
                            已選擇 {newCompetition.individualConfig.judges.length} 位個人賽評審
                          </p>
                        )}
                      </div>

                      {/* Individual Evaluation Rules */}
                      <div className="space-y-4 mb-6">
                        <div className="flex justify-between items-center">
                          <h5 className="font-semibold flex items-center">
                            <ClipboardList className="w-4 h-4 mr-2" />
                            個人賽評比標準
                          </h5>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newRule: CompetitionRule = {
                                id: `ir${Date.now()}`,
                                name: "",
                                description: "",
                                weight: 0,
                              }
                              setNewCompetition({
                                ...newCompetition,
                                individualConfig: {
                                  ...newCompetition.individualConfig,
                                  rules: [...newCompetition.individualConfig.rules, newRule],
                                },
                              })
                            }}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            新增評比項目
                          </Button>
                        </div>

                        {newCompetition.individualConfig.rules.length > 0 && (
                          <div className="space-y-3">
                            {newCompetition.individualConfig.rules.map((rule, index) => (
                              <div
                                key={rule.id}
                                className="grid grid-cols-12 gap-3 items-end p-3 border rounded-lg bg-white"
                              >
                                <div className="col-span-4">
                                  <Label className="text-xs">評比項目名稱</Label>
                                  <Input
                                    value={rule.name}
                                    onChange={(e) => {
                                      const updatedRules = [...newCompetition.individualConfig.rules]
                                      updatedRules[index] = { ...rule, name: e.target.value }
                                      setNewCompetition({
                                        ...newCompetition,
                                        individualConfig: {
                                          ...newCompetition.individualConfig,
                                          rules: updatedRules,
                                        },
                                      })
                                    }}
                                    placeholder="例如：創新性"
                                    className="text-sm"
                                  />
                                </div>
                                <div className="col-span-5">
                                  <Label className="text-xs">描述</Label>
                                  <Input
                                    value={rule.description}
                                    onChange={(e) => {
                                      const updatedRules = [...newCompetition.individualConfig.rules]
                                      updatedRules[index] = { ...rule, description: e.target.value }
                                      setNewCompetition({
                                        ...newCompetition,
                                        individualConfig: {
                                          ...newCompetition.individualConfig,
                                          rules: updatedRules,
                                        },
                                      })
                                    }}
                                    placeholder="例如：技術創新程度和獨特性"
                                    className="text-sm"
                                  />
                                </div>
                                <div className="col-span-2">
                                  <Label className="text-xs">權重 (%)</Label>
                                  <Input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={rule.weight}
                                    onChange={(e) => {
                                      const updatedRules = [...newCompetition.individualConfig.rules]
                                      updatedRules[index] = { ...rule, weight: Number.parseInt(e.target.value) || 0 }
                                      setNewCompetition({
                                        ...newCompetition,
                                        individualConfig: {
                                          ...newCompetition.individualConfig,
                                          rules: updatedRules,
                                        },
                                      })
                                    }}
                                    className="text-sm"
                                  />
                                </div>
                                <div className="col-span-1">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      const updatedRules = newCompetition.individualConfig.rules.filter(
                                        (_, i) => i !== index,
                                      )
                                      setNewCompetition({
                                        ...newCompetition,
                                        individualConfig: {
                                          ...newCompetition.individualConfig,
                                          rules: updatedRules,
                                        },
                                      })
                                    }}
                                    className="text-red-600 border-red-300 hover:bg-red-50"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}

                            <div className="flex items-center justify-between p-3 bg-blue-100 rounded-lg">
                              <span className="text-sm text-blue-700">
                                個人賽總權重：
                                {newCompetition.individualConfig.rules.reduce((sum, rule) => sum + rule.weight, 0)}%
                              </span>
                              {newCompetition.individualConfig.rules.reduce((sum, rule) => sum + rule.weight, 0) !==
                                100 && <span className="text-sm text-orange-600">⚠️ 權重總和應為 100%</span>}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Individual Award Types */}
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h5 className="font-semibold flex items-center">
                            <Award className="w-4 h-4 mr-2" />
                            個人賽獎項設定
                          </h5>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newAwardType: CompetitionAwardType = {
                                id: `iat${Date.now()}`,
                                name: "",
                                description: "",
                                icon: "🏆",
                                color: "text-yellow-600",
                              }
                              setNewCompetition({
                                ...newCompetition,
                                individualConfig: {
                                  ...newCompetition.individualConfig,
                                  awardTypes: [...newCompetition.individualConfig.awardTypes, newAwardType],
                                },
                              })
                            }}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            新增獎項類型
                          </Button>
                        </div>

                        {newCompetition.individualConfig.awardTypes.length > 0 && (
                          <div className="space-y-3">
                            {newCompetition.individualConfig.awardTypes.map((awardType, index) => (
                              <div
                                key={awardType.id}
                                className="grid grid-cols-12 gap-3 items-end p-3 border rounded-lg bg-white"
                              >
                                <div className="col-span-1">
                                  <Label className="text-xs">圖示</Label>
                                  <Select
                                    value={awardType.icon}
                                    onValueChange={(value) => {
                                      const updatedAwardTypes = [...newCompetition.individualConfig.awardTypes]
                                      updatedAwardTypes[index] = { ...awardType, icon: value }
                                      setNewCompetition({
                                        ...newCompetition,
                                        individualConfig: {
                                          ...newCompetition.individualConfig,
                                          awardTypes: updatedAwardTypes,
                                        },
                                      })
                                    }}
                                  >
                                    <SelectTrigger className="text-sm">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="🏆">🏆</SelectItem>
                                      <SelectItem value="🥇">🥇</SelectItem>
                                      <SelectItem value="🥈">🥈</SelectItem>
                                      <SelectItem value="🥉">🥉</SelectItem>
                                      <SelectItem value="⭐">⭐</SelectItem>
                                      <SelectItem value="💡">💡</SelectItem>
                                      <SelectItem value="⚙️">⚙️</SelectItem>
                                      <SelectItem value="🎯">🎯</SelectItem>
                                      <SelectItem value="❤️">❤️</SelectItem>
                                      <SelectItem value="🧠">🧠</SelectItem>
                                      <SelectItem value="🚀">🚀</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="col-span-3">
                                  <Label className="text-xs">獎項名稱</Label>
                                  <Input
                                    value={awardType.name}
                                    onChange={(e) => {
                                      const updatedAwardTypes = [...newCompetition.individualConfig.awardTypes]
                                      updatedAwardTypes[index] = { ...awardType, name: e.target.value }
                                      setNewCompetition({
                                        ...newCompetition,
                                        individualConfig: {
                                          ...newCompetition.individualConfig,
                                          awardTypes: updatedAwardTypes,
                                        },
                                      })
                                    }}
                                    placeholder="例如：最佳創新獎"
                                    className="text-sm"
                                  />
                                </div>
                                <div className="col-span-5">
                                  <Label className="text-xs">獎項描述</Label>
                                  <Input
                                    value={awardType.description}
                                    onChange={(e) => {
                                      const updatedAwardTypes = [...newCompetition.individualConfig.awardTypes]
                                      updatedAwardTypes[index] = { ...awardType, description: e.target.value }
                                      setNewCompetition({
                                        ...newCompetition,
                                        individualConfig: {
                                          ...newCompetition.individualConfig,
                                          awardTypes: updatedAwardTypes,
                                        },
                                      })
                                    }}
                                    placeholder="例如：最具創新性的應用"
                                    className="text-sm"
                                  />
                                </div>
                                <div className="col-span-2">
                                  <Label className="text-xs">顏色主題</Label>
                                  <Select
                                    value={awardType.color}
                                    onValueChange={(value) => {
                                      const updatedAwardTypes = [...newCompetition.individualConfig.awardTypes]
                                      updatedAwardTypes[index] = { ...awardType, color: value }
                                      setNewCompetition({
                                        ...newCompetition,
                                        individualConfig: {
                                          ...newCompetition.individualConfig,
                                          awardTypes: updatedAwardTypes,
                                        },
                                      })
                                    }}
                                  >
                                    <SelectTrigger className="text-sm">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="text-yellow-600">
                                        <div className="flex items-center space-x-2">
                                          <div className="w-3 h-3 bg-yellow-600 rounded-full"></div>
                                          <span>金色</span>
                                        </div>
                                      </SelectItem>
                                      <SelectItem value="text-blue-600">
                                        <div className="flex items-center space-x-2">
                                          <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                                          <span>藍色</span>
                                        </div>
                                      </SelectItem>
                                      <SelectItem value="text-green-600">
                                        <div className="flex items-center space-x-2">
                                          <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                                          <span>綠色</span>
                                        </div>
                                      </SelectItem>
                                      <SelectItem value="text-red-600">
                                        <div className="flex items-center space-x-2">
                                          <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                                          <span>紅色</span>
                                        </div>
                                      </SelectItem>
                                      <SelectItem value="text-purple-600">
                                        <div className="flex items-center space-x-2">
                                          <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                                          <span>紫色</span>
                                        </div>
                                      </SelectItem>
                                      <SelectItem value="text-orange-600">
                                        <div className="flex items-center space-x-2">
                                          <div className="w-3 h-3 bg-orange-600 rounded-full"></div>
                                          <span>橙色</span>
                                        </div>
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="col-span-1">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      const updatedAwardTypes = newCompetition.individualConfig.awardTypes.filter(
                                        (_, i) => i !== index,
                                      )
                                      setNewCompetition({
                                        ...newCompetition,
                                        individualConfig: {
                                          ...newCompetition.individualConfig,
                                          awardTypes: updatedAwardTypes,
                                        },
                                      })
                                    }}
                                    className="text-red-600 border-red-300 hover:bg-red-50"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}

                            <div className="flex items-center justify-between p-3 bg-blue-100 rounded-lg">
                              <span className="text-sm text-blue-700">
                                已設定 {newCompetition.individualConfig.awardTypes.length} 種個人賽獎項類型
                              </span>
                              <div className="flex space-x-1">
                                {newCompetition.individualConfig.awardTypes.slice(0, 5).map((awardType, index) => (
                                  <span key={index} className="text-lg">
                                    {awardType.icon}
                                  </span>
                                ))}
                                {newCompetition.individualConfig.awardTypes.length > 5 && (
                                  <span className="text-sm text-gray-500">
                                    +{newCompetition.individualConfig.awardTypes.length - 5}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  {/* Team Competition Configuration */}
                  <TabsContent value="team" className="space-y-6">
                    <div className="border rounded-lg p-6 bg-green-50">
                      <h4 className="text-lg font-semibold mb-4 flex items-center">
                        <Users className="w-5 h-5 mr-2 text-green-600" />
                        團體賽配置
                      </h4>

                      {/* Team Judge Selection */}
                      <div className="space-y-4 mb-6">
                        <h5 className="font-semibold flex items-center">
                          <UserCheck className="w-4 h-4 mr-2" />
                          團體賽評審選擇
                        </h5>
                        <div className="grid grid-cols-2 gap-4">
                          {judges.map((judge) => (
                            <div key={judge.id} className="flex items-center space-x-3 p-3 border rounded-lg bg-white">
                              <Checkbox
                                id={`team-judge-${judge.id}`}
                                checked={newCompetition.teamConfig.judges.includes(judge.id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setNewCompetition({
                                      ...newCompetition,
                                      teamConfig: {
                                        ...newCompetition.teamConfig,
                                        judges: [...newCompetition.teamConfig.judges, judge.id],
                                      },
                                    })
                                  } else {
                                    setNewCompetition({
                                      ...newCompetition,
                                      teamConfig: {
                                        ...newCompetition.teamConfig,
                                        judges: newCompetition.teamConfig.judges.filter((id) => id !== judge.id),
                                      },
                                    })
                                  }
                                }}
                              />
                              <Avatar className="w-8 h-8">
                                <AvatarImage src={judge.avatar || "/placeholder.svg"} />
                                <AvatarFallback className="bg-green-100 text-green-700 text-sm">
                                  {judge.name[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <p className="font-medium text-sm">{judge.name}</p>
                                <p className="text-xs text-gray-600">{judge.title}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                        {newCompetition.teamConfig.judges.length > 0 && (
                          <p className="text-sm text-green-600">
                            已選擇 {newCompetition.teamConfig.judges.length} 位團體賽評審
                          </p>
                        )}
                      </div>

                      {/* Team Evaluation Rules */}
                      <div className="space-y-4 mb-6">
                        <div className="flex justify-between items-center">
                          <h5 className="font-semibold flex items-center">
                            <ClipboardList className="w-4 h-4 mr-2" />
                            團體賽評比標準
                          </h5>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newRule: CompetitionRule = {
                                id: `tr${Date.now()}`,
                                name: "",
                                description: "",
                                weight: 0,
                              }
                              setNewCompetition({
                                ...newCompetition,
                                teamConfig: {
                                  ...newCompetition.teamConfig,
                                  rules: [...newCompetition.teamConfig.rules, newRule],
                                },
                              })
                            }}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            新增評比項目
                          </Button>
                        </div>

                        {newCompetition.teamConfig.rules.length > 0 && (
                          <div className="space-y-3">
                            {newCompetition.teamConfig.rules.map((rule, index) => (
                              <div
                                key={rule.id}
                                className="grid grid-cols-12 gap-3 items-end p-3 border rounded-lg bg-white"
                              >
                                <div className="col-span-4">
                                  <Label className="text-xs">評比項目名稱</Label>
                                  <Input
                                    value={rule.name}
                                    onChange={(e) => {
                                      const updatedRules = [...newCompetition.teamConfig.rules]
                                      updatedRules[index] = { ...rule, name: e.target.value }
                                      setNewCompetition({
                                        ...newCompetition,
                                        teamConfig: {
                                          ...newCompetition.teamConfig,
                                          rules: updatedRules,
                                        },
                                      })
                                    }}
                                    placeholder="例如：團隊合作"
                                    className="text-sm"
                                  />
                                </div>
                                <div className="col-span-5">
                                  <Label className="text-xs">描述</Label>
                                  <Input
                                    value={rule.description}
                                    onChange={(e) => {
                                      const updatedRules = [...newCompetition.teamConfig.rules]
                                      updatedRules[index] = { ...rule, description: e.target.value }
                                      setNewCompetition({
                                        ...newCompetition,
                                        teamConfig: {
                                          ...newCompetition.teamConfig,
                                          rules: updatedRules,
                                        },
                                      })
                                    }}
                                    placeholder="例如：團隊協作能力和分工效率"
                                    className="text-sm"
                                  />
                                </div>
                                <div className="col-span-2">
                                  <Label className="text-xs">權重 (%)</Label>
                                  <Input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={rule.weight}
                                    onChange={(e) => {
                                      const updatedRules = [...newCompetition.teamConfig.rules]
                                      updatedRules[index] = { ...rule, weight: Number.parseInt(e.target.value) || 0 }
                                      setNewCompetition({
                                        ...newCompetition,
                                        teamConfig: {
                                          ...newCompetition.teamConfig,
                                          rules: updatedRules,
                                        },
                                      })
                                    }}
                                    className="text-sm"
                                  />
                                </div>
                                <div className="col-span-1">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      const updatedRules = newCompetition.teamConfig.rules.filter((_, i) => i !== index)
                                      setNewCompetition({
                                        ...newCompetition,
                                        teamConfig: {
                                          ...newCompetition.teamConfig,
                                          rules: updatedRules,
                                        },
                                      })
                                    }}
                                    className="text-red-600 border-red-300 hover:bg-red-50"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}

                            <div className="flex items-center justify-between p-3 bg-green-100 rounded-lg">
                              <span className="text-sm text-green-700">
                                團體賽總權重：
                                {newCompetition.teamConfig.rules.reduce((sum, rule) => sum + rule.weight, 0)}%
                              </span>
                              {newCompetition.teamConfig.rules.reduce((sum, rule) => sum + rule.weight, 0) !== 100 && (
                                <span className="text-sm text-orange-600">⚠️ 權重總和應為 100%</span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Team Award Types */}
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h5 className="font-semibold flex items-center">
                            <Award className="w-4 h-4 mr-2" />
                            團體賽獎項設定
                          </h5>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newAwardType: CompetitionAwardType = {
                                id: `tat${Date.now()}`,
                                name: "",
                                description: "",
                                icon: "🏆",
                                color: "text-yellow-600",
                              }
                              setNewCompetition({
                                ...newCompetition,
                                teamConfig: {
                                  ...newCompetition.teamConfig,
                                  awardTypes: [...newCompetition.teamConfig.awardTypes, newAwardType],
                                },
                              })
                            }}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            新增獎項類型
                          </Button>
                        </div>

                        {newCompetition.teamConfig.awardTypes.length > 0 && (
                          <div className="space-y-3">
                            {newCompetition.teamConfig.awardTypes.map((awardType, index) => (
                              <div
                                key={awardType.id}
                                className="grid grid-cols-12 gap-3 items-end p-3 border rounded-lg bg-white"
                              >
                                <div className="col-span-1">
                                  <Label className="text-xs">圖示</Label>
                                  <Select
                                    value={awardType.icon}
                                    onValueChange={(value) => {
                                      const updatedAwardTypes = [...newCompetition.teamConfig.awardTypes]
                                      updatedAwardTypes[index] = { ...awardType, icon: value }
                                      setNewCompetition({
                                        ...newCompetition,
                                        teamConfig: {
                                          ...newCompetition.teamConfig,
                                          awardTypes: updatedAwardTypes,
                                        },
                                      })
                                    }}
                                  >
                                    <SelectTrigger className="text-sm">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="🏆">🏆</SelectItem>
                                      <SelectItem value="🥇">🥇</SelectItem>
                                      <SelectItem value="🥈">🥈</SelectItem>
                                      <SelectItem value="🥉">🥉</SelectItem>
                                      <SelectItem value="⭐">⭐</SelectItem>
                                      <SelectItem value="💡">💡</SelectItem>
                                      <SelectItem value="⚙️">⚙️</SelectItem>
                                      <SelectItem value="🎯">🎯</SelectItem>
                                      <SelectItem value="❤️">❤️</SelectItem>
                                      <SelectItem value="👥">👥</SelectItem>
                                      <SelectItem value="🧠">🧠</SelectItem>
                                      <SelectItem value="🚀">🚀</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="col-span-3">
                                  <Label className="text-xs">獎項名稱</Label>
                                  <Input
                                    value={awardType.name}
                                    onChange={(e) => {
                                      const updatedAwardTypes = [...newCompetition.teamConfig.awardTypes]
                                      updatedAwardTypes[index] = { ...awardType, name: e.target.value }
                                      setNewCompetition({
                                        ...newCompetition,
                                        teamConfig: {
                                          ...newCompetition.teamConfig,
                                          awardTypes: updatedAwardTypes,
                                        },
                                      })
                                    }}
                                    placeholder="例如：最佳團隊合作獎"
                                    className="text-sm"
                                  />
                                </div>
                                <div className="col-span-5">
                                  <Label className="text-xs">獎項描述</Label>
                                  <Input
                                    value={awardType.description}
                                    onChange={(e) => {
                                      const updatedAwardTypes = [...newCompetition.teamConfig.awardTypes]
                                      updatedAwardTypes[index] = { ...awardType, description: e.target.value }
                                      setNewCompetition({
                                        ...newCompetition,
                                        teamConfig: {
                                          ...newCompetition.teamConfig,
                                          awardTypes: updatedAwardTypes,
                                        },
                                      })
                                    }}
                                    placeholder="例如：團隊協作最佳的團隊"
                                    className="text-sm"
                                  />
                                </div>
                                <div className="col-span-2">
                                  <Label className="text-xs">顏色主題</Label>
                                  <Select
                                    value={awardType.color}
                                    onValueChange={(value) => {
                                      const updatedAwardTypes = [...newCompetition.teamConfig.awardTypes]
                                      updatedAwardTypes[index] = { ...awardType, color: value }
                                      setNewCompetition({
                                        ...newCompetition,
                                        teamConfig: {
                                          ...newCompetition.teamConfig,
                                          awardTypes: updatedAwardTypes,
                                        },
                                      })
                                    }}
                                  >
                                    <SelectTrigger className="text-sm">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="text-yellow-600">
                                        <div className="flex items-center space-x-2">
                                          <div className="w-3 h-3 bg-yellow-600 rounded-full"></div>
                                          <span>金色</span>
                                        </div>
                                      </SelectItem>
                                      <SelectItem value="text-blue-600">
                                        <div className="flex items-center space-x-2">
                                          <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                                          <span>藍色</span>
                                        </div>
                                      </SelectItem>
                                      <SelectItem value="text-green-600">
                                        <div className="flex items-center space-x-2">
                                          <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                                          <span>綠色</span>
                                        </div>
                                      </SelectItem>
                                      <SelectItem value="text-red-600">
                                        <div className="flex items-center space-x-2">
                                          <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                                          <span>紅色</span>
                                        </div>
                                      </SelectItem>
                                      <SelectItem value="text-purple-600">
                                        <div className="flex items-center space-x-2">
                                          <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                                          <span>紫色</span>
                                        </div>
                                      </SelectItem>
                                      <SelectItem value="text-orange-600">
                                        <div className="flex items-center space-x-2">
                                          <div className="w-3 h-3 bg-orange-600 rounded-full"></div>
                                          <span>橙色</span>
                                        </div>
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="col-span-1">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      const updatedAwardTypes = newCompetition.teamConfig.awardTypes.filter(
                                        (_, i) => i !== index,
                                      )
                                      setNewCompetition({
                                        ...newCompetition,
                                        teamConfig: {
                                          ...newCompetition.teamConfig,
                                          awardTypes: updatedAwardTypes,
                                        },
                                      })
                                    }}
                                    className="text-red-600 border-red-300 hover:bg-red-50"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}

                            <div className="flex items-center justify-between p-3 bg-green-100 rounded-lg">
                              <span className="text-sm text-green-700">
                                已設定 {newCompetition.teamConfig.awardTypes.length} 種團體賽獎項類型
                              </span>
                              <div className="flex space-x-1">
                                {newCompetition.teamConfig.awardTypes.slice(0, 5).map((awardType, index) => (
                                  <span key={index} className="text-lg">
                                    {awardType.icon}
                                  </span>
                                ))}
                                {newCompetition.teamConfig.awardTypes.length > 5 && (
                                  <span className="text-sm text-gray-500">
                                    +{newCompetition.teamConfig.awardTypes.length - 5}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            ) : (
              // Single Competition Type Configuration
              <>
                {/* Judge Selection */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center">
                    <UserCheck className="w-5 h-5 mr-2" />
                    評審選擇 *
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {judges.map((judge) => (
                      <div key={judge.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                        <Checkbox
                          id={`judge-${judge.id}`}
                          checked={newCompetition.judges.includes(judge.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setNewCompetition({
                                ...newCompetition,
                                judges: [...newCompetition.judges, judge.id],
                              })
                            } else {
                              setNewCompetition({
                                ...newCompetition,
                                judges: newCompetition.judges.filter((id) => id !== judge.id),
                              })
                            }
                          }}
                        />
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={judge.avatar || "/placeholder.svg"} />
                          <AvatarFallback className="bg-purple-100 text-purple-700 text-sm">
                            {judge.name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{judge.name}</p>
                          <p className="text-xs text-gray-600">{judge.title}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {newCompetition.judges.length > 0 && (
                    <p className="text-sm text-green-600">已選擇 {newCompetition.judges.length} 位評審</p>
                  )}
                </div>

                <Separator />

                {/* Evaluation Rules */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center">
                    <ClipboardList className="w-5 h-5 mr-2" />
                    評比標準權重
                  </h3>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-600">設定各項評比標準的權重比例</p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newRule: CompetitionRule = {
                            id: `r${Date.now()}`,
                            name: "",
                            description: "",
                            weight: 0,
                          }
                          setNewCompetition({
                            ...newCompetition,
                            rules: [...newCompetition.rules, newRule],
                          })
                        }}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        新增評比項目
                      </Button>
                    </div>

                    {newCompetition.rules.length > 0 && (
                      <div className="space-y-3">
                        {newCompetition.rules.map((rule, index) => (
                          <div key={rule.id} className="grid grid-cols-12 gap-3 items-end p-3 border rounded-lg">
                            <div className="col-span-4">
                              <Label className="text-xs">評比項目名稱</Label>
                              <Input
                                value={rule.name}
                                onChange={(e) => {
                                  const updatedRules = [...newCompetition.rules]
                                  updatedRules[index] = { ...rule, name: e.target.value }
                                  setNewCompetition({ ...newCompetition, rules: updatedRules })
                                }}
                                placeholder="例如：創新性"
                                className="text-sm"
                              />
                            </div>
                            <div className="col-span-5">
                              <Label className="text-xs">描述</Label>
                              <Input
                                value={rule.description}
                                onChange={(e) => {
                                  const updatedRules = [...newCompetition.rules]
                                  updatedRules[index] = { ...rule, description: e.target.value }
                                  setNewCompetition({ ...newCompetition, rules: updatedRules })
                                }}
                                placeholder="例如：技術創新程度和獨特性"
                                className="text-sm"
                              />
                            </div>
                            <div className="col-span-2">
                              <Label className="text-xs">權重 (%)</Label>
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                value={rule.weight}
                                onChange={(e) => {
                                  const updatedRules = [...newCompetition.rules]
                                  updatedRules[index] = { ...rule, weight: Number.parseInt(e.target.value) || 0 }
                                  setNewCompetition({ ...newCompetition, rules: updatedRules })
                                }}
                                className="text-sm"
                              />
                            </div>
                            <div className="col-span-1">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const updatedRules = newCompetition.rules.filter((_, i) => i !== index)
                                  setNewCompetition({ ...newCompetition, rules: updatedRules })
                                }}
                                className="text-red-600 border-red-300 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}

                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                          <span className="text-sm text-blue-700">
                            總權重：{newCompetition.rules.reduce((sum, rule) => sum + rule.weight, 0)}%
                          </span>
                          {newCompetition.rules.reduce((sum, rule) => sum + rule.weight, 0) !== 100 && (
                            <span className="text-sm text-orange-600">⚠️ 權重總和應為 100%</span>
                          )}
                        </div>
                      </div>
                    )}

                    {newCompetition.rules.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <ClipboardList className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                        <p>尚未設定評比標準</p>
                        <p className="text-sm">點擊上方按鈕新增評比項目</p>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Award Types */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center">
                    <Award className="w-5 h-5 mr-2" />
                    獎項設定
                  </h3>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-600">設定本次競賽可頒發的獎項類型</p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newAwardType: CompetitionAwardType = {
                            id: `at${Date.now()}`,
                            name: "",
                            description: "",
                            icon: "🏆",
                            color: "text-yellow-600",
                          }
                          setNewCompetition({
                            ...newCompetition,
                            awardTypes: [...newCompetition.awardTypes, newAwardType],
                          })
                        }}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        新增獎項類型
                      </Button>
                    </div>

                    {newCompetition.awardTypes.length > 0 && (
                      <div className="space-y-3">
                        {newCompetition.awardTypes.map((awardType, index) => (
                          <div key={awardType.id} className="grid grid-cols-12 gap-3 items-end p-3 border rounded-lg">
                            <div className="col-span-1">
                              <Label className="text-xs">圖示</Label>
                              <Select
                                value={awardType.icon}
                                onValueChange={(value) => {
                                  const updatedAwardTypes = [...newCompetition.awardTypes]
                                  updatedAwardTypes[index] = { ...awardType, icon: value }
                                  setNewCompetition({ ...newCompetition, awardTypes: updatedAwardTypes })
                                }}
                              >
                                <SelectTrigger className="text-sm">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="🏆">🏆</SelectItem>
                                  <SelectItem value="🥇">🥇</SelectItem>
                                  <SelectItem value="🥈">🥈</SelectItem>
                                  <SelectItem value="🥉">🥉</SelectItem>
                                  <SelectItem value="⭐">⭐</SelectItem>
                                  <SelectItem value="💡">💡</SelectItem>
                                  <SelectItem value="⚙️">⚙️</SelectItem>
                                  <SelectItem value="🎯">🎯</SelectItem>
                                  <SelectItem value="❤️">❤️</SelectItem>
                                  <SelectItem value="👥">👥</SelectItem>
                                  <SelectItem value="🧠">🧠</SelectItem>
                                  <SelectItem value="🚀">🚀</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="col-span-3">
                              <Label className="text-xs">獎項名稱</Label>
                              <Input
                                value={awardType.name}
                                onChange={(e) => {
                                  const updatedAwardTypes = [...newCompetition.awardTypes]
                                  updatedAwardTypes[index] = { ...awardType, name: e.target.value }
                                  setNewCompetition({ ...newCompetition, awardTypes: updatedAwardTypes })
                                }}
                                placeholder="例如：最佳創新獎"
                                className="text-sm"
                              />
                            </div>
                            <div className="col-span-5">
                              <Label className="text-xs">獎項描述</Label>
                              <Input
                                value={awardType.description}
                                onChange={(e) => {
                                  const updatedAwardTypes = [...newCompetition.awardTypes]
                                  updatedAwardTypes[index] = { ...awardType, description: e.target.value }
                                  setNewCompetition({ ...newCompetition, awardTypes: updatedAwardTypes })
                                }}
                                placeholder="例如：最具創新性的應用"
                                className="text-sm"
                              />
                            </div>
                            <div className="col-span-2">
                              <Label className="text-xs">顏色主題</Label>
                              <Select
                                value={awardType.color}
                                onValueChange={(value) => {
                                  const updatedAwardTypes = [...newCompetition.awardTypes]
                                  updatedAwardTypes[index] = { ...awardType, color: value }
                                  setNewCompetition({ ...newCompetition, awardTypes: updatedAwardTypes })
                                }}
                              >
                                <SelectTrigger className="text-sm">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="text-yellow-600">
                                    <div className="flex items-center space-x-2">
                                      <div className="w-3 h-3 bg-yellow-600 rounded-full"></div>
                                      <span>金色</span>
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="text-blue-600">
                                    <div className="flex items-center space-x-2">
                                      <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                                      <span>藍色</span>
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="text-green-600">
                                    <div className="flex items-center space-x-2">
                                      <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                                      <span>綠色</span>
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="text-red-600">
                                    <div className="flex items-center space-x-2">
                                      <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                                      <span>紅色</span>
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="text-purple-600">
                                    <div className="flex items-center space-x-2">
                                      <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                                      <span>紫色</span>
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="text-orange-600">
                                    <div className="flex items-center space-x-2">
                                      <div className="w-3 h-3 bg-orange-600 rounded-full"></div>
                                      <span>橙色</span>
                                    </div>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="col-span-1">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const updatedAwardTypes = newCompetition.awardTypes.filter((_, i) => i !== index)
                                  setNewCompetition({ ...newCompetition, awardTypes: updatedAwardTypes })
                                }}
                                className="text-red-600 border-red-300 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}

                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                          <span className="text-sm text-green-700">
                            已設定 {newCompetition.awardTypes.length} 種獎項類型
                          </span>
                          <div className="flex space-x-1">
                            {newCompetition.awardTypes.slice(0, 5).map((awardType, index) => (
                              <span key={index} className="text-lg">
                                {awardType.icon}
                              </span>
                            ))}
                            {newCompetition.awardTypes.length > 5 && (
                              <span className="text-sm text-gray-500">+{newCompetition.awardTypes.length - 5}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {newCompetition.awardTypes.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <Award className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                        <p>尚未設定獎項類型</p>
                        <p className="text-sm">點擊上方按鈕新增獎項類型</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            <Separator />

            {/* Participant Selection */}
            <div className="space-y-4">
              {newCompetition.type === "mixed" ? (
                // Mixed competition - separate sections
                <>
                  <h3 className="text-lg font-semibold flex items-center">
                    <Trophy className="w-5 h-5 mr-2" />
                    <span>混合賽參賽項目選擇 *</span>
                  </h3>

                  {/* Individual Apps Section */}
                  <div className="space-y-4 border rounded-lg p-4 bg-blue-50">
                    <h4 className="font-semibold flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      個人賽應用選擇
                    </h4>

                    <div className="flex gap-4 mb-4">
                      <div className="flex-1">
                        <Input
                          placeholder="搜尋應用名稱或創作者..."
                          value={individualParticipantSearchTerm}
                          onChange={(e) => setIndividualParticipantSearchTerm(e.target.value)}
                          className="max-w-sm"
                        />
                      </div>
                      <Select value={individualDepartmentFilter} onValueChange={setIndividualDepartmentFilter}>
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="部門篩選" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">所有部門</SelectItem>
                          <SelectItem value="HQBU">HQBU</SelectItem>
                          <SelectItem value="ITBU">ITBU</SelectItem>
                          <SelectItem value="MBU1">MBU1</SelectItem>
                          <SelectItem value="SBU">SBU</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto border rounded-lg p-4 bg-white">
                      {getFilteredParticipants("individual").map((participant) => {
                        const isSelected = newCompetition.participatingApps.includes(participant.id)
                        return (
                          <div
                            key={participant.id}
                            className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <Checkbox
                              id={`individual-${participant.id}`}
                              checked={isSelected}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setNewCompetition({
                                    ...newCompetition,
                                    participatingApps: [...newCompetition.participatingApps, participant.id],
                                  })
                                } else {
                                  setNewCompetition({
                                    ...newCompetition,
                                    participatingApps: newCompetition.participatingApps.filter(
                                      (id: string) => id !== participant.id,
                                    ),
                                  })
                                }
                              }}
                            />
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center justify-between">
                                <p className="font-medium text-sm">{participant.name}</p>
                                <Badge variant="outline" className="text-xs">
                                  {participant.department}
                                </Badge>
                              </div>
                              <p className="text-xs text-gray-600 mt-1">創作者：{participant.creator}</p>
                              <p className="text-xs text-gray-500">提交日期：{participant.submissionDate}</p>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    <div className="flex items-center justify-between p-3 bg-blue-100 rounded-lg">
                      <span className="text-sm text-blue-700">
                        已選擇 {newCompetition.participatingApps.length} 個個人賽應用
                      </span>
                    </div>
                  </div>

                  {/* Team Section */}
                  <div className="space-y-4 border rounded-lg p-4 bg-green-50">
                    <h4 className="font-semibold flex items-center">
                      <Users className="w-4 h-4 mr-2" />
                      團體賽團隊選擇
                    </h4>

                    <div className="flex gap-4 mb-4">
                      <div className="flex-1">
                        <Input
                          placeholder="搜尋團隊名稱或隊長..."
                          value={teamParticipantSearchTerm}
                          onChange={(e) => setTeamParticipantSearchTerm(e.target.value)}
                          className="max-w-sm"
                        />
                      </div>
                      <Select value={teamDepartmentFilter} onValueChange={setTeamDepartmentFilter}>
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="部門篩選" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">所有部門</SelectItem>
                          <SelectItem value="HQBU">HQBU</SelectItem>
                          <SelectItem value="ITBU">ITBU</SelectItem>
                          <SelectItem value="MBU1">MBU1</SelectItem>
                          <SelectItem value="SBU">SBU</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto border rounded-lg p-4 bg-white">
                      {getFilteredParticipants("team").map((participant) => {
                        const isSelected = newCompetition.participatingTeams.includes(participant.id)
                        return (
                          <div
                            key={participant.id}
                            className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <Checkbox
                              id={`team-${participant.id}`}
                              checked={isSelected}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setNewCompetition({
                                    ...newCompetition,
                                    participatingTeams: [...newCompetition.participatingTeams, participant.id],
                                  })
                                } else {
                                  setNewCompetition({
                                    ...newCompetition,
                                    participatingTeams: newCompetition.participatingTeams.filter(
                                      (id: string) => id !== participant.id,
                                    ),
                                  })
                                }
                              }}
                            />
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center justify-between">
                                <p className="font-medium text-sm">{participant.name}</p>
                                <Badge variant="outline" className="text-xs">
                                  {participant.department}
                                </Badge>
                              </div>
                              <div className="flex items-center space-x-4 text-xs text-gray-600">
                                <div className="flex items-center space-x-1">
                                  <User className="w-3 h-3" />
                                  <span>隊長：{participant.leader}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Users className="w-3 h-3" />
                                  <span>{participant.memberCount}人</span>
                                </div>
                              </div>
                              {participant.contactEmail && (
                                <div className="flex items-center space-x-1 text-xs text-gray-600">
                                  <Mail className="w-3 h-3" />
                                  <span>{participant.contactEmail}</span>
                                </div>
                              )}
                              {participant.description && (
                                <p className="text-xs text-gray-500 line-clamp-2">{participant.description}</p>
                              )}
                              <p className="text-xs text-gray-500">提交日期：{participant.submissionDate}</p>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    <div className="flex items-center justify-between p-3 bg-green-100 rounded-lg">
                      <span className="text-sm text-green-700">
                        已選擇 {newCompetition.participatingTeams.length} 個團體賽團隊
                      </span>
                    </div>
                  </div>

                  {/* Mixed Competition Summary */}
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <span className="text-sm text-purple-700 font-medium">
                      混合賽總計：{newCompetition.participatingApps.length} 個應用 +{" "}
                      {newCompetition.participatingTeams.length} 個團隊
                    </span>
                  </div>
                </>
              ) : (
                // Single competition type - existing logic
                <>
                  <h3 className="text-lg font-semibold flex items-center">
                    {getCompetitionTypeIcon(newCompetition.type)}
                    <span className="ml-2">
                      {newCompetition.type === "individual" && "參賽應用選擇 *"}
                      {newCompetition.type === "team" && "參賽團隊選擇 *"}
                    </span>
                  </h3>

                  {/* Search and Filter */}
                  <div className="flex gap-4 mb-4">
                    <div className="flex-1">
                      <Input
                        placeholder={`搜尋${newCompetition.type === "team" ? "團隊名稱或隊長" : "應用名稱或創作者"}...`}
                        value={participantSearchTerm}
                        onChange={(e) => setParticipantSearchTerm(e.target.value)}
                        className="max-w-sm"
                      />
                    </div>
                    <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="部門篩選" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">所有部門</SelectItem>
                        <SelectItem value="HQBU">HQBU</SelectItem>
                        <SelectItem value="ITBU">ITBU</SelectItem>
                        <SelectItem value="MBU1">MBU1</SelectItem>
                        <SelectItem value="SBU">SBU</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Participant Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto border rounded-lg p-4">
                    {getFilteredParticipants(newCompetition.type).map((participant) => {
                      const participantField =
                        newCompetition.type === "individual" ? "participatingApps" : "participatingTeams"
                      const isSelected = newCompetition[participantField].includes(participant.id)

                      return (
                        <div
                          key={participant.id}
                          className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <Checkbox
                            id={`participant-${participant.id}`}
                            checked={isSelected}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setNewCompetition({
                                  ...newCompetition,
                                  [participantField]: [...newCompetition[participantField], participant.id],
                                })
                              } else {
                                setNewCompetition({
                                  ...newCompetition,
                                  [participantField]: newCompetition[participantField].filter(
                                    (id: string) => id !== participant.id,
                                  ),
                                })
                              }
                            }}
                          />
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center justify-between">
                              <p className="font-medium text-sm">{participant.name}</p>
                              <Badge variant="outline" className="text-xs">
                                {participant.department}
                              </Badge>
                            </div>

                            {/* Team specific information */}
                            {newCompetition.type === "team" && (
                              <div className="space-y-2">
                                <div className="flex items-center space-x-4 text-xs text-gray-600">
                                  <div className="flex items-center space-x-1">
                                    <User className="w-3 h-3" />
                                    <span>隊長：{participant.leader}</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <Users className="w-3 h-3" />
                                    <span>{participant.memberCount}人</span>
                                  </div>
                                </div>

                                {participant.contactEmail && (
                                  <div className="flex items-center space-x-1 text-xs text-gray-600">
                                    <Mail className="w-3 h-3" />
                                    <span>{participant.contactEmail}</span>
                                  </div>
                                )}

                                {participant.description && (
                                  <p className="text-xs text-gray-500 line-clamp-2">{participant.description}</p>
                                )}

                                {participant.apps && participant.apps.length > 0 && (
                                  <div className="space-y-1">
                                    <p className="text-xs font-medium text-gray-700">提交應用：</p>
                                    <div className="flex flex-wrap gap-1">
                                      {participant.apps.slice(0, 2).map((app: string, index: number) => (
                                        <Badge key={index} variant="secondary" className="text-xs">
                                          {app}
                                        </Badge>
                                      ))}
                                      {participant.apps.length > 2 && (
                                        <Badge variant="secondary" className="text-xs">
                                          +{participant.apps.length - 2}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {participant.members && participant.members.length > 0 && (
                                  <div className="space-y-1">
                                    <p className="text-xs font-medium text-gray-700">團隊成員：</p>
                                    <div className="space-y-1">
                                      {participant.members.slice(0, 3).map((member: any) => (
                                        <div key={member.id} className="flex items-center justify-between text-xs">
                                          <span className="text-gray-600">{member.name}</span>
                                          <div className="flex items-center space-x-2">
                                            <Badge variant="outline" className="text-xs px-1 py-0">
                                              {member.role}
                                            </Badge>
                                            <span className="text-gray-500">{member.department}</span>
                                          </div>
                                        </div>
                                      ))}
                                      {participant.members.length > 3 && (
                                        <p className="text-xs text-gray-500">
                                          還有 {participant.members.length - 3} 位成員...
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Individual information */}
                            {newCompetition.type === "individual" && (
                              <p className="text-xs text-gray-600 mt-1">創作者：{participant.creator}</p>
                            )}

                            <p className="text-xs text-gray-500">提交日期：{participant.submissionDate}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Selection Summary */}
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm text-blue-700">
                      已選擇{" "}
                      {newCompetition.type === "individual"
                        ? newCompetition.participatingApps.length
                        : newCompetition.participatingTeams.length}{" "}
                      個{newCompetition.type === "team" ? "團隊" : "應用"}
                    </span>
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowCreateCompetition(false)}>
                取消
              </Button>
              <Button onClick={handleCreateCompetition} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {selectedCompetitionForAction ? '更新中...' : '創建中...'}
                  </>
                ) : (
                  selectedCompetitionForAction ? "更新競賽" : "創建競賽"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 查看競賽詳情對話框 */}
      <Dialog open={showCompetitionDetail} onOpenChange={setShowCompetitionDetail}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>競賽詳情</DialogTitle>
            <DialogDescription>查看競賽的詳細資訊</DialogDescription>
          </DialogHeader>
          {selectedCompetitionForAction && (
            <div className="space-y-6">
              {/* 競賽基本資訊卡片 */}
              <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{selectedCompetitionForAction.name}</h3>
                    <p className="text-gray-600 mt-1">{selectedCompetitionForAction.description || '展示最具創新性的 AI 應用，推動企業數位轉型'}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={selectedCompetitionForAction.status === 'completed' ? 'default' : selectedCompetitionForAction.status === 'ongoing' ? 'secondary' : 'outline'}>
                      {getStatusText(selectedCompetitionForAction.status)}
                    </Badge>
                    <Badge variant="outline">
                      {getCompetitionTypeText(selectedCompetitionForAction.type)}
                    </Badge>
                    <Badge variant="outline">
                      {getParticipantCount(selectedCompetitionForAction)} 個參賽項目
                    </Badge>
                  </div>
                </div>
              </div>

              {/* 詳細資訊 */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">競賽ID</Label>
                    <p className="text-lg font-medium text-gray-900 mt-1">{selectedCompetitionForAction.id}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">開始日期</Label>
                    <p className="text-lg font-medium text-gray-900 mt-1">{selectedCompetitionForAction.startDate}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">競賽年月</Label>
                    <p className="text-lg font-medium text-gray-900 mt-1">{selectedCompetitionForAction.year}年{selectedCompetitionForAction.month}月</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">結束日期</Label>
                    <p className="text-lg font-medium text-gray-900 mt-1">{selectedCompetitionForAction.endDate}</p>
                  </div>
                </div>
              </div>

              {/* 評審團隊 */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900">評審團隊</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {judges.filter(judge => selectedCompetitionForAction.judges?.includes(judge.id)).map((judge) => (
                    <div key={judge.id} className="flex items-center space-x-3 p-4 border rounded-lg bg-white">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                          {judge.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-gray-900">{judge.name}</p>
                        <p className="text-sm text-gray-600">{judge.expertise}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 參賽應用 */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900">
                  參賽應用 ({getParticipantCount(selectedCompetitionForAction)})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedCompetitionForAction.type === 'individual' && 
                    mockIndividualApps
                      .filter(app => selectedCompetitionForAction.participatingApps?.includes(app.id))
                      .map((app) => (
                        <div key={app.id} className="p-4 border rounded-lg bg-white space-y-2">
                          <h5 className="font-medium text-gray-900">{app.name}</h5>
                          <p className="text-sm text-gray-600">創作者：{app.creator}</p>
                          <p className="text-sm text-gray-600">{app.department}</p>
                        </div>
                      ))
                  }
                  {selectedCompetitionForAction.type === 'team' && 
                    teams
                      .filter(team => selectedCompetitionForAction.participatingTeams?.includes(team.id))
                      .map((team) => (
                        <div key={team.id} className="p-4 border rounded-lg bg-white space-y-2">
                          <h5 className="font-medium text-gray-900">{team.name}</h5>
                          <p className="text-sm text-gray-600">隊長：{team.leader}</p>
                          <p className="text-sm text-gray-600">{team.department}</p>
                        </div>
                      ))
                  }
                  {selectedCompetitionForAction.type === 'mixed' && (
                    <>
                      {mockIndividualApps
                        .filter(app => selectedCompetitionForAction.participatingApps?.includes(app.id))
                        .map((app) => (
                          <div key={app.id} className="p-4 border rounded-lg bg-white space-y-2">
                            <h5 className="font-medium text-gray-900">{app.name}</h5>
                            <p className="text-sm text-gray-600">創作者：{app.creator}</p>
                            <p className="text-sm text-gray-600">{app.department}</p>
                          </div>
                        ))
                      }
                      {teams
                        .filter(team => selectedCompetitionForAction.participatingTeams?.includes(team.id))
                        .map((team) => (
                          <div key={team.id} className="p-4 border rounded-lg bg-white space-y-2">
                            <h5 className="font-medium text-gray-900">{team.name}</h5>
                            <p className="text-sm text-gray-600">隊長：{team.leader}</p>
                            <p className="text-sm text-gray-600">{team.department}</p>
                          </div>
                        ))
                      }
                    </>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => setShowCompetitionDetail(false)}>關閉</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>


      {/* 刪除競賽確認對話框 */}
      <Dialog open={showDeleteCompetitionConfirm} onOpenChange={setShowDeleteCompetitionConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>確認刪除</DialogTitle>
            <DialogDescription>此操作將永久刪除競賽，且無法復原。</DialogDescription>
          </DialogHeader>
          {selectedCompetitionForAction && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                您確定要刪除競賽「{selectedCompetitionForAction.name}」嗎？
              </p>
              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={() => setShowDeleteCompetitionConfirm(false)}>
                  取消
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={confirmDeleteCompetition}
                  disabled={isLoading}
                >
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
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 修改狀態對話框 */}
      <Dialog open={showChangeStatusDialog} onOpenChange={setShowChangeStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>修改競賽狀態</DialogTitle>
            <DialogDescription>更改競賽的當前狀態</DialogDescription>
          </DialogHeader>
          {selectedCompetitionForAction && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>當前狀態</Label>
                <p className="text-sm text-gray-600">
                  <Badge>{getStatusText(selectedCompetitionForAction.status)}</Badge>
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">新狀態</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="upcoming">即將開始</SelectItem>
                    <SelectItem value="ongoing">進行中</SelectItem>
                    <SelectItem value="completed">已完成</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={() => setShowChangeStatusDialog(false)}>
                  取消
                </Button>
                <Button onClick={handleUpdateStatus} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      更新中...
                    </>
                  ) : (
                    "更新狀態"
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 手動評分對話框 */}
      <Dialog open={showManualScoring} onOpenChange={setShowManualScoring}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>手動輸入評分</DialogTitle>
            <DialogDescription>為競賽項目手動輸入評審評分</DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* 混合賽類型選擇 */}
            {selectedCompetition?.type === 'mixed' && (
              <div className="space-y-3">
                <Label className="text-base font-medium">參賽類型</Label>
                <div className="flex space-x-2">
                  <Button
                    type="button"
                    variant={selectedParticipantType === 'individual' ? 'default' : 'outline'}
                    onClick={() => handleParticipantTypeChange('individual')}
                    className="flex-1"
                  >
                    <User className="w-4 h-4 mr-2" />
                    個人賽
                  </Button>
                  <Button
                    type="button"
                    variant={selectedParticipantType === 'team' ? 'default' : 'outline'}
                    onClick={() => handleParticipantTypeChange('team')}
                    className="flex-1"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    團體賽
                  </Button>
                </div>
              </div>
            )}

            {/* 選擇評審和參賽者 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>選擇評審</Label>
                <Select 
                  value={manualScoring.judgeId} 
                  onValueChange={(value) => setManualScoring({...manualScoring, judgeId: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="選擇評審" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* 混合賽時根據參賽者類型過濾評審 */}
                    {selectedCompetition?.type === 'mixed' ? (
                      judges.filter(judge => {
                        const config = selectedParticipantType === 'individual' 
                          ? selectedCompetition.individualConfig 
                          : selectedCompetition.teamConfig;
                        return config?.judges?.includes(judge.id) || false;
                      }).map((judge) => (
                        <SelectItem key={judge.id} value={judge.id}>
                          {judge.name} - {judge.expertise}
                        </SelectItem>
                      ))
                    ) : (
                      judges.filter(judge => selectedCompetition?.judges?.includes(judge.id) || false).map((judge) => (
                        <SelectItem key={judge.id} value={judge.id}>
                          {judge.name} - {judge.expertise}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>
                  {selectedCompetition?.type === 'mixed' 
                    ? (selectedParticipantType === 'individual' ? '選擇個人' : '選擇團隊')
                    : (selectedCompetition?.type === 'team' ? '選擇團隊' : '選擇個人')
                  }
                </Label>
                <Select 
                  value={manualScoring.participantId} 
                  onValueChange={(value) => setManualScoring({...manualScoring, participantId: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={
                      selectedCompetition?.type === 'mixed' 
                        ? (selectedParticipantType === 'individual' ? '選擇個人' : '選擇團隊')
                        : (selectedCompetition?.type === 'team' ? '選擇團隊' : '選擇個人')
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {/* 根據競賽類型和選擇的參賽者類型顯示參賽者 */}
                    {(selectedCompetition?.type === 'individual' || 
                      (selectedCompetition?.type === 'mixed' && selectedParticipantType === 'individual')) && 
                      mockIndividualApps
                        .filter(app => selectedCompetition.participatingApps?.includes(app.id))
                        .map((app) => (
                          <SelectItem key={app.id} value={app.id}>
                            {app.name} - {app.creator}
                          </SelectItem>
                        ))
                    }
                    {(selectedCompetition?.type === 'team' || 
                      (selectedCompetition?.type === 'mixed' && selectedParticipantType === 'team')) && 
                      teams
                        .filter(team => selectedCompetition.participatingTeams?.includes(team.id))
                        .map((team) => (
                          <SelectItem key={team.id} value={team.id}>
                            {team.name} - {team.leader}
                          </SelectItem>
                        ))
                    }
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* 評分項目 */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Label className="text-lg font-medium">評分項目</Label>
                {selectedCompetition?.type === 'mixed' && (
                  <Badge variant="outline" className="text-sm">
                    {selectedParticipantType === 'individual' ? '個人賽評分' : '團體賽評分'}
                  </Badge>
                )}
              </div>
              
              {/* 動態顯示競賽的評分項目 */}
              {(() => {
                let currentRules: any[] = [];
                
                if (selectedCompetition?.type === 'mixed') {
                  // 混合賽：根據當前選擇的參賽者類型獲取評分規則
                  const config = selectedParticipantType === 'individual' 
                    ? selectedCompetition.individualConfig 
                    : selectedCompetition.teamConfig;
                  currentRules = config?.rules || [];
                } else {
                  // 單一類型競賽
                  currentRules = selectedCompetition?.rules || [];
                }
                
                // 如果有自定義規則，使用自定義規則；否則使用預設規則
                const scoringItems = currentRules.length > 0 
                  ? currentRules 
                  : getDefaultScoringItems(
                      selectedCompetition?.type === 'mixed' 
                        ? selectedParticipantType 
                        : selectedCompetition?.type || 'individual'
                    );
                    
                return scoringItems.map((item: any, index: number) => (
                  <div key={index} className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <Label className="text-base font-medium">{item.name}</Label>
                        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                        {item.weight && (
                          <p className="text-xs text-purple-600 mt-1">權重：{item.weight}%</p>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold">
                          {manualScoring.scores[item.name] || 0} / 10
                        </span>
                      </div>
                    </div>
                    
                    {/* 評分按鈕 */}
                    <div className="flex flex-wrap gap-2">
                      {Array.from({ length: 10 }, (_, i) => i + 1).map((score) => (
                        <button
                          key={score}
                          type="button"
                          onClick={() => setManualScoring({
                            ...manualScoring,
                            scores: { ...manualScoring.scores, [item.name]: score }
                          })}
                          className={`w-10 h-10 rounded-lg border-2 font-medium transition-all ${
                            (manualScoring.scores[item.name] || 0) === score
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                          }`}
                        >
                          {score}
                        </button>
                      ))}
                    </div>
                  </div>
                ));
              })()}
            </div>

            {/* 評審意見 */}
            <div className="space-y-2">
              <Label className="text-base font-medium">評審意見 *</Label>
              <Textarea
                value={manualScoring.comments}
                onChange={(e) => setManualScoring({...manualScoring, comments: e.target.value})}
                placeholder="請提供評審意見和建議..."
                rows={4}
                className="resize-none"
              />
            </div>

            {/* 按鈕區 */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowManualScoring(false)}>
                取消
              </Button>
              <Button 
                onClick={handleSubmitManualScore} 
                disabled={isLoading}
                className="bg-gray-900 hover:bg-gray-800 text-white"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    提交中...
                  </>
                ) : (
                  "提交評分"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 創建團隊對話框 */}
      <Dialog 
        open={showCreateTeam} 
        onOpenChange={(open) => {
          setShowCreateTeam(open)
          if (!open) {
            setCreateError("")
            setSelectedTeam(null) // 清除編輯狀態
            resetTeamForm()
          }
        }}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedTeam ? '編輯團隊' : '創建新團隊'}</DialogTitle>
            <DialogDescription>
              {selectedTeam ? '修改團隊的基本資訊、成員和應用' : '建立一個新的競賽團隊，包含完整的團隊資訊'}
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">基本資訊</TabsTrigger>
              <TabsTrigger value="members">團隊成員</TabsTrigger>
              <TabsTrigger value="apps">提交應用</TabsTrigger>
            </TabsList>

            {/* 基本資訊標籤頁 */}
            <TabsContent value="basic" className="space-y-6 mt-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="team-name">團隊名稱 *</Label>
                  <Input
                    id="team-name"
                    value={newTeam.name}
                    onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                    placeholder="輸入團隊名稱"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="leader-name">隊長姓名 *</Label>
                  <Input
                    id="leader-name"
                    value={newTeam.leader}
                    onChange={(e) => setNewTeam({ ...newTeam, leader: e.target.value })}
                    placeholder="輸入隊長姓名"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="department">主要部門</Label>
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
                <div className="space-y-2">
                  <Label htmlFor="leader-phone">隊長聯絡電話</Label>
                  <Input
                    id="leader-phone"
                    value={newTeam.leaderPhone}
                    onChange={(e) => setNewTeam({ ...newTeam, leaderPhone: e.target.value })}
                    placeholder="0912-345-678"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact-email">團隊聯絡信箱 *</Label>
                <Input
                  id="contact-email"
                  type="email"
                  value={newTeam.contactEmail}
                  onChange={(e) => setNewTeam({ ...newTeam, contactEmail: e.target.value })}
                  placeholder="team@company.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="team-description">團隊描述</Label>
                <Textarea
                  id="team-description"
                  value={newTeam.description}
                  onChange={(e) => setNewTeam({ ...newTeam, description: e.target.value })}
                  placeholder="描述團隊的專長、目標或特色..."
                  rows={4}
                  className="resize-none"
                />
              </div>
            </TabsContent>

            {/* 團隊成員標籤頁 */}
            <TabsContent value="members" className="space-y-6 mt-6">
              <div className="space-y-4">
                <Label className="text-lg font-medium">新增成員</Label>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>成員姓名</Label>
                    <Input
                      value={newMember.name}
                      onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                      placeholder="輸入成員姓名"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>部門</Label>
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
                    <Label>角色/職責</Label>
                    <Select
                      value={newMember.role}
                      onValueChange={(value) => setNewMember({ ...newMember, role: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="選擇角色" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="隊長">隊長</SelectItem>
                        <SelectItem value="成員">成員</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={handleAddMember}
                  variant="outline"
                  className="w-full border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  新增成員
                </Button>
              </div>

              {/* 成員列表 */}
              {newTeam.members.length > 0 && (
                <div className="space-y-4">
                  <Label className="text-lg font-medium">團隊成員清單</Label>
                  <div className="space-y-3">
                    {newTeam.members.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                        <div className="flex items-center space-x-4">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                              {member.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{member.name}</p>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <span>{member.department}</span>
                              <span>•</span>
                              <span>{member.role}</span>
                            </div>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveMember(member.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* 提交應用標籤頁 */}
            <TabsContent value="apps" className="space-y-6 mt-6">
              <div className="space-y-4">
                <Label className="text-lg font-medium">新增應用</Label>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>應用名稱</Label>
                    <Input
                      value={newApp.name}
                      onChange={(e) => setNewApp({ ...newApp, name: e.target.value })}
                      placeholder="輸入應用名稱"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>應用連結</Label>
                    <Input
                      value={newApp.link}
                      onChange={(e) => setNewApp({ ...newApp, link: e.target.value })}
                      placeholder="https://app.example.com"
                    />
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={handleAddApp}
                  variant="outline"
                  className="w-full border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  新增應用
                </Button>
              </div>

              {/* 應用列表 */}
              {newTeam.apps.length > 0 && (
                <div className="space-y-4">
                  <Label className="text-lg font-medium">已提交應用</Label>
                  <div className="space-y-3">
                    {newTeam.apps.map((app, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                        <div className="flex-1">
                          <p className="font-medium">{app}</p>
                          <p className="text-sm text-gray-600">{newTeam.appLinks[index]}</p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveApp(index)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* 錯誤訊息 */}
          {createError && (
            <Alert variant="destructive" className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{createError}</AlertDescription>
            </Alert>
          )}

          {/* 底部按鈕 */}
          <div className="flex justify-end space-x-3 pt-4 border-t mt-6">
            <Button variant="outline" onClick={() => setShowCreateTeam(false)}>
              取消
            </Button>
            <Button 
              onClick={handleCreateTeam} 
              disabled={isLoading}
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {selectedTeam ? '更新中...' : '創建中...'}
                </>
              ) : (
                selectedTeam ? "更新團隊" : "創建團隊"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 查看團隊詳情對話框 */}
      <Dialog open={showTeamDetail} onOpenChange={setShowTeamDetail}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>團隊詳情</DialogTitle>
            <DialogDescription>查看團隊的詳細資訊</DialogDescription>
          </DialogHeader>
          {selectedTeam && (
            <div className="space-y-6">
              {/* 團隊基本資訊卡片 */}
              <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border">
                <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{selectedTeam.name}</h3>
                    <p className="text-gray-600 mt-1">{selectedTeam.description || '專注於AI技術創新與應用的團隊'}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">
                      {selectedTeam.department}
                    </Badge>
                    <Badge variant="outline">
                      {selectedTeam.memberCount} 名成員
                    </Badge>
                    <Badge variant="outline">
                      {selectedTeam.submittedAppCount} 個應用
                    </Badge>
                  </div>
                </div>
              </div>

              {/* 詳細資訊 */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">團隊ID</Label>
                    <p className="text-lg font-medium text-gray-900 mt-1">{selectedTeam.id}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">聯絡信箱</Label>
                    <p className="text-lg font-medium text-gray-900 mt-1">{selectedTeam.contactEmail}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">隊長</Label>
                    <p className="text-lg font-medium text-gray-900 mt-1">{selectedTeam.leader}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">聯絡電話</Label>
                    <p className="text-lg font-medium text-gray-900 mt-1">{selectedTeam.leaderPhone || '未提供'}</p>
                  </div>
                </div>
              </div>

              {/* 團隊成員 */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900">團隊成員</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedTeam.members?.map((member: any) => (
                    <div key={member.id} className="flex items-center space-x-3 p-3 border rounded-lg bg-white">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
                          {member.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <p className="font-medium text-gray-900">{member.name}</p>
                          {member.name === selectedTeam.leader && (
                            <Badge variant="default" className="text-xs bg-orange-100 text-orange-800">
                              隊長
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{member.department} • {member.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 提交應用 */}
              {selectedTeam.apps && selectedTeam.apps.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900">提交應用</h4>
                  <div className="space-y-3">
                    {selectedTeam.apps.map((app: string, index: number) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg bg-white">
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900">{app}</h5>
                          {selectedTeam.appLinks && selectedTeam.appLinks[index] && (
                            <div className="flex items-center space-x-1 mt-1">
                              <Link className="w-3 h-3 text-blue-600" />
                              <a 
                                href={selectedTeam.appLinks[index]} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:text-blue-800"
                              >
                                {selectedTeam.appLinks[index]}
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <Button onClick={() => setShowTeamDetail(false)}>關閉</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 刪除團隊確認對話框 */}
      <Dialog open={showDeleteTeamConfirm} onOpenChange={setShowDeleteTeamConfirm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              <span>確認刪除團隊</span>
            </DialogTitle>
            <DialogDescription>
              此操作無法撤銷，請確認是否要刪除此團隊。
            </DialogDescription>
          </DialogHeader>
          
          {teamToDelete && (
            <div className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-red-900">{teamToDelete.name}</h4>
                    <p className="text-sm text-red-700 mt-1">
                      隊長：{teamToDelete.leader} • {teamToDelete.memberCount} 名成員
                    </p>
                    <p className="text-sm text-red-700">
                      {teamToDelete.submittedAppCount} 個提交應用
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-sm text-gray-600 space-y-1">
                <p>⚠️ 刪除團隊將會：</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>永久移除團隊的所有資料</li>
                  <li>移除所有成員記錄</li>
                  <li>移除所有提交的應用</li>
                  <li>無法復原任何相關資訊</li>
                </ul>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowDeleteTeamConfirm(false)
                setTeamToDelete(null)
              }}
              disabled={isLoading}
            >
              取消
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleConfirmDeleteTeam}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  刪除中...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  確認刪除
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 新增評審對話框 */}
      <Dialog open={showAddJudge} onOpenChange={setShowAddJudge}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedJudge ? '編輯評審' : '新增評審'}</DialogTitle>
            <DialogDescription>
              {selectedJudge ? '修改評審的基本資訊和專業領域' : '新增專業評審到評審團'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* 姓名 */}
            <div className="space-y-2">
              <Label htmlFor="judge-name">
                姓名 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="judge-name"
                value={newJudge.name}
                onChange={(e) => setNewJudge({ ...newJudge, name: e.target.value })}
                placeholder="輸入評審姓名"
              />
            </div>

            {/* 職稱 */}
            <div className="space-y-2">
              <Label htmlFor="judge-title">
                職稱 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="judge-title"
                value={newJudge.title}
                onChange={(e) => setNewJudge({ ...newJudge, title: e.target.value })}
                placeholder="輸入職稱"
              />
            </div>

            {/* 部門 */}
            <div className="space-y-2">
              <Label htmlFor="judge-department">
                部門 <span className="text-red-500">*</span>
              </Label>
              <Select
                value={newJudge.department === "" || !["HQBU", "ITBU", "MBU1", "MBU2", "SBU", "研發部", "產品部", "技術部"].includes(newJudge.department) ? "custom" : newJudge.department}
                onValueChange={(value) => {
                  if (value === "custom") {
                    setNewJudge({ ...newJudge, department: "" })
                  } else {
                    setNewJudge({ ...newJudge, department: value })
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="選擇部門" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HQBU">HQBU</SelectItem>
                  <SelectItem value="ITBU">ITBU</SelectItem>
                  <SelectItem value="MBU1">MBU1</SelectItem>
                  <SelectItem value="MBU2">MBU2</SelectItem>
                  <SelectItem value="SBU">SBU</SelectItem>
                  <SelectItem value="研發部">研發部</SelectItem>
                  <SelectItem value="產品部">產品部</SelectItem>
                  <SelectItem value="技術部">技術部</SelectItem>
                  <SelectItem value="custom">其他/自定義...</SelectItem>
                </SelectContent>
              </Select>
              
              {/* 自定義部門輸入框 */}
              {(newJudge.department === "" || !["HQBU", "ITBU", "MBU1", "MBU2", "SBU", "研發部", "產品部", "技術部"].includes(newJudge.department)) && (
                <Input
                  value={newJudge.department}
                  onChange={(e) => setNewJudge({ ...newJudge, department: e.target.value })}
                  placeholder="請輸入部門/機構名稱，例如：外部顧問、XX顧問公司"
                  className="mt-2"
                />
              )}
            </div>

            {/* 專業領域 */}
            <div className="space-y-3">
              <Label htmlFor="judge-expertise">專業領域</Label>
              <Input
                id="judge-expertise"
                value={newJudge.expertise}
                onChange={(e) => setNewJudge({ ...newJudge, expertise: e.target.value })}
                placeholder="用逗號分隔，例如：機器學習, 深度學習"
              />
              
              {/* 快速選擇標籤 */}
              <div className="space-y-2">
                <p className="text-sm text-gray-600">快速選擇常用專業領域：</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    "機器學習",
                    "深度學習", 
                    "自然語言處理",
                    "計算機視覺",
                    "數據科學",
                    "人工智能",
                    "雲端計算",
                    "網路安全",
                    "軟體工程",
                    "用戶體驗"
                  ].map((tag) => (
                    <Button
                      key={tag}
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 px-3 text-xs border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                      onClick={() => {
                        const currentExpertise = newJudge.expertise.trim()
                        if (currentExpertise === "") {
                          setNewJudge({ ...newJudge, expertise: tag })
                        } else {
                          // 檢查是否已經包含這個標籤
                          const expertiseList = currentExpertise.split(',').map(item => item.trim())
                          if (!expertiseList.includes(tag)) {
                            setNewJudge({ ...newJudge, expertise: currentExpertise + ", " + tag })
                          }
                        }
                      }}
                    >
                      + {tag}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* 錯誤訊息 */}
            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-600">{error}</AlertDescription>
              </Alert>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowAddJudge(false)
                setSelectedJudge(null)
                setNewJudge({
                  name: "",
                  title: "",
                  department: "",
                  expertise: "",
                })
                setError("")
              }}
              disabled={isLoading}
            >
              取消
            </Button>
            <Button 
              onClick={handleAddJudge}
              disabled={isLoading}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {selectedJudge ? '更新中...' : '新增中...'}
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  {selectedJudge ? '更新評審' : '新增評審'}
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 查看評審詳情對話框 */}
      <Dialog open={showJudgeDetail} onOpenChange={setShowJudgeDetail}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>評審詳情</DialogTitle>
            <DialogDescription>查看評審的詳細資訊</DialogDescription>
          </DialogHeader>
          
          {selectedJudge && (
            <div className="space-y-6">
              {/* 評審基本資訊卡片 */}
              <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border">
                <Avatar className="w-16 h-16">
                  <AvatarFallback className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-lg font-bold">
                    {selectedJudge.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{selectedJudge.name}</h3>
                    <p className="text-gray-600 font-medium">{selectedJudge.title}</p>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>{selectedJudge.department}</span>
                    <Badge variant="outline" className="text-xs">
                      ID: {selectedJudge.id}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* 專業領域 */}
              <div className="space-y-3">
                <h4 className="text-lg font-semibold text-gray-900">專業領域</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedJudge.expertise && selectedJudge.expertise.length > 0 ? (
                    selectedJudge.expertise.map((field, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary"
                        className="bg-purple-100 text-purple-800 hover:bg-purple-200"
                      >
                        {field}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">未設定專業領域</p>
                  )}
                </div>
              </div>

              {/* 統計資訊 */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div className="text-center">
                  <div className="text-sm text-gray-500">評審ID</div>
                  <div className="text-lg font-bold text-gray-900">{selectedJudge.id}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-500">專業領域數量</div>
                  <div className="text-lg font-bold text-gray-900">
                    {selectedJudge.expertise ? selectedJudge.expertise.length : 0} 個
                  </div>
                </div>
              </div>

              {/* 底部按鈕 */}
              <div className="flex justify-end space-x-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowJudgeDetail(false)}
                >
                  關閉
                </Button>
                <Button 
                  onClick={() => {
                    setShowJudgeDetail(false)
                    handleEditJudge(selectedJudge)
                  }}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  編輯評審
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 刪除評審確認對話框 */}
      <Dialog open={showDeleteJudgeConfirm} onOpenChange={setShowDeleteJudgeConfirm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              <span>確認刪除評審</span>
            </DialogTitle>
            <DialogDescription>
              此操作無法撤銷，請確認是否要刪除此評審。
            </DialogDescription>
          </DialogHeader>
          
          {selectedJudge && (
            <div className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-red-100 text-red-600">
                      {selectedJudge.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h4 className="font-medium text-red-900">{selectedJudge.name}</h4>
                    <p className="text-sm text-red-700 mt-1">
                      職稱：{selectedJudge.title}
                    </p>
                    <p className="text-sm text-red-700">
                      部門：{selectedJudge.department}
                    </p>
                    <p className="text-sm text-red-700">
                      專業領域：{selectedJudge.expertise?.length || 0} 個
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-sm text-gray-600 space-y-1">
                <p>⚠️ 刪除評審將會：</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>永久移除評審的所有資料</li>
                  <li>移除該評審的所有評分記錄</li>
                  <li>從所有競賽中移除此評審</li>
                  <li>無法復原任何相關資訊</li>
                </ul>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowDeleteJudgeConfirm(false)
                setSelectedJudge(null)
              }}
              disabled={isLoading}
            >
              取消
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDeleteJudge}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  刪除中...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  確認刪除
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 創建獎項對話框 */}
      <Dialog open={showCreateAward} onOpenChange={setShowCreateAward}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Award className="w-6 h-6 text-orange-600" />
              <span>{selectedAward ? "編輯獎項" : "創建獎項"}</span>
            </DialogTitle>
            <DialogDescription>
              {selectedAward ? "修改獎項資訊，更新相關競賽、團隊和評審資訊" : "為競賽參賽者創建獎項，系統將自動關聯相關競賽、團隊和評審資訊"}
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="basic">基本資訊</TabsTrigger>
              <TabsTrigger value="participants">參賽者</TabsTrigger>
              <TabsTrigger value="links">應用連結</TabsTrigger>
              <TabsTrigger value="documents">相關文檔</TabsTrigger>
              <TabsTrigger value="photos">得獎照片</TabsTrigger>
            </TabsList>

            {/* 基本資訊 */}
            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 競賽選擇 */}
                <div className="space-y-2">
                  <Label htmlFor="award-competition">
                    選擇競賽 <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={newAward.competitionId}
                    onValueChange={(value) => {
                      setNewAward({ ...newAward, competitionId: value, participantId: "" })
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="選擇競賽" />
                    </SelectTrigger>
                    <SelectContent>
                      {competitions.map((competition) => (
                        <SelectItem key={competition.id} value={competition.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{competition.name}</span>
                            <span className="text-xs text-gray-500">
                              {competition.year}年{competition.month}月 • {competition.type === "individual" ? "個人賽" : competition.type === "team" ? "團體賽" : "混合賽"}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 獎項名稱 */}
                <div className="space-y-2">
                  <Label htmlFor="award-name">
                    獎項名稱 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="award-name"
                    value={newAward.awardName}
                    onChange={(e) => setNewAward({ ...newAward, awardName: e.target.value })}
                    placeholder="例如：最佳創新獎、金獎、銀獎"
                  />
                </div>

                {/* 獎項類型 */}
                <div className="space-y-2">
                  <Label>獎項類型</Label>
                  <Select
                    value={newAward.awardType}
                    onValueChange={(value: any) => setNewAward({ ...newAward, awardType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gold">🥇 金獎</SelectItem>
                      <SelectItem value="silver">🥈 銀獎</SelectItem>
                      <SelectItem value="bronze">🥉 銅獎</SelectItem>
                      <SelectItem value="popular">👥 人氣獎</SelectItem>
                      <SelectItem value="innovation">💡 創新獎</SelectItem>
                      <SelectItem value="technical">⚙️ 技術獎</SelectItem>
                      <SelectItem value="custom">🏆 自定義獎項</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 獎項類別 */}
                <div className="space-y-2">
                  <Label>獎項類別</Label>
                  <Select
                    value={newAward.category}
                    onValueChange={(value: any) => setNewAward({ ...newAward, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="innovation">創新類</SelectItem>
                      <SelectItem value="technical">技術類</SelectItem>
                      <SelectItem value="practical">實用類</SelectItem>
                      <SelectItem value="popular">人氣類</SelectItem>
                      <SelectItem value="teamwork">團隊合作類</SelectItem>
                      <SelectItem value="solution">解決方案類</SelectItem>
                      <SelectItem value="creativity">創意類</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 獎項排名 */}
                <div className="space-y-2">
                  <Label>獎項排名</Label>
                  <Select
                    value={newAward.rank.toString()}
                    onValueChange={(value) => setNewAward({ ...newAward, rank: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">非排名獎項</SelectItem>
                      <SelectItem value="1">第一名</SelectItem>
                      <SelectItem value="2">第二名</SelectItem>
                      <SelectItem value="3">第三名</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 評分 */}
                <div className="space-y-2">
                  <Label>評審評分</Label>
                  <Input
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={newAward.score}
                    onChange={(e) => setNewAward({ ...newAward, score: parseFloat(e.target.value) || 0 })}
                    placeholder="0.0 - 5.0"
                  />
                  <p className="text-xs text-gray-500">滿分5.0分，將顯示在獎項詳情中</p>
                </div>
              </div>

              {/* 獎項描述 */}
              <div className="space-y-2">
                <Label>獎項描述</Label>
                <Textarea
                  value={newAward.description}
                  onChange={(e) => setNewAward({ ...newAward, description: e.target.value })}
                  placeholder="描述此獎項的意義、評選標準或特殊說明..."
                  rows={3}
                />
              </div>

              {/* 評審評語 */}
              <div className="space-y-2">
                <Label>評審評語</Label>
                <Textarea
                  value={newAward.judgeComments}
                  onChange={(e) => setNewAward({ ...newAward, judgeComments: e.target.value })}
                  placeholder="評審團對此作品的整體評語和建議..."
                  rows={3}
                />
              </div>

              {/* 競賽資訊預覽 */}
              {newAward.competitionId && (() => {
                const selectedCompetition = competitions.find(c => c.id === newAward.competitionId)
                if (!selectedCompetition) return null

                return (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">競賽資訊預覽</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <div><span className="font-medium">競賽名稱：</span>{selectedCompetition.name}</div>
                      <div><span className="font-medium">競賽類型：</span>{selectedCompetition.type === "individual" ? "個人賽" : selectedCompetition.type === "team" ? "團體賽" : "混合賽"}</div>
                      <div><span className="font-medium">競賽期間：</span>{selectedCompetition.startDate} ~ {selectedCompetition.endDate}</div>
                      <div><span className="font-medium">評審團：</span>{judges.filter(j => selectedCompetition.judges?.includes(j.id)).length} 位評審</div>
                    </div>
                  </div>
                )
              })()}
            </TabsContent>

            {/* 參賽者選擇 */}
            <TabsContent value="participants" className="space-y-4">
              {newAward.competitionId ? (() => {
                const selectedCompetition = competitions.find(c => c.id === newAward.competitionId)
                if (!selectedCompetition) return <p className="text-gray-500">請先選擇競賽</p>

                return (
                  <div className="space-y-4">
                    {/* 參賽者類型選擇 */}
                    {selectedCompetition.type === "mixed" && (
                      <div className="space-y-2">
                        <Label>參賽者類型</Label>
                        <div className="flex space-x-2">
                          <Button
                            type="button"
                            variant={newAward.participantType === "individual" ? "default" : "outline"}
                            onClick={() => setNewAward({ ...newAward, participantType: "individual", participantId: "" })}
                          >
                            個人參賽
                          </Button>
                          <Button
                            type="button"
                            variant={newAward.participantType === "team" ? "default" : "outline"}
                            onClick={() => setNewAward({ ...newAward, participantType: "team", participantId: "" })}
                          >
                            團隊參賽
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* 參賽者選擇 */}
                    <div className="space-y-2">
                      <Label>
                        選擇{newAward.participantType === "individual" ? "個人" : "團隊"}參賽者 <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={newAward.participantId}
                        onValueChange={(value) => setNewAward({ ...newAward, participantId: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={`選擇${newAward.participantType === "individual" ? "個人" : "團隊"}參賽者`} />
                        </SelectTrigger>
                        <SelectContent>
                          {newAward.participantType === "individual" ? (
                            // 這裡應該從 mockIndividualApps 獲取，暫時用示例數據
                            [
                              { id: "app1", name: "智能客服系統", creator: "張小明", department: "ITBU" },
                              { id: "app2", name: "數據分析平台", creator: "李美華", department: "研發部" },
                            ].map((app) => (
                              <SelectItem key={app.id} value={app.id}>
                                <div className="flex flex-col">
                                  <span className="font-medium">{app.name}</span>
                                  <span className="text-xs text-gray-500">by {app.creator} • {app.department}</span>
                                </div>
                              </SelectItem>
                            ))
                          ) : (
                            teams.map((team) => (
                              <SelectItem key={team.id} value={team.id}>
                                <div className="flex flex-col">
                                  <span className="font-medium">{team.name}</span>
                                  <span className="text-xs text-gray-500">隊長：{team.leader} • {team.department} • {team.memberCount}人</span>
                                </div>
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* 參賽者資訊預覽 */}
                    {newAward.participantId && (() => {
                      if (newAward.participantType === "individual") {
                        const app = [
                          { id: "app1", name: "智能客服系統", creator: "張小明", department: "ITBU", description: "基於AI的智能客服解決方案" },
                          { id: "app2", name: "數據分析平台", creator: "李美華", department: "研發部", description: "企業級數據分析和視覺化平台" },
                        ].find(a => a.id === newAward.participantId)
                        
                        if (!app) return null

                        return (
                          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                            <h4 className="font-medium text-green-900 mb-2">個人參賽者資訊</h4>
                            <div className="space-y-2 text-sm">
                              <div><span className="font-medium">應用名稱：</span>{app.name}</div>
                              <div><span className="font-medium">創作者：</span>{app.creator}</div>
                              <div><span className="font-medium">所屬部門：</span>{app.department}</div>
                              <div><span className="font-medium">應用描述：</span>{app.description}</div>
                            </div>
                          </div>
                        )
                      } else {
                        const team = teams.find(t => t.id === newAward.participantId)
                        if (!team) return null

                        return (
                          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                            <h4 className="font-medium text-green-900 mb-2">團隊參賽者資訊</h4>
                            <div className="space-y-2 text-sm">
                              <div><span className="font-medium">團隊名稱：</span>{team.name}</div>
                              <div><span className="font-medium">隊長：</span>{team.leader}</div>
                              <div><span className="font-medium">所屬部門：</span>{team.department}</div>
                              <div><span className="font-medium">團隊人數：</span>{team.memberCount}人</div>
                              <div><span className="font-medium">提交應用：</span>{team.submittedAppCount}個</div>
                              <div><span className="font-medium">聯絡信箱：</span>{team.contactEmail}</div>
                            </div>
                          </div>
                        )
                      }
                    })()}

                    {/* 評審團資訊 */}
                    <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                      <h4 className="font-medium text-purple-900 mb-2">競賽評審團</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {judges.filter(judge => selectedCompetition.judges?.includes(judge.id)).map((judge) => (
                          <div key={judge.id} className="flex items-center space-x-2 text-sm">
                            <Avatar className="w-6 h-6">
                              <AvatarFallback className="text-xs bg-purple-100 text-purple-600">
                                {judge.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <span className="font-medium">{judge.name}</span>
                              <span className="text-gray-500 ml-1">• {judge.department}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              })() : (
                <div className="text-center py-8 text-gray-500">
                  <Trophy className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>請先在「基本資訊」頁面選擇競賽</p>
                </div>
              )}
            </TabsContent>

            {/* 應用連結 */}
            <TabsContent value="links" className="space-y-4">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* 正式應用 */}
                  <div className="space-y-2">
                    <Label className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span>正式應用</span>
                    </Label>
                    <Input
                      value={newAward.applicationLinks.production}
                      onChange={(e) => setNewAward({
                        ...newAward,
                        applicationLinks: { ...newAward.applicationLinks, production: e.target.value }
                      })}
                      placeholder="https://app.example.com"
                    />
                    <p className="text-xs text-gray-500">生產環境應用連結</p>
                  </div>

                  {/* 演示版本 */}
                  <div className="space-y-2">
                    <Label className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span>演示版本</span>
                    </Label>
                    <Input
                      value={newAward.applicationLinks.demo}
                      onChange={(e) => setNewAward({
                        ...newAward,
                        applicationLinks: { ...newAward.applicationLinks, demo: e.target.value }
                      })}
                      placeholder="https://demo.example.com"
                    />
                    <p className="text-xs text-gray-500">體驗環境連結</p>
                  </div>

                  {/* GitHub */}
                  <div className="space-y-2">
                    <Label className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-gray-800 rounded-full"></div>
                      <span>源碼倉庫</span>
                    </Label>
                    <Input
                      value={newAward.applicationLinks.github}
                      onChange={(e) => setNewAward({
                        ...newAward,
                        applicationLinks: { ...newAward.applicationLinks, github: e.target.value }
                      })}
                      placeholder="https://github.com/..."
                    />
                    <p className="text-xs text-gray-500">GitHub 或其他代碼倉庫</p>
                  </div>
                </div>

                {/* 連結預覽 */}
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">應用連結預覽</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {newAward.applicationLinks.production && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                          <span className="text-sm font-medium">正式應用</span>
                        </div>
                        <p className="text-xs text-gray-600 break-all">{newAward.applicationLinks.production}</p>
                      </div>
                    )}

                    {newAward.applicationLinks.demo && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">▶</span>
                          </div>
                          <span className="text-sm font-medium">演示版本</span>
                        </div>
                        <p className="text-xs text-gray-600 break-all">{newAward.applicationLinks.demo}</p>
                      </div>
                    )}

                    {newAward.applicationLinks.github && (
                      <div className="p-3 bg-gray-50 border border-gray-300 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="w-4 h-4 bg-gray-800 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">⚡</span>
                          </div>
                          <span className="text-sm font-medium">源碼倉庫</span>
                        </div>
                        <p className="text-xs text-gray-600 break-all">{newAward.applicationLinks.github}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* 相關文檔 */}
            <TabsContent value="documents" className="space-y-4">
              <div className="space-y-4">
                {/* 文檔上傳區域 */}
                <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg text-center">
                  <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">上傳相關文檔</h4>
                  <p className="text-gray-600 mb-4">支持 PDF、DOC、DOCX、PPTX 等格式，單檔最大 10MB</p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      // 模擬文檔上傳
                      const newDoc = {
                        id: `doc_${Date.now()}`,
                        name: `示例文檔_${newAward.documents.length + 1}.pdf`,
                        type: "PDF",
                        size: "2.5 MB",
                        uploadDate: new Date().toISOString().split("T")[0],
                        url: "#"
                      }
                      setNewAward({
                        ...newAward,
                        documents: [...newAward.documents, newDoc]
                      })
                    }}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    選擇文檔
                  </Button>
                </div>

                {/* 已上傳文檔列表 */}
                {newAward.documents.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">已上傳文檔</h4>
                    {newAward.documents.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                            <span className="text-xs font-medium text-red-600">{doc.type}</span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{doc.name}</p>
                            <p className="text-xs text-gray-500">
                              大小：{doc.size} • 上傳：{doc.uploadDate}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-1" />
                            預覽
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setNewAward({
                                ...newAward,
                                documents: newAward.documents.filter(d => d.id !== doc.id)
                              })
                            }}
                            className="text-red-600 border-red-300 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 常見文檔類型模板 */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-3">建議上傳的文檔類型</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      <span>技術報告書 (詳細技術實現和架構設計)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      <span>用戶手冊 (操作指南和功能說明)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      <span>演示簡報 (競賽現場使用的簡報資料)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      <span>測試報告 (性能測試和用戶體驗測試結果)</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* 得獎照片 */}
            <TabsContent value="photos" className="space-y-4">
              <div className="space-y-4">
                {/* 照片上傳區域 */}
                <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-lg flex items-center justify-center">
                    📸
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">上傳得獎照片</h4>
                  <p className="text-gray-600 mb-4">支持 JPG、PNG、GIF 等格式，建議尺寸 1920x1080，單檔最大 5MB</p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      // 模擬照片上傳
                      const newPhoto = {
                        id: `photo_${Date.now()}`,
                        name: `得獎照片_${newAward.photos.length + 1}.jpg`,
                        url: "/placeholder.jpg", // 實際應用中會是真實的圖片URL
                        caption: "",
                        uploadDate: new Date().toISOString().split("T")[0],
                        size: "2.5 MB"
                      }
                      setNewAward({
                        ...newAward,
                        photos: [...newAward.photos, newPhoto]
                      })
                    }}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    選擇照片
                  </Button>
                </div>

                {/* 已上傳照片預覽 */}
                {newAward.photos.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">已上傳照片 ({newAward.photos.length})</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {newAward.photos.map((photo) => (
                        <div key={photo.id} className="relative group border border-gray-200 rounded-lg overflow-hidden">
                          {/* 照片預覽 */}
                          <div className="aspect-video bg-gray-100 flex items-center justify-center">
                            <div className="text-4xl">🖼️</div>
                          </div>
                          
                          {/* 照片資訊 */}
                          <div className="p-3 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-900 truncate">{photo.name}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setNewAward({
                                    ...newAward,
                                    photos: newAward.photos.filter(p => p.id !== photo.id)
                                  })
                                }}
                                className="text-red-600 hover:bg-red-50 h-6 w-6 p-0"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                            
                            <div className="text-xs text-gray-500">
                              大小：{photo.size} • {photo.uploadDate}
                            </div>
                            
                            {/* 照片說明 */}
                            <Input
                              placeholder="輸入照片說明..."
                              value={photo.caption}
                              onChange={(e) => {
                                const updatedPhotos = newAward.photos.map(p => 
                                  p.id === photo.id ? { ...p, caption: e.target.value } : p
                                )
                                setNewAward({ ...newAward, photos: updatedPhotos })
                              }}
                              className="text-xs"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 照片說明指南 */}
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <h4 className="font-medium text-amber-900 mb-3">得獎照片拍攝建議</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-amber-800">
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                      <span>頒獎典禮現場照片</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                      <span>得獎者與評審合影</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                      <span>獎盃或證書特寫</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                      <span>團隊慶祝瞬間</span>
                    </div>
                  </div>
                </div>

                {/* 照片展示效果預覽 */}
                {newAward.photos.length > 0 && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-3">前台展示效果預覽</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {newAward.photos.slice(0, 4).map((photo, index) => (
                        <div key={photo.id} className="aspect-video bg-blue-100 rounded border flex items-center justify-center text-xs text-blue-600">
                          照片 {index + 1}
                        </div>
                      ))}
                      {newAward.photos.length > 4 && (
                        <div className="aspect-video bg-blue-100 rounded border flex items-center justify-center text-xs text-blue-600">
                          +{newAward.photos.length - 4}
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-blue-700 mt-2">
                      {newAward.photos.length > 4 
                        ? "前台將顯示前4張照片，用戶可點擊「查看所有照片」查看完整相簿" 
                        : "前台將顯示所有上傳的照片"}
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={() => {
              setShowCreateAward(false)
              setSelectedAward(null)
              setNewAward({
                competitionId: "",
                participantId: "",
                participantType: "individual",
                awardType: "custom",
                awardName: "",
                customAwardTypeId: "",
                description: "",
                score: 0,
                category: "innovation",
                rank: 0,
                applicationLinks: {
                  production: "",
                  demo: "",
                  github: "",
                },
                documents: [],
                judgeComments: "",
                photos: [],
              })
            }} disabled={isLoading}>
              取消
            </Button>
            <Button onClick={handleCreateAward} disabled={isLoading} className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700">
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {selectedAward ? "更新中..." : "創建中..."}
                </>
              ) : (
                <>
                  <Award className="w-4 h-4 mr-2" />
                  {selectedAward ? "更新獎項" : "創建獎項"}
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 查看獎項詳情對話框 */}
      <Dialog open={showAwardDetail} onOpenChange={setShowAwardDetail}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Award className="w-6 h-6 text-orange-600" />
              <span>獎項詳情</span>
            </DialogTitle>
            <DialogDescription>
              查看獎項的完整資訊和相關資料
            </DialogDescription>
          </DialogHeader>

          {selectedAward && (
            <div className="space-y-6">
              {/* 獎項基本資訊卡片 */}
              <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-600 to-amber-600 rounded-xl flex items-center justify-center flex-shrink-0 text-2xl">
                  {selectedAward.icon}
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{selectedAward.awardName}</h3>
                    <p className="text-gray-600 mt-1">
                      {selectedAward.appName || "團隊作品"} • by {selectedAward.creator}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge 
                      variant="secondary"
                      className={`${
                        selectedAward.awardType === "gold"
                          ? "bg-yellow-100 text-yellow-800"
                          : selectedAward.awardType === "silver"
                            ? "bg-gray-100 text-gray-800"
                            : selectedAward.awardType === "bronze"
                              ? "bg-orange-100 text-orange-800"
                              : selectedAward.awardType === "popular"
                                ? "bg-purple-100 text-purple-800"
                                : selectedAward.awardType === "innovation"
                                  ? "bg-green-100 text-green-800"
                                  : selectedAward.awardType === "technical"
                                    ? "bg-indigo-100 text-indigo-800"
                                    : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {selectedAward.awardType}
                    </Badge>
                    <Badge variant="outline">
                      {(selectedAward as any).category || "innovation"}
                    </Badge>
                    {selectedAward.rank > 0 && (
                      <Badge variant="outline" className="bg-amber-50 text-amber-700">
                        第 {selectedAward.rank} 名
                      </Badge>
                    )}
                    {selectedAward.score > 0 && (
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="font-semibold text-orange-600">{selectedAward.score.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 基本資訊 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900">基本資訊</h4>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">獎項ID</Label>
                      <p className="text-sm text-gray-900">{selectedAward.id}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">頒獎時間</Label>
                      <p className="text-sm text-gray-900">{selectedAward.year}年{selectedAward.month}月</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">競賽類型</Label>
                      <p className="text-sm text-gray-900">
                        {selectedAward.competitionType === "individual" ? "個人賽" : "團體賽"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900">競賽資訊</h4>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">競賽名稱</Label>
                      <p className="text-sm text-gray-900">
                        {competitions.find(c => c.id === selectedAward.competitionId)?.name || "未知競賽"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">評審團</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        {(() => {
                          const competition = competitions.find(c => c.id === selectedAward.competitionId)
                          const competitionJudges = judges.filter(j => competition?.judges?.includes(j.id))
                          return competitionJudges.slice(0, 3).map((judge) => (
                            <Avatar key={judge.id} className="w-6 h-6">
                              <AvatarFallback className="text-xs bg-orange-100 text-orange-600">
                                {judge.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                          ))
                        })()}
                        {(() => {
                          const competition = competitions.find(c => c.id === selectedAward.competitionId)
                          const competitionJudges = judges.filter(j => competition?.judges?.includes(j.id))
                          if (competitionJudges.length > 3) {
                            return <span className="text-xs text-gray-500">+{competitionJudges.length - 3}</span>
                          }
                          return null
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 獎項描述 */}
              {(selectedAward as any).description && (
                <div className="space-y-3">
                  <h4 className="text-lg font-semibold text-gray-900">獎項描述</h4>
                  <p className="text-gray-700 leading-relaxed">{(selectedAward as any).description}</p>
                </div>
              )}

              {/* 評審評語 */}
              {(selectedAward as any).judgeComments && (
                <div className="space-y-3">
                  <h4 className="text-lg font-semibold text-gray-900">評審評語</h4>
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-blue-900 leading-relaxed">{(selectedAward as any).judgeComments}</p>
                  </div>
                </div>
              )}

              {/* 應用連結 */}
              {(selectedAward as any).applicationLinks && (
                <div className="space-y-3">
                  <h4 className="text-lg font-semibold text-gray-900">應用連結</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {(selectedAward as any).applicationLinks.production && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className="text-sm font-medium text-green-900">正式應用</span>
                        </div>
                        <p className="text-xs text-green-700 break-all">
                          {(selectedAward as any).applicationLinks.production}
                        </p>
                      </div>
                    )}
                    {(selectedAward as any).applicationLinks.demo && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          <span className="text-sm font-medium text-blue-900">演示版本</span>
                        </div>
                        <p className="text-xs text-blue-700 break-all">
                          {(selectedAward as any).applicationLinks.demo}
                        </p>
                      </div>
                    )}
                    {(selectedAward as any).applicationLinks.github && (
                      <div className="p-3 bg-gray-50 border border-gray-300 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="w-3 h-3 bg-gray-800 rounded-full"></div>
                          <span className="text-sm font-medium text-gray-900">源碼倉庫</span>
                        </div>
                        <p className="text-xs text-gray-700 break-all">
                          {(selectedAward as any).applicationLinks.github}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 相關文檔 */}
              {(selectedAward as any).documents && (selectedAward as any).documents.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-lg font-semibold text-gray-900">相關文檔</h4>
                  <div className="space-y-2">
                    {(selectedAward as any).documents.map((doc: any) => (
                      <div key={doc.id} className="flex items-center space-x-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                        <div className="w-8 h-8 bg-red-100 rounded flex items-center justify-center">
                          <span className="text-xs font-medium text-red-600">{doc.type}</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                          <p className="text-xs text-gray-500">大小：{doc.size} • {doc.uploadDate}</p>
                        </div>
                        <Button variant="outline" size="sm">
                          <Eye className="w-3 h-3 mr-1" />
                          預覽
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 得獎照片 */}
              {(selectedAward as any).photos && (selectedAward as any).photos.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-lg font-semibold text-gray-900">得獎照片</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {(selectedAward as any).photos.map((photo: any) => (
                      <div key={photo.id} className="space-y-2">
                        <div className="aspect-video bg-gray-100 rounded-lg border flex items-center justify-center">
                          <div className="text-2xl">🖼️</div>
                        </div>
                        {photo.caption && (
                          <p className="text-xs text-gray-600 text-center">{photo.caption}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowAwardDetail(false)}>
                  關閉
                </Button>
                <Button onClick={() => {
                  setShowAwardDetail(false)
                  handleEditAward(selectedAward)
                }} className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700">
                  <Edit className="w-4 h-4 mr-2" />
                  編輯獎項
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 刪除獎項確認對話框 */}
      <Dialog open={showDeleteAwardConfirm} onOpenChange={setShowDeleteAwardConfirm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              <span>確認刪除獎項</span>
            </DialogTitle>
            <DialogDescription>
              此操作無法撤銷，請確認是否要刪除此獎項。
            </DialogDescription>
          </DialogHeader>

          {awardToDelete && (
            <div className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0 text-lg">
                    {awardToDelete.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-red-900">{awardToDelete.awardName}</h4>
                    <p className="text-sm text-red-700 mt-1">
                      作品：{awardToDelete.appName || "團隊作品"}
                    </p>
                    <p className="text-sm text-red-700">
                      創作者：{awardToDelete.creator}
                    </p>
                    <p className="text-sm text-red-700">
                      頒獎時間：{awardToDelete.year}年{awardToDelete.month}月
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-sm text-gray-600 space-y-1">
                <p>⚠️ 刪除獎項將會：</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>永久移除獎項的所有資料</li>
                  <li>移除所有相關的照片和文檔</li>
                  <li>移除獎項的評分記錄</li>
                  <li>從前台展示中移除此獎項</li>
                  <li>無法復原任何相關資訊</li>
                </ul>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowDeleteAwardConfirm(false)
                setAwardToDelete(null)
              }}
              disabled={isLoading}
            >
              取消
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDeleteAward}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  刪除中...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  確認刪除
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
