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

async function fixUserLikes() {
  let connection;
  
  try {
    console.log('🔧 修復 user_likes 表...');
    
    // 連接資料庫
    connection = await mysql.createConnection(dbConfig);
    
    // 先刪除可能存在的表
    try {
      await connection.query('DROP TABLE IF EXISTS user_likes');
      console.log('✅ 刪除舊的 user_likes 表');
    } catch (error) {
      console.log('沒有舊表需要刪除');
    }
    
    // 建立簡化版的 user_likes 表
    const userLikesTable = `
      CREATE TABLE user_likes (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        app_id VARCHAR(36),
        proposal_id VARCHAR(36),
        liked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (app_id) REFERENCES apps(id) ON DELETE CASCADE,
        FOREIGN KEY (proposal_id) REFERENCES proposals(id) ON DELETE CASCADE,
        INDEX idx_user (user_id),
        INDEX idx_app (app_id),
        INDEX idx_proposal (proposal_id),
        INDEX idx_date (liked_at)
      )
    `;
    
    await connection.query(userLikesTable);
    console.log('✅ user_likes 表建立成功');
    
    // 驗證結果
    const [tables] = await connection.query(`
      SELECT TABLE_NAME, TABLE_ROWS 
      FROM information_schema.tables 
      WHERE table_schema = '${dbConfig.database}' AND TABLE_NAME = 'user_likes'
    `);
    
    if (tables.length > 0) {
      console.log('✅ user_likes 表驗證成功');
    } else {
      console.log('❌ user_likes 表建立失敗');
    }
    
  } catch (error) {
    console.error('❌ 修復 user_likes 表失敗:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 資料庫連接已關閉');
    }
  }
}

// 執行修復腳本
if (require.main === module) {
  fixUserLikes();
}

module.exports = { fixUserLikes }; 