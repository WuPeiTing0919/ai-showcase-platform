const mysql = require('mysql2/promise');

// Simulate the detailed API response structure
const simulateDetailedApiResponse = async () => {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '123456',
      database: 'ai_showcase_platform'
    });

    console.log('=== Testing Detail View Edit Flow ===\n');

    // 1. First, get the actual detailed API response
    const [apps] = await connection.execute(`
      SELECT 
        a.id, a.name, a.description, a.type, a.department as app_department, 
        a.creator_name as app_creator_name, a.creator_email as app_creator_email,
        a.icon, a.icon_color, a.status, a.created_at,
        u.id as user_id, u.name as user_name, u.email as user_email, u.department as user_department
      FROM apps a LEFT JOIN users u ON a.creator_id = u.id 
      ORDER BY a.created_at DESC LIMIT 1
    `);

    if (apps.length === 0) {
      console.log('No apps found in database');
      return;
    }

    const app = apps[0];
    console.log('Raw database data:');
    console.log('app_department:', app.app_department);
    console.log('app_creator_name:', app.app_creator_name);
    console.log('user_department:', app.user_department);
    console.log('user_name:', app.user_name);
    console.log('type:', app.type);
    console.log('icon:', app.icon);
    console.log('icon_color:', app.icon_color);
    console.log('');

    // 2. Simulate the detailed API response structure (like /api/apps/[id])
    const detailedAppData = {
      id: app.id,
      name: app.name,
      description: app.description,
      type: app.type, // This is the API type (English)
      department: app.app_department, // This should be the app's department
      icon: app.icon,
      iconColor: app.icon_color,
      status: app.status,
      createdAt: app.created_at,
      creator: {
        id: app.user_id,
        name: app.app_creator_name || app.user_name, // Prioritize app.creator_name
        email: app.app_creator_email || app.user_email,
        department: app.app_department || app.user_department, // Prioritize app.department
        role: 'developer'
      }
    };

    console.log('Simulated detailed API response:');
    console.log('detailedAppData:', JSON.stringify(detailedAppData, null, 2));
    console.log('');

    // 3. Simulate the handleEditApp function processing
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
      }
      
      console.log('newAppData:', newAppData);
      return newAppData;
    };

    // 4. Test the type conversion function
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
        // Old English types
        'web_app': '文字處理',
        'mobile_app': '文字處理',
        'desktop_app': '文字處理',
        'api_service': '程式開發'
      };
      return typeMap[apiType] || '其他';
    };

    // 5. Process the detailed app data
    const result = handleEditApp(detailedAppData);
    
    console.log('\n=== Final Result ===');
    console.log('Expected creator name:', app.app_creator_name || app.user_name);
    console.log('Expected department:', app.app_department);
    console.log('Actual result creator:', result.creator);
    console.log('Actual result department:', result.department);
    console.log('Actual result type:', result.type);
    console.log('Actual result icon:', result.icon);
    console.log('Actual result iconColor:', result.iconColor);

    // 6. Verify the results
    const expectedCreator = app.app_creator_name || app.user_name;
    const expectedDepartment = app.app_department;
    
    console.log('\n=== Verification ===');
    console.log('Creator match:', result.creator === expectedCreator ? '✅ PASS' : '❌ FAIL');
    console.log('Department match:', result.department === expectedDepartment ? '✅ PASS' : '❌ FAIL');
    console.log('Type conversion:', result.type !== app.type ? '✅ PASS (converted)' : '⚠️  No conversion needed');
    console.log('Icon preserved:', result.icon === app.icon ? '✅ PASS' : '❌ FAIL');
    console.log('IconColor preserved:', result.iconColor === app.icon_color ? '✅ PASS' : '❌ FAIL');

    await connection.end();
  } catch (error) {
    console.error('Test failed:', error);
  }
};

simulateDetailedApiResponse(); 