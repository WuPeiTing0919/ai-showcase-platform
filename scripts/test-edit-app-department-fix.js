// 測試編輯應用功能部門資訊修正
console.log('🧪 測試編輯應用功能部門資訊修正...');

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

// 模擬修正後的 handleEditApp 函數
const handleEditApp = (app) => {
  console.log('=== handleEditApp Debug ===');
  console.log('Input app:', app);
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
    // 優先使用應用程式的部門，而不是創建者的部門
    department = app.department || app.creator.department || "";
  }
  
  const newAppData = {
    name: app.name || "",
    type: displayType || "文字處理",
    department: department || "",
    creator: creator || "",
    description: app.description || "",
    appUrl: app.appUrl || app.demoUrl || "",
    icon: app.icon || "",
    iconColor: app.iconColor || "",
  };
  
  console.log('newAppData:', newAppData);
  return newAppData;
};

async function testEditAppDepartmentFix() {
  console.log('\n📋 測試案例 1: 來自列表 API 的資料');
  
  // 模擬來自列表 API 的資料（基於實際資料庫資料）
  const listAppData = {
    id: "mdzotctmlayh9u9iogt",
    name: "Wu Petty",
    description: "ewqewqewqewqeqwewqewq",
    type: "automation",
    department: "MBU1", // 應用程式的部門
    creator: {
      id: "admin-1754374591679",
      name: "佩庭", // 創建者名稱
      email: "admin@example.com",
      department: "ITBU", // 創建者的部門
      role: "admin"
    },
    icon: "Zap",
    iconColor: "from-yellow-500 to-orange-500",
    appUrl: "https://example.com/app"
  };
  
  const result1 = handleEditApp(listAppData);
  
  console.log('\n✅ 測試案例 1 結果:');
  console.log('期望創建者名稱: 佩庭');
  console.log('實際創建者名稱:', result1.creator);
  console.log('期望部門: MBU1 (應用程式部門)');
  console.log('實際部門:', result1.department);
  
  const isCorrect1 = result1.creator === "佩庭" && result1.department === "MBU1";
  console.log('✅ 測試案例 1 通過:', isCorrect1);
  
  console.log('\n📋 測試案例 2: 來自詳細 API 的資料');
  
  // 模擬來自詳細 API 的資料
  const detailAppData = {
    id: "mdzotctmlayh9u9iogt",
    name: "Wu Petty",
    description: "ewqewqewqewqeqwewqewq",
    type: "automation",
    department: "MBU1", // 應用程式的部門
    creator: {
      id: "admin-1754374591679",
      name: "佩庭",
      email: "admin@example.com",
      department: "ITBU", // 創建者的部門
      role: "admin"
    },
    demoUrl: "https://example.com/demo"
  };
  
  const result2 = handleEditApp(detailAppData);
  
  console.log('\n✅ 測試案例 2 結果:');
  console.log('期望創建者名稱: 佩庭');
  console.log('實際創建者名稱:', result2.creator);
  console.log('期望部門: MBU1 (應用程式部門)');
  console.log('實際部門:', result2.department);
  
  const isCorrect2 = result2.creator === "佩庭" && result2.department === "MBU1";
  console.log('✅ 測試案例 2 通過:', isCorrect2);
  
  console.log('\n📊 總結:');
  console.log(`✅ 測試案例 1 (列表資料): ${isCorrect1 ? '通過' : '失敗'}`);
  console.log(`✅ 測試案例 2 (詳細資料): ${isCorrect2 ? '通過' : '失敗'}`);
  
  if (isCorrect1 && isCorrect2) {
    console.log('\n🎉 部門資訊修正成功！現在正確使用應用程式的部門而非創建者的部門。');
  } else {
    console.log('\n❌ 部分測試案例失敗，需要進一步檢查。');
  }
}

// 執行測試
testEditAppDepartmentFix().catch(console.error); 