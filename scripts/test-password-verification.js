const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function testPasswordVerification() {
  console.log('=== 測試密碼驗證 ===');
  
  try {
    const connection = await mysql.createConnection({
      host: 'mysql.theaken.com',
      port: 33306,
      user: 'AI_Platform',
      password: 'Aa123456',
      database: 'db_AI_Platform'
    });

    console.log('✅ 資料庫連接成功');

    // 測試密碼
    const testPasswords = [
      'Admin123!',
      'Admin@2024',
      'admin123',
      'password',
      '123456'
    ];

    // 查詢管理員用戶
    const [rows] = await connection.execute(`
      SELECT id, name, email, role, password_hash
      FROM users 
      WHERE role = 'admin'
      ORDER BY created_at DESC
    `);

    console.log(`\n找到 ${rows.length} 個管理員用戶:`);
    
    for (const user of rows) {
      console.log(`\n用戶: ${user.name} (${user.email})`);
      console.log(`密碼雜湊: ${user.password_hash}`);
      
      // 測試每個密碼
      for (const password of testPasswords) {
        try {
          const isValid = await bcrypt.compare(password, user.password_hash);
          if (isValid) {
            console.log(`✅ 密碼匹配: "${password}"`);
          }
        } catch (error) {
          console.log(`❌ 密碼驗證錯誤: ${error.message}`);
        }
      }
    }

    await connection.end();
  } catch (error) {
    console.error('❌ 資料庫連接失敗:', error.message);
  }
}

testPasswordVerification().catch(console.error); 