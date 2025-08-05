const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'good777';

async function testApiStats() {
  try {
    // Generate a token for admin user
    const adminPayload = {
      id: 1,
      email: 'admin@example.com',
      role: 'admin'
    };
    const token = jwt.sign(adminPayload, JWT_SECRET, { expiresIn: '1h' });

    console.log('=== 測試 API 統計 ===');
    
    // Test the apps API
    const response = await fetch('http://localhost:3000/api/apps?page=1&limit=10', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API 回應成功');
      console.log('分頁資訊:', data.pagination);
      console.log('統計資訊:', data.stats);
      console.log(`應用程式數量: ${data.apps?.length || 0}`);
    } else {
      console.log('❌ API 回應失敗:', response.status, response.statusText);
      const errorText = await response.text();
      console.log('錯誤詳情:', errorText);
    }

  } catch (error) {
    console.error('測試過程中發生錯誤:', error);
  }
}

testApiStats(); 