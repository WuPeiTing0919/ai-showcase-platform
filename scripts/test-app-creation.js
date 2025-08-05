const http = require('http');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'good777';

// 生成測試 Token
function generateTestToken() {
  return jwt.sign({
    userId: 'mdxxt1xt7slle4g8wz8', // 使用現有的管理員用戶 ID
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

async function testAppCreation() {
  try {
    console.log('🧪 測試應用程式創建...');
    
    // 生成測試 Token
    const token = generateTestToken();
    console.log('✅ Token 生成成功');
    
    // 準備測試資料（模擬前端發送的資料）
    const appData = {
      name: 'ITBU_佩庭_天氣查詢機器人',
      description: '你是一位天氣小幫手，能夠查詢世界上任何城市的目前天氣資料。',
      type: 'productivity',
      demoUrl: 'https://dify.theaken.com/chat/xLqNfXDQIeoKGROm',
      version: '1.0.0'
    };
    
    console.log('📤 發送資料:', JSON.stringify(appData, null, 2));
    
    // 發送請求
    console.log('🔑 使用 Token:', token.substring(0, 50) + '...');
    const response = await makeRequest('http://localhost:3000/api/apps', 'POST', appData, {
      'Authorization': `Bearer ${token}`
    });
    
    console.log('📥 回應狀態:', response.status);
    console.log('📥 回應資料:', JSON.stringify(response.data, null, 2));
    
    if (response.status === 201) {
      console.log('✅ 應用程式創建成功！');
    } else {
      console.log('❌ 應用程式創建失敗');
    }
    
  } catch (error) {
    console.error('❌ 測試失敗:', error.message);
  }
}

testAppCreation(); 