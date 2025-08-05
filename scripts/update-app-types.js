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

async function updateAppTypes() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 資料庫連接成功');

    // 更新 ENUM 類型，移除不適合企業平台的類型
    const updateTypeEnum = `
      ALTER TABLE apps MODIFY COLUMN type ENUM(
        'web_app', 'mobile_app', 'desktop_app', 'api_service', 'ai_model', 
        'data_analysis', 'automation', 'productivity', 'educational', 'healthcare', 
        'finance', 'iot_device', 'blockchain', 'ar_vr', 'machine_learning', 
        'computer_vision', 'nlp', 'robotics', 'cybersecurity', 'cloud_service', 'other'
      ) DEFAULT 'other'
    `;
    
    await connection.execute(updateTypeEnum);
    console.log('✅ 應用程式類型 ENUM 更新成功');

    // 查看更新後的結構
    const [describeResult] = await connection.execute('DESCRIBE apps');
    console.log('\n📋 更新後的 apps 表結構:');
    describeResult.forEach(row => {
      if (row.Field === 'type') {
        console.log(`  ${row.Field}: ${row.Type}`);
      }
    });

    // 列出所有有效的類型
    console.log('\n🎯 有效的應用程式類型:');
    const validTypes = [
      'web_app', 'mobile_app', 'desktop_app', 'api_service', 'ai_model', 
      'data_analysis', 'automation', 'productivity', 'educational', 'healthcare', 
      'finance', 'iot_device', 'blockchain', 'ar_vr', 'machine_learning', 
      'computer_vision', 'nlp', 'robotics', 'cybersecurity', 'cloud_service', 'other'
    ];
    validTypes.forEach((type, index) => {
      console.log(`  ${index + 1}. ${type}`);
    });

    console.log('\n✅ 企業 AI 平台應用類型更新完成！');
    console.log('🎯 已移除遊戲、娛樂、社交媒體等不適合企業平台的類型');
    console.log('📈 新增了更多適合企業 AI 應用的類型');

  } catch (error) {
    console.error('❌ 更新失敗:', error.message);
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('💡 提示：某些欄位可能已存在，這是正常的');
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 資料庫連接已關閉');
    }
  }
}

updateAppTypes().catch(console.error); 