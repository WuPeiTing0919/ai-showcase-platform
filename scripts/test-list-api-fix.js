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

async function testListApiFix() {
  let connection;
  
  try {
    console.log('🔍 測試列表 API 創建者資訊修正...');
    
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 資料庫連接成功');
    
    // 模擬列表 API 的查詢
    const sql = `
      SELECT 
        a.*,
        u.name as user_creator_name,
        u.email as user_creator_email,
        u.department as user_creator_department,
        u.role as creator_role
      FROM apps a
      LEFT JOIN users u ON a.creator_id = u.id
      ORDER BY a.created_at DESC
      LIMIT 3
    `;

    const [apps] = await connection.execute(sql, []);
    
    console.log('\n📊 原始資料庫查詢結果:');
    apps.forEach((app, index) => {
      console.log(`\n應用程式 ${index + 1}:`);
      console.log(`  ID: ${app.id}`);
      console.log(`  名稱: ${app.name}`);
      console.log(`  creator_id: ${app.creator_id}`);
      console.log(`  user_creator_name: ${app.user_creator_name}`);
      console.log(`  user_creator_email: ${app.user_creator_email}`);
      console.log(`  user_creator_department: ${app.user_creator_department}`);
      console.log(`  department: ${app.department}`);
    });
    
    // 模擬修正後的格式化邏輯
    const formattedApps = apps.map((app) => ({
      id: app.id,
      name: app.name,
      description: app.description,
      creatorId: app.creator_id,
      status: app.status,
      type: app.type,
      icon: app.icon,
      iconColor: app.icon_color,
      department: app.department,
      creator: {
        id: app.creator_id,
        name: app.user_creator_name, // 修正：直接使用 user_creator_name
        email: app.user_creator_email, // 修正：直接使用 user_creator_email
        department: app.department || app.user_creator_department,
        role: app.creator_role
      }
    }));
    
    console.log('\n📋 修正後的格式化結果:');
    formattedApps.forEach((app, index) => {
      console.log(`\n應用程式 ${index + 1}:`);
      console.log(`  名稱: ${app.name}`);
      console.log(`  創建者 ID: ${app.creator.id}`);
      console.log(`  創建者名稱: ${app.creator.name}`);
      console.log(`  創建者郵箱: ${app.creator.email}`);
      console.log(`  創建者部門: ${app.creator.department}`);
      console.log(`  應用部門: ${app.department}`);
    });
    
    // 驗證修正是否有效
    const hasValidCreatorNames = formattedApps.every(app => 
      app.creator.name && app.creator.name.trim() !== ''
    );
    
    console.log('\n✅ 驗證結果:');
    console.log(`所有應用程式都有有效的創建者名稱: ${hasValidCreatorNames}`);
    
    if (hasValidCreatorNames) {
      console.log('🎉 列表 API 創建者資訊修正成功！');
    } else {
      console.log('❌ 仍有應用程式缺少創建者名稱，需要進一步檢查。');
    }
    
  } catch (error) {
    console.error('❌ 測試列表 API 修正失敗:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 資料庫連接已關閉');
    }
  }
}

// 執行測試
testListApiFix().catch(console.error); 