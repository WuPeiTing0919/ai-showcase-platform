// 測試編輯應用功能是否正確使用資料庫值而非預設值
console.log('🧪 測試編輯應用功能資料庫值處理...');

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
    'other': '其他',
    // 舊的英文類型映射
    'web_app': '文字處理',
    'mobile_app': '文字處理',
    'desktop_app': '文字處理',
    'api_service': '程式開發'
  };
  return typeMap[apiType] || '其他';
};

// 模擬修正後的 handleEditApp 函數
const handleEditApp = (app) => {
  console.log('=== handleEditApp Debug ===');
  console.log('Input app:', app);
  console.log('app.type:', app.type);
  console.log('app.department:', app.department);
  console.log('app.creator:', app.creator);
  console.log('app.icon:', app.icon);
  console.log('app.iconColor:', app.iconColor);
  
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
    department = app.creator.department || app.department || "";
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

async function testEditAppDatabaseValues() {
  console.log('\n📋 測試案例 1: 資料庫有實際值的應用程式');
  
  // 模擬來自詳細 API 的資料（有實際資料庫值）
  const appWithRealData = {
    id: "test-1",
    name: "真實 AI 應用",
    description: "這是一個真實的應用程式",
    type: "productivity", // 英文 API 類型
    department: "ITBU", // 實際部門
    creator: {
      id: "user-1",
      name: "張三", // 實際創建者名稱
      email: "zhang@example.com",
      department: "ITBU",
      role: "developer"
    },
    icon: "Zap", // 實際圖示
    iconColor: "from-yellow-500 to-orange-500", // 實際圖示顏色
    appUrl: "https://example.com/app",
    demoUrl: "https://demo.example.com"
  };
  
  const result1 = handleEditApp(appWithRealData);
  
  console.log('\n✅ 測試案例 1 結果:');
  console.log('期望: 使用資料庫的實際值');
  console.log('實際結果:', result1);
  
  // 驗證結果
  const expected1 = {
    name: "真實 AI 應用",
    type: "文字處理", // 應該從 productivity 轉換
    department: "ITBU", // 應該使用實際部門
    creator: "張三", // 應該從物件提取名稱
    description: "這是一個真實的應用程式",
    appUrl: "https://example.com/app",
    icon: "Zap", // 應該使用實際圖示
    iconColor: "from-yellow-500 to-orange-500" // 應該使用實際顏色
  };
  
  const isCorrect1 = JSON.stringify(result1) === JSON.stringify(expected1);
  console.log('✅ 測試案例 1 通過:', isCorrect1);
  
  console.log('\n📋 測試案例 2: 資料庫值為空字串的應用程式');
  
  // 模擬資料庫值為空字串的情況
  const appWithEmptyData = {
    id: "test-2",
    name: "空值測試應用",
    description: "測試空值處理",
    type: "other",
    department: "", // 空字串
    creator: {
      id: "user-2",
      name: "", // 空字串
      email: "test@example.com",
      department: "", // 空字串
      role: "user"
    },
    icon: "", // 空字串
    iconColor: "", // 空字串
    appUrl: "",
    demoUrl: ""
  };
  
  const result2 = handleEditApp(appWithEmptyData);
  
  console.log('\n✅ 測試案例 2 結果:');
  console.log('期望: 保持空字串，不使用預設值');
  console.log('實際結果:', result2);
  
  // 驗證結果
  const expected2 = {
    name: "空值測試應用",
    type: "其他",
    department: "", // 應該保持空字串
    creator: "", // 應該保持空字串
    description: "測試空值處理",
    appUrl: "",
    icon: "", // 應該保持空字串
    iconColor: "" // 應該保持空字串
  };
  
  const isCorrect2 = JSON.stringify(result2) === JSON.stringify(expected2);
  console.log('✅ 測試案例 2 通過:', isCorrect2);
  
  console.log('\n📋 測試案例 3: 來自列表 API 的資料（字串格式）');
  
  // 模擬來自列表 API 的資料（字串格式）
  const appFromList = {
    id: "test-3",
    name: "列表應用",
    description: "來自列表的應用",
    type: "文字處理", // 已經是中文
    department: "HQBU", // 字串格式
    creator: "李四", // 字串格式
    icon: "Bot", // 字串格式
    iconColor: "from-blue-500 to-purple-500", // 字串格式
    appUrl: "https://list.example.com"
  };
  
  const result3 = handleEditApp(appFromList);
  
  console.log('\n✅ 測試案例 3 結果:');
  console.log('期望: 直接使用字串值');
  console.log('實際結果:', result3);
  
  // 驗證結果
  const expected3 = {
    name: "列表應用",
    type: "文字處理",
    department: "HQBU",
    creator: "李四",
    description: "來自列表的應用",
    appUrl: "https://list.example.com",
    icon: "Bot",
    iconColor: "from-blue-500 to-purple-500"
  };
  
  const isCorrect3 = JSON.stringify(result3) === JSON.stringify(expected3);
  console.log('✅ 測試案例 3 通過:', isCorrect3);
  
  console.log('\n📊 總結:');
  console.log(`✅ 測試案例 1 (實際資料庫值): ${isCorrect1 ? '通過' : '失敗'}`);
  console.log(`✅ 測試案例 2 (空字串處理): ${isCorrect2 ? '通過' : '失敗'}`);
  console.log(`✅ 測試案例 3 (列表資料格式): ${isCorrect3 ? '通過' : '失敗'}`);
  
  if (isCorrect1 && isCorrect2 && isCorrect3) {
    console.log('\n🎉 所有測試案例通過！編輯功能現在正確使用資料庫值而非預設值。');
  } else {
    console.log('\n❌ 部分測試案例失敗，需要進一步檢查。');
  }
}

// 執行測試
testEditAppDatabaseValues().catch(console.error); 