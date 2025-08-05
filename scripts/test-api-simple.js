const http = require('http');

function makeRequest(url, method = 'GET') {
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

    req.end();
  });
}

async function testAPI() {
  try {
    console.log('🧪 測試 API 可訪問性...');
    
    // 測試根 API
    console.log('\n1. 測試根 API...');
    const response = await makeRequest('http://localhost:3000/api');
    console.log('狀態碼:', response.status);
    console.log('回應:', JSON.stringify(response.data, null, 2));
    
    // 測試 apps API
    console.log('\n2. 測試 apps API...');
    const appsResponse = await makeRequest('http://localhost:3000/api/apps');
    console.log('狀態碼:', appsResponse.status);
    console.log('回應:', JSON.stringify(appsResponse.data, null, 2));
    
  } catch (error) {
    console.error('❌ 測試失敗:', error.message);
  }
}

testAPI(); 