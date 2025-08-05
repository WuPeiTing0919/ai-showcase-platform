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

async function fixTables() {
  let connection;
  
  try {
    console.log('🔧 修復剩餘的資料表...');
    
    // 連接資料庫
    connection = await mysql.createConnection(dbConfig);
    
    // 修復 awards 表 (rank 是保留字)
    console.log('修復 awards 表...');
    const awardsTable = `
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
        award_rank INT DEFAULT 0,
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
      )
    `;
    
    await connection.query(awardsTable);
    console.log('✅ awards 表建立成功');
    
    // 修復 user_likes 表 (DATE() 函數在唯一約束中的問題)
    console.log('修復 user_likes 表...');
    const userLikesTable = `
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
      )
    `;
    
    await connection.query(userLikesTable);
    console.log('✅ user_likes 表建立成功');
    
    // 驗證修復結果
    console.log('\n📋 驗證修復結果...');
    
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
    
    if (successCount === expectedTables.length) {
      console.log('🎉 所有資料表建立完成!');
    } else {
      console.log('⚠️ 仍有部分資料表未建立');
    }
    
  } catch (error) {
    console.error('❌ 修復資料表失敗:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 資料庫連接已關閉');
    }
  }
}

// 執行修復腳本
if (require.main === module) {
  fixTables();
}

module.exports = { fixTables }; 