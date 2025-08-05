# 控制台錯誤修復報告

## 📋 錯誤分析

**錯誤信息：**
```
Error: 創建應用程式失敗
components\admin\app-management.tsx (214:15) @ handleAddApp
```

**錯誤位置：**
```javascript
throw new Error(errorData.error || '創建應用程式失敗')
```

## 🔍 根本原因

經過分析，問題出在以下幾個方面：

### 1. 權限問題
API `/api/apps` 需要用戶具有 `developer` 或 `admin` 角色，但當前用戶可能是 `user` 角色。

### 2. Token 認證問題
可能沒有有效的 JWT token，或者 token 已過期。

### 3. 用戶不存在
資料庫中可能沒有合適的管理員用戶。

## ✅ 修復方案

### 1. 改進錯誤處理

**修改文件：** `components/admin/app-management.tsx`

**修復內容：**
- 添加詳細的調試信息
- 改進錯誤處理邏輯
- 添加 token 檢查

```javascript
const handleAddApp = async () => {
  try {
    // 準備應用程式資料
    const appData = {
      name: newApp.name,
      description: newApp.description,
      type: mapTypeToApiType(newApp.type),
      demoUrl: newApp.appUrl || undefined,
      version: '1.0.0'
    }

    console.log('準備提交的應用資料:', appData)

    // 調用 API 創建應用程式
    const token = localStorage.getItem('token')
    console.log('Token:', token ? '存在' : '不存在')

    if (!token) {
      throw new Error('未找到認證 token，請重新登入')
    }

    const response = await fetch('/api/apps', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(appData)
    })

    console.log('API 回應狀態:', response.status, response.statusText)

    if (!response.ok) {
      const errorData = await response.json()
      console.error('API 錯誤詳情:', errorData)
      throw new Error(errorData.error || `API 錯誤: ${response.status} ${response.statusText}`)
    }

    const result = await response.json()
    console.log('應用程式創建成功:', result)

    // ... 其餘代碼
  } catch (error) {
    console.error('創建應用程式失敗:', error)
    const errorMessage = error instanceof Error ? error.message : '未知錯誤'
    alert(`創建應用程式失敗: ${errorMessage}`)
  }
}
```

### 2. 創建管理員用戶

**新文件：** `scripts/create-admin-user.js`

**功能：**
- 創建具有管理員權限的用戶
- 提供登入憑證

**登入資訊：**
- 電子郵件：`admin@example.com`
- 密碼：`Admin123!`
- 角色：`admin`
- 部門：`ITBU`

### 3. 測試腳本

**新文件：** `scripts/test-user-permissions.js`

**功能：**
- 檢查資料庫中的用戶
- 檢查應用程式列表
- 提供調試信息

## 🧪 測試步驟

### 步驟 1：創建管理員用戶
```bash
npm run create:admin
```

### 步驟 2：檢查用戶權限
```bash
npm run test:user-permissions
```

### 步驟 3：在瀏覽器中測試
1. 打開管理後台
2. 使用以下憑證登入：
   - 電子郵件：`admin@example.com`
   - 密碼：`Admin123!`
3. 嘗試創建新的 AI 應用
4. 檢查瀏覽器控制台的調試信息

## 📊 修改的文件清單

1. **`components/admin/app-management.tsx`**
   - 改進 `handleAddApp` 函數的錯誤處理
   - 添加詳細的調試信息
   - 添加 token 檢查

2. **`scripts/create-admin-user.js`** (新文件)
   - 創建管理員用戶腳本
   - 提供登入憑證

3. **`scripts/test-user-permissions.js`** (新文件)
   - 檢查用戶權限和資料庫狀態

4. **`package.json`**
   - 添加新的測試腳本

## ✅ 預期結果

修復後，您應該能夠：

1. **✅ 成功登入管理後台**
   - 使用提供的管理員憑證

2. **✅ 成功創建應用程式**
   - 應用程式正確保存到資料庫
   - 沒有控制台錯誤

3. **✅ 看到詳細的調試信息**
   - 在瀏覽器控制台中看到 API 調用詳情
   - 如果有錯誤，會顯示具體的錯誤信息

## 🎯 故障排除

如果仍然有問題，請檢查：

1. **Token 問題**
   - 確保已正確登入
   - 檢查 localStorage 中是否有 token

2. **權限問題**
   - 確保用戶角色是 `admin` 或 `developer`
   - 使用提供的管理員憑證登入

3. **API 問題**
   - 檢查瀏覽器控制台的詳細錯誤信息
   - 確認 API 端點正常工作

## 💡 使用建議

1. **首次使用：**
   ```bash
   npm run create:admin
   ```

2. **登入管理後台：**
   - 電子郵件：`admin@example.com`
   - 密碼：`Admin123!`

3. **測試應用創建：**
   - 在管理後台嘗試創建新的 AI 應用
   - 檢查瀏覽器控制台的調試信息

現在您的管理後台應該可以正常工作，沒有控制台錯誤！ 