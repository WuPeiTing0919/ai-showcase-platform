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

async function checkDatabase() {
  let connection;
  
  try {
    console.log('🔍 檢查資料庫表結構...');
    
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 資料庫連接成功');
    
    // 檢查 apps 表結構
    console.log('\n📋 Apps 表結構:');
    const [appsStructure] = await connection.execute('DESCRIBE apps');
    console.table(appsStructure);
    
    // 檢查 apps 表資料
    console.log('\n📊 Apps 表資料:');
    const [appsData] = await connection.execute('SELECT id, name, type, status, creator_id FROM apps LIMIT 5');
    console.table(appsData);
    
    // 檢查 users 表結構
    console.log('\n👥 Users 表結構:');
    const [usersStructure] = await connection.execute('DESCRIBE users');
    console.table(usersStructure);
    
    // 檢查是否有開發者或管理員用戶
    console.log('\n🔑 檢查開發者/管理員用戶:');
    const [adminUsers] = await connection.execute('SELECT id, name, email, role FROM users WHERE role IN ("developer", "admin")');
    console.table(adminUsers);
    
    console.log('\n✅ 資料庫檢查完成');
    
  } catch (error) {
    console.error('❌ 檢查失敗:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkDatabase(); 