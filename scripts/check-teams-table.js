const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || 'mysql.theaken.com',
  port: parseInt(process.env.DB_PORT || '33306'),
  user: process.env.DB_USER || 'AI_Platform',
  password: process.env.DB_PASSWORD || 'Aa123456',
  database: process.env.DB_NAME || 'db_AI_Platform',
  charset: 'utf8mb4',
  timezone: '+08:00'
};

async function checkTeamsTable() {
  let connection;
  
  try {
    console.log('🔍 檢查 teams 表...');
    
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 資料庫連接成功');
    
    // 檢查所有表
    console.log('\n📋 所有表:');
    const [tables] = await connection.execute('SHOW TABLES');
    console.table(tables);
    
    // 檢查 teams 表是否存在
    console.log('\n🔍 檢查 teams 表是否存在...');
    const [teamsTable] = await connection.execute("SHOW TABLES LIKE 'teams'");
    
    if (teamsTable.length > 0) {
      console.log('✅ teams 表存在');
      
      // 檢查 teams 表結構
      console.log('\n📋 Teams 表結構:');
      const [teamsStructure] = await connection.execute('DESCRIBE teams');
      console.table(teamsStructure);
      
      // 檢查 teams 表資料
      console.log('\n📊 Teams 表資料:');
      const [teamsData] = await connection.execute('SELECT * FROM teams LIMIT 5');
      console.table(teamsData);
    } else {
      console.log('❌ teams 表不存在');
    }
    
    // 測試簡單的 apps 查詢
    console.log('\n🧪 測試簡單的 apps 查詢...');
    const [appsData] = await connection.execute('SELECT id, name, type, status, creator_id FROM apps LIMIT 5');
    console.table(appsData);
    
  } catch (error) {
    console.error('❌ 檢查失敗:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkTeamsTable(); 