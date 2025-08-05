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

async function testDBQuery() {
  let connection;
  
  try {
    console.log('🧪 測試資料庫查詢...');
    
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 資料庫連接成功');
    
    // 測試 1: 簡單查詢
    console.log('\n1. 測試簡單查詢...');
    const [apps1] = await connection.execute('SELECT * FROM apps LIMIT 5');
    console.log('結果:', apps1.length, '個應用程式');
    
    // 測試 2: 使用 LIMIT 查詢
    console.log('\n2. 測試 LIMIT 查詢...');
    const [apps2] = await connection.execute('SELECT * FROM apps LIMIT 5');
    console.log('結果:', apps2.length, '個應用程式');
    
    // 測試 3: 使用 OFFSET
    console.log('\n3. 測試 OFFSET 查詢...');
    const [apps3] = await connection.execute('SELECT * FROM apps LIMIT 5 OFFSET 0');
    console.log('結果:', apps3.length, '個應用程式');
    
    // 測試 4: 計數查詢
    console.log('\n4. 測試計數查詢...');
    const [countResult] = await connection.execute('SELECT COUNT(*) as total FROM apps');
    console.log('總數:', countResult[0].total);
    
    // 測試 5: JOIN 查詢
    console.log('\n5. 測試 JOIN 查詢...');
    const [apps4] = await connection.execute(`
      SELECT 
        a.*,
        u.name as creator_name,
        u.email as creator_email
      FROM apps a
      LEFT JOIN users u ON a.creator_id = u.id
      LIMIT 5
    `);
    console.log('結果:', apps4.length, '個應用程式');
    
  } catch (error) {
    console.error('❌ 測試失敗:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

testDBQuery(); 