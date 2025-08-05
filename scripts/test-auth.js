const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');

const dbConfig = {
  host: process.env.DB_HOST || 'mysql.theaken.com',
  port: parseInt(process.env.DB_PORT || '33306'),
  user: process.env.DB_USER || 'AI_Platform',
  password: process.env.DB_PASSWORD || 'Aa123456',
  database: process.env.DB_NAME || 'db_AI_Platform',
  charset: 'utf8mb4',
  timezone: '+08:00'
};

const JWT_SECRET = process.env.JWT_SECRET || 'good777';

async function testAuth() {
  let connection;
  
  try {
    console.log('🧪 測試認證過程...');
    
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 資料庫連接成功');
    
    // 1. 檢查用戶是否存在
    console.log('\n1. 檢查用戶是否存在...');
    const [users] = await connection.execute(
      'SELECT id, name, email, role FROM users WHERE id = ?',
      ['mdxxt1xt7slle4g8wz8']
    );
    
    if (users.length === 0) {
      console.log('❌ 用戶不存在');
      return;
    }
    
    const user = users[0];
    console.log('✅ 用戶存在:', user);
    
    // 2. 生成 Token
    console.log('\n2. 生成 JWT Token...');
    const token = jwt.sign({
      userId: user.id,
      email: user.email,
      role: user.role
    }, JWT_SECRET, { expiresIn: '1h' });
    
    console.log('✅ Token 生成成功');
    console.log('Token:', token.substring(0, 50) + '...');
    
    // 3. 驗證 Token
    console.log('\n3. 驗證 JWT Token...');
    const payload = jwt.verify(token, JWT_SECRET);
    console.log('✅ Token 驗證成功:', payload);
    
    // 4. 模擬認證查詢
    console.log('\n4. 模擬認證查詢...');
    const [authUser] = await connection.execute(
      'SELECT * FROM users WHERE id = ? AND email = ?',
      [payload.userId, payload.email]
    );
    
    if (authUser.length === 0) {
      console.log('❌ 認證查詢失敗 - 用戶不存在');
    } else {
      console.log('✅ 認證查詢成功:', authUser[0]);
    }
    
    // 5. 檢查用戶角色
    console.log('\n5. 檢查用戶角色...');
    if (authUser.length > 0) {
      const userRole = authUser[0].role;
      console.log('用戶角色:', userRole);
      
      if (userRole === 'admin' || userRole === 'developer') {
        console.log('✅ 用戶有權限創建應用程式');
      } else {
        console.log('❌ 用戶沒有權限創建應用程式');
      }
    }
    
  } catch (error) {
    console.error('❌ 測試失敗:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

testAuth(); 