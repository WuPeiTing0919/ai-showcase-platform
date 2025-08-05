# 應用程式管理 API 使用說明

## 概述

本文件說明 AI Showcase Platform 第二階段實現的應用程式管理 API 功能。

## 快速開始

### 1. 資料庫準備

```bash
# 修復 apps 表格結構
npm run db:fix-apps

# 測試 API 功能
npm run test:apps
```

### 2. API 端點

#### 應用程式管理

| 方法 | 端點 | 描述 |
|------|------|------|
| GET | `/api/apps` | 獲取應用程式列表 |
| POST | `/api/apps` | 創建新應用程式 |
| GET | `/api/apps/[id]` | 獲取單個應用程式 |
| PUT | `/api/apps/[id]` | 更新應用程式 |
| DELETE | `/api/apps/[id]` | 刪除應用程式 |

#### 檔案上傳

| 方法 | 端點 | 描述 |
|------|------|------|
| POST | `/api/apps/[id]/upload` | 上傳應用程式檔案 |

#### 統計資料

| 方法 | 端點 | 描述 |
|------|------|------|
| GET | `/api/apps/stats` | 獲取應用程式統計 |

#### 互動功能

| 方法 | 端點 | 描述 |
|------|------|------|
| POST | `/api/apps/[id]/like` | 按讚應用程式 |
| DELETE | `/api/apps/[id]/like` | 取消按讚 |
| POST | `/api/apps/[id]/favorite` | 收藏應用程式 |
| DELETE | `/api/apps/[id]/favorite` | 取消收藏 |

## 使用範例

### 創建應用程式

```javascript
const response = await fetch('/api/apps', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    name: '我的 AI 應用',
    description: '這是一個創新的 AI 應用程式',
    type: 'web_app',
    techStack: ['React', 'Node.js', 'TensorFlow'],
    tags: ['AI', '機器學習'],
    demoUrl: 'https://demo.example.com',
    githubUrl: 'https://github.com/user/app',
    docsUrl: 'https://docs.example.com',
    version: '1.0.0'
  })
});
```

### 獲取應用程式列表

```javascript
const response = await fetch('/api/apps?page=1&limit=10&type=web_app&status=published', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### 上傳檔案

```javascript
const formData = new FormData();
formData.append('file', file);
formData.append('type', 'screenshot');

const response = await fetch(`/api/apps/${appId}/upload`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

### 按讚應用程式

```javascript
const response = await fetch(`/api/apps/${appId}/like`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

## 資料結構

### 應用程式狀態

- `draft` - 草稿
- `submitted` - 已提交
- `under_review` - 審核中
- `approved` - 已批准
- `rejected` - 已拒絕
- `published` - 已發布

### 應用程式類型

- `web_app` - 網頁應用
- `mobile_app` - 行動應用
- `desktop_app` - 桌面應用
- `api_service` - API 服務
- `ai_model` - AI 模型
- `data_analysis` - 資料分析
- `automation` - 自動化
- `other` - 其他

## 權限要求

- **查看應用程式**: 需要登入
- **創建應用程式**: 需要開發者或管理員權限
- **編輯應用程式**: 需要創建者或管理員權限
- **刪除應用程式**: 需要創建者或管理員權限
- **上傳檔案**: 需要創建者或管理員權限
- **按讚/收藏**: 需要登入

## 錯誤處理

所有 API 都會返回標準的 HTTP 狀態碼：

- `200` - 成功
- `201` - 創建成功
- `400` - 請求錯誤
- `401` - 認證失敗
- `403` - 權限不足
- `404` - 資源不存在
- `500` - 伺服器錯誤

錯誤回應格式：

```json
{
  "error": "錯誤訊息",
  "details": ["詳細錯誤資訊"]
}
```

## 測試

運行完整的 API 測試：

```bash
npm run test:apps
```

測試包括：
- 資料庫連接測試
- 應用程式 CRUD 操作測試
- 檔案上傳測試
- 搜尋篩選測試
- 統計功能測試
- 互動功能測試
- 權限驗證測試

## 注意事項

1. 所有 API 都需要 JWT Token 認證
2. 檔案上傳大小限制為 10MB
3. 按讚功能有每日限制，防止重複按讚
4. 刪除應用程式會同時刪除相關的按讚、收藏、評分記錄
5. 統計資料包含各種排行榜和分析數據

## 相關文件

- [BACKEND_STAGE2_REPORT.md](./BACKEND_STAGE2_REPORT.md) - 詳細的實現報告
- [types/app.ts](./types/app.ts) - TypeScript 類型定義 