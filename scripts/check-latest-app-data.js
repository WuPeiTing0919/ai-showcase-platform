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

async function checkLatestAppData() {
  let connection;
  
  try {
    console.log('🔍 檢查最新的應用程式資料...');
    
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 資料庫連接成功');
    
    // 檢查最新的應用程式資料
    const [apps] = await connection.execute(`
      SELECT 
        a.id,
        a.name,
        a.description,
        a.creator_id,
        a.department as app_department,
        a.creator_name as app_creator_name,
        a.creator_email as app_creator_email,
        a.type,
        a.status,
        a.created_at,
        u.id as user_id,
        u.name as user_name,
        u.email as user_email,
        u.department as user_department
      FROM apps a
      LEFT JOIN users u ON a.creator_id = u.id
      ORDER BY a.created_at DESC
      LIMIT 5
    `);
    
    console.log('\n📊 最新應用程式資料:');
    apps.forEach((app, index) => {
      console.log(`\n應用程式 ${index + 1}:`);
      console.log(`  應用 ID: ${app.id}`);
      console.log(`  應用名稱: ${app.name}`);
      console.log(`  應用描述: ${app.description}`);
      console.log(`  創建者 ID: ${app.creator_id}`);
      console.log(`  應用部門: ${app.app_department}`);
      console.log(`  應用創建者名稱: ${app.app_creator_name}`);
      console.log(`  應用創建者郵箱: ${app.app_creator_email}`);
      console.log(`  應用類型: ${app.type}`);
      console.log(`  應用狀態: ${app.status}`);
      console.log(`  創建時間: ${app.created_at}`);
      console.log(`  用戶 ID: ${app.user_id}`);
      console.log(`  用戶名稱: ${app.user_name}`);
      console.log(`  用戶郵箱: ${app.user_email}`);
      console.log(`  用戶部門: ${app.user_department}`);
    });
    
    // 檢查特定應用程式的詳細資料
    const [specificApp] = await connection.execute(`
      SELECT 
        a.*,
        u.name as user_name,
        u.email as user_email,
        u.department as user_department
      FROM apps a
      LEFT JOIN users u ON a.creator_id = u.id
      WHERE a.name LIKE '%天氣查詢機器人%'
      ORDER BY a.created_at DESC
      LIMIT 1
    `);
    
    if (specificApp.length > 0) {
      const app = specificApp[0];
      console.log('\n🎯 天氣查詢機器人應用程式詳細資料:');
      console.log(`  應用名稱: ${app.name}`);
      console.log(`  應用創建者名稱: ${app.creator_name}`);
      console.log(`  應用部門: ${app.department}`);
      console.log(`  用戶名稱: ${app.user_name}`);
      console.log(`  用戶部門: ${app.user_department}`);
    }
    
  } catch (error) {
    console.error('❌ 檢查最新應用程式資料失敗:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 資料庫連接已關閉');
    }
  }
}

// 執行檢查
checkLatestAppData().catch(console.error); 