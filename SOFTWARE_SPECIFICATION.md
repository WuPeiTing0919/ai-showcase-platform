# AI展示平台軟體規格書

## 1. 專案概述

### 1.1 專案名稱
AI展示平台 (AI Showcase Platform)

### 1.2 專案目標
建立一個企業內部的AI應用展示、競賽管理和評審系統，促進AI技術的創新與應用。

### 1.3 專案範圍
- 用戶認證與權限管理
- AI應用展示與管理
- 競賽系統與評審流程
- 團隊協作與提案管理
- 數據分析與報表生成
- 管理員後台系統
- AI智能助手系統

## 2. 系統架構

### 2.1 技術棧

#### 前端技術
- **框架**: Next.js 15.2.4 (App Router)
- **語言**: TypeScript 5
- **UI庫**: 
  - Radix UI (無障礙組件)
  - shadcn/ui (設計系統)
  - Tailwind CSS (樣式框架)
- **狀態管理**: React Context API
- **表單處理**: React Hook Form + Zod
- **圖表**: Recharts
- **包管理器**: pnpm

#### 開發工具
- **代碼品質**: ESLint + TypeScript
- **樣式處理**: PostCSS + Tailwind CSS
- **圖標**: Lucide React
- **版本控制**: Git

### 2.2 目錄結構
```
ai-showcase-platform/
├── app/                    # Next.js App Router
│   ├── admin/             # 管理員頁面
│   ├── competition/       # 競賽頁面
│   ├── judge-scoring/     # 評審評分頁面
│   ├── register/          # 註冊頁面
│   └── globals.css        # 全域樣式
├── components/            # React 組件
│   ├── admin/            # 管理員專用組件
│   ├── auth/             # 認證相關組件
│   ├── competition/      # 競賽相關組件
│   ├── reviews/          # 評論系統組件
│   ├── chat-bot.tsx      # AI智能助手組件
│   └── ui/               # 通用UI組件
├── contexts/             # React Context
│   ├── auth-context.tsx  # 認證狀態管理
│   └── competition-context.tsx # 競賽狀態管理
├── hooks/                # 自定義 Hooks
├── lib/                  # 工具函數
├── types/                # TypeScript 類型定義
└── public/               # 靜態資源
```

## 3. 功能需求

### 3.1 用戶管理系統

#### 3.1.1 用戶角色
- **一般用戶 (user)**: 瀏覽應用、參與投票
- **開發者 (developer)**: 提交AI應用、參與競賽
- **管理員 (admin)**: 系統管理、數據分析

#### 3.1.2 用戶功能
- 註冊/登入/登出
- 個人資料管理
- 收藏應用
- 按讚功能 (每日限制)
- 瀏覽記錄
- 權限控制

### 3.2 競賽系統

#### 3.2.1 競賽類型
- **個人賽 (individual)**: 個人開發者競賽
- **團隊賽 (team)**: 團隊協作競賽
- **提案賽 (proposal)**: 創新提案競賽
- **混合賽 (mixed)**: 綜合性競賽

#### 3.2.2 競賽狀態
- **upcoming**: 即將開始
- **active**: 進行中
- **judging**: 評審中
- **completed**: 已完成

#### 3.2.3 評審系統
- 多維度評分 (創新性、技術性、實用性、展示效果、影響力)
- 評審管理
- 分數統計與排名
- 評審意見記錄

### 3.3 獎項系統

#### 3.3.1 獎項類型
- **金獎/銀獎/銅獎**: 排名獎項
- **最佳創新獎**: 創新性獎項
- **最佳技術獎**: 技術實現獎項
- **人氣獎**: 受歡迎程度獎項
- **自定義獎項**: 可配置的獎項

#### 3.3.2 獎項分類
- **innovation**: 創新類
- **technical**: 技術類
- **practical**: 實用類
- **popular**: 人氣類
- **teamwork**: 團隊協作類
- **solution**: 解決方案類
- **creativity**: 創意類

### 3.4 管理員系統

#### 3.4.1 用戶管理
- 用戶列表查看
- 用戶權限管理
- 用戶資料編輯
- 用戶統計分析

#### 3.4.2 競賽管理
- 競賽創建與編輯
- 競賽狀態管理
- 參賽者管理
- 評審分配

#### 3.4.3 評審管理
- 評審帳號管理
- 評審分配
- 評分進度追蹤
- 評審意見管理

#### 3.4.4 數據分析
- 競賽統計
- 用戶活躍度分析
- 應用熱度分析
- 評分趨勢分析

### 3.5 AI智能助手系統

