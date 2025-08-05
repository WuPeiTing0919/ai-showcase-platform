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

async function testDBConnection() {
  let connection;
  
  try {
    console.log('🧪 測試資料庫連接...');
    
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 資料庫連接成功');
    
    // 測試查詢用戶
    console.log('\n1. 測試查詢用戶...');
    const [users] = await connection.execute(
      'SELECT id, name, email, role FROM users WHERE id = ? AND email = ?',
      ['mdxxt1xt7slle4g8wz8', 'petty091901@gmail.com']
    );
    
    console.log('查詢結果:', users);
    
    if (users.length > 0) {
      console.log('✅ 用戶查詢成功');
    } else {
      console.log('❌ 用戶查詢失敗 - 沒有找到用戶');
    }
    
    // 測試查詢所有用戶
    console.log('\n2. 測試查詢所有用戶...');
    const [allUsers] = await connection.execute(
      'SELECT id, name, email, role FROM users LIMIT 5'
    );
    
    console.log('所有用戶:', allUsers);
    
  } catch (error) {
    console.error('❌ 測試失敗:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

testDBConnection(); 