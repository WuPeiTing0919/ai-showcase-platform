# AI智能助手 (ChatBot) 組件分析

## 1. 組件概述

### 1.1 功能定位
AI智能助手是一個內嵌的聊天機器人組件，為用戶提供即時的系統使用指導和問題解答服務。

### 1.2 核心特性
- **即時對話**: 與AI助手進行自然語言對話
- **智能回答**: 基於DeepSeek API的智能回應
- **快速問題**: 提供相關問題的快速選擇
- **上下文記憶**: 保持對話的連續性

## 2. 技術實現

### 2.1 技術棧
```typescript
// 核心技術
- React 19 (Hooks)
- TypeScript 5
- DeepSeek Chat API
- Tailwind CSS
- shadcn/ui 組件庫
```

### 2.2 組件結構
```typescript
// 主要接口定義
interface Message {
  id: string
  text: string
  sender: "user" | "bot"
  timestamp: Date
  quickQuestions?: string[]
}

// 組件狀態
const [isOpen, setIsOpen] = useState(false)           // 對話框開關
const [messages, setMessages] = useState<Message[]>() // 訊息列表
const [inputValue, setInputValue] = useState("")      // 輸入值
const [isTyping, setIsTyping] = useState(false)       // 打字狀態
const [isLoading, setIsLoading] = useState(false)     // 載入狀態
```

### 2.3 API整合
```typescript
// DeepSeek API 配置
const DEEPSEEK_API_KEY = "your_api_key_here"
const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions"

// API 調用函數
const callDeepSeekAPI = async (userMessage: string): Promise<string> => {
  // 實現細節...
}
```

## 3. 功能詳解

### 3.1 對話能力

#### 3.1.1 前台功能指導
- **註冊流程**: 如何註冊參賽團隊
- **作品提交**: 如何提交和管理作品
- **投票系統**: 如何參與投票和收藏
- **個人中心**: 如何管理個人資料

#### 3.1.2 後台管理協助
- **競賽創建**: 如何創建和管理競賽
- **評審管理**: 如何管理評審團成員
- **評分系統**: 如何設定評分標準
- **獎項設定**: 如何配置獎項類型

#### 3.1.3 系統使用指南
- **操作步驟**: 提供具體的操作指引
- **常見問題**: 解答用戶常見疑問
- **最佳實踐**: 推薦最佳使用方法

### 3.2 智能特性

#### 3.2.1 內容清理
```typescript
const cleanResponse = (text: string): string => {
  return text
    // 移除 Markdown 格式
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`(.*?)`/g, '$1')
    .replace(/#{1,6}\s/g, '')
    .replace(/^- /g, '• ')
    .replace(/^\d+\.\s/g, '')
    // 移除多餘空行
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    // 限制文字長度
    .slice(0, 300)
    .trim()
}
```

#### 3.2.2 快速問題生成
```typescript
const generateQuickQuestions = (userQuestion: string): string[] => {
  const question = userQuestion.toLowerCase()
  
  // 根據問題類型生成相關建議
  if (question.includes('註冊') || question.includes('團隊')) {
    return [
      "如何提交作品？",
      "怎麼查看競賽詳情？",
      "如何收藏作品？",
      "怎麼進行投票？"
    ]
  }
  // 更多邏輯...
}
```

### 3.3 用戶體驗

#### 3.3.1 界面設計
- **浮動按鈕**: 固定在右下角的聊天入口
- **模態對話框**: 全屏遮罩的聊天界面
- **響應式設計**: 適配不同螢幕尺寸
- **無障礙設計**: 支持鍵盤導航

#### 3.3.2 交互體驗
- **即時反饋**: 輸入狀態和載入動畫
- **自動滾動**: 新訊息自動滾動到底部
- **快捷操作**: Enter鍵發送訊息
- **錯誤處理**: 網路錯誤的優雅處理

## 4. 系統提示詞 (System Prompt)

### 4.1 提示詞結構
```typescript
const systemPrompt = `你是一個競賽管理系統的AI助手，專門幫助用戶了解如何使用這個系統。

系統功能包括：

後台管理功能：
1. 競賽管理 - 創建、編輯、刪除競賽
2. 評審管理 - 管理評審團成員
3. 評分系統 - 手動輸入評分或讓評審自行評分
4. 團隊管理 - 管理參賽團隊
5. 獎項管理 - 設定各種獎項
6. 評審連結 - 提供評審登入連結

