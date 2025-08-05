# 🗄️ AI展示平台資料庫指南

## 📋 資料庫概述

AI展示平台使用 **MySQL** 作為主要資料庫，支援完整的競賽管理、用戶認證、評審系統和AI助手功能。

### 🔗 連接資訊
- **主機**: mysql.theaken.com
- **埠號**: 33306
- **資料庫**: db_AI_Platform
- **用戶**: AI_Platform
- **密碼**: Aa123456

## 🏗️ 資料庫結構

### 📊 核心資料表 (18個)

#### 1. 用戶管理
- **users** - 用戶基本資料
- **user_favorites** - 用戶收藏
- **user_likes** - 用戶按讚記錄

#### 2. 競賽系統
- **competitions** - 競賽基本資料
- **competition_participants** - 競賽參與者
- **competition_judges** - 競賽評審分配

#### 3. 團隊管理
- **teams** - 團隊基本資料
- **team_members** - 團隊成員

#### 4. 作品管理
- **apps** - AI應用程式
- **proposals** - 提案作品

#### 5. 評審系統
- **judges** - 評審基本資料
- **judge_scores** - 評審評分

#### 6. 獎項系統
- **awards** - 獎項記錄

#### 7. AI助手
- **chat_sessions** - 聊天會話
- **chat_messages** - 聊天訊息
- **ai_assistant_configs** - AI配置

#### 8. 系統管理
- **system_settings** - 系統設定
- **activity_logs** - 活動日誌

## 🚀 快速開始

### 1. 環境設定

```bash
# 複製環境變數範例
cp env.example .env.local

# 編輯環境變數
nano .env.local
```

### 2. 安裝依賴

```bash
# 安裝新依賴
pnpm install
```

### 3. 建立資料庫

```bash
# 建立資料庫和資料表
pnpm run db:setup
```

### 4. 測試連接

```bash
# 測試資料庫連接
pnpm run db:test
```

## 📊 資料表詳細說明

### users 表
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

**用途**: 儲存所有用戶資料
**角色**: 
- `user`: 一般用戶 (瀏覽、投票)
- `developer`: 開發者 (提交作品、參賽)
- `admin`: 管理員 (系統管理、數據分析)

### competitions 表
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

**競賽狀態流程**: `upcoming` → `active` → `judging` → `completed`
**競賽類型**:
- `individual`: 個人賽
- `team`: 團隊賽
- `mixed`: 混合賽
- `proposal`: 提案賽

### judge_scores 表
```sql
CREATE TABLE judge_scores (
    id VARCHAR(36) PRIMARY KEY,
    judge_id VARCHAR(36) NOT NULL,
    app_id VARCHAR(36),
    proposal_id VARCHAR(36),
    scores JSON NOT NULL,
    comments TEXT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**評分維度** (JSON格式):
```json
{
  "innovation": 8,      // 創新性 (1-10)
  "technical": 7,       // 技術性 (1-10)
  "usability": 9,       // 實用性 (1-10)
  "presentation": 8,    // 展示效果 (1-10)
  "impact": 7           // 影響力 (1-10)
}
```

## 🔍 查詢範例

### 1. 獲取用戶統計
```sql
SELECT 
    u.name,
    u.department,
    u.role,
    COUNT(DISTINCT a.id) as total_apps,
    COUNT(DISTINCT f.app_id) as total_favorites,
    u.total_likes,
    u.total_views
FROM users u
LEFT JOIN apps a ON u.id = a.creator_id
LEFT JOIN user_favorites f ON u.id = f.user_id
GROUP BY u.id;
```

### 2. 獲取競賽統計
```sql
SELECT 
    c.name,
    c.status,
    c.type,
    COUNT(DISTINCT cp.user_id) as participant_count,
    COUNT(DISTINCT cp.team_id) as team_count,
    COUNT(DISTINCT cp.app_id) as app_count
FROM competitions c
LEFT JOIN competition_participants cp ON c.id = cp.competition_id
GROUP BY c.id;
```

### 3. 獲取應用排行榜
```sql
SELECT 
    a.name,
    u.name as creator_name,
    t.name as team_name,
    a.likes_count,
    a.views_count,
    a.rating,
    ROW_NUMBER() OVER (ORDER BY a.likes_count DESC) as popularity_rank
