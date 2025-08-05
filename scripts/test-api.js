const https = require('https');
const http = require('http');

// 測試配置
const BASE_URL = 'http://localhost:3000';
const ADMIN_EMAIL = 'admin@theaken.com';
const ADMIN_PASSWORD = 'Admin@2024';

// 測試用戶資料
const TEST_USER = {
  name: '測試用戶',
  email: 'test@theaken.com',
  password: 'Test@2024',
  department: '測試部門',
  role: 'user'
};

// 發送 HTTP 請求
async function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    const req = client.request(requestOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: jsonData
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

// 測試函數
async function testAPI() {
  console.log('🧪 開始測試 API...\n');

  try {
    // 1. 測試健康檢查
    console.log('1️⃣ 測試健康檢查 API...');
    const healthResponse = await makeRequest(`${BASE_URL}/api`);
    console.log(`   狀態碼: ${healthResponse.status}`);
    console.log(`   回應: ${JSON.stringify(healthResponse.data, null, 2)}`);
    console.log('');

    // 2. 測試註冊 API
    console.log('2️⃣ 測試註冊 API...');
    const registerResponse = await makeRequest(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      body: TEST_USER
    });
    console.log(`   狀態碼: ${registerResponse.status}`);
    console.log(`   回應: ${JSON.stringify(registerResponse.data, null, 2)}`);
    console.log('');

    // 3. 測試登入 API
    console.log('3️⃣ 測試登入 API...');
    const loginResponse = await makeRequest(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      body: {
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD
      }
    });
    console.log(`   狀態碼: ${loginResponse.status}`);
    
    let authToken = null;
    if (loginResponse.status === 200) {
      authToken = loginResponse.data.token;
      console.log(`   登入成功，獲得 Token`);
    } else {
      console.log(`   登入失敗: ${JSON.stringify(loginResponse.data, null, 2)}`);
    }
    console.log('');

    // 4. 測試獲取當前用戶 API
    if (authToken) {
      console.log('4️⃣ 測試獲取當前用戶 API...');
      const meResponse = await makeRequest(`${BASE_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      console.log(`   狀態碼: ${meResponse.status}`);
      console.log(`   回應: ${JSON.stringify(meResponse.data, null, 2)}`);
      console.log('');
    }

    // 5. 測試用戶列表 API (需要管理員權限)
    if (authToken) {
      console.log('5️⃣ 測試用戶列表 API...');
      const usersResponse = await makeRequest(`${BASE_URL}/api/users`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      console.log(`   狀態碼: ${usersResponse.status}`);
      console.log(`   回應: ${JSON.stringify(usersResponse.data, null, 2)}`);
      console.log('');
    }

    console.log('✅ API 測試完成!');

  } catch (error) {
    console.error('❌ API 測試失敗:', error.message);
    console.error('錯誤詳情:', error);
  }
}

// 執行測試
if (require.main === module) {
  testAPI();
}

module.exports = { testAPI }; 