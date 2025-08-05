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

    console.log('發送請求到:', url);
    console.log('請求方法:', method);
    console.log('請求標頭:', options.headers);

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('回應狀態:', res.statusCode);
        console.log('回應標頭:', res.headers);
        
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
      const bodyStr = JSON.stringify(body);
      console.log('請求體:', bodyStr);
      req.write(bodyStr);
    }

    req.end();
  });
}

async function testAuthDetailed() {
  try {
    console.log('🧪 詳細認證測試...');
    
    // 生成測試 Token
    const token = generateTestToken();
    console.log('✅ Token 生成成功');
    console.log('Token 長度:', token.length);
    
    // 驗證 Token
    const payload = jwt.verify(token, JWT_SECRET);
    console.log('✅ Token 驗證成功:', payload);
    
    // 測試 GET 請求（不需要認證）
    console.log('\n1. 測試 GET /api/apps（需要認證）...');
    const getResponse = await makeRequest('http://localhost:3000/api/apps', 'GET', null, {
      'Authorization': `Bearer ${token}`
    });
    
    console.log('GET 回應:', JSON.stringify(getResponse.data, null, 2));
    
    // 測試 POST 請求
    console.log('\n2. 測試 POST /api/apps...');
    const appData = {
      name: '測試應用',
      description: '這是一個測試應用',
      type: 'productivity',
      demoUrl: 'https://example.com',
      version: '1.0.0'
    };
    
    const postResponse = await makeRequest('http://localhost:3000/api/apps', 'POST', appData, {
      'Authorization': `Bearer ${token}`
    });
    
    console.log('POST 回應:', JSON.stringify(postResponse.data, null, 2));
    
  } catch (error) {
    console.error('❌ 測試失敗:', error.message);
  }
}

testAuthDetailed(); 