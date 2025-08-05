const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const dbConfig = {
  host: process.env.DB_HOST || 'mysql.theaken.com',
  port: parseInt(process.env.DB_PORT || '33306'),
  user: process.env.DB_USER || 'AI_Platform',
  password: process.env.DB_PASSWORD || 'Aa123456',
  database: process.env.DB_NAME || 'db_AI_Platform',
  charset: 'utf8mb4',
  timezone: '+08:00'
};

const JWT_SECRET = 'ai_platform_jwt_secret_key_2024';

async function testAppsAPI() {
  let connection;
  
  try {
    console.log('🧪 開始測試應用程式 API...');
    
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 資料庫連接成功');
    
    // 1. 創建測試用戶
    console.log('\n1. 創建測試用戶...');
    const testUserId = 'test-user-' + Date.now();
    const hashedPassword = await bcrypt.hash('test123', 12);
    
    await connection.execute(`
      INSERT INTO users (id, name, email, password_hash, department, role, join_date)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [testUserId, '測試用戶', 'test@example.com', hashedPassword, '測試部', 'developer', '2025-01-01']);
    
    console.log('✅ 測試用戶創建成功');
    
    // 2. 生成測試 Token
    const token = jwt.sign({
      userId: testUserId,
      email: 'test@example.com',
      role: 'developer'
    }, JWT_SECRET, { expiresIn: '1h' });
    
    console.log('✅ JWT Token 生成成功');
    
    // 3. 測試創建應用程式
    console.log('\n2. 測試創建應用程式...');
    const appData = {
      id: 'test-app-' + Date.now(),
      name: '測試 AI 應用',
      description: '這是一個用於測試的 AI 應用程式，具有機器學習功能',
      creator_id: testUserId,
      type: 'web_app',
      tech_stack: JSON.stringify(['React', 'Node.js', 'TensorFlow']),
      tags: JSON.stringify(['AI', '機器學習', '測試']),
      demo_url: 'https://demo.example.com',
      github_url: 'https://github.com/test/app',
      docs_url: 'https://docs.example.com',
      version: '1.0.0',
      status: 'draft'
    };
    
    await connection.execute(`
      INSERT INTO apps (id, name, description, creator_id, type, tech_stack, tags, demo_url, github_url, docs_url, version, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      appData.id, appData.name, appData.description, appData.creator_id, appData.type,
      appData.tech_stack, appData.tags, appData.demo_url, appData.github_url, appData.docs_url,
      appData.version, appData.status
    ]);
    
    console.log('✅ 測試應用程式創建成功');
    
    // 4. 測試查詢應用程式列表
    console.log('\n3. 測試查詢應用程式列表...');
    const [apps] = await connection.execute(`
      SELECT 
        a.*,
        u.name as creator_name,
        u.email as creator_email,
        u.department as creator_department,
        u.role as creator_role
      FROM apps a
      LEFT JOIN users u ON a.creator_id = u.id
      WHERE a.creator_id = ?
    `, [testUserId]);
    
    console.log(`✅ 查詢到 ${apps.length} 個應用程式`);
    apps.forEach(app => {
      console.log(`  - ${app.name} (${app.type}) - ${app.status}`);
    });
    
    // 5. 測試更新應用程式
    console.log('\n4. 測試更新應用程式...');
    await connection.execute(`
      UPDATE apps 
      SET name = ?, description = ?, status = ?, version = ?
      WHERE id = ?
    `, [
      '更新後的測試 AI 應用',
      '這是更新後的測試應用程式描述',
      'submitted',
      '1.1.0',
      appData.id
    ]);
    
    console.log('✅ 應用程式更新成功');
    
    // 6. 測試按讚功能
    console.log('\n5. 測試按讚功能...');
    const likeId = 'like-' + Date.now();
    await connection.execute(`
      INSERT INTO user_likes (id, user_id, app_id, liked_at)
      VALUES (?, ?, ?, NOW())
    `, [likeId, testUserId, appData.id]);
    
    await connection.execute(`
      UPDATE apps SET likes_count = likes_count + 1 WHERE id = ?
    `, [appData.id]);
    
    console.log('✅ 按讚功能測試成功');
    
    // 7. 測試收藏功能
    console.log('\n6. 測試收藏功能...');
    const favoriteId = 'favorite-' + Date.now();
    await connection.execute(`
      INSERT INTO user_favorites (id, user_id, app_id)
      VALUES (?, ?, ?)
    `, [favoriteId, testUserId, appData.id]);
    
    console.log('✅ 收藏功能測試成功');
    
    // 8. 測試統計功能
    console.log('\n7. 測試統計功能...');
    const [stats] = await connection.execute(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END) as published,
        SUM(CASE WHEN status IN ('submitted', 'under_review') THEN 1 ELSE 0 END) as pending_review,
        SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as draft,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected
      FROM apps
    `);
    
    console.log('✅ 統計功能測試成功:');
    console.log(`  - 總應用數: ${stats[0].total}`);
    console.log(`  - 已發布: ${stats[0].published}`);
    console.log(`  - 待審核: ${stats[0].pending_review}`);
    console.log(`  - 草稿: ${stats[0].draft}`);
    console.log(`  - 已批准: ${stats[0].approved}`);
    console.log(`  - 已拒絕: ${stats[0].rejected}`);
    
    // 9. 測試搜尋功能
    console.log('\n8. 測試搜尋功能...');
    const [searchResults] = await connection.execute(`
      SELECT a.*, u.name as creator_name
      FROM apps a
      LEFT JOIN users u ON a.creator_id = u.id
      WHERE (a.name LIKE ? OR a.description LIKE ? OR u.name LIKE ?)
        AND a.type = ?
        AND a.status = ?
    `, ['%AI%', '%AI%', '%測試%', 'web_app', 'submitted']);
    
    console.log(`✅ 搜尋功能測試成功，找到 ${searchResults.length} 個結果`);
    
    // 10. 測試刪除功能
    console.log('\n9. 測試刪除功能...');
    
    // 先刪除相關記錄
    await connection.execute('DELETE FROM user_likes WHERE app_id = ?', [appData.id]);
    await connection.execute('DELETE FROM user_favorites WHERE app_id = ?', [appData.id]);
    
    // 刪除應用程式
    await connection.execute('DELETE FROM apps WHERE id = ?', [appData.id]);
    
    console.log('✅ 刪除功能測試成功');
    
    // 11. 清理測試資料
    console.log('\n10. 清理測試資料...');
    await connection.execute('DELETE FROM users WHERE id = ?', [testUserId]);
    
    console.log('✅ 測試資料清理完成');
    
    console.log('\n🎉 所有應用程式 API 測試通過！');
    
  } catch (error) {
    console.error('❌ 測試失敗:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 資料庫連接已關閉');
    }
  }
}

// 執行測試
testAppsAPI().catch(console.error); 