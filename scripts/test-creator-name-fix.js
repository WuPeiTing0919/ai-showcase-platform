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

async function testCreatorNameFix() {
  let connection;
  
  try {
    console.log('🔍 測試創建者名稱修正...');
    
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 資料庫連接成功');
    
    // 模擬列表 API 的查詢
    const [apps] = await connection.execute(`
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
    `);
    
    console.log('\n📊 原始資料庫查詢結果:');
    apps.forEach((app, index) => {
      console.log(`\n應用程式 ${index + 1}:`);
      console.log(`  應用名稱: ${app.name}`);
      console.log(`  apps.creator_name: ${app.creator_name}`);
      console.log(`  users.name: ${app.user_creator_name}`);
    });
    
    // 模擬修正後的格式化邏輯
    const formattedApps = apps.map((app) => ({
      id: app.id,
      name: app.name,
      creator: {
        id: app.creator_id,
        name: app.creator_name || app.user_creator_name, // 修正：優先使用 apps.creator_name
        email: app.user_creator_email,
        department: app.department || app.user_creator_department,
        role: app.creator_role
      }
    }));
    
    console.log('\n📋 修正後的格式化結果:');
    formattedApps.forEach((app, index) => {
      console.log(`\n應用程式 ${index + 1}:`);
      console.log(`  名稱: ${app.name}`);
      console.log(`  創建者名稱: ${app.creator.name}`);
      console.log(`  創建者郵箱: ${app.creator.email}`);
      console.log(`  創建者部門: ${app.creator.department}`);
    });
    
    // 驗證修正是否有效
    const expectedCreatorName = "佩庭"; // 期望的創建者名稱
    const actualCreatorName = formattedApps[0]?.creator.name;
    
    console.log('\n✅ 驗證結果:');
    console.log(`期望創建者名稱: ${expectedCreatorName}`);
    console.log(`實際創建者名稱: ${actualCreatorName}`);
    console.log(`修正是否成功: ${actualCreatorName === expectedCreatorName}`);
    
    if (actualCreatorName === expectedCreatorName) {
      console.log('🎉 創建者名稱修正成功！現在顯示正確的資料庫值。');
    } else {
      console.log('❌ 創建者名稱修正失敗，需要進一步檢查。');
    }
    
  } catch (error) {
    console.error('❌ 測試創建者名稱修正失敗:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 資料庫連接已關閉');
    }
  }
}

// 執行測試
testCreatorNameFix().catch(console.error); 