const jwt = require('jsonwebtoken');

async function testApproval() {
  console.log('🧪 測試批准功能...');
  
  // 生成測試 token
  const token = jwt.sign(
    { userId: 'admin-001', role: 'admin' },
    process.env.JWT_SECRET || 'good777',
    { expiresIn: '1h' }
  );
  
  console.log('✅ Token 生成成功\n');

  try {
    // 首先獲取應用程式列表
    const response = await fetch('http://localhost:3000/api/apps', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      console.log(`❌ 獲取應用程式失敗: ${response.status}`);
      return;
    }
    
    const data = await response.json();
    console.log(`✅ 獲取到 ${data.apps.length} 個應用程式`);
    
    // 找到一個可以測試的應用程式
    const testApp = data.apps[0];
    if (!testApp) {
      console.log('❌ 沒有找到可測試的應用程式');
      return;
    }
    
    console.log(`\n測試應用程式: ${testApp.name} (ID: ${testApp.id})`);
    console.log(`當前狀態: ${testApp.status}`);
    
    // 測試批准功能
    console.log('\n測試批准功能...');
    const approveResponse = await fetch(`http://localhost:3000/api/apps/${testApp.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        status: 'published'
      })
    });
    
    if (approveResponse.ok) {
      console.log('✅ 批准成功');
    } else {
      const errorData = await approveResponse.json();
      console.log(`❌ 批准失敗: ${errorData.error}`);
    }
    
    // 測試拒絕功能
    console.log('\n測試拒絕功能...');
    const rejectResponse = await fetch(`http://localhost:3000/api/apps/${testApp.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        status: 'rejected'
      })
    });
    
    if (rejectResponse.ok) {
      console.log('✅ 拒絕成功');
    } else {
      const errorData = await rejectResponse.json();
      console.log(`❌ 拒絕失敗: ${errorData.error}`);
    }
    
  } catch (error) {
    console.log(`❌ 測試失敗: ${error.message}`);
  }
  
  console.log('\n✅ 批准測試完成');
}

testApproval(); 