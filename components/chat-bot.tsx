"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  MessageCircle, 
  X, 
  Send, 
  Bot, 
  User, 
  Loader2
} from "lucide-react"

interface Message {
  id: string
  text: string
  sender: "user" | "bot"
  timestamp: Date
  quickQuestions?: string[]
}

const DEEPSEEK_API_KEY = process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY || ""
const DEEPSEEK_API_URL = process.env.NEXT_PUBLIC_DEEPSEEK_API_URL || "https://api.deepseek.com/v1/chat/completions"

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

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "您好！我是AI助手，很高興為您服務。我可以協助您了解競賽管理系統的使用方法，包括後台管理和前台功能。請問有什麼可以幫助您的嗎？",
      sender: "bot",
      timestamp: new Date(),
      quickQuestions: [
        "如何註冊參賽團隊？",
        "怎麼提交作品？",
        "如何創建新競賽？",
        "怎麼管理評審團？"
      ]
    }
  ])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // 清理 Markdown 格式和過長文字
  const cleanResponse = (text: string): string => {
    return text
      // 移除 Markdown 格式
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/`(.*?)`/g, '$1')
      .replace(/#{1,6}\s/g, '')
      .replace(/^- /g, '• ')
      .replace(/^\d+\.\s/g, '')
      // 移除多餘的空行
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      // 限制文字長度，如果太長就截斷並添加省略號
      .slice(0, 300)
      .trim()
  }

  const callDeepSeekAPI = async (userMessage: string): Promise<string> => {
    try {
      const response = await fetch(DEEPSEEK_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${DEEPSEEK_API_KEY}`
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            {
              role: "system",
              content: systemPrompt
            },
            ...messages
              .filter(msg => msg.sender === "user")
              .map(msg => ({
                role: "user" as const,
                content: msg.text
              })),
            {
              role: "user",
              content: userMessage
            }
          ],
                     max_tokens: 200, // 減少 token 數量以獲得更簡潔的回答
          temperature: 0.7
        })
      })

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`)
      }

      const data = await response.json()
      const rawResponse = data.choices[0]?.message?.content || "抱歉，我現在無法回答您的問題，請稍後再試。"
      return cleanResponse(rawResponse)
    } catch (error) {
      console.error("DeepSeek API error:", error)
      return "抱歉，我現在無法連接到AI服務，請檢查網路連接或稍後再試。"
    }
  }

  // 根據用戶問題生成相關的快速問題
  const generateQuickQuestions = (userQuestion: string): string[] => {
    const question = userQuestion.toLowerCase()
    
    // 前台相關問題
    if (question.includes('註冊') || question.includes('團隊')) {
      return [
        "如何提交作品？",
        "怎麼查看競賽詳情？",
        "如何收藏作品？",
        "怎麼進行投票？"
      ]
    }
    if (question.includes('作品') || question.includes('提交')) {
      return [
        "如何修改作品？",
        "怎麼查看作品狀態？",
        "如何刪除作品？",
        "怎麼下載作品？"
      ]
    }
    if (question.includes('投票') || question.includes('排行榜')) {
      return [
        "如何查看排行榜？",
        "怎麼收藏作品？",
        "如何評論作品？",
        "怎麼分享作品？"
      ]
    }
    
    // 後台相關問題
    if (question.includes('競賽') || question.includes('創建')) {
      return [
        "如何編輯競賽？",
        "怎麼設定評分標準？",
        "如何管理參賽團隊？",
        "怎麼設定獎項？"
      ]
    }
    if (question.includes('評審') || question.includes('評分')) {
      return [
        "如何新增評審？",
        "怎麼設定評審權限？",
        "如何查看評分結果？",
        "怎麼生成評審連結？"
      ]
    }
    
    // 通用問題
    return [
      "如何註冊參賽團隊？",
      "怎麼提交作品？",
      "如何創建新競賽？",
      "怎麼管理評審團？"
    ]
  }

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      sender: "user",
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue("")
    setIsTyping(true)
    setIsLoading(true)

    try {
      const aiResponse = await callDeepSeekAPI(text)
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        sender: "bot",
        timestamp: new Date(),
        quickQuestions: generateQuickQuestions(text)
      }
      
      setMessages(prev => [...prev, botMessage])
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "抱歉，發生錯誤，請稍後再試。",
        sender: "bot",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage(inputValue)
    }
  }

  return (
    <>
      {/* 浮動按鈕 */}
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg z-50"
        size="icon"
      >
        <MessageCircle className="w-6 h-6" />
      </Button>

             {/* 聊天對話框 */}
       {isOpen && (
         <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end justify-end p-4">
           <Card className="w-96 max-h-[80vh] flex flex-col shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="flex items-center space-x-2">
                <Bot className="w-5 h-5 text-blue-600" />
                <span>AI 助手</span>
                <Badge variant="secondary" className="text-xs">在線</Badge>
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8"
              >
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>

                         <CardContent className="flex-1 flex flex-col p-0 min-h-0">
               {/* 訊息區域 */}
               <div className="flex-1 overflow-y-auto px-4" style={{ minHeight: '200px', maxHeight: 'calc(80vh - 200px)' }}>
                <div className="space-y-4 pb-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`flex items-start space-x-2 max-w-[85%] ${message.sender === "user" ? "flex-row-reverse space-x-reverse" : ""}`}>
                        <Avatar className="w-8 h-8 flex-shrink-0">
                          <AvatarFallback className="text-xs">
                            {message.sender === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                          </AvatarFallback>
                        </Avatar>
                                                 <div
                           className={`rounded-lg px-3 py-2 text-sm break-words whitespace-pre-wrap ${
                             message.sender === "user"
                               ? "bg-blue-600 text-white"
                               : "bg-gray-100 text-gray-900"
                           }`}
                           style={{
                             maxWidth: '100%',
                             wordWrap: 'break-word',
                             overflowWrap: 'break-word'
                           }}
                         >
                           {message.text}
                           
                           {/* 快速問題按鈕 */}
                           {message.sender === "bot" && message.quickQuestions && message.quickQuestions.length > 0 && (
                             <div className="mt-3 space-y-2">
                               <div className="text-xs text-gray-500 mb-2">您可能還想問：</div>
                               <div className="flex flex-wrap gap-2">
                                 {message.quickQuestions.map((question, index) => (
                                   <Button
                                     key={index}
                                     variant="outline"
                                     size="sm"
                                     className="text-xs h-7 px-2 py-1 bg-white hover:bg-gray-50 border-gray-200"
                                     onClick={() => handleSendMessage(question)}
                                     disabled={isLoading}
                                   >
                                     {question}
                                   </Button>
                                 ))}
                               </div>
                             </div>
                           )}
                         </div>
                      </div>
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="flex items-start space-x-2">
                        <Avatar className="w-8 h-8 flex-shrink-0">
                          <AvatarFallback className="text-xs">
                            <Bot className="w-4 h-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="bg-gray-100 rounded-lg px-3 py-2">
                          <div className="flex items-center space-x-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="text-sm text-gray-600">AI 正在思考...</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
              </div>

                             {/* 輸入區域 */}
               <div className="p-4 border-t border-gray-200 bg-white flex-shrink-0">
                <div className="flex items-center space-x-2">
                  <div className="flex-1 min-w-0">
                    <Input
                      ref={inputRef}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="輸入您的問題..."
                      className="w-full"
                      disabled={isLoading}
                    />
                  </div>
                  <Button
                    onClick={() => handleSendMessage(inputValue)}
                    disabled={!inputValue.trim() || isLoading}
                    size="icon"
                    className="w-10 h-10 flex-shrink-0"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
} 