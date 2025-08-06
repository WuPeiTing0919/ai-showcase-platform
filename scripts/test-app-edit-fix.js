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

async function testAppEditFix() {
  let connection;
  
  try {
    console.log('🧪 測試應用編輯功能修正...');
    
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 資料庫連接成功');
    
    // 1. 檢查現有應用程式
    console.log('\n📋 檢查現有應用程式...');
    const [apps] = await connection.execute(`
      SELECT a.*, u.name as creator_name, u.department as creator_department
      FROM apps a
      LEFT JOIN users u ON a.creator_id = u.id
      LIMIT 3
    `);
    
    console.log(`找到 ${apps.length} 個應用程式:`);
    apps.forEach((app, index) => {
      console.log(`${index + 1}. ${app.name}`);
      console.log(`   創建者: ${app.creator_name} (${app.creator_department})`);
      console.log(`   圖示: ${app.icon || '未設定'}`);
      console.log(`   圖示顏色: ${app.icon_color || '未設定'}`);
      console.log(`   狀態: ${app.status || 'draft'}`);
      console.log('');
    });
    
    // 2. 測試類型映射
    console.log('\n🧪 測試類型映射...');
    const testTypes = [
      '文字處理',
      '圖像生成', 
      '數據分析',
      '機器學習',
      '其他'
    ];
    
    const typeMap = {
      '文字處理': 'productivity',
      '圖像生成': 'ai_model',
      '數據分析': 'data_analysis',
      '機器學習': 'machine_learning',
      '其他': 'other'
    };
    
    testTypes.forEach(frontendType => {
      const apiType = typeMap[frontendType] || 'other';
      console.log(`${frontendType} -> ${apiType}`);
    });
    
    // 3. 檢查 API 有效類型
    console.log('\n📋 API 有效類型:');
    const validApiTypes = [
      'web_app', 'mobile_app', 'desktop_app', 'api_service', 'ai_model', 
      'data_analysis', 'automation', 'productivity', 'educational', 'healthcare', 
      'finance', 'iot_device', 'blockchain', 'ar_vr', 'machine_learning', 
      'computer_vision', 'nlp', 'robotics', 'cybersecurity', 'cloud_service', 'other'
    ];
    
    validApiTypes.forEach(type => {
      console.log(`  - ${type}`);
    });
    
    // 4. 驗證映射是否有效
    console.log('\n✅ 驗證映射有效性:');
    const mappedTypes = Object.values(typeMap);
    const validMappedTypes = mappedTypes.filter(type => validApiTypes.includes(type));
    console.log(`有效映射類型: ${validMappedTypes.length}/${mappedTypes.length}`);
    
    if (validMappedTypes.length === mappedTypes.length) {
      console.log('✅ 所有映射類型都是有效的');
    } else {
      console.log('❌ 有無效的映射類型');
    }
    
    console.log('\n✅ 應用編輯功能修正測試完成！');
    
  } catch (error) {
    console.error('❌ 測試失敗:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 資料庫連接已關閉');
    }
  }
}

testAppEditFix().catch(console.error); 