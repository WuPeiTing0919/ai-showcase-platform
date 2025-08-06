// Script to check app types in database
const mysql = require('mysql2/promise');

async function checkAppTypes() {
  let connection;
  
  try {
    // Database connection
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '123456',
      database: 'ai_showcase_platform'
    });

    console.log('Connected to database successfully');

    // Check what types exist in the apps table
    const [rows] = await connection.execute('SELECT DISTINCT type FROM apps ORDER BY type');
    
    console.log('=== App Types in Database ===');
    console.log('Total unique types:', rows.length);
    rows.forEach((row, index) => {
      console.log(`${index + 1}. ${row.type}`);
    });

    // Check API valid types
    const apiValidTypes = [
      'web_app', 'mobile_app', 'desktop_app', 'api_service', 'ai_model', 
      'data_analysis', 'automation', 'productivity', 'educational', 'healthcare', 
      'finance', 'iot_device', 'blockchain', 'ar_vr', 'machine_learning', 
      'computer_vision', 'nlp', 'robotics', 'cybersecurity', 'cloud_service', 'other'
    ];

    console.log('\n=== API Valid Types ===');
    apiValidTypes.forEach((type, index) => {
      console.log(`${index + 1}. ${type}`);
    });

    // Check frontend mapping
    const frontendTypes = [
      '文字處理', '圖像生成', '圖像處理', '語音辨識', '推薦系統', '音樂生成',
      '程式開發', '影像處理', '對話系統', '數據分析', '設計工具', '語音技術',
      '教育工具', '健康醫療', '金融科技', '物聯網', '區塊鏈', 'AR/VR',
      '機器學習', '電腦視覺', '自然語言處理', '機器人', '網路安全', '雲端服務', '其他'
    ];

    console.log('\n=== Frontend Types ===');
    frontendTypes.forEach((type, index) => {
      console.log(`${index + 1}. ${type}`);
    });

    // Check mapping consistency
    console.log('\n=== Mapping Analysis ===');
    
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

    // Test mapping for all frontend types
    console.log('\n=== Frontend to API Mapping Test ===');
    frontendTypes.forEach(frontendType => {
      const apiType = mapTypeToApiType(frontendType);
      const backToFrontend = mapApiTypeToDisplayType(apiType);
      const isValidApiType = apiValidTypes.includes(apiType);
      console.log(`${frontendType} -> ${apiType} -> ${backToFrontend} (Valid API: ${isValidApiType})`);
    });

    // Test mapping for all API types
    console.log('\n=== API to Frontend Mapping Test ===');
    apiValidTypes.forEach(apiType => {
      const frontendType = mapApiTypeToDisplayType(apiType);
      const backToApi = mapTypeToApiType(frontendType);
      console.log(`${apiType} -> ${frontendType} -> ${backToApi}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkAppTypes(); 