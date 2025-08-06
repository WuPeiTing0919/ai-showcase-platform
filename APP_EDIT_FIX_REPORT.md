# 應用編輯功能修正報告

## 問題描述

### 1. 所屬部門無法帶入編輯介面
- **問題**: 編輯應用時，所屬部門欄位無法正確顯示現有值
- **原因**: `handleEditApp` 函數中資料來源路徑錯誤

### 2. 應用圖示沒有儲存到資料庫
- **問題**: 選擇的圖示無法保存，總是顯示預設圖示
- **原因**: 資料庫 `apps` 表缺少 `icon` 和 `icon_color` 欄位

## 修正方案

### 1. 修正所屬部門資料來源

**修改檔案**: `components/admin/app-management.tsx`

**修正內容**:
```typescript
const handleEditApp = (app: any) => {
  setSelectedApp(app)
  setNewApp({
    name: app.name,
    type: app.type,
    department: app.creator?.department || app.department || "HQBU", // 修正：優先從 creator.department 獲取
    creator: app.creator?.name || app.creator || "", // 修正：優先從 creator.name 獲取
    description: app.description,
    appUrl: app.appUrl || app.demoUrl || "", // 修正：同時檢查 appUrl 和 demoUrl
    icon: app.icon || "Bot",
    iconColor: app.iconColor || "from-blue-500 to-purple-500",
  })
  setShowEditApp(true)
}
```

### 2. 新增資料庫圖示欄位

**修改檔案**: `database_setup.sql`

**新增欄位**:
```sql
-- 6. 應用表 (apps)
CREATE TABLE apps (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    creator_id VARCHAR(36) NOT NULL,
    team_id VARCHAR(36),
    likes_count INT DEFAULT 0,
    views_count INT DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0,
    icon VARCHAR(50) DEFAULT 'Bot',                    -- 新增：圖示欄位
    icon_color VARCHAR(100) DEFAULT 'from-blue-500 to-purple-500', -- 新增：圖示顏色欄位
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL,
    INDEX idx_creator (creator_id),
    INDEX idx_team (team_id),
    INDEX idx_rating (rating),
    INDEX idx_likes (likes_count)
);
```

### 3. 更新 TypeScript 類型定義

**修改檔案**: `types/app.ts`

**新增欄位**:
```typescript
export interface App {
  // ... 其他欄位
  icon?: string;
  iconColor?: string;
  // ... 其他欄位
}

export interface AppUpdateRequest {
  // ... 其他欄位
  icon?: string;
  iconColor?: string;
  // ... 其他欄位
}
```

### 4. 更新 API 路由

**修改檔案**: `app/api/apps/[id]/route.ts`

**新增處理**:
```typescript
const {
  // ... 其他欄位
  icon,
  iconColor
}: AppUpdateRequest = body;

// 在更新資料驗證部分
if (icon !== undefined) {
  updateData.icon = icon;
}

if (iconColor !== undefined) {
  updateData.icon_color = iconColor;
}
```

**修改檔案**: `app/api/apps/route.ts`

**新增回應欄位**:
```typescript
const formattedApps = apps.map((app: any) => ({
  // ... 其他欄位
  icon: app.icon,
  iconColor: app.icon_color,
  // ... 其他欄位
}));
```

### 5. 更新前端資料處理

**修改檔案**: `components/admin/app-management.tsx`

**修正 loadApps 函數**:
```typescript
const formattedApps = (data.apps || []).map((app: any) => ({
  // ... 其他欄位
  icon: app.icon || 'Bot',
  iconColor: app.iconColor || 'from-blue-500 to-purple-500',
  // ... 其他欄位
}))
```

**修正 handleUpdateApp 函數**:
```typescript
const updateData = {
  name: newApp.name,
  description: newApp.description,
  type: mapTypeToApiType(newApp.type),
  demoUrl: newApp.appUrl || undefined,
  icon: newApp.icon, // 新增：更新圖示
  iconColor: newApp.iconColor, // 新增：更新圖示顏色
  department: newApp.department, // 新增：更新部門
}
```

## 測試腳本

**新增檔案**: `scripts/test-app-edit.js`

**功能**:
- 檢查資料庫結構是否包含圖示欄位
- 檢查現有應用程式的圖示設定
- 測試圖示更新功能

**執行方式**:
```bash
npm run test:app-edit
```

## 資料庫更新腳本

**修改檔案**: `scripts/fix-apps-table.js`

**新增欄位**:
```sql
-- 添加圖示欄位
ALTER TABLE apps ADD COLUMN icon VARCHAR(50) DEFAULT 'Bot',

-- 添加圖示顏色欄位
ALTER TABLE apps ADD COLUMN icon_color VARCHAR(100) DEFAULT 'from-blue-500 to-purple-500',
```

**執行方式**:
```bash
npm run db:update-structure
```

## 修正結果

### ✅ 所屬部門問題已解決
- 編輯應用時，所屬部門欄位會正確顯示現有值
- 資料來源優先從 `app.creator?.department` 獲取
- 支援多種資料結構格式

### ✅ 應用圖示問題已解決
- 資料庫新增 `icon` 和 `icon_color` 欄位
- 前端可以正確保存和顯示選擇的圖示
- API 支援圖示的更新和查詢

### ✅ 完整的功能支援
- 編輯對話框包含圖示選擇器
- 所屬部門下拉選單
- 資料正確保存到資料庫
- 前端正確顯示保存的資料

## 使用說明

### 1. 更新資料庫結構
```bash
npm run db:update-structure
```

### 2. 測試功能
```bash
npm run test:app-edit
```

### 3. 在管理後台使用
1. 進入應用管理頁面
2. 點擊應用程式的「編輯應用」按鈕
3. 修改所屬部門和選擇應用圖示
4. 點擊「更新應用」保存變更

## 注意事項

1. **資料庫更新**: 需要先執行 `npm run db:update-structure` 來新增圖示欄位
2. **向後相容**: 現有的應用程式會使用預設圖示，直到手動更新
3. **圖示選擇**: 提供 20 種不同的圖示供選擇
4. **部門管理**: 支援 HQBU、ITBU、MBU1、SBU 四個部門

---

**修正完成時間**: 2025-01-XX
**修正人員**: AI Assistant
**測試狀態**: ✅ 已測試 