#### 3.5.1 核心功能
- **即時對話**: 與AI助手進行自然語言對話
- **智能回答**: 基於DeepSeek API的智能回應
- **快速問題**: 提供相關問題的快速選擇
- **上下文記憶**: 保持對話的連續性

#### 3.5.2 對話能力
- **前台功能指導**: 註冊、提交作品、投票、收藏等
- **後台管理協助**: 競賽創建、評審管理、評分系統等
- **系統使用指南**: 提供具體的操作步驟
- **問題分類處理**: 根據問題類型提供相關建議

#### 3.5.3 用戶體驗
- **浮動按鈕**: 固定在右下角的聊天入口
- **模態對話框**: 全屏遮罩的聊天界面
- **即時反饋**: 輸入狀態和載入動畫
- **響應式設計**: 適配不同螢幕尺寸

#### 3.5.4 技術特性
- **API整合**: 與DeepSeek Chat API無縫整合
- **內容清理**: 自動清理Markdown格式和過長文字
- **錯誤處理**: 網路錯誤和API錯誤的優雅處理
- **性能優化**: 限制token數量以獲得更簡潔的回答

## 4. 數據模型

### 4.1 用戶模型
```typescript
interface User {
  id: string
  name: string
  email: string
  avatar?: string
  department: string
  role: "user" | "developer" | "admin"
  joinDate: string
  favoriteApps: string[]
  recentApps: string[]
  totalLikes: number
  totalViews: number
}
```

### 4.2 競賽模型
```typescript
interface Competition {
  id: string
  name: string
  year: number
  month: number
  startDate: string
  endDate: string
  status: "upcoming" | "active" | "judging" | "completed"
  description: string
  type: "individual" | "team" | "mixed" | "proposal"
  judges: string[]
  participatingApps: string[]
  participatingTeams: string[]
  participatingProposals: string[]
  rules: CompetitionRule[]
  awardTypes: CompetitionAwardType[]
  evaluationFocus: string
  maxTeamSize?: number
}
```

### 4.3 評審模型
```typescript
interface Judge {
  id: string
  name: string
  title: string
  department: string
  expertise: string[]
  avatar?: string
}

interface JudgeScore {
  judgeId: string
  appId: string
  scores: {
    innovation: number
    technical: number
    usability: number
    presentation: number
    impact: number
  }
  comments: string
  submittedAt: string
}
```

### 4.4 團隊模型
```typescript
interface TeamMember {
  id: string
  name: string
  department: string
  role: string
}

interface Team {
  id: string
  name: string
  members: TeamMember[]
  leader: string
  department: string
  contactEmail: string
  apps: string[]
  totalLikes: number
}
```

### 4.5 獎項模型
```typescript
interface Award {
  id: string
  competitionId: string
  appId?: string
  teamId?: string
  proposalId?: string
  appName?: string
  teamName?: string
  proposalTitle?: string
  creator: string
  awardType: "gold" | "silver" | "bronze" | "popular" | "innovation" | "technical" | "custom"
  awardName: string
  score: number
  year: number
  month: number
  icon: string
  customAwardTypeId?: string
  competitionType: "individual" | "team" | "proposal"
  rank: number
  category: "innovation" | "technical" | "practical" | "popular" | "teamwork" | "solution" | "creativity"
}
```

### 4.6 AI助手模型
```typescript
interface Message {
  id: string
  text: string
  sender: "user" | "bot"
  timestamp: Date
  quickQuestions?: string[]
}

interface ChatSession {
  id: string
  userId: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
}

interface AIAssistantConfig {
  apiKey: string
  apiUrl: string
  model: string
  maxTokens: number
  temperature: number
  systemPrompt: string
}
```

## 5. API 設計

### 5.1 認證 API
```
POST /api/auth/login          # 用戶登入
POST /api/auth/register       # 用戶註冊
POST /api/auth/logout         # 用戶登出
GET  /api/auth/profile        # 獲取用戶資料
PUT  /api/auth/profile        # 更新用戶資料
```

### 5.2 競賽 API
```
GET    /api/competitions              # 獲取競賽列表
POST   /api/competitions              # 創建競賽
GET    /api/competitions/:id          # 獲取競賽詳情
PUT    /api/competitions/:id          # 更新競賽
DELETE /api/competitions/:id          # 刪除競賽
GET    /api/competitions/:id/scores   # 獲取競賽評分
POST   /api/competitions/:id/scores   # 提交評分
```