前台功能：
1. 競賽瀏覽 - 查看所有競賽資訊和詳細內容
2. 團隊註冊 - 如何註冊參賽團隊和提交作品
3. 作品展示 - 瀏覽參賽作品和投票功能
4. 排行榜 - 查看人氣排行榜和得獎名單
5. 個人中心 - 管理個人資料和參賽記錄
6. 收藏功能 - 如何收藏喜歡的作品
7. 評論系統 - 如何對作品進行評論和互動
8. 搜尋功能 - 如何搜尋特定競賽或作品
9. 通知系統 - 查看競賽更新和個人通知
10. 幫助中心 - 常見問題和使用指南

請用友善、專業的語氣回答用戶問題，並提供具體的操作步驟。回答要簡潔明瞭，避免過長的文字。

重要：請不要使用任何Markdown格式，只使用純文字回答。不要使用**、*、#、-等符號。

回答時請使用繁體中文。`
```

### 4.2 回答規範
- **語言**: 繁體中文
- **格式**: 純文字，無Markdown
- **長度**: 限制在300字以內
- **語氣**: 友善、專業
- **內容**: 具體操作步驟

## 5. 錯誤處理

### 5.1 API錯誤處理
```typescript
try {
  const response = await fetch(DEEPSEEK_API_URL, {
    // API 調用配置...
  })
  
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`)
  }
  
  const data = await response.json()
  return cleanResponse(data.choices[0]?.message?.content || "抱歉，我現在無法回答您的問題，請稍後再試。")
} catch (error) {
  console.error("DeepSeek API error:", error)
  return "抱歉，我現在無法連接到AI服務，請檢查網路連接或稍後再試。"
}
```

### 5.2 用戶體驗錯誤處理
- **網路錯誤**: 提示檢查網路連接
- **API限制**: 提示稍後再試
- **輸入驗證**: 防止空訊息發送
- **載入狀態**: 防止重複發送

## 6. 性能優化

### 6.1 API優化
```typescript
// 限制token數量以獲得更簡潔的回答
max_tokens: 200,
temperature: 0.7
```

### 6.2 組件優化
- **訊息虛擬化**: 大量訊息時的效能優化
- **防抖處理**: 避免頻繁API調用
- **記憶化**: 重複問題的快取處理
- **懶加載**: 按需載入組件

## 7. 安全考量

### 7.1 API密鑰安全
- **環境變數**: API密鑰存儲在環境變數中
- **加密存儲**: 敏感資訊加密處理
- **訪問控制**: 限制API調用頻率

### 7.2 數據隱私
- **聊天記錄**: 本地存儲，不上傳服務器
- **個人資訊**: 不收集敏感個人資訊
- **數據清理**: 定期清理過期數據

## 8. 擴展性設計

### 8.1 多語言支持
```typescript
interface LocalizationConfig {
  language: string
  systemPrompt: Record<string, string>
  quickQuestions: Record<string, string[]>
  errorMessages: Record<string, string>
}
```

### 8.2 多AI模型支持
```typescript
interface AIModelConfig {
  provider: 'deepseek' | 'openai' | 'anthropic'
  model: string
  apiKey: string
  apiUrl: string
  maxTokens: number
  temperature: number
}
```

### 8.3 自定義功能
- **知識庫整合**: 連接企業知識庫
- **FAQ系統**: 自動回答常見問題
- **工單系統**: 複雜問題轉人工處理
- **分析報告**: 聊天數據分析

## 9. 使用指南

### 9.1 基本使用
1. 點擊右下角的聊天按鈕
2. 在輸入框中輸入問題
3. 按Enter鍵或點擊發送按鈕
4. 查看AI助手的回答
5. 點擊快速問題進行後續對話

### 9.2 進階功能
- **上下文記憶**: 對話會保持上下文
- **快速問題**: 點擊建議問題快速提問
- **錯誤重試**: 網路錯誤時可重新發送
- **對話重置**: 關閉重開可開始新對話

### 9.3 最佳實踐
- **具體問題**: 提出具體明確的問題
- **分步驟**: 複雜操作分步驟詢問
- **耐心等待**: AI需要時間處理複雜問題
- **反饋提供**: 對回答不滿意時可重新提問

## 10. 未來規劃

### 10.1 短期目標
- [ ] 添加語音輸入功能
- [ ] 支持圖片上傳和識別
- [ ] 增加更多快速問題模板
- [ ] 優化回答品質和速度

### 10.2 長期目標
- [ ] 整合企業知識庫
- [ ] 支持多語言對話
- [ ] 添加情感分析功能
- [ ] 實現智能推薦系統

---

**文檔版本**: v1.0  
**最後更新**: 2024年12月  
**負責人**: 前端開發團隊 