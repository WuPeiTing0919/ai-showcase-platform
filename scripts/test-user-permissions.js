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

async function testUserPermissions() {
  let connection;
  try {
    console.log('🧪 測試用戶權限和認證狀態...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 資料庫連接成功');

    // 檢查現有用戶
    const [users] = await connection.execute('SELECT id, name, email, role, department FROM users ORDER BY created_at DESC LIMIT 5');
    
    console.log('\n📋 資料庫中的用戶列表:');
    users.forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.name} (${user.email}) - 角色: ${user.role} - 部門: ${user.department}`);
    });

    // 檢查應用程式
    const [apps] = await connection.execute('SELECT id, name, creator_id, type, status FROM apps ORDER BY created_at DESC LIMIT 5');
    
    console.log('\n📋 資料庫中的應用程式列表:');
    apps.forEach((app, index) => {
      console.log(`  ${index + 1}. ${app.name} - 創建者: ${app.creator_id} - 類型: ${app.type} - 狀態: ${app.status}`);
    });

    // 創建一個管理員用戶用於測試
    const adminUserData = {
      id: 'admin-test-' + Date.now(),
      name: '測試管理員',
      email: 'admin-test@example.com',
      password_hash: 'test_hash',
      department: 'ITBU',
      role: 'admin',
      join_date: new Date(),
      created_at: new Date(),
      updated_at: new Date()
    };

    await connection.execute(
      'INSERT INTO users (id, name, email, password_hash, department, role, join_date, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [adminUserData.id, adminUserData.name, adminUserData.email, adminUserData.password_hash, adminUserData.department, adminUserData.role, adminUserData.join_date, adminUserData.created_at, adminUserData.updated_at]
    );
    console.log('\n✅ 測試管理員用戶創建成功');

    // 模擬 API 調用
    console.log('\n🧪 模擬 API 調用測試...');
    
    // 這裡我們需要模擬一個有效的 JWT token
    // 在實際環境中，這個 token 應該通過登入 API 獲得
    console.log('💡 提示：要測試 API 調用，需要先通過登入 API 獲得有效的 JWT token');
    console.log('💡 建議：在瀏覽器中登入管理後台，然後檢查 localStorage 中的 token');

    // 清理測試資料
    await connection.execute('DELETE FROM users WHERE id = ?', [adminUserData.id]);
    console.log('✅ 測試資料清理完成');

  } catch (error) {
    console.error('❌ 測試失敗:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 資料庫連接已關閉');
    }
  }
}

testUserPermissions().catch(console.error); 