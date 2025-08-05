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

async function fixAppsTable() {
  let connection;
  
  try {
    console.log('🔧 開始修復 apps 表格...');
    
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 資料庫連接成功');
    
    // 檢查並添加新欄位
    const alterStatements = [
      // 添加狀態欄位
      `ALTER TABLE apps ADD COLUMN status ENUM('draft', 'submitted', 'under_review', 'approved', 'rejected', 'published') DEFAULT 'draft'`,
      
      // 添加類型欄位
      `ALTER TABLE apps ADD COLUMN type ENUM('web_app', 'mobile_app', 'desktop_app', 'api_service', 'ai_model', 'data_analysis', 'automation', 'other') DEFAULT 'other'`,
      
      // 添加檔案路徑欄位
      `ALTER TABLE apps ADD COLUMN file_path VARCHAR(500)`,
      
      // 添加技術棧欄位
      `ALTER TABLE apps ADD COLUMN tech_stack JSON`,
      
      // 添加標籤欄位
      `ALTER TABLE apps ADD COLUMN tags JSON`,
      
      // 添加截圖路徑欄位
      `ALTER TABLE apps ADD COLUMN screenshots JSON`,
      
      // 添加演示連結欄位
      `ALTER TABLE apps ADD COLUMN demo_url VARCHAR(500)`,
      
      // 添加 GitHub 連結欄位
      `ALTER TABLE apps ADD COLUMN github_url VARCHAR(500)`,
      
      // 添加文檔連結欄位
      `ALTER TABLE apps ADD COLUMN docs_url VARCHAR(500)`,
      
      // 添加版本欄位
      `ALTER TABLE apps ADD COLUMN version VARCHAR(50) DEFAULT '1.0.0'`,
      
      // 添加最後更新時間欄位
      `ALTER TABLE apps ADD COLUMN last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`
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
    
    // 添加索引
    const indexStatements = [
      `CREATE INDEX idx_apps_status ON apps(status)`,
      `CREATE INDEX idx_apps_type ON apps(type)`,
      `CREATE INDEX idx_apps_created_at ON apps(created_at)`,
      `CREATE INDEX idx_apps_rating ON apps(rating DESC)`,
      `CREATE INDEX idx_apps_likes ON apps(likes_count DESC)`
    ];
    
    for (const statement of indexStatements) {
      try {
        await connection.execute(statement);
        console.log(`✅ 創建索引: ${statement.substring(0, 50)}...`);
      } catch (error) {
        if (error.code === 'ER_DUP_KEYNAME') {
          console.log(`⚠️ 索引已存在，跳過: ${statement.substring(0, 50)}...`);
        } else {
          console.error(`❌ 創建索引失敗: ${statement.substring(0, 50)}...`, error.message);
        }
      }
    }
    
    // 檢查表格結構
    const [columns] = await connection.execute('DESCRIBE apps');
    console.log('\n📋 apps 表格結構:');
    columns.forEach(col => {
      console.log(`  ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${col.Default ? `DEFAULT ${col.Default}` : ''}`);
    });
    
    console.log('\n✅ apps 表格修復完成！');
    
  } catch (error) {
    console.error('❌ 修復 apps 表格失敗:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 資料庫連接已關閉');
    }
  }
}

// 執行修復
fixAppsTable().catch(console.error); 