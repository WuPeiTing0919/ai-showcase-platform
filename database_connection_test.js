const mysql = require('mysql2/promise');

// 資料庫配置
const dbConfig = {
  host: 'mysql.theaken.com',
  port: 33306,
  user: 'AI_Platform',
  password: 'Aa123456',
  database: 'db_AI_Platform',
  charset: 'utf8mb4',
  timezone: '+08:00'
};

async function testDatabaseConnection() {
  let connection;
  
  try {
    console.log('🔌 正在連接資料庫...');
    console.log(`主機: ${dbConfig.host}:${dbConfig.port}`);
    console.log(`資料庫: ${dbConfig.database}`);
    console.log(`用戶: ${dbConfig.user}`);
    
    // 建立連接
    connection = await mysql.createConnection(dbConfig);
    
    console.log('✅ 資料庫連接成功!');
    
    // 測試查詢
    const [rows] = await connection.execute('SELECT VERSION() as version');
    console.log(`📊 MySQL版本: ${rows[0].version}`);
    
    // 檢查資料表
    const [tables] = await connection.execute(`
      SELECT TABLE_NAME, TABLE_ROWS 
      FROM information_schema.tables 
      WHERE table_schema = '${dbConfig.database}'
      ORDER BY TABLE_NAME
    `);
    
    console.log('\n📋 資料表列表:');
    console.log('─'.repeat(50));
    tables.forEach(table => {
      console.log(`${table.TABLE_NAME.padEnd(25)} | ${table.TABLE_ROWS || 0} 筆記錄`);
    });
    
    // 檢查用戶數量
    const [userCount] = await connection.execute('SELECT COUNT(*) as count FROM users');
    console.log(`\n👥 用戶數量: ${userCount[0].count}`);
    
    // 檢查競賽數量
    const [compCount] = await connection.execute('SELECT COUNT(*) as count FROM competitions');
    console.log(`🏆 競賽數量: ${compCount[0].count}`);
    
    // 檢查評審數量
    const [judgeCount] = await connection.execute('SELECT COUNT(*) as count FROM judges');
    console.log(`👨‍⚖️ 評審數量: ${judgeCount[0].count}`);
    
    console.log('\n🎉 資料庫連接測試完成!');
    
  } catch (error) {
    console.error('❌ 資料庫連接失敗:', error.message);
    console.error('請檢查以下項目:');
    console.error('1. 資料庫主機是否可達');
    console.error('2. 連接埠是否正確');
    console.error('3. 用戶名和密碼是否正確');
    console.error('4. 資料庫是否存在');
    console.error('5. 用戶是否有足夠權限');
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 資料庫連接已關閉');
    }
  }
}

// 執行測試
testDatabaseConnection(); 