// 模擬前端類型映射函數
const mapApiTypeToDisplayType = (apiType) => {
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
};

// 模擬 handleEditApp 函數（修正後）
const handleEditApp = (app) => {
  console.log('=== handleEditApp Debug ===');
  console.log('Input app:', app);
  console.log('app.type:', app.type);
  console.log('app.department:', app.department);
  console.log('app.creator:', app.creator);
  
  // 處理類型轉換：如果類型是英文的，轉換為中文
  let displayType = app.type;
  if (app.type && !['文字處理', '圖像生成', '程式開發', '數據分析', '教育工具', '健康醫療', '金融科技', '物聯網', '區塊鏈', 'AR/VR', '機器學習', '電腦視覺', '自然語言處理', '機器人', '網路安全', '雲端服務', '其他'].includes(app.type)) {
    displayType = mapApiTypeToDisplayType(app.type);
  }
  
  // 處理部門和創建者資料
  let department = app.department;
  let creator = app.creator;
  
  // 如果 app.creator 是物件（來自詳細 API），提取名稱
  if (app.creator && typeof app.creator === 'object') {
    creator = app.creator.name || "";
    department = app.creator.department || app.department || "HQBU";
  }
  
  const newAppData = {
    name: app.name,
    type: displayType,
    department: department || "HQBU",
    creator: creator || "",
    description: app.description,
    appUrl: app.appUrl || app.demoUrl || "",
    icon: app.icon || "Bot",
    iconColor: app.iconColor || "from-blue-500 to-purple-500",
  };
  
  console.log('newAppData:', newAppData);
  return newAppData;
};

async function testEditAppConsistency() {
  console.log('🧪 測試編輯應用功能一致性...\n');

  // 1. 模擬列表中的應用資料（來自 loadApps）
  const listApp = {
    id: 'test123',
    name: '測試應用程式',
    description: '這是一個測試應用程式',
    type: '文字處理', // 已經轉換為中文
    department: 'HQBU',
    creator: '測試創建者',
    appUrl: 'https://example.com',
    icon: 'Bot',
    iconColor: 'from-blue-500 to-purple-500'
  };

  // 2. 模擬詳細 API 返回的應用資料
  const detailApp = {
    id: 'test123',
    name: '測試應用程式',
    description: '這是一個測試應用程式',
    type: 'productivity', // 英文類型
    department: 'HQBU',
    creator: {
      id: 'user123',
      name: '測試創建者',
      email: 'test@example.com',
      department: 'HQBU',
      role: 'developer'
    },
    demoUrl: 'https://example.com',
    icon: 'Bot',
    iconColor: 'from-blue-500 to-purple-500'
  };

  console.log('📋 測試列表中的編輯功能:');
  console.log('輸入資料:', listApp);
  const listResult = handleEditApp(listApp);
  console.log('處理結果:', listResult);

  console.log('\n📋 測試詳細對話框中的編輯功能:');
  console.log('輸入資料:', detailApp);
  const detailResult = handleEditApp(detailApp);
  console.log('處理結果:', detailResult);

  // 3. 驗證一致性
  console.log('\n✅ 一致性檢查:');
  const fieldsToCheck = ['name', 'type', 'department', 'creator', 'description', 'appUrl', 'icon', 'iconColor'];
  
  fieldsToCheck.forEach(field => {
    const listValue = listResult[field];
    const detailValue = detailResult[field];
    const isConsistent = listValue === detailValue;
    console.log(`  ${field}: ${listValue} vs ${detailValue} ${isConsistent ? '✅' : '❌'}`);
  });

  // 4. 測試不同類型的轉換
  console.log('\n🔍 測試類型轉換:');
  const testTypes = [
    { apiType: 'productivity', expected: '文字處理' },
    { apiType: 'ai_model', expected: '圖像生成' },
    { apiType: 'automation', expected: '程式開發' },
    { apiType: 'data_analysis', expected: '數據分析' },
    { apiType: 'educational', expected: '教育工具' },
    { apiType: 'healthcare', expected: '健康醫療' },
    { apiType: 'finance', expected: '金融科技' },
    { apiType: 'iot_device', expected: '物聯網' },
    { apiType: 'blockchain', expected: '區塊鏈' },
    { apiType: 'ar_vr', expected: 'AR/VR' },
    { apiType: 'machine_learning', expected: '機器學習' },
    { apiType: 'computer_vision', expected: '電腦視覺' },
    { apiType: 'nlp', expected: '自然語言處理' },
    { apiType: 'robotics', expected: '機器人' },
    { apiType: 'cybersecurity', expected: '網路安全' },
    { apiType: 'cloud_service', expected: '雲端服務' },
    { apiType: 'other', expected: '其他' }
  ];

  testTypes.forEach(({ apiType, expected }) => {
    const testApp = {
      ...detailApp,
      type: apiType
    };
    const result = handleEditApp(testApp);
    const isCorrect = result.type === expected;
    console.log(`  ${apiType} -> ${result.type} ${isCorrect ? '✅' : '❌'}`);
  });

  console.log('\n✅ 編輯應用功能一致性測試完成！');
}

testEditAppConsistency().catch(console.error); 