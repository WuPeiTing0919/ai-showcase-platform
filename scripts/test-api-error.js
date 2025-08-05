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

async function testApiError() {
  let connection;
  try {
    console.log('🧪 測試 API 錯誤...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 資料庫連接成功');

    // 檢查 apps 表結構
    const [describeResult] = await connection.execute('DESCRIBE apps');
    console.log('\n📋 apps 表結構:');
    describeResult.forEach(row => {
      console.log(`  ${row.Field}: ${row.Type} ${row.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${row.Default ? `DEFAULT ${row.Default}` : ''}`);
    });

    // 檢查是否有管理員用戶
    const [users] = await connection.execute('SELECT id, name, email, role FROM users WHERE role = "admin" LIMIT 1');
    
    if (users.length === 0) {
      console.log('\n⚠️ 沒有找到管理員用戶，創建一個...');
      
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

      const passwordHash = await bcrypt.hash(adminUserData.password, 12);

      await connection.execute(
        'INSERT INTO users (id, name, email, password_hash, department, role, join_date, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [adminUserData.id, adminUserData.name, adminUserData.email, passwordHash, adminUserData.department, adminUserData.role, adminUserData.join_date, adminUserData.created_at, adminUserData.updated_at]
      );
      
      console.log('✅ 管理員用戶創建成功');
    } else {
      console.log('\n✅ 找到管理員用戶:', users[0].email);
    }

    // 測試直接插入應用程式
    console.log('\n🧪 測試直接插入應用程式...');
    
    const testAppData = {
      id: 'test-app-' + Date.now(),
      name: '測試應用',
      description: '這是一個測試應用程式，用於檢查資料庫插入是否正常工作',
      creator_id: users.length > 0 ? users[0].id : 'admin-' + Date.now(),
      type: 'ai_model',
      demo_url: 'https://test.example.com',
      version: '1.0.0',
      status: 'draft'
    };

    try {
      await connection.execute(
        'INSERT INTO apps (id, name, description, creator_id, type, demo_url, version, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
        [testAppData.id, testAppData.name, testAppData.description, testAppData.creator_id, testAppData.type, testAppData.demo_url, testAppData.version, testAppData.status]
      );
      console.log('✅ 直接插入應用程式成功');

      // 清理測試資料
      await connection.execute('DELETE FROM apps WHERE id = ?', [testAppData.id]);
      console.log('✅ 測試資料清理完成');

    } catch (insertError) {
      console.error('❌ 直接插入失敗:', insertError.message);
      console.error('詳細錯誤:', insertError);
    }

    // 檢查資料庫連接狀態
    console.log('\n🧪 檢查資料庫連接狀態...');
    const [result] = await connection.execute('SELECT 1 as test');
    console.log('✅ 資料庫連接正常:', result[0]);

  } catch (error) {
    console.error('❌ 測試失敗:', error.message);
    console.error('詳細錯誤:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 資料庫連接已關閉');
    }
  }
}

testApiError().catch(console.error); 