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

async function checkActualCreatorData() {
  let connection;
  
  try {
    console.log('🔍 檢查實際的創建者資料...');
    
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 資料庫連接成功');
    
    // 檢查應用程式的創建者資訊
    const [apps] = await connection.execute(`
      SELECT 
        a.id,
        a.name,
        a.creator_id,
        a.department as app_department,
        a.creator_name as app_creator_name,
        u.id as user_id,
        u.name as user_name,
        u.email as user_email,
        u.department as user_department
      FROM apps a
      LEFT JOIN users u ON a.creator_id = u.id
      ORDER BY a.created_at DESC
      LIMIT 5
    `);
    
    console.log('\n📊 應用程式和創建者資料:');
    apps.forEach((app, index) => {
      console.log(`\n應用程式 ${index + 1}:`);
      console.log(`  應用 ID: ${app.id}`);
      console.log(`  應用名稱: ${app.name}`);
      console.log(`  創建者 ID: ${app.creator_id}`);
      console.log(`  應用部門: ${app.app_department}`);
      console.log(`  應用創建者名稱: ${app.app_creator_name}`);
      console.log(`  用戶 ID: ${app.user_id}`);
      console.log(`  用戶名稱: ${app.user_name}`);
      console.log(`  用戶郵箱: ${app.user_email}`);
      console.log(`  用戶部門: ${app.user_department}`);
    });
    
    // 檢查用戶表中的資料
    const [users] = await connection.execute(`
      SELECT id, name, email, department, role
      FROM users
      ORDER BY created_at DESC
      LIMIT 5
    `);
    
    console.log('\n📋 用戶表資料:');
    users.forEach((user, index) => {
      console.log(`\n用戶 ${index + 1}:`);
      console.log(`  ID: ${user.id}`);
      console.log(`  名稱: ${user.name}`);
      console.log(`  郵箱: ${user.email}`);
      console.log(`  部門: ${user.department}`);
      console.log(`  角色: ${user.role}`);
    });
    
    // 檢查是否有名為「佩庭」的用戶
    const [peitingUsers] = await connection.execute(`
      SELECT id, name, email, department, role
      FROM users
      WHERE name LIKE '%佩庭%'
    `);
    
    console.log('\n🔍 搜尋「佩庭」相關的用戶:');
    if (peitingUsers.length > 0) {
      peitingUsers.forEach((user, index) => {
        console.log(`\n用戶 ${index + 1}:`);
        console.log(`  ID: ${user.id}`);
        console.log(`  名稱: ${user.name}`);
        console.log(`  郵箱: ${user.email}`);
        console.log(`  部門: ${user.department}`);
        console.log(`  角色: ${user.role}`);
      });
    } else {
      console.log('❌ 沒有找到名為「佩庭」的用戶');
    }
    
  } catch (error) {
    console.error('❌ 檢查創建者資料失敗:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 資料庫連接已關閉');
    }
  }
}

// 執行檢查
checkActualCreatorData().catch(console.error); 