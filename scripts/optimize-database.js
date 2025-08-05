const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || 'mysql.theaken.com',
  user: process.env.DB_USER || 'AI_Platform',
  password: process.env.DB_PASSWORD || 'Aa123456',
  database: process.env.DB_NAME || 'db_AI_Platform',
  port: process.env.DB_PORT || 33306
};

async function optimizeDatabase() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('🔗 連接到資料庫...');

    // 檢查並創建索引
    const indexes = [
      // users 表索引
      { table: 'users', column: 'role', name: 'idx_users_role' },
      { table: 'users', column: 'status', name: 'idx_users_status' },
      { table: 'users', column: 'created_at', name: 'idx_users_created_at' },
      { table: 'users', column: 'email', name: 'idx_users_email' },
      
      // apps 表索引
      { table: 'apps', column: 'creator_id', name: 'idx_apps_creator_id' },
      { table: 'apps', column: 'created_at', name: 'idx_apps_created_at' },
      
      // judge_scores 表索引
      { table: 'judge_scores', column: 'judge_id', name: 'idx_judge_scores_judge_id' },
      { table: 'judge_scores', column: 'created_at', name: 'idx_judge_scores_created_at' }
    ];

    for (const index of indexes) {
      try {
        // 檢查索引是否存在
        const [existingIndexes] = await connection.execute(`
          SELECT INDEX_NAME 
          FROM INFORMATION_SCHEMA.STATISTICS 
          WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND INDEX_NAME = ?
        `, [dbConfig.database, index.table, index.name]);

        if (existingIndexes.length === 0) {
          // 創建索引
          await connection.execute(`
            CREATE INDEX ${index.name} ON ${index.table} (${index.column})
          `);
          console.log(`✅ 創建索引: ${index.name} on ${index.table}.${index.column}`);
        } else {
          console.log(`ℹ️  索引已存在: ${index.name}`);
        }
      } catch (error) {
        console.error(`❌ 創建索引失敗 ${index.name}:`, error.message);
      }
    }

    // 檢查表結構和統計信息
    console.log('\n📊 資料庫優化完成！');
    
    // 顯示表統計信息
    const [tables] = await connection.execute(`
      SELECT 
        TABLE_NAME,
        TABLE_ROWS,
        DATA_LENGTH,
        INDEX_LENGTH
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = ?
    `, [dbConfig.database]);

    console.log('\n📋 表統計信息:');
    tables.forEach(table => {
      const dataSize = Math.round(table.DATA_LENGTH / 1024);
      const indexSize = Math.round(table.INDEX_LENGTH / 1024);
      console.log(`  ${table.TABLE_NAME}: ${table.TABLE_ROWS} 行, 資料 ${dataSize}KB, 索引 ${indexSize}KB`);
    });

  } catch (error) {
    console.error('❌ 資料庫優化失敗:', error.message);
    throw error;
  } finally {
    if (connection) await connection.end();
  }
}

optimizeDatabase()
  .then(() => {
    console.log('✅ 資料庫優化完成！');
    process.exit(0);
  })
  .catch(() => {
    console.error('❌ 資料庫優化失敗！');
    process.exit(1);
  }); 