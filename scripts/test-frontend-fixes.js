const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'good777';

async function testFrontendFixes() {
  try {
    // Generate a token for admin user
    const adminPayload = {
      userId: 'admin-001',
      email: 'admin@theaken.com',
      role: 'admin'
    };
    const token = jwt.sign(adminPayload, JWT_SECRET, { expiresIn: '1h' });

    console.log('=== 測試前端修復 ===');
    
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
      console.log('統計資訊:', data1.stats);
      
      // 模擬前端數據轉換
      const formattedApps = (data1.apps || []).map((app) => ({
        ...app,
        creator: app.creator?.name || '未知',
        department: app.creator?.department || '未知',
        views: app.viewsCount || 0,
        likes: app.likesCount || 0,
        appUrl: app.demoUrl || '',
        type: mapApiTypeToDisplayType(app.type),
        icon: 'Bot',
        iconColor: 'from-blue-500 to-purple-500',
        reviews: 0,
        createdAt: app.createdAt ? new Date(app.createdAt).toLocaleDateString() : '未知'
      }));
      
      console.log('\n模擬前端統計:');
      console.log(`總應用數 (totalApps): ${data1.pagination?.total}`);
      console.log(`已發布: ${data1.stats?.published || 0}`);
      console.log(`待審核: ${data1.stats?.pending || 0}`);
      console.log(`草稿: ${data1.stats?.draft || 0}`);
      console.log(`已拒絕: ${data1.stats?.rejected || 0}`);
      
      // 檢查分頁是否應該顯示
      const shouldShowPagination = data1.pagination?.totalPages > 1;
      console.log(`\n分頁是否應該顯示: ${shouldShowPagination} (總頁數: ${data1.pagination?.totalPages})`);
      
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
      
      // 檢查狀態是否正確 (應該是 draft)
      if (result.app?.status === 'draft') {
        console.log('✅ 狀態正確: 管理員創建的應用程式狀態為 draft');
      } else {
        console.log('❌ 狀態錯誤: 管理員創建的應用程式狀態應該為 draft，但實際為', result.app?.status);
      }
    } else {
      const errorData = await response2.json();
      console.log('❌ 創建應用程式失敗:', errorData);
    }

  } catch (error) {
    console.error('測試過程中發生錯誤:', error);
  }
}

// 模擬前端的類型轉換函數
function mapApiTypeToDisplayType(apiType) {
  const typeMap = {
    'productivity': '文字處理',
    'ai_model': '圖像生成',
    'automation': '程式開發',
    'data_analysis': '數據分析',
    'educational': '教育工具',
    'healthcare': '健康醫療',
    'finance': '金融科技',
    'iot_device': '物聯網',
    'blockchain': '區塊鏈',
    'ar_vr': 'AR/VR',
    'machine_learning': '機器學習',
    'computer_vision': '電腦視覺',
    'nlp': '自然語言處理',
    'robotics': '機器人',
    'cybersecurity': '網路安全',
    'cloud_service': '雲端服務',
    'other': '其他'
  };
  return typeMap[apiType] || '其他';
}

testFrontendFixes(); 