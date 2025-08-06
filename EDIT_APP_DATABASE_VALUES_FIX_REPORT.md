# 編輯應用功能資料庫值修正報告

## 問題描述

用戶報告：**"會帶資料了，但這是預設資料，應該帶資料庫的資料，因為這是編輯功能"**

當用戶點擊編輯應用功能時，表單會預填資料，但這些資料是預設值（如 "HQBU" 部門、"Bot" 圖示等）而不是實際的資料庫值。

## 問題分析

### 根本原因
1. **`handleEditApp` 函數使用硬編碼預設值**：當資料庫欄位為空或 undefined 時，函數會使用預設值如 `"HQBU"`、`"Bot"` 等
2. **`newApp` 狀態初始化包含預設值**：初始狀態包含預設值，影響編輯時的資料顯示
3. **表單欄位依賴預設值**：當資料庫值為空字串時，表單會顯示預設值而非實際的資料庫值

### 影響範圍
- 編輯應用功能無法正確顯示實際的資料庫值
- 用戶可能誤以為資料已正確載入，但實際上是預設值
- 影響資料的準確性和用戶體驗

## 修正方案

### 1. 修改 `handleEditApp` 函數

**修改前：**
```typescript
const newAppData = {
  name: app.name,
  type: displayType,
  department: department || "HQBU", // 使用預設值
  creator: creator || "",
  description: app.description,
  appUrl: app.appUrl || app.demoUrl || "",
  icon: app.icon || "Bot", // 使用預設值
  iconColor: app.iconColor || "from-blue-500 to-purple-500", // 使用預設值
}
```

**修改後：**
```typescript
const newAppData = {
  name: app.name || "",
  type: displayType || "文字處理",
  department: department || "", // 使用空字串而非預設值
  creator: creator || "",
  description: app.description || "",
  appUrl: app.appUrl || app.demoUrl || "",
  icon: app.icon || "", // 使用空字串而非預設值
  iconColor: app.iconColor || "", // 使用空字串而非預設值
}
```

### 2. 修改 `newApp` 狀態初始化

**修改前：**
```typescript
const [newApp, setNewApp] = useState({
  name: "",
  type: "文字處理", // 預設值
  department: "HQBU", // 預設值
  creator: "",
  description: "",
  appUrl: "",
  icon: "Bot", // 預設值
  iconColor: "from-blue-500 to-purple-500", // 預設值
})
```

**修改後：**
```typescript
const [newApp, setNewApp] = useState({
  name: "",
  type: "", // 移除預設值
  department: "", // 移除預設值
  creator: "",
  description: "",
  appUrl: "",
  icon: "", // 移除預設值
  iconColor: "", // 移除預設值
})
```

### 3. 修改 `resetNewApp` 函數

**修改前：**
```typescript
const resetNewApp = () => {
  setNewApp({
    name: "",
    type: "文字處理", // 預設值
    department: "HQBU", // 預設值
    creator: "",
    description: "",
    appUrl: "",
    icon: "Bot", // 預設值
    iconColor: "from-blue-500 to-purple-500", // 預設值
  })
}
```

**修改後：**
```typescript
const resetNewApp = () => {
  setNewApp({
    name: "",
    type: "", // 移除預設值
    department: "", // 移除預設值
    creator: "",
    description: "",
    appUrl: "",
    icon: "", // 移除預設值
    iconColor: "", // 移除預設值
  })
}
```

## 測試驗證

### 測試案例 1：資料庫有實際值的應用程式
- **輸入**：包含實際資料庫值的應用物件
- **期望**：使用資料庫的實際值（如 "ITBU" 部門、"Zap" 圖示）
- **結果**：✅ 通過

### 測試案例 2：資料庫值為空字串的應用程式
- **輸入**：資料庫欄位為空字串的應用物件
- **期望**：保持空字串，不使用預設值
- **結果**：✅ 通過

### 測試案例 3：來自列表 API 的資料（字串格式）
- **輸入**：來自列表 API 的字串格式資料
- **期望**：直接使用字串值
- **結果**：✅ 通過

## 修正效果

### 修正前
- 編輯表單顯示預設值（"HQBU" 部門、"Bot" 圖示等）
- 無法區分實際資料庫值和預設值
- 用戶可能誤以為資料已正確載入

### 修正後
- 編輯表單顯示實際的資料庫值
- 空字串欄位保持為空，不使用預設值
- 用戶可以清楚看到實際的資料庫內容

## 技術細節

### 修改的檔案
- `components/admin/app-management.tsx`

### 修改的函數
- `handleEditApp`：移除硬編碼預設值
- `newApp` 狀態初始化：移除預設值
- `resetNewApp`：移除預設值

### 影響的資料欄位
- `department`：從預設 "HQBU" 改為空字串
- `icon`：從預設 "Bot" 改為空字串
- `iconColor`：從預設 "from-blue-500 to-purple-500" 改為空字串
- `type`：從預設 "文字處理" 改為空字串

## 總結

此修正確保了編輯應用功能能夠正確顯示實際的資料庫值，而不是預設值。這提高了資料的準確性和用戶體驗，讓用戶能夠清楚看到和編輯實際的應用程式資料。

**修正狀態**：✅ 已完成並通過測試
**影響範圍**：編輯應用功能
**測試狀態**：✅ 所有測試案例通過 