const mysql = require('mysql2/promise');

// Test the detailed API fix
const testDetailedApiFix = async () => {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '123456',
      database: 'ai_showcase_platform'
    });

    console.log('=== Testing Detailed API Fix ===\n');

    // 1. Get the latest app data
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
    console.log('Database values:');
    console.log('app_department:', app.app_department);
    console.log('app_creator_name:', app.app_creator_name);
    console.log('user_department:', app.user_department);
    console.log('user_name:', app.user_name);
    console.log('');

    // 2. Simulate the updated detailed API response structure
    const detailedAppData = {
      id: app.id,
      name: app.name,
      description: app.description,
      type: app.type,
      department: app.app_department, // Now included in detailed API
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
    console.log('department:', detailedAppData.department);
    console.log('creator.name:', detailedAppData.creator.name);
    console.log('creator.department:', detailedAppData.creator.department);
    console.log('');

    // 3. Simulate handleEditApp processing
    const handleEditApp = (app) => {
      console.log('=== handleEditApp Processing ===');
      console.log('Input app.department:', app.department);
      console.log('Input app.creator:', app.creator);
      
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
        type: app.type || "文字處理",
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

    // 4. Process the detailed app data
    const result = handleEditApp(detailedAppData);
    
    console.log('\n=== Final Result ===');
    console.log('Expected creator name:', app.app_creator_name || app.user_name);
    console.log('Expected department:', app.app_department);
    console.log('Actual result creator:', result.creator);
    console.log('Actual result department:', result.department);

    // 5. Verify the results
    const expectedCreator = app.app_creator_name || app.user_name;
    const expectedDepartment = app.app_department;
    
    console.log('\n=== Verification ===');
    console.log('Creator match:', result.creator === expectedCreator ? '✅ PASS' : '❌ FAIL');
    console.log('Department match:', result.department === expectedDepartment ? '✅ PASS' : '❌ FAIL');

    if (result.creator !== expectedCreator) {
      console.log('❌ Creator mismatch!');
      console.log('Expected:', expectedCreator);
      console.log('Actual:', result.creator);
    }

    if (result.department !== expectedDepartment) {
      console.log('❌ Department mismatch!');
      console.log('Expected:', expectedDepartment);
      console.log('Actual:', result.department);
    }

    await connection.end();
  } catch (error) {
    console.error('Test failed:', error);
  }
};

testDetailedApiFix(); 