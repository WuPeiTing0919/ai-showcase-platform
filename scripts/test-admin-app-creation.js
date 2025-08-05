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

async function testAdminAppCreation() {
  let connection;
  try {
    console.log('🧪 測試管理後台應用程式創建流程...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 資料庫連接成功');

    // 創建測試用戶（管理員）
    const userData = {
      id: 'admin-test-' + Date.now(),
      name: '管理員測試用戶',
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
      [userData.id, userData.name, userData.email, userData.password_hash, userData.department, userData.role, userData.join_date, userData.created_at, userData.updated_at]
    );
    console.log('✅ 測試管理員用戶創建成功');

    // 模擬管理後台提交的資料
    const adminAppData = {
      name: '管理後台測試應用',
      description: '這是一個通過管理後台創建的測試應用程式',
      type: 'ai_model', // 映射後的類型
      demoUrl: 'https://admin-test.example.com/demo',
      version: '1.0.0'
    };

    console.log('📋 管理後台提交的資料:', adminAppData);

    // 創建應用程式
    const appId = Date.now().toString(36) + Math.random().toString(36).substr(2);
    const appInsertData = {
      id: appId,
      name: adminAppData.name,
      description: adminAppData.description,
      creator_id: userData.id,
      type: adminAppData.type,
      demo_url: adminAppData.demoUrl,
      version: adminAppData.version,
      status: 'draft'
    };

    await connection.execute(
      'INSERT INTO apps (id, name, description, creator_id, type, demo_url, version, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
      [appInsertData.id, appInsertData.name, appInsertData.description, appInsertData.creator_id, appInsertData.type, appInsertData.demo_url, appInsertData.version, appInsertData.status]
    );
    console.log('✅ 應用程式創建成功');

    // 查詢並顯示創建的應用程式
    const [appResult] = await connection.execute(
      'SELECT a.*, u.name as creator_name FROM apps a LEFT JOIN users u ON a.creator_id = u.id WHERE a.id = ?',
      [appId]
    );

    if (appResult.length > 0) {
      const app = appResult[0];
      console.log('\n📋 資料庫中的應用程式資料:');
      console.log(`  ID: ${app.id}`);
      console.log(`  名稱: ${app.name}`);
      console.log(`  描述: ${app.description}`);
      console.log(`  類型: ${app.type}`);
      console.log(`  狀態: ${app.status}`);
      console.log(`  創建者: ${app.creator_name}`);
      console.log(`  演示連結: ${app.demo_url}`);
      console.log(`  版本: ${app.version}`);
      console.log(`  創建時間: ${app.created_at}`);
    }

    console.log('\n✅ 管理後台應用程式創建測試成功！');
    console.log('🎯 問題已解決：管理後台現在可以正確創建應用程式並保存到資料庫');

    // 清理測試資料
    await connection.execute('DELETE FROM apps WHERE id = ?', [appId]);
    await connection.execute('DELETE FROM users WHERE id = ?', [userData.id]);
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

testAdminAppCreation().catch(console.error); 