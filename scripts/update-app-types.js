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

// Type mapping for converting old types to new types
const typeMapping = {
  'web_app': 'productivity',
  'mobile_app': 'productivity', 
  'desktop_app': 'productivity',
  'api_service': 'automation',
  'ai_model': 'ai_model',
  'data_analysis': 'data_analysis',
  'automation': 'automation',
  'other': 'other'
};

async function updateAppTypes() {
  let connection;
  
  try {
    console.log('🔄 開始更新應用程式類型...');
    
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 資料庫連接成功');
    
    // 1. 檢查現有的類型分佈
    console.log('\n📊 檢查現有類型分佈:');
    const [typeStats] = await connection.execute(`
      SELECT type, COUNT(*) as count 
      FROM apps 
      WHERE type IS NOT NULL 
      GROUP BY type
    `);
    
    typeStats.forEach(row => {
      console.log(`  ${row.type}: ${row.count} 個應用程式`);
    });
    
    // 2. 更新現有數據的類型
    console.log('\n🔄 更新現有應用程式的類型...');
    for (const [oldType, newType] of Object.entries(typeMapping)) {
      if (oldType !== newType) {
        const [result] = await connection.execute(
          'UPDATE apps SET type = ? WHERE type = ?',
          [newType, oldType]
        );
        if (result.affectedRows > 0) {
          console.log(`  ✅ 將 ${oldType} 更新為 ${newType}: ${result.affectedRows} 個應用程式`);
        }
      }
    }
    
    // 3. 修改 type 欄位的 ENUM 定義
    console.log('\n🔧 更新 type 欄位的 ENUM 定義...');
    try {
      // 先刪除舊的 ENUM 約束
      await connection.execute(`
        ALTER TABLE apps 
        MODIFY COLUMN type VARCHAR(50) DEFAULT 'other'
      `);
      console.log('  ✅ 移除舊的 ENUM 約束');
      
      // 添加新的 ENUM 約束
      await connection.execute(`
        ALTER TABLE apps 
        MODIFY COLUMN type ENUM(
          'productivity', 'ai_model', 'automation', 'data_analysis', 
          'educational', 'healthcare', 'finance', 'iot_device', 
          'blockchain', 'ar_vr', 'machine_learning', 'computer_vision', 
          'nlp', 'robotics', 'cybersecurity', 'cloud_service', 'other'
        ) DEFAULT 'other'
      `);
      console.log('  ✅ 添加新的 ENUM 約束');
    } catch (error) {
      console.error('  ❌ 更新 ENUM 約束失敗:', error.message);
    }
    
    // 4. 檢查更新後的類型分佈
    console.log('\n📊 更新後的類型分佈:');
    const [newTypeStats] = await connection.execute(`
      SELECT type, COUNT(*) as count 
      FROM apps 
      WHERE type IS NOT NULL 
      GROUP BY type
    `);
    
    newTypeStats.forEach(row => {
      console.log(`  ${row.type}: ${row.count} 個應用程式`);
    });
    
    // 5. 檢查表格結構
    console.log('\n📋 apps 表格結構:');
    const [columns] = await connection.execute('DESCRIBE apps');
    columns.forEach(col => {
      if (col.Field === 'type') {
        console.log(`  ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${col.Default ? `DEFAULT ${col.Default}` : ''}`);
      }
    });
    
    console.log('\n✅ 應用程式類型更新完成！');
    
  } catch (error) {
    console.error('❌ 更新應用程式類型失敗:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 資料庫連接已關閉');
    }
  }
}

updateAppTypes().catch(console.error); 