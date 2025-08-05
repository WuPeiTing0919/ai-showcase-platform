const mysql = require('mysql2/promise');

async function checkAppsCount() {
  try {
    // 連接資料庫
    const connection = await mysql.createConnection({
      host: 'mysql.theaken.com',
      port: 33306,
      user: 'AI_Platform',
      password: 'Aa123456',
      database: 'db_AI_Platform'
    });

    console.log('=== 檢查應用程式數量 ===');

    // 檢查總數
    const [totalRows] = await connection.execute('SELECT COUNT(*) as total FROM apps');
    console.log('總應用程式數量:', totalRows[0].total);

    // 檢查各狀態的數量
    const [statusRows] = await connection.execute(`
      SELECT status, COUNT(*) as count 
      FROM apps 
      GROUP BY status
    `);
    console.log('各狀態數量:');
    statusRows.forEach(row => {
      console.log(`  ${row.status}: ${row.count}`);
    });

    // 檢查最近的應用程式
    const [recentRows] = await connection.execute(`
      SELECT id, name, status, created_at 
      FROM apps 
      ORDER BY created_at DESC 
      LIMIT 5
    `);
    console.log('最近的應用程式:');
    recentRows.forEach(row => {
      console.log(`  ${row.name} (${row.status}) - ${row.created_at}`);
    });

    await connection.end();
  } catch (error) {
    console.error('檢查失敗:', error);
  }
}

checkAppsCount(); 