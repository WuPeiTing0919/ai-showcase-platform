const mysql = require('mysql2/promise');

// 資料庫配置
const dbConfig = {
  host: process.env.DB_HOST || 'mysql.theaken.com',
  port: parseInt(process.env.DB_PORT || '33306'),
  user: process.env.DB_USER || 'AI_Platform',
  password: process.env.DB_PASSWORD || 'Aa123456',
  database: process.env.DB_NAME || 'db_AI_Platform',
  charset: 'utf8mb4',
  timezone: '+08:00'
};

async function setupDatabase() {
  let connection;
  
  try {
    console.log('🚀 開始建立AI展示平台資料庫...');
    console.log('─'.repeat(50));
    
    // 1. 連接資料庫
    console.log('🔌 連接資料庫...');
    connection = await mysql.createConnection({
      ...dbConfig,
      database: undefined
    });
    
    // 2. 檢查資料庫是否存在
    const [databases] = await connection.query('SHOW DATABASES');
    const dbExists = databases.some(db => db.Database === dbConfig.database);
    
    if (!dbExists) {
      console.log(`📊 建立資料庫: ${dbConfig.database}`);
      await connection.query(`CREATE DATABASE ${dbConfig.database} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    } else {
      console.log(`✅ 資料庫已存在: ${dbConfig.database}`);
    }
    
    // 3. 切換到目標資料庫
    await connection.query(`USE ${dbConfig.database}`);
    
    // 4. 手動執行SQL語句
    console.log('📝 執行資料庫建立腳本...');
    
    const sqlStatements = [
      // 1. 用戶表
      `CREATE TABLE IF NOT EXISTS users (
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
      )`,
      
      // 2. 競賽表
      `CREATE TABLE IF NOT EXISTS competitions (
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
      )`,
      
      // 3. 評審表
      `CREATE TABLE IF NOT EXISTS judges (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        title VARCHAR(100) NOT NULL,
        department VARCHAR(100) NOT NULL,
        expertise JSON,
        avatar VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_department (department)
      )`,
      
      // 4. 團隊表
      `CREATE TABLE IF NOT EXISTS teams (
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
      )`,
      
      // 5. 團隊成員表
      `CREATE TABLE IF NOT EXISTS team_members (
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
      )`,
      
      // 6. 應用表
      `CREATE TABLE IF NOT EXISTS apps (
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
      )`,
      
      // 7. 提案表
      `CREATE TABLE IF NOT EXISTS proposals (
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
      )`,
      
      // 8. 評分表
      `CREATE TABLE IF NOT EXISTS judge_scores (
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
      )`,
      
      // 9. 獎項表
      `CREATE TABLE IF NOT EXISTS awards (
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
      )`,
      
      // 10. 聊天會話表
      `CREATE TABLE IF NOT EXISTS chat_sessions (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user (user_id),
        INDEX idx_created (created_at)
      )`,
      
      // 11. 聊天訊息表
      `CREATE TABLE IF NOT EXISTS chat_messages (
        id VARCHAR(36) PRIMARY KEY,
        session_id VARCHAR(36) NOT NULL,
        text TEXT NOT NULL,
        sender ENUM('user', 'bot') NOT NULL,
        quick_questions JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE,
        INDEX idx_session (session_id),
        INDEX idx_created (created_at)
      )`,
      
      // 12. AI助手配置表
      `CREATE TABLE IF NOT EXISTS ai_assistant_configs (
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
      )`,
      
      // 13. 用戶收藏表
      `CREATE TABLE IF NOT EXISTS user_favorites (
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
      )`,
      
      // 14. 用戶按讚表
      `CREATE TABLE IF NOT EXISTS user_likes (
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
      )`,
      
      // 15. 競賽參與表
      `CREATE TABLE IF NOT EXISTS competition_participants (
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
      )`,
      
      // 16. 競賽評審分配表
      `CREATE TABLE IF NOT EXISTS competition_judges (
        id VARCHAR(36) PRIMARY KEY,
        competition_id VARCHAR(36) NOT NULL,
        judge_id VARCHAR(36) NOT NULL,
        assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (competition_id) REFERENCES competitions(id) ON DELETE CASCADE,
        FOREIGN KEY (judge_id) REFERENCES judges(id) ON DELETE CASCADE,
        UNIQUE KEY unique_competition_judge (competition_id, judge_id),
        INDEX idx_competition (competition_id),
        INDEX idx_judge (judge_id)
      )`,
      
      // 17. 系統設定表
      `CREATE TABLE IF NOT EXISTS system_settings (
        id VARCHAR(36) PRIMARY KEY,
        setting_key VARCHAR(100) UNIQUE NOT NULL,
        setting_value TEXT,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_key (setting_key)
      )`,
      
      // 18. 活動日誌表
      `CREATE TABLE IF NOT EXISTS activity_logs (
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
      )`
    ];
    
    console.log(`📋 準備執行 ${sqlStatements.length} 個SQL語句`);
    
    for (let i = 0; i < sqlStatements.length; i++) {
      const statement = sqlStatements[i];
      try {
        console.log(`執行語句 ${i + 1}/${sqlStatements.length}: ${statement.substring(0, 50)}...`);
        await connection.query(statement);
      } catch (error) {
        console.error(`SQL執行錯誤 (語句 ${i + 1}):`, error.message);
      }
    }
    
    // 5. 插入初始數據
    console.log('\n📝 插入初始數據...');
    
    const insertStatements = [
      // 插入預設管理員用戶
      `INSERT IGNORE INTO users (id, name, email, password_hash, department, role, join_date) VALUES
       ('admin-001', '系統管理員', 'admin@theaken.com', '$2b$10$rQZ8K9mN2pL1vX3yU7wE4tA6sB8cD1eF2gH3iJ4kL5mN6oP7qR8sT9uV0wX1yZ2a', '資訊部', 'admin', '2025-01-01')`,
      
      // 插入預設評審
      `INSERT IGNORE INTO judges (id, name, title, department, expertise) VALUES
       ('judge-001', '張教授', '資深技術顧問', '研發部', '["AI", "機器學習", "深度學習"]'),
       ('judge-002', '李經理', '產品經理', '產品部', '["產品設計", "用戶體驗", "市場分析"]'),
       ('judge-003', '王工程師', '資深工程師', '技術部', '["軟體開發", "系統架構", "雲端技術"]')`,
      
      // 插入預設競賽
      `INSERT IGNORE INTO competitions (id, name, year, month, start_date, end_date, status, description, type, evaluation_focus, max_team_size) VALUES
       ('comp-2025-01', '2025年AI創新競賽', 2025, 1, '2025-01-15', '2025-03-15', 'upcoming', '年度AI技術創新競賽，鼓勵員工開發創新AI應用', 'mixed', '創新性、技術實現、實用價值', 5),
       ('comp-2025-02', '2025年提案競賽', 2025, 2, '2025-02-01', '2025-04-01', 'upcoming', 'AI解決方案提案競賽', 'proposal', '解決方案可行性、創新程度、商業價值', NULL)`,
      
      // 插入AI助手配置
      `INSERT IGNORE INTO ai_assistant_configs (id, api_key, api_url, model, max_tokens, temperature, system_prompt, is_active) VALUES
       ('ai-config-001', 'your_deepseek_api_key_here', 'https://api.deepseek.com/v1/chat/completions', 'deepseek-chat', 200, 0.7, '你是一個AI展示平台的智能助手，專門協助用戶使用平台功能。請用友善、專業的態度回答問題。', TRUE)`,
      
      // 插入系統設定
      `INSERT IGNORE INTO system_settings (setting_key, setting_value, description) VALUES
       ('daily_like_limit', '5', '用戶每日按讚限制'),
       ('max_team_size', '5', '最大團隊人數'),
       ('competition_registration_deadline', '7', '競賽報名截止天數'),
       ('judge_score_weight_innovation', '25', '創新性評分權重'),
       ('judge_score_weight_technical', '25', '技術性評分權重'),
       ('judge_score_weight_usability', '20', '實用性評分權重'),
       ('judge_score_weight_presentation', '15', '展示效果評分權重'),
       ('judge_score_weight_impact', '15', '影響力評分權重')`
    ];
    
    for (let i = 0; i < insertStatements.length; i++) {
      const statement = insertStatements[i];
      try {
        console.log(`插入數據 ${i + 1}/${insertStatements.length}...`);
        await connection.query(statement);
      } catch (error) {
        console.error(`插入數據錯誤 (語句 ${i + 1}):`, error.message);
      }
    }
    
    console.log('✅ 資料庫建立完成!');
    
    // 6. 驗證建立結果
    console.log('\n📋 驗證資料庫結構...');
    
    // 檢查資料表
    const [tables] = await connection.query(`
      SELECT TABLE_NAME, TABLE_ROWS 
      FROM information_schema.tables 
      WHERE table_schema = '${dbConfig.database}'
      ORDER BY TABLE_NAME
    `);
    
    console.log('\n📊 資料表列表:');
    console.log('─'.repeat(60));
    console.log('表名'.padEnd(25) + '| 記錄數'.padEnd(10) + '| 狀態');
    console.log('─'.repeat(60));
    
    const expectedTables = [
      'users', 'competitions', 'judges', 'teams', 'team_members',
      'apps', 'proposals', 'judge_scores', 'awards', 'chat_sessions',
      'chat_messages', 'ai_assistant_configs', 'user_favorites',
      'user_likes', 'competition_participants', 'competition_judges',
      'system_settings', 'activity_logs'
    ];
    
    let successCount = 0;
    for (const expectedTable of expectedTables) {
      const table = tables.find(t => t.TABLE_NAME === expectedTable);
      const status = table ? '✅' : '❌';
      const rowCount = table ? (table.TABLE_ROWS || 0) : 'N/A';
      console.log(`${expectedTable.padEnd(25)}| ${rowCount.toString().padEnd(10)}| ${status}`);
      if (table) successCount++;
    }
    
    console.log(`\n📊 成功建立 ${successCount}/${expectedTables.length} 個資料表`);
    
    // 檢查初始數據
    console.log('\n📊 初始數據檢查:');
    console.log('─'.repeat(40));
    
    const checks = [
      { name: '管理員用戶', query: 'SELECT COUNT(*) as count FROM users WHERE role = "admin"' },
      { name: '預設評審', query: 'SELECT COUNT(*) as count FROM judges' },
      { name: '預設競賽', query: 'SELECT COUNT(*) as count FROM competitions' },
      { name: 'AI配置', query: 'SELECT COUNT(*) as count FROM ai_assistant_configs' },
      { name: '系統設定', query: 'SELECT COUNT(*) as count FROM system_settings' }
    ];
    
    for (const check of checks) {
      try {
        const [result] = await connection.query(check.query);
        console.log(`${check.name.padEnd(15)}: ${result[0].count} 筆`);
      } catch (error) {
        console.log(`${check.name.padEnd(15)}: 查詢失敗 - ${error.message}`);
      }
    }
    
    console.log('\n🎉 資料庫建立和驗證完成!');
    console.log('\n📝 下一步:');
    console.log('1. 複製 env.example 到 .env.local');
    console.log('2. 設定環境變數');
    console.log('3. 安裝依賴: pnpm install');
    console.log('4. 啟動開發服務器: pnpm dev');
    
  } catch (error) {
    console.error('❌ 資料庫建立失敗:', error.message);
    console.error('請檢查以下項目:');
    console.error('1. 資料庫主機是否可達');
    console.error('2. 用戶名和密碼是否正確');
    console.error('3. 用戶是否有建立資料庫的權限');
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 資料庫連接已關閉');
    }
  }
}

// 執行建立腳本
if (require.main === module) {
  setupDatabase();
}

module.exports = { setupDatabase }; 