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

async function testAppEdit() {
  let connection;
  
  try {
    console.log('🧪 測試應用編輯功能...');
    
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 資料庫連接成功');
    
    // 1. 檢查 apps 表結構
    console.log('\n📋 檢查 apps 表結構...');
    const [columns] = await connection.execute('DESCRIBE apps');
    const hasIcon = columns.some(col => col.Field === 'icon');
    const hasIconColor = columns.some(col => col.Field === 'icon_color');
    
    console.log(`圖示欄位: ${hasIcon ? '✅' : '❌'}`);
    console.log(`圖示顏色欄位: ${hasIconColor ? '✅' : '❌'}`);
    
    if (!hasIcon || !hasIconColor) {
      console.log('⚠️ 需要更新資料庫結構，請執行: npm run db:update-structure');
      return;
    }
    
    // 2. 檢查現有應用程式
    console.log('\n📋 檢查現有應用程式...');
    const [apps] = await connection.execute(`
      SELECT a.*, u.name as creator_name, u.department as creator_department
      FROM apps a
      LEFT JOIN users u ON a.creator_id = u.id
      LIMIT 5
    `);
    
    console.log(`找到 ${apps.length} 個應用程式:`);
    apps.forEach((app, index) => {
      console.log(`${index + 1}. ${app.name}`);
      console.log(`   創建者: ${app.creator_name} (${app.creator_department})`);
      console.log(`   圖示: ${app.icon || '未設定'}`);
      console.log(`   圖示顏色: ${app.icon_color || '未設定'}`);
      console.log(`   狀態: ${app.status || 'draft'}`);
      console.log('');
    });
    
    // 3. 測試更新應用程式
    if (apps.length > 0) {
      const testApp = apps[0];
      console.log(`🧪 測試更新應用程式: ${testApp.name}`);
      
      const updateData = {
        icon: 'Brain',
        icon_color: 'from-purple-500 to-pink-500',
        department: 'ITBU'
      };
      
      await connection.execute(
        'UPDATE apps SET icon = ?, icon_color = ? WHERE id = ?',
        [updateData.icon, updateData.icon_color, testApp.id]
      );
      
      console.log('✅ 測試更新成功');
      
      // 驗證更新
      const [updatedApp] = await connection.execute(
        'SELECT * FROM apps WHERE id = ?',
        [testApp.id]
      );
      
      if (updatedApp.length > 0) {
        const app = updatedApp[0];
        console.log(`更新後的圖示: ${app.icon}`);
        console.log(`更新後的圖示顏色: ${app.icon_color}`);
      }
    }
    
    console.log('\n✅ 應用編輯功能測試完成！');
    
  } catch (error) {
    console.error('❌ 測試失敗:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 資料庫連接已關閉');
    }
  }
}

testAppEdit().catch(console.error); 