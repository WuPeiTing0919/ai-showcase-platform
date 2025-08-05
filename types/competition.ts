export interface Judge {
  id: string
  name: string
  title: string
  department: string
  expertise: string[]
  avatar?: string
}

export interface JudgeScore {
  judgeId: string
  appId: string
  scores: {
    innovation: number // 創新性 (1-10)
    technical: number // 技術性 (1-10)
    usability: number // 實用性 (1-10)
    presentation: number // 展示效果 (1-10)
    impact: number // 影響力 (1-10)
  }
  comments: string
  submittedAt: string
}

// 新增團隊成員接口
export interface TeamMember {
  id: string
  name: string
  department: string
  role: string // 角色：隊長、成員等
}

// 新增團隊接口
export interface Team {
  id: string
  name: string
  members: TeamMember[]
  leader: string // 隊長ID
  department: string // 主要部門
  contactEmail: string
  apps: string[] // 團隊提交的應用ID列表
  totalLikes: number // 所有應用的總按讚數
}

export interface CompetitionRule {
  id: string
  name: string
  description: string
  weight: number // 權重百分比 (0-100)
}

export interface CompetitionAwardType {
  id: string
  name: string
  description: string
  icon: string
  color: string
}

// 擴展競賽接口以支持不同類型，包括混合類型
export interface Competition {
  id: string
  name: string
  year: number
  month: number
  startDate: string
  endDate: string
  status: "upcoming" | "active" | "judging" | "completed"
  description: string
  type: "individual" | "team" | "mixed" // 新增混合類型
  judges: string[] // judge IDs
  participatingApps: string[] // app IDs (個人賽使用)
  participatingTeams: string[] // team IDs (團隊賽使用)
  rules: CompetitionRule[] // 評比規則
  awardTypes: CompetitionAwardType[] // 可頒發的獎項類型
  evaluationFocus: string // 評比重點描述
  maxTeamSize?: number // 最大團隊人數限制
}

export interface Award {
  id: string
  competitionId: string
  appId?: string // 個人賽和團隊賽使用
  teamId?: string // 團隊賽和提案賽使用
  appName?: string
  creator: string
  awardType: "gold" | "silver" | "bronze" | "popular" | "innovation" | "technical" | "custom"
  awardName: string
  score: number
  year: number
  month: number
  icon: string
  customAwardTypeId?: string // 如果是自定義獎項類型
  competitionType: "individual" | "team" // 競賽類型
  rank: number // 0 for non-ranking awards, 1-3 for top 3
  category: "innovation" | "technical" | "practical" | "popular" | "teamwork" | "solution" | "creativity"
}
