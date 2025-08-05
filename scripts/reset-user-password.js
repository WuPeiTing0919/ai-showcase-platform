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

async function resetUserPassword() {
  let connection;
  
  try {
    console.log('🔧 重置用戶密碼...');
    
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 資料庫連接成功');
    
    // 新密碼
    const newPassword = 'Admin123';
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    console.log(`\n新密碼: ${newPassword}`);
    console.log(`密碼哈希: ${hashedPassword}`);
    
    // 重置所有管理員用戶的密碼
    const adminEmails = [
      'admin@theaken.com',
      'admin@example.com',
      'petty091901@gmail.com'
    ];
    
    for (const email of adminEmails) {
      try {
        await connection.execute(
          'UPDATE users SET password_hash = ? WHERE email = ?',
          [hashedPassword, email]
        );
        
        console.log(`✅ 已重置 ${email} 的密碼`);
      } catch (error) {
        console.error(`❌ 重置 ${email} 密碼失敗:`, error.message);
      }
    }
    
    console.log('\n🎉 密碼重置完成！');
    console.log('現在可以使用以下憑證登入:');
    console.log('電子郵件: admin@theaken.com');
    console.log('密碼: Admin123');
    
  } catch (error) {
    console.error('❌ 重置失敗:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

resetUserPassword(); 