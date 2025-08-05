const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

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

// 生成 UUID
function generateId() {
  return crypto.randomUUID();
}

// 加密密碼
async function hashPassword(password) {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

async function createAdmin() {
  let connection;

  try {
    console.log('🔌 連接資料庫...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 資料庫連接成功');

    // 管理員資料
    const adminData = {
      id: generateId(),
      name: 'AI平台管理員',
      email: 'admin@theaken.com',
      password: 'Admin@2024',
      department: '資訊技術部',
      role: 'admin'
    };

    console.log('\n📋 準備建立管理員帳號:');
    console.log(`   姓名: ${adminData.name}`);
    console.log(`   電子郵件: ${adminData.email}`);
    console.log(`   部門: ${adminData.department}`);
    console.log(`   角色: ${adminData.role}`);

    // 檢查是否已存在
    const [existingUser] = await connection.execute(
      'SELECT id FROM users WHERE email = ?',
      [adminData.email]
    );

    if (existingUser.length > 0) {
      console.log('\n⚠️  管理員帳號已存在，更新密碼...');
      
      // 加密新密碼
      const passwordHash = await hashPassword(adminData.password);
      
      // 更新密碼
      await connection.execute(
        'UPDATE users SET password_hash = ?, updated_at = NOW() WHERE email = ?',
        [passwordHash, adminData.email]
      );
      
      console.log('✅ 管理員密碼已更新');
    } else {
      console.log('\n📝 建立新的管理員帳號...');
      
      // 加密密碼
      const passwordHash = await hashPassword(adminData.password);
      
      // 插入管理員資料
      await connection.execute(`
        INSERT INTO users (
          id, name, email, password_hash, department, role, 
          join_date, total_likes, total_views, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, CURDATE(), 0, 0, NOW(), NOW())
      `, [
        adminData.id,
        adminData.name,
        adminData.email,
        passwordHash,
        adminData.department,
        adminData.role
      ]);
      
      console.log('✅ 管理員帳號建立成功');
    }

    // 驗證建立結果
    console.log('\n🔍 驗證管理員帳號...');
    const [adminUser] = await connection.execute(
      'SELECT id, name, email, department, role, created_at FROM users WHERE email = ?',
      [adminData.email]
    );

    if (adminUser.length > 0) {
      const user = adminUser[0];
      console.log('✅ 管理員帳號驗證成功:');
      console.log(`   ID: ${user.id}`);
      console.log(`   姓名: ${user.name}`);
      console.log(`   電子郵件: ${user.email}`);
      console.log(`   部門: ${user.department}`);
      console.log(`   角色: ${user.role}`);
      console.log(`   建立時間: ${user.created_at}`);
    }

    console.log('\n🎉 管理員帳號設定完成!');
    console.log('\n📋 登入資訊:');
    console.log(`   電子郵件: ${adminData.email}`);
    console.log(`   密碼: ${adminData.password}`);
    console.log('\n⚠️  請妥善保管登入資訊，建議在首次登入後更改密碼');

  } catch (error) {
    console.error('❌ 建立管理員帳號失敗:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 資料庫連接已關閉');
    }
  }
}

// 如果直接執行此腳本
if (require.main === module) {
  createAdmin();
}

module.exports = { createAdmin }; 