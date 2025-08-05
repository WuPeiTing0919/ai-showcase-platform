const http = require('http');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'good777';

// 生成測試 Token
function generateTestToken() {
  return jwt.sign({
    userId: 'mdxxt1xt7slle4g8wz8',
    email: 'petty091901@gmail.com',
    role: 'admin'
  }, JWT_SECRET, { expiresIn: '1h' });
}

// 發送 HTTP 請求
function makeRequest(url, method = 'GET', body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
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

async function testAppsQuery() {
  try {
    console.log('🧪 測試應用程式查詢...');
    
    // 生成測試 Token
    const token = generateTestToken();
    console.log('✅ Token 生成成功');
    
    // 測試 GET /api/apps
    console.log('\n1. 測試 GET /api/apps...');
    const response = await makeRequest('http://localhost:3000/api/apps', 'GET', null, {
      'Authorization': `Bearer ${token}`
    });
    
    console.log('狀態碼:', response.status);
    console.log('回應:', JSON.stringify(response.data, null, 2));
    
    if (response.status === 200) {
      console.log('✅ 應用程式查詢成功');
      console.log('應用程式數量:', response.data.apps?.length || 0);
      
      if (response.data.apps && response.data.apps.length > 0) {
        console.log('第一個應用程式:', response.data.apps[0]);
      }
    } else {
      console.log('❌ 應用程式查詢失敗');
    }
    
  } catch (error) {
    console.error('❌ 測試失敗:', error.message);
  }
}

testAppsQuery(); 