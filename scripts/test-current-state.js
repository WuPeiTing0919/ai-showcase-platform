const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'good777';

async function testCurrentState() {
  try {
    // Generate a token for admin user
    const adminPayload = {
      id: 1,
      email: 'admin@example.com',
      role: 'admin'
    };
    const token = jwt.sign(adminPayload, JWT_SECRET, { expiresIn: '1h' });

    console.log('=== 測試當前狀態 ===');
    
    // Test 1: Get apps list with pagination
    console.log('\n1. 測試應用程式列表 (分頁)');
    const response1 = await fetch('http://localhost:3000/api/apps?page=1&limit=10', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response1.ok) {
      const data1 = await response1.json();
      console.log('✅ API 回應成功');
      console.log(`總應用數: ${data1.pagination?.total || 'N/A'}`);
      console.log(`總頁數: ${data1.pagination?.totalPages || 'N/A'}`);
      console.log(`當前頁應用數: ${data1.apps?.length || 0}`);
      console.log('應用狀態統計:');
      const statusCounts = {};
      data1.apps?.forEach(app => {
        statusCounts[app.status] = (statusCounts[app.status] || 0) + 1;
      });
      console.log(statusCounts);
    } else {
      console.log('❌ API 回應失敗:', response1.status, response1.statusText);
    }

    // Test 2: Create a new app as admin
    console.log('\n2. 測試管理員創建應用程式');
    const newAppData = {
      name: '測試應用程式_' + Date.now(),
      description: '這是一個測試應用程式',
      type: 'productivity',
      demoUrl: 'https://example.com',
      version: '1.0.0'
    };

    const response2 = await fetch('http://localhost:3000/api/apps', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(newAppData)
    });

    if (response2.ok) {
      const result = await response2.json();
      console.log('✅ 創建應用程式成功');
      console.log('創建的應用程式狀態:', result.app?.status);
      console.log('應用程式ID:', result.appId);
    } else {
      const errorData = await response2.json();
      console.log('❌ 創建應用程式失敗:', errorData);
    }

    // Test 3: Get apps list again to see the new app
    console.log('\n3. 重新獲取應用程式列表');
    const response3 = await fetch('http://localhost:3000/api/apps?page=1&limit=10', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response3.ok) {
      const data3 = await response3.json();
      console.log('✅ 重新獲取成功');
      console.log(`更新後總應用數: ${data3.pagination?.total || 'N/A'}`);
      console.log(`更新後總頁數: ${data3.pagination?.totalPages || 'N/A'}`);
      
      // Find the newly created app
      const newApp = data3.apps?.find(app => app.name.includes('測試應用程式_'));
      if (newApp) {
        console.log('新創建的應用程式狀態:', newApp.status);
      }
    } else {
      console.log('❌ 重新獲取失敗:', response3.status, response3.statusText);
    }

  } catch (error) {
    console.error('測試過程中發生錯誤:', error);
  }
}

testCurrentState(); 