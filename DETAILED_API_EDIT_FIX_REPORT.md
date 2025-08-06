# 詳細 API 編輯功能修正報告

## 問題描述

用戶報告在應用詳細視窗中點擊「編輯應用」按鈕時，創建者和所屬部門顯示的是預設資料而不是真正的資料庫數據。

## 根本原因分析

### 1. 詳細 API 與列表 API 的數據結構不一致

**列表 API (`/api/apps`)**：
- `department: app.department` (來自 apps 表)
- `creator.name: app.creator_name || app.user_creator_name` (優先使用 apps.creator_name)

**詳細 API (`/api/apps/[id]`)**：
- 缺少 `department` 欄位
- `creator.name: app.creator_name` (只使用 users.name)
- `creator.department: app.creator_department` (使用用戶部門而非應用部門)

### 2. SQL 查詢不一致

**列表 API 查詢**：
```sql
SELECT 
  a.*,
  u.name as user_creator_name,  -- 使用 user_creator_name
  u.email as user_creator_email,
  u.department as user_creator_department,
  u.role as creator_role
FROM apps a
LEFT JOIN users u ON a.creator_id = u.id
```

**詳細 API 查詢**：
```sql
SELECT 
  a.*,
  u.name as creator_name,  -- 使用 creator_name
  u.email as creator_email,
  u.department as creator_department,
  u.role as creator_role
FROM apps a
LEFT JOIN users u ON a.creator_id = u.id
```

## 修正方案

### 1. 更新詳細 API 的 SQL 查詢

**修改前**：
```sql
SELECT 
  a.*,
  u.name as creator_name,
  u.email as creator_email,
  u.department as creator_department,
  u.role as creator_role
```

**修改後**：
```sql
SELECT 
  a.*,
  u.name as user_creator_name,  -- 改為 user_creator_name
  u.email as creator_email,
  u.department as creator_department,
  u.role as creator_role
```

### 2. 更新詳細 API 的回應格式

**修改前**：
```typescript
const formattedApp = {
  // ... 其他欄位
  creator: {
    id: app.creator_id,
    name: app.creator_name,  // 只使用 users.name
    email: app.creator_email,
    department: app.creator_department,  // 使用用戶部門
    role: app.creator_role
  }
}
```

**修改後**：
```typescript
const formattedApp = {
  // ... 其他欄位
  department: app.department,  // 新增應用部門
  icon: app.icon,  // 新增圖示
  iconColor: app.icon_color,  // 新增圖示顏色
  creator: {
    id: app.creator_id,
    name: app.creator_name || app.user_creator_name,  // 優先使用 apps.creator_name
    email: app.creator_email,
    department: app.department || app.creator_department,  // 優先使用應用部門
    role: app.creator_role
  }
}
```

## 修正的檔案

### `app/api/apps/[id]/route.ts`

1. **SQL 查詢修正**：
   - 將 `u.name as creator_name` 改為 `u.name as user_creator_name`
   - 保持與列表 API 一致的欄位命名

2. **回應格式修正**：
   - 新增 `department: app.department` 欄位
   - 新增 `icon: app.icon` 和 `iconColor: app.icon_color` 欄位
   - 修正 `creator.name` 優先使用 `app.creator_name`
   - 修正 `creator.department` 優先使用 `app.department`

## 測試驗證

### 測試腳本：`scripts/test-detailed-api-logic.js`

模擬修正後的數據流程：

```javascript
// 模擬資料庫值
const mockAppData = {
  app_department: 'MBU1',
  app_creator_name: '佩庭',
  user_department: 'ITBU',
  user_name: '系統管理員'
};

// 模擬詳細 API 回應
const detailedAppData = {
  department: mockAppData.app_department,  // MBU1
  creator: {
    name: mockAppData.app_creator_name || mockAppData.user_name,  // 佩庭
    department: mockAppData.app_department || mockAppData.user_department  // MBU1
  }
};

// 模擬 handleEditApp 處理
const result = handleEditApp(detailedAppData);
// 結果：creator: '佩庭', department: 'MBU1'
```

### 測試結果

```
=== Verification ===
Creator match: ✅ PASS
Department match: ✅ PASS
```

## 預期效果

修正後，當用戶在應用詳細視窗中點擊「編輯應用」按鈕時：

1. **創建者欄位**：顯示 `apps.creator_name` (如「佩庭」) 而非 `users.name` (如「系統管理員」)
2. **部門欄位**：顯示 `apps.department` (如「MBU1」) 而非 `users.department` (如「ITBU」)
3. **圖示欄位**：正確顯示 `apps.icon` 和 `apps.icon_color`
4. **類型欄位**：正確轉換英文 API 類型為中文顯示類型

## 技術細節

### 數據優先級

1. **創建者名稱**：`apps.creator_name` > `users.name`
2. **部門**：`apps.department` > `users.department`
3. **圖示**：`apps.icon` 和 `apps.icon_color`

### 向後兼容性

修正保持向後兼容性：
- 如果 `apps.creator_name` 為空，仍會使用 `users.name`
- 如果 `apps.department` 為空，仍會使用 `users.department`

## 部署注意事項

1. 清除瀏覽器快取以確保獲取最新的 API 回應
2. 重新測試編輯功能以驗證修正效果
3. 確認所有相關欄位都正確顯示資料庫中的實際值

## 結論

此修正解決了詳細 API 與列表 API 數據結構不一致的問題，確保編輯功能能夠正確顯示資料庫中的實際值而非預設資料。修正後的系統將提供一致且準確的數據顯示體驗。 