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

async function addMissingAppColumns() {
  let connection;
  
  try {
    console.log('🔧 開始添加缺失的 apps 表格欄位...');
    
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 資料庫連接成功');
    
    // 檢查並添加新欄位
    const alterStatements = [
      // 添加部門欄位
      `ALTER TABLE apps ADD COLUMN department VARCHAR(100) DEFAULT 'HQBU'`,
      
      // 添加創建者名稱欄位
      `ALTER TABLE apps ADD COLUMN creator_name VARCHAR(100)`,
      
      // 添加創建者郵箱欄位
      `ALTER TABLE apps ADD COLUMN creator_email VARCHAR(255)`
    ];
    
    for (const statement of alterStatements) {
      try {
        await connection.execute(statement);
        console.log(`✅ 執行: ${statement.substring(0, 50)}...`);
      } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
          console.log(`⚠️ 欄位已存在，跳過: ${statement.substring(0, 50)}...`);
        } else {
          console.error(`❌ 執行失敗: ${statement.substring(0, 50)}...`, error.message);
        }
      }
    }
    
    // 檢查表格結構
    const [columns] = await connection.execute('DESCRIBE apps');
    console.log('\n📋 apps 表格結構:');
    columns.forEach(col => {
      console.log(`  ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${col.Default ? `DEFAULT ${col.Default}` : ''}`);
    });
    
    console.log('\n✅ apps 表格欄位添加完成！');
    
  } catch (error) {
    console.error('❌ 添加 apps 表格欄位失敗:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 資料庫連接已關閉');
    }
  }
}

// 執行添加
addMissingAppColumns().catch(console.error); 