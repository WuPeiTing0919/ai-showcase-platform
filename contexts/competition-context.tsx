"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { Judge, JudgeScore, Competition, Award, Team, Proposal, ProposalJudgeScore } from "@/types/competition"

interface CompetitionContextType {
  // Judges
  judges: Judge[]
  addJudge: (judge: Omit<Judge, "id">) => void
  updateJudge: (id: string, updates: Partial<Judge>) => void
  deleteJudge: (id: string) => void

  // Competitions
  competitions: Competition[]
  currentCompetition: Competition | null
  setCurrentCompetition: (competition: Competition | null) => void
  addCompetition: (competition: Omit<Competition, "id">) => void
  updateCompetition: (id: string, updates: Partial<Competition>) => void
  deleteCompetition: (id: string) => void

  // Teams
  teams: Team[]
  addTeam: (team: Omit<Team, "id">) => void
  updateTeam: (id: string, updates: Partial<Team>) => void
  getTeamById: (id: string) => Team | undefined

  // Proposals
  proposals: Proposal[]
  addProposal: (proposal: Omit<Proposal, "id">) => void
  updateProposal: (id: string, updates: Partial<Proposal>) => void
  getProposalById: (id: string) => Proposal | undefined

  // Judge Scores
  judgeScores: JudgeScore[]
  proposalJudgeScores: ProposalJudgeScore[]
  addJudgeScore: (score: Omit<JudgeScore, "submittedAt">) => void
  addProposalJudgeScore: (score: Omit<ProposalJudgeScore, "submittedAt">) => void
  submitJudgeScore: (score: Omit<JudgeScore, "submittedAt">) => void
  submitProposalJudgeScore: (score: Omit<ProposalJudgeScore, "submittedAt">) => void
  getAppJudgeScores: (appId: string) => JudgeScore[]
  getProposalJudgeScores: (proposalId: string) => ProposalJudgeScore[]
  getAppAverageScore: (appId: string) => number
  getProposalAverageScore: (proposalId: string) => number
  getAppDetailedScores: (appId: string) => {
    innovation: number
    technical: number
    usability: number
    presentation: number
    impact: number
    total: number
    judgeCount: number
  }
  getProposalDetailedScores: (proposalId: string) => {
    problemIdentification: number
    solutionFeasibility: number
    innovation: number
    impact: number
    presentation: number
    total: number
    judgeCount: number
  }

  // Awards
  awards: Award[]
  addAward: (award: Omit<Award, "id">) => void
  getAwardsByYear: (year: number) => Award[]
  getAwardsByMonth: (year: number, month: number) => Award[]

  // Rankings
  getCompetitionRankings: (competitionId?: string) => Array<{
    appId?: string
    proposalId?: string
    teamId?: string
    appName?: string
    proposalTitle?: string
    teamName?: string
    creator: string
    totalScore: number
    rank: number
    scores: any
    competitionType: "individual" | "team" | "proposal"
  }>

  // Add new filtering functions
  getAwardsByCompetitionType: (competitionType?: string) => Award[]
  getAwardsByCategory: (category?: string) => Award[]
  getTopRankingAwards: () => Award[]
  getPopularityAwards: () => Award[]

  getPopularityRankings: (competitionId?: string) => Array<{
    id: string
    name: string
    creator: string
    department: string
    type: string
    likes: number
    rank: number
  }>
}

const CompetitionContext = createContext<CompetitionContextType | undefined>(undefined)

// Mock data
const mockJudges: Judge[] = []

// Mock teams data
const mockTeams: Team[] = []

// Mock proposals data
const mockProposals: Proposal[] = []

// 競賽資料
const mockCompetitions: Competition[] = []

// Mock app likes counter
const appLikesCounter: Record<string, number> = {}

