const http = require('http');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'good777';

// 測試登入
function testLogin(email, password) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      email: email,
      password: password
    });

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            status: res.statusCode,
            data: jsonData
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            data: data
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

async function testLogins() {
  console.log('🧪 測試登入...');
  
  const testUsers = [
    { email: 'admin@theaken.com', password: 'Admin123' },
    { email: 'admin@example.com', password: 'Admin123' },
    { email: 'petty091901@gmail.com', password: 'Admin123' },
    { email: 'test@theaken.com', password: 'Test123' },
    { email: 'test@example.com', password: 'Test123' }
  ];

  for (const user of testUsers) {
    try {
      console.log(`\n測試用戶: ${user.email}`);
      const response = await testLogin(user.email, user.password);
      
      if (response.status === 200) {
        console.log('✅ 登入成功');
        console.log('用戶資訊:', response.data.user);
        console.log('Token 長度:', response.data.token?.length || 0);
      } else {
        console.log('❌ 登入失敗');
        console.log('錯誤:', response.data.error);
      }
    } catch (error) {
      console.error('❌ 測試失敗:', error.message);
    }
  }
}

testLogins(); 