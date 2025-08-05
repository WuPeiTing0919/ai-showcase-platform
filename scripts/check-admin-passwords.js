const mysql = require('mysql2/promise');

async function checkAdminPasswords() {
  console.log('=== 檢查管理員密碼 ===');
  
  try {
    const connection = await mysql.createConnection({
      host: 'mysql.theaken.com',
      port: 33306,
      user: 'AI_Platform',
      password: 'Aa123456',
      database: 'db_AI_Platform'
    });

    console.log('✅ 資料庫連接成功');

    // 查詢管理員用戶
    const [rows] = await connection.execute(`
      SELECT id, name, email, role, password_hash, created_at
      FROM users 
      WHERE role = 'admin'
      ORDER BY created_at DESC
    `);

    console.log(`\n找到 ${rows.length} 個管理員用戶:`);
    
    for (const user of rows) {
      console.log(`\n用戶ID: ${user.id}`);
      console.log(`姓名: ${user.name}`);
      console.log(`郵箱: ${user.email}`);
      console.log(`角色: ${user.role}`);
      console.log(`密碼雜湊: ${user.password_hash.substring(0, 20)}...`);
      console.log(`創建時間: ${user.created_at}`);
    }

    await connection.end();
  } catch (error) {
    console.error('❌ 資料庫連接失敗:', error.message);
  }
}

checkAdminPasswords().catch(console.error); 