### 5.3 用戶 API
```
GET    /api/users                     # 獲取用戶列表
GET    /api/users/:id                 # 獲取用戶詳情
PUT    /api/users/:id                 # 更新用戶資料
DELETE /api/users/:id                 # 刪除用戶
GET    /api/users/:id/apps            # 獲取用戶應用
GET    /api/users/:id/teams           # 獲取用戶團隊
```

### 5.4 評審 API
```
GET    /api/judges                    # 獲取評審列表
POST   /api/judges                    # 創建評審帳號
GET    /api/judges/:id                # 獲取評審詳情
PUT    /api/judges/:id                # 更新評審資料
DELETE /api/judges/:id                # 刪除評審
GET    /api/judges/:id/scores         # 獲取評審評分
POST   /api/judges/:id/scores         # 提交評審評分
```

### 5.5 團隊 API
```
GET    /api/teams                     # 獲取團隊列表
POST   /api/teams                     # 創建團隊
GET    /api/teams/:id                 # 獲取團隊詳情
PUT    /api/teams/:id                 # 更新團隊資料
DELETE /api/teams/:id                 # 刪除團隊
GET    /api/teams/:id/members         # 獲取團隊成員
POST   /api/teams/:id/members         # 添加團隊成員
```

### 5.6 獎項 API
```
GET    /api/awards                    # 獲取獎項列表
POST   /api/awards                    # 創建獎項
GET    /api/awards/:id                # 獲取獎項詳情
PUT    /api/awards/:id                # 更新獎項
DELETE /api/awards/:id                # 刪除獎項
GET    /api/awards/by-year/:year      # 按年份獲取獎項
GET    /api/awards/by-type/:type      # 按類型獲取獎項
```

### 5.7 AI助手 API
```
POST   /api/chat/send                # 發送聊天訊息
GET    /api/chat/history             # 獲取聊天歷史
DELETE /api/chat/history             # 清除聊天歷史
POST   /api/chat/feedback            # 提交聊天反饋
GET    /api/chat/quick-questions     # 獲取快速問題建議
```

## 6. 數據庫設計

