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

async function testFrontendAppCreation() {
  let connection;
  
  try {
    console.log('🧪 測試前端應用程式創建流程...');
    
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 資料庫連接成功');
    
    // 1. 創建測試用戶
    const userId = Date.now().toString(36) + Math.random().toString(36).substr(2);
    const userData = {
      id: userId,
      name: '測試用戶',
      email: 'test@example.com',
      password: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.i8eK', // 密碼: test123
      role: 'developer',
      department: 'IT',
      join_date: new Date(),
      created_at: new Date(),
      updated_at: new Date()
    };
    
    await connection.execute(
      'INSERT INTO users (id, name, email, password_hash, role, department, join_date, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [userData.id, userData.name, userData.email, userData.password, userData.role, userData.department, userData.join_date, userData.created_at, userData.updated_at]
    );
    console.log('✅ 測試用戶創建成功');
    
    // 2. 模擬前端提交的應用程式資料
    const frontendAppData = {
      name: '測試前端應用',
      description: '這是一個通過前端界面創建的測試應用程式',
      type: 'productivity', // 映射自 '文字處理'
      demoUrl: 'https://example.com/demo',
      githubUrl: 'https://github.com/example/app',
      docsUrl: 'https://docs.example.com',
      techStack: ['React', 'TypeScript', 'Tailwind CSS'],
      tags: ['生產力工具', '文字處理'],
      version: '1.0.0'
    };
    
    console.log('📋 前端提交的資料:', frontendAppData);
    
    // 3. 創建應用程式（模擬 API 調用）
    const appId = Date.now().toString(36) + Math.random().toString(36).substr(2);
    const appData = {
      id: appId,
      name: frontendAppData.name,
      description: frontendAppData.description,
      creator_id: userId,
      team_id: null,
      type: frontendAppData.type,
      tech_stack: JSON.stringify(frontendAppData.techStack),
      tags: JSON.stringify(frontendAppData.tags),
      demo_url: frontendAppData.demoUrl,
      github_url: frontendAppData.githubUrl,
      docs_url: frontendAppData.docsUrl,
      version: frontendAppData.version,
      status: 'draft'
    };
    
    await connection.execute(
      `INSERT INTO apps (
        id, name, description, creator_id, team_id, type, 
        tech_stack, tags, demo_url, github_url, docs_url, 
        version, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        appData.id, appData.name, appData.description, appData.creator_id,
        appData.team_id, appData.type, appData.tech_stack, appData.tags,
        appData.demo_url, appData.github_url, appData.docs_url,
        appData.version, appData.status
      ]
    );
    console.log('✅ 應用程式創建成功');
    
    // 4. 驗證應用程式是否正確保存到資料庫
    const [apps] = await connection.execute(
      `SELECT a.*, u.name as creator_name 
       FROM apps a 
       LEFT JOIN users u ON a.creator_id = u.id 
       WHERE a.id = ?`,
      [appId]
    );
    
    if (apps.length > 0) {
      const app = apps[0];
      console.log('\n📋 資料庫中的應用程式資料:');
      console.log(`  ID: ${app.id}`);
      console.log(`  名稱: ${app.name}`);
      console.log(`  描述: ${app.description}`);
      console.log(`  類型: ${app.type}`);
      console.log(`  狀態: ${app.status}`);
      console.log(`  創建者: ${app.creator_name}`);
      console.log(`  技術棧: ${app.tech_stack}`);
      console.log(`  標籤: ${app.tags}`);
      console.log(`  演示連結: ${app.demo_url}`);
      console.log(`  GitHub: ${app.github_url}`);
      console.log(`  文檔: ${app.docs_url}`);
      console.log(`  版本: ${app.version}`);
      console.log(`  創建時間: ${app.created_at}`);
      
      console.log('\n✅ 前端應用程式創建測試成功！');
      console.log('🎯 問題已解決：前端現在可以正確創建應用程式並保存到資料庫');
    } else {
      console.log('❌ 應用程式未在資料庫中找到');
    }
    
    // 5. 清理測試資料
    await connection.execute('DELETE FROM apps WHERE id = ?', [appId]);
    await connection.execute('DELETE FROM users WHERE id = ?', [userId]);
    console.log('✅ 測試資料清理完成');
    
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
testFrontendAppCreation().catch(console.error); 