const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function updateAllAdminPasswords() {
  console.log('=== 更新所有管理員密碼 ===');
  
  try {
    const connection = await mysql.createConnection({
      host: 'mysql.theaken.com',
      port: 33306,
      user: 'AI_Platform',
      password: 'Aa123456',
      database: 'db_AI_Platform'
    });

    console.log('✅ 資料庫連接成功');

    // 新密碼
    const newPassword = 'Admin123!';
    const passwordHash = await bcrypt.hash(newPassword, 12);

    console.log(`\n更新所有管理員密碼為: ${newPassword}`);

    // 更新所有管理員用戶的密碼
    const [result] = await connection.execute(`
      UPDATE users 
      SET password_hash = ?, updated_at = NOW()
      WHERE role = 'admin'
    `, [passwordHash]);

    console.log(`✅ 已更新 ${result.affectedRows} 個管理員用戶的密碼`);

    // 驗證更新結果
    const [users] = await connection.execute(`
      SELECT id, name, email, role, updated_at
      FROM users 
      WHERE role = 'admin'
      ORDER BY created_at DESC
    `);

    console.log('\n📋 更新後的管理員用戶:');
    for (const user of users) {
      console.log(`  - ${user.name} (${user.email}) - 更新時間: ${user.updated_at}`);
    }

    console.log('\n🎉 所有管理員密碼已統一為: Admin123!');
    console.log('💡 現在所有管理員用戶都可以使用相同的密碼登入');

    await connection.end();
  } catch (error) {
    console.error('❌ 更新失敗:', error.message);
  }
}

updateAllAdminPasswords().catch(console.error); 