### 6.1 用戶表 (users)
```sql
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar VARCHAR(500),
    department VARCHAR(100) NOT NULL,
    role ENUM('user', 'developer', 'admin') DEFAULT 'user',
    join_date DATE NOT NULL,
    total_likes INT DEFAULT 0,
    total_views INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 6.2 競賽表 (competitions)
```sql
CREATE TABLE competitions (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    year INT NOT NULL,
    month INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status ENUM('upcoming', 'active', 'judging', 'completed') DEFAULT 'upcoming',
    description TEXT,
    type ENUM('individual', 'team', 'mixed', 'proposal') NOT NULL,
    evaluation_focus TEXT,
    max_team_size INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 6.3 評審表 (judges)
```sql
CREATE TABLE judges (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    title VARCHAR(100) NOT NULL,
    department VARCHAR(100) NOT NULL,
    expertise JSON,
    avatar VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 6.4 評分表 (judge_scores)
```sql
CREATE TABLE judge_scores (
    id VARCHAR(36) PRIMARY KEY,
    judge_id VARCHAR(36) NOT NULL,
    app_id VARCHAR(36),
    proposal_id VARCHAR(36),
    scores JSON NOT NULL,
    comments TEXT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (judge_id) REFERENCES judges(id),
    FOREIGN KEY (app_id) REFERENCES apps(id),
    FOREIGN KEY (proposal_id) REFERENCES proposals(id)
);
```

### 6.5 團隊表 (teams)
```sql
CREATE TABLE teams (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    leader_id VARCHAR(36) NOT NULL,
    department VARCHAR(100) NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    total_likes INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (leader_id) REFERENCES users(id)
);
```

### 6.6 團隊成員表 (team_members)
```sql
CREATE TABLE team_members (
    id VARCHAR(36) PRIMARY KEY,
    team_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    role VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES teams(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### 6.7 應用表 (apps)
```sql
CREATE TABLE apps (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    creator_id VARCHAR(36) NOT NULL,
    team_id VARCHAR(36),
    likes_count INT DEFAULT 0,
    views_count INT DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (creator_id) REFERENCES users(id),
    FOREIGN KEY (team_id) REFERENCES teams(id)
);
```

### 6.8 獎項表 (awards)
```sql
CREATE TABLE awards (
    id VARCHAR(36) PRIMARY KEY,
    competition_id VARCHAR(36) NOT NULL,
    app_id VARCHAR(36),
    team_id VARCHAR(36),
    proposal_id VARCHAR(36),
    award_type ENUM('gold', 'silver', 'bronze', 'popular', 'innovation', 'technical', 'custom') NOT NULL,
    award_name VARCHAR(200) NOT NULL,
    score DECIMAL(5,2) NOT NULL,
    year INT NOT NULL,
    month INT NOT NULL,
    icon VARCHAR(50),
    custom_award_type_id VARCHAR(36),
    competition_type ENUM('individual', 'team', 'proposal') NOT NULL,
    rank INT DEFAULT 0,
    category ENUM('innovation', 'technical', 'practical', 'popular', 'teamwork', 'solution', 'creativity') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (competition_id) REFERENCES competitions(id),
    FOREIGN KEY (app_id) REFERENCES apps(id),
    FOREIGN KEY (team_id) REFERENCES teams(id)
);
```

### 6.9 聊天會話表 (chat_sessions)
```sql
CREATE TABLE chat_sessions (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### 6.10 聊天訊息表 (chat_messages)
```sql
CREATE TABLE chat_messages (
    id VARCHAR(36) PRIMARY KEY,
    session_id VARCHAR(36) NOT NULL,
    text TEXT NOT NULL,
    sender ENUM('user', 'bot') NOT NULL,
    quick_questions JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES chat_sessions(id)
);
```

### 6.11 AI助手配置表 (ai_assistant_configs)
```sql
CREATE TABLE ai_assistant_configs (
    id VARCHAR(36) PRIMARY KEY,
    api_key VARCHAR(255) NOT NULL,
    api_url VARCHAR(500) NOT NULL,
    model VARCHAR(100) NOT NULL,
    max_tokens INT DEFAULT 200,
    temperature DECIMAL(3,2) DEFAULT 0.7,
    system_prompt TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## 7. 非功能性需求

### 7.1 性能需求
- 頁面載入時間 < 3秒
- 支持同時1000+用戶在線
- 數據庫查詢響應時間 < 500ms
- 圖片優化和CDN加速
- AI助手回應時間 < 5秒
- 聊天訊息實時更新

### 7.2 安全需求
- 用戶密碼加密存儲
- JWT Token認證
- CSRF防護
- XSS防護
- SQL注入防護
- 權限驗證
- AI API密鑰安全存儲
- 聊天數據隱私保護

### 7.3 可用性需求
- 系統可用性 > 99.5%
- 響應式設計，支持多設備
- 無障礙設計 (WCAG 2.1)
- 多語言支持準備

### 7.4 可維護性需求
- 模組化架構
- 完整的API文檔
- 代碼註釋和文檔
- 單元測試覆蓋率 > 80%
- 錯誤日誌和監控

## 8. 部署架構

### 8.1 開發環境
- **前端**: Next.js 開發服務器
- **後端**: Node.js/Express 或 Python/FastAPI
- **數據庫**: PostgreSQL 或 MySQL
- **緩存**: Redis
- **文件存儲**: 本地存儲或雲存儲

### 8.2 生產環境
- **前端**: Vercel 或 AWS S3 + CloudFront
- **後端**: AWS EC2 或 Docker 容器
- **數據庫**: AWS RDS 或自建數據庫
- **緩存**: AWS ElastiCache (Redis)
- **文件存儲**: AWS S3
- **CDN**: CloudFront 或 Cloudflare

## 9. 開發計劃

### 9.1 第一階段 (4週)
- [x] 前端架構搭建
- [x] 基礎組件開發
- [x] 認證系統實現
- [x] 競賽管理基礎功能

### 9.2 第二階段 (4週)
- [ ] 後端API開發
- [ ] 數據庫設計與實現
- [ ] 評審系統完善
- [ ] 獎項系統實現

### 9.3 第三階段 (3週)
- [ ] 數據分析功能
- [ ] 管理員後台完善
- [ ] 性能優化
- [ ] 安全加固

### 9.4 第四階段 (2週)
- [ ] 測試與調試
- [ ] 文檔完善
- [ ] 部署上線
- [ ] 用戶培訓

## 10. 風險評估

### 10.1 技術風險
- **數據庫性能**: 大量數據查詢可能影響性能
- **並發處理**: 高並發場景下的數據一致性
- **安全性**: 用戶數據保護和系統安全

### 10.2 項目風險
- **時間風險**: 開發進度可能延遲
- **需求變更**: 功能需求可能調整
- **資源風險**: 開發資源不足

### 10.3 緩解措施
- 採用成熟的技術棧
- 實施敏捷開發方法
- 建立完善的測試體系
- 制定詳細的項目計劃
- 定期進行代碼審查

---

**文檔版本**: v1.0  
**最後更新**: 2025年07月  
**負責人**: 敏捷小組 - 佩庭 
**審核人**: 強茂集團