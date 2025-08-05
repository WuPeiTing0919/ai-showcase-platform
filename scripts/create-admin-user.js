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

async function createAdminUser() {
  let connection;
  try {
    console.log('🧪 創建管理員用戶...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 資料庫連接成功');

    // 創建管理員用戶
    const adminUserData = {
      id: 'admin-' + Date.now(),
      name: '系統管理員',
      email: 'admin@example.com',
      password: 'Admin123!',
      department: 'ITBU',
      role: 'admin',
      join_date: new Date(),
      created_at: new Date(),
      updated_at: new Date()
    };

    // 加密密碼
    const passwordHash = await bcrypt.hash(adminUserData.password, 12);

    // 檢查用戶是否已存在
    const [existingUser] = await connection.execute(
      'SELECT id FROM users WHERE email = ?',
      [adminUserData.email]
    );

    if (existingUser.length > 0) {
      console.log('⚠️ 管理員用戶已存在，更新密碼...');
      await connection.execute(
        'UPDATE users SET password_hash = ?, updated_at = NOW() WHERE email = ?',
        [passwordHash, adminUserData.email]
      );
    } else {
      console.log('✅ 創建新的管理員用戶...');
      await connection.execute(
        'INSERT INTO users (id, name, email, password_hash, department, role, join_date, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [adminUserData.id, adminUserData.name, adminUserData.email, passwordHash, adminUserData.department, adminUserData.role, adminUserData.join_date, adminUserData.created_at, adminUserData.updated_at]
      );
    }

    console.log('\n✅ 管理員用戶創建/更新成功！');
    console.log('📋 登入資訊:');
    console.log(`  電子郵件: ${adminUserData.email}`);
    console.log(`  密碼: ${adminUserData.password}`);
    console.log(`  角色: ${adminUserData.role}`);
    console.log(`  部門: ${adminUserData.department}`);

    // 驗證用戶創建
    const [userResult] = await connection.execute(
      'SELECT id, name, email, role, department FROM users WHERE email = ?',
      [adminUserData.email]
    );

    if (userResult.length > 0) {
      const user = userResult[0];
      console.log('\n📋 資料庫中的用戶資訊:');
      console.log(`  ID: ${user.id}`);
      console.log(`  姓名: ${user.name}`);
      console.log(`  電子郵件: ${user.email}`);
      console.log(`  角色: ${user.role}`);
      console.log(`  部門: ${user.department}`);
    }

    console.log('\n💡 現在您可以使用這些憑證登入管理後台');
    console.log('💡 登入後，管理後台的應用創建功能應該可以正常工作');

  } catch (error) {
    console.error('❌ 創建管理員用戶失敗:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 資料庫連接已關閉');
    }
  }
}

createAdminUser().catch(console.error); 