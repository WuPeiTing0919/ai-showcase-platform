const mysql = require('mysql2/promise');

async function checkAppsTable() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ai_showcase_platform'
  });

  try {
    console.log('檢查 apps 表格結構...');
    
    // 檢查表格結構
    const [columns] = await connection.execute('DESCRIBE apps');
    console.log('\napps 表格欄位:');
    columns.forEach(col => {
      console.log(`- ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Default ? `DEFAULT ${col.Default}` : ''}`);
    });

    // 檢查是否有資料
    const [rows] = await connection.execute('SELECT COUNT(*) as count FROM apps');
    console.log(`\napps 表格資料筆數: ${rows[0].count}`);

    if (rows[0].count > 0) {
      // 顯示前幾筆資料
      const [sampleData] = await connection.execute('SELECT * FROM apps LIMIT 3');
      console.log('\n前 3 筆資料:');
      sampleData.forEach((row, index) => {
        console.log(`\n第 ${index + 1} 筆:`);
        Object.keys(row).forEach(key => {
          console.log(`  ${key}: ${row[key]}`);
        });
      });
    }

  } catch (error) {
    console.error('檢查失敗:', error);
  } finally {
    await connection.end();
  }
}

checkAppsTable(); 