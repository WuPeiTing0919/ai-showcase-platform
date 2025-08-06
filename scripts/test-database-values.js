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

async function testDatabaseValues() {
  let connection;
  
  try {
    console.log('🔍 檢查資料庫中的應用程式資料...');
    
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 資料庫連接成功');
    
    // 檢查 apps 表格結構
    const [columns] = await connection.execute('DESCRIBE apps');
    console.log('\n📋 apps 表格結構:');
    columns.forEach(col => {
      console.log(`  ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${col.Default ? `DEFAULT ${col.Default}` : ''}`);
    });
    
    // 檢查前 5 個應用程式的資料
    const [apps] = await connection.execute(`
      SELECT 
        id, name, description, type, department, creator_name, creator_email,
        icon, icon_color, status, created_at
      FROM apps 
      LIMIT 5
    `);
    
    console.log('\n📊 前 5 個應用程式資料:');
    apps.forEach((app, index) => {
      console.log(`\n應用程式 ${index + 1}:`);
      console.log(`  ID: ${app.id}`);
      console.log(`  名稱: ${app.name}`);
      console.log(`  類型: ${app.type || 'NULL'}`);
      console.log(`  部門: ${app.department || 'NULL'}`);
      console.log(`  創建者名稱: ${app.creator_name || 'NULL'}`);
      console.log(`  創建者郵箱: ${app.creator_email || 'NULL'}`);
      console.log(`  圖示: ${app.icon || 'NULL'}`);
      console.log(`  圖示顏色: ${app.icon_color || 'NULL'}`);
      console.log(`  狀態: ${app.status || 'NULL'}`);
      console.log(`  創建時間: ${app.created_at}`);
    });
    
    // 檢查是否有任何應用程式的 type 欄位為 NULL
    const [nullTypes] = await connection.execute(`
      SELECT COUNT(*) as count 
      FROM apps 
      WHERE type IS NULL
    `);
    
    console.log(`\n📈 類型為 NULL 的應用程式數量: ${nullTypes[0].count}`);
    
    // 檢查是否有任何應用程式的 department 欄位為 NULL
    const [nullDepartments] = await connection.execute(`
      SELECT COUNT(*) as count 
      FROM apps 
      WHERE department IS NULL
    `);
    
    console.log(`📈 部門為 NULL 的應用程式數量: ${nullDepartments[0].count}`);
    
    // 檢查是否有任何應用程式的 creator_name 欄位為 NULL
    const [nullCreatorNames] = await connection.execute(`
      SELECT COUNT(*) as count 
      FROM apps 
      WHERE creator_name IS NULL
    `);
    
    console.log(`📈 創建者名稱為 NULL 的應用程式數量: ${nullCreatorNames[0].count}`);
    
    // 檢查是否有任何應用程式的 icon 欄位為 NULL
    const [nullIcons] = await connection.execute(`
      SELECT COUNT(*) as count 
      FROM apps 
      WHERE icon IS NULL
    `);
    
    console.log(`📈 圖示為 NULL 的應用程式數量: ${nullIcons[0].count}`);
    
  } catch (error) {
    console.error('❌ 檢查資料庫值失敗:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 資料庫連接已關閉');
    }
  }
}

// 執行檢查
testDatabaseValues().catch(console.error); 