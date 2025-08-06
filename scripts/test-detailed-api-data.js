// 測試詳細 API 資料結構，檢查創建者資訊
console.log('🧪 測試詳細 API 資料結構...');

// 模擬詳細 API 的資料結構（基於實際資料庫查詢結果）
const detailedAppData = {
  id: "mdzncsmzelu6n5v6e5",
  name: "ITBU_佩庭_天氣查詢機器人",
  description: "SADSADSADASDASDASDAS",
  creatorId: "user-123",
  teamId: null,
  status: "draft",
  type: "ai_model",
  filePath: null,
  techStack: [],
  tags: [],
  screenshots: [],
  demoUrl: "https://dify.theaken.com/chat/xLqNfXDQleoKGROm",
  githubUrl: null,
  docsUrl: null,
  version: "1.0.0",
  likesCount: 0,
  viewsCount: 0,
  rating: 0,
  createdAt: "2025-08-06T07:28:50.000Z",
  updatedAt: "2025-08-06T07:28:50.000Z",
  lastUpdated: "2025-08-06T07:28:50.000Z",
  creator: {
    id: "user-123",
    name: "佩庭", // 實際資料庫中的創建者名稱
    email: "admin@example.com",
    department: "ITBU",
    role: "developer"
  },
  team: undefined
};

console.log('📋 詳細 API 資料結構:');
console.log('應用名稱:', detailedAppData.name);
console.log('創建者物件:', detailedAppData.creator);
console.log('創建者名稱:', detailedAppData.creator.name);
console.log('創建者部門:', detailedAppData.creator.department);

// 模擬 handleEditApp 函數處理
const handleEditApp = (app) => {
  console.log('\n=== handleEditApp Debug ===');
  console.log('Input app:', app);
  console.log('app.creator:', app.creator);
  console.log('app.creator.name:', app.creator?.name);
  console.log('app.creator.department:', app.creator?.department);
  
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
    type: app.type || "",
    department: department || "",
    creator: creator || "",
    description: app.description || "",
    appUrl: app.demoUrl || "",
    icon: app.icon || "",
    iconColor: app.iconColor || "",
  };
  
  console.log('newAppData:', newAppData);
  return newAppData;
};

// 測試處理
const result = handleEditApp(detailedAppData);

console.log('\n✅ 測試結果:');
console.log('期望創建者名稱: 佩庭');
console.log('實際創建者名稱:', result.creator);
console.log('期望部門: ITBU');
console.log('實際部門:', result.department);

const isCorrect = result.creator === "佩庭" && result.department === "ITBU";
console.log('✅ 測試通過:', isCorrect);

if (isCorrect) {
  console.log('\n🎉 創建者資訊處理正確！');
} else {
  console.log('\n❌ 創建者資訊處理有問題，需要檢查。');
} 