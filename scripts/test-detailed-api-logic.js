// Test the detailed API logic without database connection
const testDetailedApiLogic = () => {
  console.log('=== Testing Detailed API Logic ===\n');

  // Simulate the database values we expect
  const mockAppData = {
    app_department: 'MBU1',
    app_creator_name: '佩庭',
    user_department: 'ITBU',
    user_name: '系統管理員'
  };

  console.log('Mock database values:');
  console.log('app_department:', mockAppData.app_department);
  console.log('app_creator_name:', mockAppData.app_creator_name);
  console.log('user_department:', mockAppData.user_department);
  console.log('user_name:', mockAppData.user_name);
  console.log('');

  // Simulate the updated detailed API response structure
  const detailedAppData = {
    id: 1,
    name: 'Test App',
    description: 'Test Description',
    type: 'productivity',
    department: mockAppData.app_department, // Now included in detailed API
    icon: 'Bot',
    iconColor: 'from-blue-500 to-purple-500',
    status: 'published',
    createdAt: '2024-01-01',
    creator: {
      id: 1,
      name: mockAppData.app_creator_name || mockAppData.user_name, // Prioritize app.creator_name
      email: 'test@example.com',
      department: mockAppData.app_department || mockAppData.user_department, // Prioritize app.department
      role: 'developer'
    }
  };

  console.log('Simulated detailed API response:');
  console.log('department:', detailedAppData.department);
  console.log('creator.name:', detailedAppData.creator.name);
  console.log('creator.department:', detailedAppData.creator.department);
  console.log('');

  // Simulate handleEditApp processing
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

  // Process the detailed app data
  const result = handleEditApp(detailedAppData);
  
  console.log('\n=== Final Result ===');
  console.log('Expected creator name:', mockAppData.app_creator_name || mockAppData.user_name);
  console.log('Expected department:', mockAppData.app_department);
  console.log('Actual result creator:', result.creator);
  console.log('Actual result department:', result.department);

  // Verify the results
  const expectedCreator = mockAppData.app_creator_name || mockAppData.user_name;
  const expectedDepartment = mockAppData.app_department;
  
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

  console.log('\n=== Summary ===');
  console.log('The detailed API should now return:');
  console.log('- department: app.department (MBU1)');
  console.log('- creator.name: app.creator_name (佩庭)');
  console.log('- creator.department: app.department (MBU1)');
  console.log('');
  console.log('The handleEditApp function should extract:');
  console.log('- department: app.department (MBU1)');
  console.log('- creator: app.creator.name (佩庭)');
};

testDetailedApiLogic(); 