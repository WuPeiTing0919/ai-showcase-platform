const http = require('http');

// 簡單的 HTTP 請求函數
function makeSimpleRequest(url, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json'
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

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

async function testSimple() {
  console.log('🧪 簡單 API 測試...\n');

  try {
    // 測試健康檢查
    console.log('1️⃣ 測試健康檢查...');
    const health = await makeSimpleRequest('http://localhost:3000/api');
    console.log(`   狀態碼: ${health.status}`);
    console.log(`   回應: ${JSON.stringify(health.data, null, 2)}`);
    console.log('');

    // 測試註冊 API
    console.log('2️⃣ 測試註冊 API...');
    const register = await makeSimpleRequest('http://localhost:3000/api/auth/register', 'POST', {
      name: '測試用戶',
      email: 'test@example.com',
      password: 'Test@2024',
      department: '測試部門'
    });
    console.log(`   狀態碼: ${register.status}`);
    console.log(`   回應: ${JSON.stringify(register.data, null, 2)}`);

  } catch (error) {
    console.error('❌ 測試失敗:', error.message);
  }
}

testSimple(); 