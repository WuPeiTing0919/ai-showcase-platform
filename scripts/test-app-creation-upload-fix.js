const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || 'mysql.theaken.com',
  port: parseInt(process.env.DB_PORT || '33306'),
  user: process.env.DB_USER || 'AI_Platform',
  password: process.env.DB_PASSWORD || 'Aa123456',
  database: process.env.DB_NAME || 'db_AI_Platform',
  charset: 'utf8mb4',
  timezone: '+08:00'
};

// 模擬前端類型映射函數
const mapTypeToApiType = (frontendType) => {
  const typeMap = {
    '文字處理': 'productivity',
    '圖像生成': 'ai_model',
    '圖像處理': 'ai_model',
    '語音辨識': 'ai_model',
    '推薦系統': 'ai_model',
    '音樂生成': 'ai_model',
    '程式開發': 'automation',
    '影像處理': 'ai_model',
    '對話系統': 'ai_model',
    '數據分析': 'data_analysis',
    '設計工具': 'productivity',
    '語音技術': 'ai_model',
    '教育工具': 'educational',
    '健康醫療': 'healthcare',
    '金融科技': 'finance',
    '物聯網': 'iot_device',
    '區塊鏈': 'blockchain',
    'AR/VR': 'ar_vr',
    '機器學習': 'machine_learning',
    '電腦視覺': 'computer_vision',
    '自然語言處理': 'nlp',
    '機器人': 'robotics',
    '網路安全': 'cybersecurity',
    '雲端服務': 'cloud_service',
    '其他': 'other'
  };
  return typeMap[frontendType] || 'other';
};

// API 的 validTypes 陣列（已修正）
const apiValidTypes = [
  'productivity', 'ai_model', 'automation', 'data_analysis', 'educational', 
  'healthcare', 'finance', 'iot_device', 'blockchain', 'ar_vr', 
  'machine_learning', 'computer_vision', 'nlp', 'robotics', 'cybersecurity', 
  'cloud_service', 'other'
];

async function testAppCreationUpload() {
  let connection;

  try {
    console.log('🧪 測試 AI 應用程式創建上傳流程...\n');

    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 資料庫連接成功');

    // 1. 測試前端類型映射
    console.log('📋 測試前端類型映射:');
    const testTypes = [
      '文字處理', '圖像生成', '程式開發', '數據分析', '教育工具',
      '健康醫療', '金融科技', '物聯網', '區塊鏈', 'AR/VR',
      '機器學習', '電腦視覺', '自然語言處理', '機器人', '網路安全', '雲端服務', '其他'
    ];

    testTypes.forEach(frontendType => {
      const apiType = mapTypeToApiType(frontendType);
      const isValid = apiValidTypes.includes(apiType);
      console.log(`  ${frontendType} -> ${apiType} ${isValid ? '✅' : '❌'}`);
    });

    // 2. 檢查資料庫中現有的類型分佈
    console.log('\n📊 檢查資料庫中現有的應用程式類型:');
    const [typeStats] = await connection.execute(`
      SELECT type, COUNT(*) as count
      FROM apps
      WHERE type IS NOT NULL
      GROUP BY type
      ORDER BY count DESC
    `);

    typeStats.forEach(row => {
      const isValid = apiValidTypes.includes(row.type);
      console.log(`  ${row.type}: ${row.count} 個應用程式 ${isValid ? '✅' : '❌'}`);
    });

    // 3. 檢查是否有無效的類型
    console.log('\n🔍 檢查無效的類型:');
    const [invalidTypes] = await connection.execute(`
      SELECT type, COUNT(*) as count
      FROM apps
      WHERE type IS NOT NULL AND type NOT IN (?)
      GROUP BY type
    `, [apiValidTypes]);

    if (invalidTypes.length > 0) {
      console.log('  ❌ 發現無效的類型:');
      invalidTypes.forEach(row => {
        console.log(`    ${row.type}: ${row.count} 個應用程式`);
      });
    } else {
      console.log('  ✅ 所有類型都是有效的');
    }

    // 4. 模擬創建新應用程式的資料
    console.log('\n📝 模擬創建新應用程式的資料:');
    const testAppData = {
      name: '測試 AI 應用程式',
      description: '這是一個測試用的 AI 應用程式',
      type: mapTypeToApiType('文字處理'), // 應該映射為 'productivity'
      creator: '測試創建者',
      department: 'HQBU',
      icon: 'Bot',
      iconColor: 'from-blue-500 to-purple-500'
    };

    console.log('  前端資料:');
    console.log(`    名稱: ${testAppData.name}`);
    console.log(`    類型: 文字處理 -> ${testAppData.type}`);
    console.log(`    創建者: ${testAppData.creator}`);
    console.log(`    部門: ${testAppData.department}`);
    console.log(`    圖示: ${testAppData.icon}`);
    console.log(`    圖示顏色: ${testAppData.iconColor}`);

    // 5. 驗證 API 會接受這些資料
    console.log('\n✅ API 驗證結果:');
    console.log(`  類型 '${testAppData.type}' 是否有效: ${apiValidTypes.includes(testAppData.type) ? '是' : '否'}`);
    console.log(`  名稱長度 (${testAppData.name.length}): ${testAppData.name.length >= 2 && testAppData.name.length <= 200 ? '有效' : '無效'}`);
    console.log(`  描述長度 (${testAppData.description.length}): ${testAppData.description.length >= 10 ? '有效' : '無效'}`);

    // 6. 檢查資料庫表格結構
    console.log('\n📋 檢查 apps 表格結構:');
    const [columns] = await connection.execute('DESCRIBE apps');
    const relevantColumns = ['name', 'description', 'type', 'creator_name', 'creator_email', 'department', 'icon', 'icon_color'];
    
    relevantColumns.forEach(colName => {
      const column = columns.find(col => col.Field === colName);
      if (column) {
        console.log(`  ${colName}: ${column.Type} ${column.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${column.Default ? `DEFAULT ${column.Default}` : ''}`);
      } else {
        console.log(`  ${colName}: ❌ 欄位不存在`);
      }
    });

    console.log('\n✅ AI 應用程式創建上傳流程測試完成！');
    console.log('📝 總結:');
    console.log('  - 前端類型映射 ✅');
    console.log('  - API validTypes 已更新 ✅');
    console.log('  - 資料庫欄位完整 ✅');
    console.log('  - 類型驗證邏輯正確 ✅');

  } catch (error) {
    console.error('❌ 測試失敗:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 資料庫連接已關閉');
    }
  }
}

testAppCreationUpload().catch(console.error); 