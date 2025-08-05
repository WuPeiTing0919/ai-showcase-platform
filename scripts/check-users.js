const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'good777';

async function checkUsers() {
  try {
    // 連接資料庫
    const connection = await mysql.createConnection({
      host: 'mysql.theaken.com',
      port: 33306,
      user: 'AI_Platform',
      password: 'Aa123456',
      database: 'db_AI_Platform'
    });

    console.log('=== 檢查用戶 ===');

    // 檢查用戶
    const [userRows] = await connection.execute('SELECT id, email, name, role FROM users LIMIT 5');
    console.log('用戶列表:');
    userRows.forEach(user => {
      console.log(`  ID: ${user.id}, Email: ${user.email}, Name: ${user.name}, Role: ${user.role}`);
    });

    // 為第一個用戶生成 token
    if (userRows.length > 0) {
      const user = userRows[0];
      const token = jwt.sign({
        userId: user.id,
        email: user.email,
        role: user.role
      }, JWT_SECRET, { expiresIn: '1h' });
      
      console.log('\n生成的 Token:');
      console.log(token);
      
      // 測試 API
      console.log('\n=== 測試 API ===');
      const response = await fetch('http://localhost:3000/api/apps?page=1&limit=10', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ API 回應成功');
        console.log('分頁資訊:', data.pagination);
        console.log('統計資訊:', data.stats);
        console.log(`應用程式數量: ${data.apps?.length || 0}`);
      } else {
        console.log('❌ API 回應失敗:', response.status, response.statusText);
        const errorText = await response.text();
        console.log('錯誤詳情:', errorText);
      }
    }

    await connection.end();
  } catch (error) {
    console.error('檢查失敗:', error);
  }
}

checkUsers(); 