FROM apps a
LEFT JOIN users u ON a.creator_id = u.id
LEFT JOIN teams t ON a.team_id = t.id;
```

## 🛠️ 存儲過程

### GetUserPermissions
```sql
CALL GetUserPermissions('user@example.com');
```
**用途**: 獲取用戶權限和基本資料

### GetCompetitionStats
```sql
CALL GetCompetitionStats('comp-2025-01');
```
**用途**: 獲取競賽統計資料

### CalculateAwardRankings
```sql
CALL CalculateAwardRankings('comp-2025-01');
```
**用途**: 計算獎項排名

## 👁️ 視圖 (Views)

### user_statistics
顯示用戶統計資料，包含作品數、收藏數、按讚數等

### competition_statistics
顯示競賽統計資料，包含參與者數、團隊數、作品數等

### app_rankings
顯示應用排行榜，包含人氣排名和評分排名

## 🔧 觸發器 (Triggers)

### update_user_total_likes
當用戶按讚時，自動更新用戶總按讚數

### update_app_likes_count
當應用被按讚時，自動更新應用按讚數

### update_user_total_views
當應用瀏覽數更新時，自動更新用戶總瀏覽數

## 📈 索引優化

### 主要索引
- `users.email` - 用戶郵箱查詢
- `users.role` - 角色權限查詢
- `competitions.status` - 競賽狀態查詢
- `apps.likes_count` - 人氣排序
- `apps.rating` - 評分排序

### 複合索引
- `competitions.year, competitions.month` - 時間範圍查詢
- `competitions.start_date, competitions.end_date` - 日期範圍查詢

## 🔒 安全性

### 密碼加密
使用 bcrypt 進行密碼雜湊，鹽值輪數為 10

### 外鍵約束
所有關聯表都設定了適當的外鍵約束，確保資料完整性

### 唯一約束
- 用戶郵箱唯一
- 用戶每日按讚限制
- 評審對同一作品只能評分一次

## 📊 性能監控

### 查詢統計
```sql
-- 查看慢查詢
SHOW VARIABLES LIKE 'slow_query_log';
SHOW VARIABLES LIKE 'long_query_time';

-- 查看連接數
SHOW STATUS LIKE 'Threads_connected';
SHOW STATUS LIKE 'Max_used_connections';
```

### 資料表大小
```sql
SELECT 
    table_name,
    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Size (MB)'
FROM information_schema.tables 
WHERE table_schema = 'db_AI_Platform'
ORDER BY (data_length + index_length) DESC;
```

## 🚨 故障排除

### 常見問題

#### 1. 連接失敗
```bash
# 檢查網路連接
ping mysql.theaken.com

# 檢查埠號
telnet mysql.theaken.com 33306
```

#### 2. 權限錯誤
```sql
-- 檢查用戶權限
SHOW GRANTS FOR 'AI_Platform'@'%';
```

#### 3. 資料表不存在
```bash
# 重新執行建立腳本
pnpm run db:setup
```

#### 4. 密碼錯誤
```bash
# 檢查環境變數
echo $DB_PASSWORD
```

## 📝 維護指南

### 定期備份
```bash
# 建立備份
mysqldump -h mysql.theaken.com -P 33306 -u AI_Platform -p db_AI_Platform > backup_$(date +%Y%m%d).sql
```

### 資料清理
```sql
-- 清理過期的活動日誌 (保留30天)
DELETE FROM activity_logs WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY);

-- 清理過期的聊天會話 (保留7天)
DELETE FROM chat_sessions WHERE updated_at < DATE_SUB(NOW(), INTERVAL 7 DAY);
```

### 性能優化
```sql
-- 分析資料表
ANALYZE TABLE users, competitions, apps;

-- 優化資料表
OPTIMIZE TABLE users, competitions, apps;
```

## 🔄 版本更新

### 新增欄位
```sql
-- 範例：為 users 表新增欄位
ALTER TABLE users ADD COLUMN phone VARCHAR(20) AFTER email;
```

### 修改欄位
```sql
-- 範例：修改欄位類型
ALTER TABLE users MODIFY COLUMN department VARCHAR(150);
```

### 新增索引
```sql
-- 範例：新增複合索引
CREATE INDEX idx_user_department_role ON users(department, role);
```

---

**最後更新**: 2025年1月  
**維護者**: AI展示平台開發團隊 