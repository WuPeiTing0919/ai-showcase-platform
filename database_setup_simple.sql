-- AI展示平台資料庫建立腳本 (簡化版)
-- 資料庫: db_AI_Platform
-- 主機: mysql.theaken.com:33306
-- 用戶: AI_Platform

-- 使用資料庫
USE db_AI_Platform;

-- 1. 用戶表 (users)
CREATE TABLE IF NOT EXISTS users (
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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_department (department),
    INDEX idx_role (role)
);

-- 2. 競賽表 (competitions)
CREATE TABLE IF NOT EXISTS competitions (
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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_type (type),
    INDEX idx_year_month (year, month),
    INDEX idx_dates (start_date, end_date)
);

-- 3. 評審表 (judges)
CREATE TABLE IF NOT EXISTS judges (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    title VARCHAR(100) NOT NULL,
    department VARCHAR(100) NOT NULL,
    expertise JSON,
    avatar VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_department (department)
);

-- 4. 團隊表 (teams)
CREATE TABLE IF NOT EXISTS teams (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    leader_id VARCHAR(36) NOT NULL,
    department VARCHAR(100) NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    total_likes INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (leader_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_department (department),
    INDEX idx_leader (leader_id)
);

-- 5. 團隊成員表 (team_members)
CREATE TABLE IF NOT EXISTS team_members (
    id VARCHAR(36) PRIMARY KEY,
    team_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    role VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_team_user (team_id, user_id),
    INDEX idx_team (team_id),
    INDEX idx_user (user_id)
);

-- 6. 應用表 (apps)
CREATE TABLE IF NOT EXISTS apps (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    creator_id VARCHAR(36) NOT NULL,
    team_id VARCHAR(36),
    likes_count INT DEFAULT 0,
    views_count INT DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL,
    INDEX idx_creator (creator_id),
    INDEX idx_team (team_id),
    INDEX idx_rating (rating),
    INDEX idx_likes (likes_count)
);

-- 7. 提案表 (proposals)
CREATE TABLE IF NOT EXISTS proposals (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    creator_id VARCHAR(36) NOT NULL,
    team_id VARCHAR(36),
    status ENUM('draft', 'submitted', 'under_review', 'approved', 'rejected') DEFAULT 'draft',
    likes_count INT DEFAULT 0,
    views_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL,
    INDEX idx_creator (creator_id),
    INDEX idx_status (status)
);

-- 8. 評分表 (judge_scores)
CREATE TABLE IF NOT EXISTS judge_scores (
    id VARCHAR(36) PRIMARY KEY,
    judge_id VARCHAR(36) NOT NULL,
    app_id VARCHAR(36),
    proposal_id VARCHAR(36),
    scores JSON NOT NULL,
    comments TEXT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (judge_id) REFERENCES judges(id) ON DELETE CASCADE,
    FOREIGN KEY (app_id) REFERENCES apps(id) ON DELETE CASCADE,
    FOREIGN KEY (proposal_id) REFERENCES proposals(id) ON DELETE CASCADE,
    UNIQUE KEY unique_judge_app (judge_id, app_id),
    UNIQUE KEY unique_judge_proposal (judge_id, proposal_id),
    INDEX idx_judge (judge_id),
    INDEX idx_app (app_id),
    INDEX idx_proposal (proposal_id)
);

-- 9. 獎項表 (awards)
CREATE TABLE IF NOT EXISTS awards (
    id VARCHAR(36) PRIMARY KEY,
    competition_id VARCHAR(36) NOT NULL,
    app_id VARCHAR(36),
    team_id VARCHAR(36),
    proposal_id VARCHAR(36),
    award_type ENUM('gold', 'silver', 'bronze', 'popular', 'innovation', 'technical', 'custom') NOT NULL,
    award_name VARCHAR(200) NOT NULL,
    score DECIMAL(5,2) NOT NULL,
    year INT NOT NULL,
    month INT NOT NULL,
    icon VARCHAR(50),
    custom_award_type_id VARCHAR(36),
    competition_type ENUM('individual', 'team', 'proposal') NOT NULL,
    rank INT DEFAULT 0,
    category ENUM('innovation', 'technical', 'practical', 'popular', 'teamwork', 'solution', 'creativity') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (competition_id) REFERENCES competitions(id) ON DELETE CASCADE,
    FOREIGN KEY (app_id) REFERENCES apps(id) ON DELETE SET NULL,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL,
    FOREIGN KEY (proposal_id) REFERENCES proposals(id) ON DELETE SET NULL,
    INDEX idx_competition (competition_id),
    INDEX idx_award_type (award_type),
    INDEX idx_year_month (year, month),
    INDEX idx_category (category)
);

-- 10. 聊天會話表 (chat_sessions)
CREATE TABLE IF NOT EXISTS chat_sessions (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_created (created_at)
);

-- 11. 聊天訊息表 (chat_messages)
CREATE TABLE IF NOT EXISTS chat_messages (
    id VARCHAR(36) PRIMARY KEY,
    session_id VARCHAR(36) NOT NULL,
    text TEXT NOT NULL,
    sender ENUM('user', 'bot') NOT NULL,
    quick_questions JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE,
    INDEX idx_session (session_id),
    INDEX idx_created (created_at)
);

-- 12. AI助手配置表 (ai_assistant_configs)
CREATE TABLE IF NOT EXISTS ai_assistant_configs (
    id VARCHAR(36) PRIMARY KEY,
    api_key VARCHAR(255) NOT NULL,
    api_url VARCHAR(500) NOT NULL,
    model VARCHAR(100) NOT NULL,
    max_tokens INT DEFAULT 200,
    temperature DECIMAL(3,2) DEFAULT 0.7,
    system_prompt TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_active (is_active)
);

-- 13. 用戶收藏表 (user_favorites)
CREATE TABLE IF NOT EXISTS user_favorites (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    app_id VARCHAR(36),
    proposal_id VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (app_id) REFERENCES apps(id) ON DELETE CASCADE,
    FOREIGN KEY (proposal_id) REFERENCES proposals(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_app (user_id, app_id),
    UNIQUE KEY unique_user_proposal (user_id, proposal_id),
    INDEX idx_user (user_id)
);

-- 14. 用戶按讚表 (user_likes)
CREATE TABLE IF NOT EXISTS user_likes (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    app_id VARCHAR(36),
    proposal_id VARCHAR(36),
    liked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (app_id) REFERENCES apps(id) ON DELETE CASCADE,
    FOREIGN KEY (proposal_id) REFERENCES proposals(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_app_date (user_id, app_id, DATE(liked_at)),
    UNIQUE KEY unique_user_proposal_date (user_id, proposal_id, DATE(liked_at)),
    INDEX idx_user (user_id),
    INDEX idx_app (app_id),
    INDEX idx_proposal (proposal_id),
    INDEX idx_date (liked_at)
);

-- 15. 競賽參與表 (competition_participants)
CREATE TABLE IF NOT EXISTS competition_participants (
    id VARCHAR(36) PRIMARY KEY,
    competition_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36),
    team_id VARCHAR(36),
    app_id VARCHAR(36),
    proposal_id VARCHAR(36),
    status ENUM('registered', 'submitted', 'approved', 'rejected') DEFAULT 'registered',
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (competition_id) REFERENCES competitions(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    FOREIGN KEY (app_id) REFERENCES apps(id) ON DELETE CASCADE,
    FOREIGN KEY (proposal_id) REFERENCES proposals(id) ON DELETE CASCADE,
    INDEX idx_competition (competition_id),
    INDEX idx_user (user_id),
    INDEX idx_team (team_id),
    INDEX idx_status (status)
);

-- 16. 競賽評審分配表 (competition_judges)
CREATE TABLE IF NOT EXISTS competition_judges (
    id VARCHAR(36) PRIMARY KEY,
    competition_id VARCHAR(36) NOT NULL,
    judge_id VARCHAR(36) NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (competition_id) REFERENCES competitions(id) ON DELETE CASCADE,
    FOREIGN KEY (judge_id) REFERENCES judges(id) ON DELETE CASCADE,
    UNIQUE KEY unique_competition_judge (competition_id, judge_id),
    INDEX idx_competition (competition_id),
    INDEX idx_judge (judge_id)
);

-- 17. 系統設定表 (system_settings)
CREATE TABLE IF NOT EXISTS system_settings (
    id VARCHAR(36) PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_key (setting_key)
);

-- 18. 活動日誌表 (activity_logs)
CREATE TABLE IF NOT EXISTS activity_logs (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36),
    action VARCHAR(100) NOT NULL,
    target_type ENUM('user', 'competition', 'app', 'proposal', 'team', 'award') NOT NULL,
    target_id VARCHAR(36),
    details JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_action (action),
    INDEX idx_target (target_type, target_id),
    INDEX idx_created (created_at)
);

-- 插入初始數據

-- 1. 插入預設管理員用戶 (密碼: admin123)
INSERT IGNORE INTO users (id, name, email, password_hash, department, role, join_date) VALUES
('admin-001', '系統管理員', 'admin@theaken.com', '$2b$10$rQZ8K9mN2pL1vX3yU7wE4tA6sB8cD1eF2gH3iJ4kL5mN6oP7qR8sT9uV0wX1yZ2a', '資訊部', 'admin', '2025-01-01');

-- 2. 插入預設評審
INSERT IGNORE INTO judges (id, name, title, department, expertise) VALUES
('judge-001', '張教授', '資深技術顧問', '研發部', '["AI", "機器學習", "深度學習"]'),
('judge-002', '李經理', '產品經理', '產品部', '["產品設計", "用戶體驗", "市場分析"]'),
('judge-003', '王工程師', '資深工程師', '技術部', '["軟體開發", "系統架構", "雲端技術"]');

-- 3. 插入預設競賽
INSERT IGNORE INTO competitions (id, name, year, month, start_date, end_date, status, description, type, evaluation_focus, max_team_size) VALUES
('comp-2025-01', '2025年AI創新競賽', 2025, 1, '2025-01-15', '2025-03-15', 'upcoming', '年度AI技術創新競賽，鼓勵員工開發創新AI應用', 'mixed', '創新性、技術實現、實用價值', 5),
('comp-2025-02', '2025年提案競賽', 2025, 2, '2025-02-01', '2025-04-01', 'upcoming', 'AI解決方案提案競賽', 'proposal', '解決方案可行性、創新程度、商業價值', NULL);

-- 4. 插入AI助手配置
INSERT IGNORE INTO ai_assistant_configs (id, api_key, api_url, model, max_tokens, temperature, system_prompt, is_active) VALUES
('ai-config-001', 'your_deepseek_api_key_here', 'https://api.deepseek.com/v1/chat/completions', 'deepseek-chat', 200, 0.7, '你是一個AI展示平台的智能助手，專門協助用戶使用平台功能。請用友善、專業的態度回答問題。', TRUE);

-- 5. 插入系統設定
INSERT IGNORE INTO system_settings (setting_key, setting_value, description) VALUES
('daily_like_limit', '5', '用戶每日按讚限制'),
('max_team_size', '5', '最大團隊人數'),
('competition_registration_deadline', '7', '競賽報名截止天數'),
('judge_score_weight_innovation', '25', '創新性評分權重'),
('judge_score_weight_technical', '25', '技術性評分權重'),
('judge_score_weight_usability', '20', '實用性評分權重'),
('judge_score_weight_presentation', '15', '展示效果評分權重'),
('judge_score_weight_impact', '15', '影響力評分權重');

-- 顯示建立結果
SELECT 'Database setup completed successfully!' as status; 