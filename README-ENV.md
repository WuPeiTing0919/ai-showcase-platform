# 環境變數設定說明

## DeepSeek API 設定

本專案使用 DeepSeek API 作為聊天機器人的 AI 服務。請按照以下步驟設定環境變數：

### 1. 創建環境變數檔案

在專案根目錄創建 `.env.local` 檔案：

```bash
# DeepSeek API Configuration
NEXT_PUBLIC_DEEPSEEK_API_KEY=your_deepseek_api_key_here
NEXT_PUBLIC_DEEPSEEK_API_URL=https://api.deepseek.com/v1/chat/completions
```

### 2. 取得 DeepSeek API 金鑰

1. 前往 [DeepSeek 官網](https://platform.deepseek.com/)
2. 註冊或登入帳號
3. 在控制台中生成 API 金鑰
4. 將金鑰複製到 `.env.local` 檔案中的 `NEXT_PUBLIC_DEEPSEEK_API_KEY`

### 3. 環境變數說明

- `NEXT_PUBLIC_DEEPSEEK_API_KEY`: DeepSeek API 金鑰
- `NEXT_PUBLIC_DEEPSEEK_API_URL`: DeepSeek API 端點 URL

### 4. 安全注意事項

- `.env.local` 檔案已加入 `.gitignore`，不會被提交到版本控制
- 請勿將 API 金鑰分享給他人
- 在生產環境中，請使用更安全的環境變數管理方式

### 5. 重新啟動開發伺服器

設定完成後，請重新啟動開發伺服器：

```bash
npm run dev
# 或
pnpm dev
```

### 6. 驗證設定

聊天機器人應該能夠正常運作，並能夠回答用戶問題。

## 故障排除

如果聊天機器人無法運作：

1. 確認 `.env.local` 檔案存在且格式正確
2. 確認 API 金鑰有效且未過期
3. 檢查網路連接是否正常
4. 查看瀏覽器開發者工具中的錯誤訊息 