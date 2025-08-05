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

// 模擬瀏覽器的 localStorage
const mockLocalStorage = {
  token: generateTestToken()
};

console.log('🧪 測試前端認證狀態...');
console.log('Token 存在:', !!mockLocalStorage.token);
console.log('Token 長度:', mockLocalStorage.token.length);

function makeRequest(url, method = 'GET', headers = {}) {
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

    req.end();
  });
}

async function testFrontendAPI() {
  try {
    console.log('\n🧪 測試前端 API 調用...');
    
    const response = await makeRequest('http://localhost:3000/api/apps', 'GET', {
      'Authorization': `Bearer ${mockLocalStorage.token}`
    });

    if (response.status === 200) {
      console.log('✅ API 調用成功');
      console.log('應用程式數量:', response.data.apps?.length || 0);
      
      if (response.data.apps && response.data.apps.length > 0) {
        const app = response.data.apps[0];
        console.log('第一個應用程式範例:');
        console.log('- ID:', app.id);
        console.log('- 名稱:', app.name);
        console.log('- 創建者:', app.creator?.name);
        console.log('- 部門:', app.creator?.department);
        console.log('- 狀態:', app.status);
        console.log('- 類型:', app.type);
      }
    } else {
      console.log('❌ API 調用失敗:', response.status);
      console.log('回應:', response.data);
    }
  } catch (error) {
    console.error('❌ 測試失敗:', error.message);
  }
}

testFrontendAPI(); 