export function CompetitionProvider({ children }: { children: ReactNode }) {
  const [judges, setJudges] = useState<Judge[]>(mockJudges)
  const [competitions, setCompetitions] = useState<Competition[]>(mockCompetitions)
  const [currentCompetition, setCurrentCompetition] = useState<Competition | null>(null)
  const [teams, setTeams] = useState<Team[]>(mockTeams)
  const [proposals, setProposals] = useState<Proposal[]>(mockProposals)

  // Load judge scores from localStorage
  const [judgeScores, setJudgeScores] = useState<JudgeScore[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("judgeScores")
      if (saved) {
        return JSON.parse(saved)
      }
    }

    // 評分資料
    const mockScores: JudgeScore[] = []

    return mockScores
  })

  // Load proposal judge scores from localStorage
  const [proposalJudgeScores, setProposalJudgeScores] = useState<ProposalJudgeScore[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("proposalJudgeScores")
      if (saved) {
        return JSON.parse(saved)
      }
    }

    // 提案評分資料
    const mockProposalScores: ProposalJudgeScore[] = []

    return mockProposalScores
  })

  // Load awards from localStorage
  const [awards, setAwards] = useState<Award[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("competitionAwards")
      if (saved) {
        return JSON.parse(saved)
      }
    }

    // 獎項資料
    const mockAwards = []

    return mockAwards
  })

  // Save to localStorage when data changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("judgeScores", JSON.stringify(judgeScores))
    }
  }, [judgeScores])

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("proposalJudgeScores", JSON.stringify(proposalJudgeScores))
    }
  }, [proposalJudgeScores])

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("competitionAwards", JSON.stringify(awards))
    }
  }, [awards])

  const addJudge = (judge: Omit<Judge, "id">) => {
    const newJudge: Judge = {
      ...judge,
      id: `j${Date.now()}`,
    }
    setJudges((prev) => [...prev, newJudge])
  }

  const updateJudge = (id: string, updates: Partial<Judge>) => {
    setJudges((prev) => prev.map((judge) => (judge.id === id ? { ...judge, ...updates } : judge)))
  }

  const deleteJudge = (id: string) => {
    setJudges((prev) => prev.filter((judge) => judge.id !== id))
    setCompetitions((prev) =>
      prev.map((comp) => ({
        ...comp,
        judges: comp.judges.filter((judgeId) => judgeId !== id),
      })),
    )
    setJudgeScores((prev) => prev.filter((score) => score.judgeId !== id))
    setProposalJudgeScores((prev) => prev.filter((score) => score.judgeId !== id))
  }

  const addCompetition = (competition: Omit<Competition, "id">) => {
    const newCompetition: Competition = {
      ...competition,
      id: `c${Date.now()}`,
    }
    setCompetitions((prev) => [...prev, newCompetition])
  }

  const updateCompetition = (id: string, updates: Partial<Competition>) => {
    setCompetitions((prev) => prev.map((comp) => (comp.id === id ? { ...comp, ...updates } : comp)))
    if (currentCompetition?.id === id) {
      setCurrentCompetition((prev) => (prev ? { ...prev, ...updates } : null))
    }
  }

  const deleteCompetition = (id: string) => {
    setCompetitions((prev) => prev.filter((comp) => comp.id !== id))
    if (currentCompetition?.id === id) {
      setCurrentCompetition(null)
    }
  }

  const addTeam = (team: Omit<Team, "id">) => {
    const newTeam: Team = {
      ...team,
      id: `t${Date.now()}`,
    }
    setTeams((prev) => [...prev, newTeam])
  }

  const updateTeam = (id: string, updates: Partial<Team>) => {
    setTeams((prev) => prev.map((team) => (team.id === id ? { ...team, ...updates } : team)))
  }

  const getTeamById = (id: string): Team | undefined => {
    return teams.find((team) => team.id === id)
  }

  const addProposal = (proposal: Omit<Proposal, "id">) => {
    const newProposal: Proposal = {
      ...proposal,
      id: `p${Date.now()}`,
    }
    setProposals((prev) => [...prev, newProposal])
  }

  const updateProposal = (id: string, updates: Partial<Proposal>) => {
    setProposals((prev) => prev.map((proposal) => (proposal.id === id ? { ...proposal, ...updates } : proposal)))
  }

  const getProposalById = (id: string): Proposal | undefined => {
    return proposals.find((proposal) => proposal.id === id)
  }

  const addJudgeScore = (score: Omit<JudgeScore, "submittedAt">) => {
    const newScore: JudgeScore = {
      ...score,
      submittedAt: new Date().toISOString(),
    }
    const filteredScores = judgeScores.filter((s) => !(s.judgeId === score.judgeId && s.appId === score.appId))
    setJudgeScores([...filteredScores, newScore])
  }

  const addProposalJudgeScore = (score: Omit<ProposalJudgeScore, "submittedAt">) => {
    const newScore: ProposalJudgeScore = {
      ...score,
      submittedAt: new Date().toISOString(),
    }
    const filteredScores = proposalJudgeScores.filter(
      (s) => !(s.judgeId === score.judgeId && s.proposalId === score.proposalId),
    )
    setProposalJudgeScores([...filteredScores, newScore])
  }

  const submitJudgeScore = (score: Omit<JudgeScore, "submittedAt">) => {
    addJudgeScore(score)
  }

  const submitProposalJudgeScore = (score: Omit<ProposalJudgeScore, "submittedAt">) => {
    addProposalJudgeScore(score)
  }

  const getAppJudgeScores = (appId: string): JudgeScore[] => {
    return judgeScores.filter((score) => score.appId === appId)
  }

  const getProposalJudgeScores = (proposalId: string): ProposalJudgeScore[] => {
    return proposalJudgeScores.filter((score) => score.proposalId === proposalId)
  }

  const getAppAverageScore = (appId: string): number => {
    const scores = getAppJudgeScores(appId)
    if (scores.length === 0) return 0

    const totalScore = scores.reduce((sum, score) => {
      const scoreSum = Object.values(score.scores).reduce((a, b) => a + b, 0)
      return sum + scoreSum
    }, 0)

    return Number((totalScore / (scores.length * 5)).toFixed(1))
  }

  const getProposalAverageScore = (proposalId: string): number => {
    const scores = getProposalJudgeScores(proposalId)
    if (scores.length === 0) return 0

    const totalScore = scores.reduce((sum, score) => {
      const scoreSum = Object.values(score.scores).reduce((a, b) => a + b, 0)
      return sum + scoreSum
    }, 0)

    return Number((totalScore / (scores.length * 5)).toFixed(1))
  }

  const getAppDetailedScores = (appId: string) => {
    const scores = getAppJudgeScores(appId)
    if (scores.length === 0) {
      return {
        innovation: 0,
        technical: 0,
        usability: 0,
        presentation: 0,
        impact: 0,
        total: 0,
        judgeCount: 0,
      }
    }

    const totals = scores.reduce(
      (acc, score) => ({
        innovation: acc.innovation + score.scores.innovation,
        technical: acc.technical + score.scores.technical,
        usability: acc.usability + score.scores.usability,
        presentation: acc.presentation + score.scores.presentation,
        impact: acc.impact + score.scores.impact,
      }),
      { innovation: 0, technical: 0, usability: 0, presentation: 0, impact: 0 },
    )

    const judgeCount = scores.length
    const averages = {
      innovation: Number((totals.innovation / judgeCount).toFixed(1)),
      technical: Number((totals.technical / judgeCount).toFixed(1)),
      usability: Number((totals.usability / judgeCount).toFixed(1)),
      presentation: Number((totals.presentation / judgeCount).toFixed(1)),
      impact: Number((totals.impact / judgeCount).toFixed(1)),
    }

    const total = Number(
      (
        (totals.innovation + totals.technical + totals.usability + totals.presentation + totals.impact) /
        (judgeCount * 5)
      ).toFixed(1),
    )

    return {
      ...averages,
      total,
      judgeCount,
    }
  }

  const getProposalDetailedScores = (proposalId: string) => {
    const scores = getProposalJudgeScores(proposalId)
    if (scores.length === 0) {
      return {
        problemIdentification: 0,
        solutionFeasibility: 0,
        innovation: 0,
        impact: 0,
        presentation: 0,
        total: 0,
        judgeCount: 0,
      }
    }

    const totals = scores.reduce(
      (acc, score) => ({
        problemIdentification: acc.problemIdentification + score.scores.problemIdentification,
        solutionFeasibility: acc.solutionFeasibility + score.scores.solutionFeasibility,
        innovation: acc.innovation + score.scores.innovation,
        impact: acc.impact + score.scores.impact,
        presentation: acc.presentation + score.scores.presentation,
      }),
      { problemIdentification: 0, solutionFeasibility: 0, innovation: 0, impact: 0, presentation: 0 },
    )

    const judgeCount = scores.length
    const averages = {
      problemIdentification: Number((totals.problemIdentification / judgeCount).toFixed(1)),
      solutionFeasibility: Number((totals.solutionFeasibility / judgeCount).toFixed(1)),
      innovation: Number((totals.innovation / judgeCount).toFixed(1)),
      impact: Number((totals.impact / judgeCount).toFixed(1)),
      presentation: Number((totals.presentation / judgeCount).toFixed(1)),
    }

    const total = Number(
      (
        (totals.problemIdentification +
          totals.solutionFeasibility +
          totals.innovation +
          totals.impact +
          totals.presentation) /
        (judgeCount * 5)
      ).toFixed(1),
    )

    return {
      ...averages,
      total,
      judgeCount,
    }
  }

  const addAward = (award: Omit<Award, "id">) => {
    const newAward: Award = {
      ...award,
      id: `a${Date.now()}`,
    }
    setAwards((prev) => [...prev, newAward])
  }

  const getAwardsByYear = (year: number): Award[] => {
    return awards.filter((award) => award.year === year)
  }

  const getAwardsByMonth = (year: number, month: number): Award[] => {
    return awards.filter((award) => award.year === year && award.month === month)
  }

  const getCompetitionRankings = (competitionId?: string) => {
    const targetCompetition = competitionId ? competitions.find((c) => c.id === competitionId) : currentCompetition

    if (!targetCompetition) return []

    const rankings: any[] = []

    // Handle individual competitions
    if (targetCompetition.type === "individual" || targetCompetition.type === "mixed") {
      targetCompetition.participatingApps.forEach((appId) => {
        const detailedScores = getAppDetailedScores(appId)
        const appNames: Record<string, string> = {
          "1": "智能對話助手",
          "2": "圖像生成工具",
          "3": "語音識別系統",
          "4": "智能推薦引擎",
          "5": "文本分析器",
          "6": "AI創意寫作",
        }
        const creators: Record<string, string> = {
          "1": "張小明",
          "2": "李美華",
          "3": "王大偉",
          "4": "陳小芳",
          "5": "劉志強",
          "6": "黃小玲",
        }

        rankings.push({
          appId,
          appName: appNames[appId] || `應用 ${appId}`,
          creator: creators[appId] || "未知",
          totalScore: detailedScores.total,
          scores: {
            innovation: detailedScores.innovation,
            technical: detailedScores.technical,
            usability: detailedScores.usability,
            presentation: detailedScores.presentation,
            impact: detailedScores.impact,
          },
          rank: 0,
          competitionType: "individual" as const,
        })
      })
    }

    // Handle team competitions
    if (targetCompetition.type === "team" || targetCompetition.type === "mixed") {
      targetCompetition.participatingTeams.forEach((teamId) => {
        const team = getTeamById(teamId)
        if (team) {
          // Calculate team score based on their apps
          let totalScore = 0
          let appCount = 0
          team.apps.forEach((appId) => {
            const appScore = getAppDetailedScores(appId)
            totalScore += appScore.total
            appCount++
          })
          const averageScore = appCount > 0 ? totalScore / appCount : 0

          rankings.push({
            teamId,
            teamName: team.name,
            creator: `${team.members.find((m) => m.id === team.leader)?.name}團隊`,
            totalScore: averageScore,
            scores: {
              teamwork: averageScore * 0.25,
              technical: averageScore * 0.25,
              innovation: averageScore * 0.25,
              practical: averageScore * 0.25,
            },
            rank: 0,
            competitionType: "team" as const,
            appCount: team.apps.length,
            totalLikes: team.totalLikes,
            members: team.members,
          })
        }
      })
    }

    // Handle proposal competitions
    if (targetCompetition.type === "proposal" || targetCompetition.type === "mixed") {
      targetCompetition.participatingProposals.forEach((proposalId) => {
        const proposal = getProposalById(proposalId)
        const detailedScores = getProposalDetailedScores(proposalId)
        if (proposal) {
          const team = getTeamById(proposal.teamId)
          rankings.push({
            proposalId,
            proposalTitle: proposal.title,
            creator: team?.name || "未知團隊",
            totalScore: detailedScores.total,
            scores: {
              problemIdentification: detailedScores.problemIdentification,
              solutionFeasibility: detailedScores.solutionFeasibility,
              innovation: detailedScores.innovation,
              impact: detailedScores.impact,
              presentation: detailedScores.presentation,
            },
            rank: 0,
            competitionType: "proposal" as const,
            proposal,
            team,
          })
        }
      })
    }

    // Sort by total score and assign ranks within each competition type
    const individualRankings = rankings
      .filter((r) => r.competitionType === "individual")
      .sort((a, b) => b.totalScore - a.totalScore)
      .map((item, index) => ({ ...item, rank: index + 1 }))

    const teamRankings = rankings
      .filter((r) => r.competitionType === "team")
      .sort((a, b) => b.totalScore - a.totalScore)
      .map((item, index) => ({ ...item, rank: index + 1 }))

    const proposalRankings = rankings
      .filter((r) => r.competitionType === "proposal")
      .sort((a, b) => b.totalScore - a.totalScore)
      .map((item, index) => ({ ...item, rank: index + 1 }))

    // Combine all rankings
    return [...individualRankings, ...teamRankings, ...proposalRankings]
  }

  // Add new filtering functions
  const getAwardsByCompetitionType = (competitionType?: string) => {
    if (!competitionType || competitionType === "all") return awards
    return awards.filter((award) => award.competitionType === competitionType)
  }

  const getAwardsByCategory = (category?: string) => {
    if (!category || category === "all") return awards
    return awards.filter((award) => award.category === category)
  }

  const getTopRankingAwards = () => {
    return awards.filter((award) => award.rank > 0 && award.rank <= 3)
  }

  const getPopularityAwards = () => {
    return awards.filter((award) => award.awardType === "popular")
  }

  const getPopularityRankings = (competitionId?: string) => {
    const targetCompetition = competitionId ? competitions.find((c) => c.id === competitionId) : currentCompetition

    if (!targetCompetition) return []

    const rankings: any[] = []

    // Get participants based on competition type
    const participants =
      targetCompetition.type === "individual"
        ? targetCompetition.participatingApps
        : targetCompetition.type === "team"
          ? targetCompetition.participatingTeams
          : targetCompetition.participatingProposals

    // For each participant, calculate popularity based on likes
    participants.forEach((participantId) => {
      const appNames: Record<string, string> = {
        "1": "智能對話助手",
        "2": "圖像生成工具",
        "3": "語音識別系統",
        "4": "智能推薦引擎",
        "5": "文本分析器",
        "6": "AI創意寫作",
      }

      const creators: Record<string, string> = {
        "1": "張小明",
        "2": "李美華",
        "3": "王大偉",
        "4": "陳小芳",
        "5": "劉志強",
        "6": "黃小玲",
      }

      const departments: Record<string, string> = {
        "1": "HQBU",
        "2": "ITBU",
        "3": "MBU1",
        "4": "SBU",
        "5": "HQBU",
        "6": "ITBU",
      }

      const types: Record<string, string> = {
        "1": "文字處理",
        "2": "圖像生成",
        "3": "語音辨識",
        "4": "推薦系統",
        "5": "文字處理",
        "6": "文字處理",
      }

      // Get likes from appLikesCounter
      const likes = appLikesCounter[participantId] || 0

      rankings.push({
        id: participantId,
        name: appNames[participantId] || `應用 ${participantId}`,
        creator: creators[participantId] || "未知",
        department: departments[participantId] || "未知",
        type: types[participantId] || "未知",
        likes: likes,
        rank: 0, // Will be calculated after sorting
      })
    })

    // Sort by likes and assign ranks
    return rankings.sort((a, b) => b.likes - a.likes).map((item, index) => ({ ...item, rank: index + 1 }))
  }

  // Add these functions to the context value
  return (
    <CompetitionContext.Provider
      value={{
        judges,
        addJudge,
        updateJudge,
        deleteJudge,
        competitions,
        currentCompetition,
        setCurrentCompetition,
        addCompetition,
        updateCompetition,
        deleteCompetition,
        teams,
        addTeam,
        updateTeam,
        getTeamById,
        proposals,
        addProposal,
        updateProposal,
        getProposalById,
        judgeScores,
        proposalJudgeScores,
        addJudgeScore,
        addProposalJudgeScore,
        submitJudgeScore,
        submitProposalJudgeScore,
        getAppJudgeScores,
        getProposalJudgeScores,
        getAppAverageScore,
        getProposalAverageScore,
        getAppDetailedScores,
        getProposalDetailedScores,
        awards,
        addAward,
        getAwardsByYear,
        getAwardsByMonth,
        getCompetitionRankings,
        getAwardsByCompetitionType,
        getAwardsByCategory,
        getTopRankingAwards,
        getPopularityAwards,
        getPopularityRankings,
      }}
    >
      {children}
    </CompetitionContext.Provider>
  )
}

export function useCompetition() {
  const context = useContext(CompetitionContext)
  if (context === undefined) {
    throw new Error("useCompetition must be used within a CompetitionProvider")
  }
  return context
}
