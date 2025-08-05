const jwt = require('jsonwebtoken');

async function testPagination() {
  console.log('🧪 測試分頁功能...');
  
  // 生成測試 token
  const token = jwt.sign(
    { userId: 'admin-001', role: 'admin' },
    process.env.JWT_SECRET || 'good777',
    { expiresIn: '1h' }
  );
  
  console.log('✅ Token 生成成功\n');

  // 測試不同的分頁參數
  const testCases = [
    { page: 1, limit: 3, description: '第1頁，每頁3筆' },
    { page: 2, limit: 3, description: '第2頁，每頁3筆' },
    { page: 1, limit: 5, description: '第1頁，每頁5筆' },
    { page: 1, limit: 10, description: '第1頁，每頁10筆' }
  ];

  for (const testCase of testCases) {
    console.log(`\n${testCase.description}:`);
    
    try {
      const params = new URLSearchParams({
        page: testCase.page.toString(),
        limit: testCase.limit.toString()
      });
      
      const response = await fetch(`http://localhost:3000/api/apps?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`  狀態碼: ${response.status}`);
        console.log(`  應用程式數量: ${data.apps.length}`);
        console.log(`  分頁資訊:`, data.pagination);
      } else {
        console.log(`  錯誤: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.log(`  請求失敗: ${error.message}`);
    }
  }
  
  console.log('\n✅ 分頁測試完成');
}

testPagination(); 