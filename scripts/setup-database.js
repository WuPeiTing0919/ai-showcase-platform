const fs = require('fs');
const path = require('path');
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
      database: undefined // 先不指定資料庫，因為可能不存在
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
    
    // 4. 讀取並執行SQL腳本
    console.log('📝 執行資料庫建立腳本...');
    const sqlScript = fs.readFileSync(path.join(__dirname, '../database_setup_simple.sql'), 'utf8');
    
    // 分割SQL語句並執行
    const statements = sqlScript
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
      .map(stmt => stmt + ';'); // 重新添加分號
    
    console.log(`📋 找到 ${statements.length} 個SQL語句`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim() && statement.trim() !== ';') {
        try {
          console.log(`執行語句 ${i + 1}/${statements.length}: ${statement.substring(0, 50)}...`);
          await connection.query(statement);
        } catch (error) {
          // 忽略一些非關鍵錯誤（如表已存在等）
          if (!error.message.includes('already exists') && 
              !error.message.includes('Duplicate key') &&
              !error.message.includes('Duplicate entry')) {
            console.error(`SQL執行錯誤 (語句 ${i + 1}):`, error.message);
            console.error('問題語句:', statement.substring(0, 100));
          }
        }
      }
    }
    
    console.log('✅ 資料庫建立完成!');
    
    // 5. 驗證建立結果
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