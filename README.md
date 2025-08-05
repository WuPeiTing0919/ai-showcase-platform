# 🚀 AI展示平台 (AI Showcase Platform)

> 強茂集團企業內部AI應用展示、競賽管理和評審系統

[![Next.js](https://img.shields.io/badge/Next.js-15.2.4-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.17-38B2AC)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## 📖 專案概述

AI展示平台是一個企業內部的AI應用展示、競賽管理和評審系統，旨在促進AI技術的創新與應用。平台提供完整的競賽管理流程，從競賽創建、作品提交、評審評分到頒獎的完整閉環，並整合智能AI助手為用戶提供即時指導。

### 🎯 專案目標
- 建立企業內部AI技術創新平台
- 促進跨部門AI技術交流與合作
- 提供完整的競賽管理和評審系統
- 整合AI助手提升用戶體驗

## ✨ 核心功能

### 🏆 競賽管理系統
- **多種競賽類型**: 個人賽、團隊賽、提案賽、混合賽
- **完整競賽流程**: 創建 → 報名 → 提交 → 評審 → 頒獎
- **動態評分系統**: 根據競賽規則動態生成評分項目
- **權重計算**: 支援不同評分項目的權重設定

### 👥 用戶管理系統
- **角色權限**: 一般用戶(user) / 開發者(developer) / 管理員(admin)
- **個人中心**: 收藏管理、瀏覽記錄、參賽記錄
- **互動功能**: 按讚(每日限制)、收藏、評論

### 🏅 獎項系統
- **獎項類型**: 金獎/銀獎/銅獎、最佳創新獎、最佳技術獎、人氣獎
- **獎項分類**: 創新類、技術類、實用類、人氣類、團隊協作類
- **排行榜**: 人氣排行榜、得獎作品展示

### 🤖 AI智能助手
- **即時對話**: 與AI助手進行自然語言對話
- **智能回答**: 基於DeepSeek API的智能回應
- **快速問題**: 提供相關問題的快速選擇
- **上下文記憶**: 保持對話的連續性

### 📊 管理員後台
- **用戶管理**: 用戶列表、權限管理、資料編輯
- **競賽管理**: 競賽創建、狀態管理、參賽者管理
- **評審管理**: 評審帳號、評分進度追蹤
- **數據分析**: 競賽統計、用戶活躍度、應用熱度分析

## 🛠 技術架構

### 前端技術棧
- **框架**: Next.js 15.2.4 (App Router)
- **語言**: TypeScript 5
- **UI庫**: 
  - Radix UI (無障礙組件)
  - shadcn/ui (設計系統)
  - Tailwind CSS (樣式框架)
- **狀態管理**: React Context API
- **表單處理**: React Hook Form + Zod
- **圖表**: Recharts
- **AI整合**: DeepSeek API

### 開發工具
- **包管理器**: pnpm
- **代碼品質**: ESLint + TypeScript
- **樣式處理**: PostCSS + Tailwind CSS
- **圖標**: Lucide React

## 📁 專案結構

```
ai-showcase-platform/
├── app/                    # Next.js App Router
│   ├── admin/             # 管理員頁面
│   │   ├── page.tsx       # 管理員主頁
│   │   └── scoring/       # 評分管理
│   ├── competition/       # 競賽頁面
│   ├── judge-scoring/     # 評審評分頁面
│   ├── register/          # 註冊頁面
│   ├── layout.tsx         # 根布局
│   └── page.tsx           # 首頁
├── components/            # React 組件
│   ├── admin/            # 管理員專用組件
│   ├── auth/             # 認證相關組件
│   ├── competition/      # 競賽相關組件
│   ├── ui/               # 通用UI組件
│   └── chat-bot.tsx      # AI智能助手
├── contexts/             # React Context
│   ├── auth-context.tsx  # 認證狀態管理
│   └── competition-context.tsx # 競賽狀態管理
├── hooks/                # 自定義 Hooks
├── lib/                  # 工具函數
├── types/                # TypeScript 類型定義
└── public/               # 靜態資源
```

## 🚀 快速開始

### 環境要求
- Node.js 18+ 
- pnpm 8+

### 安裝步驟

1. **克隆專案**
```bash
git clone <repository-url>
cd ai-showcase-platform
```

2. **安裝依賴**
```bash
pnpm install
```

3. **環境配置**
```bash
# 複製環境變數範例
cp .env.example .env.local

# 編輯環境變數
# 設定 DeepSeek API 金鑰
NEXT_PUBLIC_DEEPSEEK_API_KEY=your_deepseek_api_key_here
NEXT_PUBLIC_DEEPSEEK_API_URL=https://api.deepseek.com/v1/chat/completions
```

4. **啟動開發服務器**
```bash
pnpm dev
```

5. **開啟瀏覽器**
```
http://localhost:3000
```

## 🔧 環境配置

### DeepSeek API 設定

1. **取得 API 金鑰**
   - 前往 [DeepSeek 官網](https://platform.deepseek.com/)
   - 註冊或登入帳號
   - 在控制台中生成 API 金鑰

2. **設定環境變數**
```bash
# .env.local
NEXT_PUBLIC_DEEPSEEK_API_KEY=your_deepseek_api_key_here
NEXT_PUBLIC_DEEPSEEK_API_URL=https://api.deepseek.com/v1/chat/completions
```

## 📖 使用指南

### 一般用戶
1. **註冊/登入**: 使用企業郵箱註冊帳號
2. **瀏覽應用**: 查看AI應用展示和競賽資訊
3. **參與互動**: 收藏喜歡的應用、參與投票
4. **查看排行榜**: 瀏覽人氣排行榜和得獎作品

### 開發者
1. **提交作品**: 在競賽期間提交AI應用
2. **管理作品**: 編輯、更新作品資訊
3. **查看評分**: 查看評審評分和意見
4. **參與競賽**: 加入團隊或個人參賽

### 管理員
1. **競賽管理**: 創建、編輯、刪除競賽
2. **評審管理**: 管理評審團成員和權限
3. **評分管理**: 手動輸入評分或查看評審評分
4. **數據分析**: 查看競賽統計和用戶分析

### AI助手使用
1. **開啟對話**: 點擊右下角聊天按鈕
2. **提問**: 輸入問題或選擇快速問題
3. **獲取幫助**: AI助手提供系統使用指導
4. **持續對話**: 保持上下文進行深入交流

## 🏗 開發指南

### 新增組件
```bash
# 在 components 目錄下創建新組件
touch components/MyComponent.tsx
```

### 新增頁面
```bash
# 在 app 目錄下創建新頁面
mkdir app/my-page
touch app/my-page/page.tsx
```

### 狀態管理
```typescript
// 使用 Context Hook
import { useAuth } from "@/contexts/auth-context"
import { useCompetition } from "@/contexts/competition-context"

const { user, login, logout } = useAuth()
const { competitions, addCompetition } = useCompetition()
```

### 樣式開發
```typescript
// 使用 Tailwind CSS
<div className="bg-white rounded-lg shadow-md p-6">
  <h2 className="text-2xl font-bold text-gray-900">標題</h2>
</div>
```

## 📊 數據模型

### 用戶模型
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

### 競賽模型
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
  type: "individual" | "team" | "mixed"
  judges: string[]
  participatingApps: string[]
  participatingTeams: string[]
  rules: CompetitionRule[]
  awardTypes: CompetitionAwardType[]
  evaluationFocus: string
  maxTeamSize?: number
}
```

### 評審模型
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

## 🚀 部署指南

### 開發環境
```bash
# 啟動開發服務器
pnpm dev

# 建置專案
pnpm build

# 啟動生產服務器
pnpm start
```

### 生產環境
```bash
# 使用 Vercel 部署
vercel --prod

# 或使用 Docker
docker build -t ai-showcase-platform .
docker run -p 3000:3000 ai-showcase-platform
```

## 🔒 安全考量

- **API密鑰安全**: 環境變數存儲敏感資訊
- **用戶權限**: 完整的角色權限控制
- **數據驗證**: 使用 Zod 進行表單驗證
- **XSS防護**: 輸入內容安全處理

## 📈 性能優化

- **圖片優化**: Next.js 內建圖片優化
- **代碼分割**: 自動代碼分割和懶加載
- **快取策略**: 靜態資源快取
- **CDN加速**: 靜態資源CDN分發

## 🤝 貢獻指南

1. **Fork 專案**
2. **創建功能分支**: `git checkout -b feature/AmazingFeature`
3. **提交變更**: `git commit -m 'Add some AmazingFeature'`
4. **推送到分支**: `git push origin feature/AmazingFeature`
5. **開啟 Pull Request**

## 📝 更新日誌

### v1.0.0 (2025-01)
- ✨ 初始版本發布
- 🏆 完整的競賽管理系統
- 🤖 AI智能助手整合
- 📊 管理員後台功能
- 👥 用戶權限管理

## 📄 授權條款

本專案採用 MIT 授權條款 - 詳見 [LICENSE](LICENSE) 檔案

## 📞 聯絡資訊

- **專案負責人**: 強茂集團應用系統部
- **技術支援**: 請透過企業內部管道聯繫
- **問題回報**: 請在企業內部系統提交問題

## 🙏 致謝

- [Next.js](https://nextjs.org/) - React 框架
- [Tailwind CSS](https://tailwindcss.com/) - CSS 框架
- [Radix UI](https://www.radix-ui.com/) - 無障礙組件
- [DeepSeek](https://platform.deepseek.com/) - AI API 服務
- [Lucide](https://lucide.dev/) - 圖標庫

---

**強茂集團 AI 展示平台** - 促進AI技術創新與應用 🚀 