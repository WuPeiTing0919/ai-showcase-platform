const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

const dbConfig = {
  host: process.env.DB_HOST || 'mysql.theaken.com',
  port: parseInt(process.env.DB_PORT || '33306'),
  user: process.env.DB_USER || 'AI_Platform',
  password: process.env.DB_PASSWORD || 'Aa123456',
  database: process.env.DB_NAME || 'db_AI_Platform',
  charset: 'utf8mb4',
  timezone: '+08:00'
};

async function checkUserPasswords() {
  let connection;
  
  try {
    console.log('🔍 檢查用戶密碼...');
    
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 資料庫連接成功');
    
    // 檢查用戶密碼哈希
    console.log('\n📊 用戶密碼哈希:');
    const [users] = await connection.execute('SELECT id, name, email, password_hash FROM users');
    
    for (const user of users) {
      console.log(`\n用戶: ${user.name} (${user.email})`);
      console.log(`密碼哈希: ${user.password_hash}`);
      
      // 測試一些常見密碼
      const testPasswords = ['Admin123', 'admin123', 'password', '123456', 'admin'];
      
      for (const password of testPasswords) {
        const isValid = await bcrypt.compare(password, user.password_hash);
        if (isValid) {
          console.log(`✅ 找到正確密碼: ${password}`);
          break;
        }
      }
    }
    
  } catch (error) {
    console.error('❌ 檢查失敗:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkUserPasswords(); 