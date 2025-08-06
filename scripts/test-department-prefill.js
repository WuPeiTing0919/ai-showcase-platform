// Test script to verify department pre-fill issue in handleEditApp
console.log('Testing department pre-fill issue...')

// Simulate the loadApps function processing
function processApps(apiApps) {
  return apiApps.map(app => ({
    id: app.id,
    name: app.name,
    type: app.type,
    creator: typeof app.creator === 'object' ? app.creator.name : app.creator,
    department: typeof app.creator === 'object' ? app.creator.department : app.department,
    description: app.description,
    appUrl: app.appUrl || app.demoUrl || '',
    icon: app.icon || 'Bot',
    iconColor: app.iconColor || 'from-blue-500 to-purple-500',
    status: app.status,
    views: app.views || 0,
    likes: app.likes || 0,
    rating: app.rating || 0,
    reviews: app.reviews || 0,
    createdAt: app.createdAt ? new Date(app.createdAt).toLocaleDateString() : '未知'
  }))
}

// Simulate the handleEditApp function
function handleEditApp(app) {
  console.log('📝 Editing app:', app.name)
  console.log('📋 App object structure:', {
    name: app.name,
    creator: app.creator,
    department: app.department,
    hasCreatorObject: typeof app.creator === 'object',
    hasCreatorProperty: 'creator' in app,
    hasDepartmentProperty: 'department' in app
  })
  
  const newApp = {
    name: app.name,
    type: app.type,
    department: app.creator?.department || app.department || "HQBU", // This is the problematic line
    creator: app.creator?.name || app.creator || "",
    description: app.description,
    appUrl: app.appUrl || app.demoUrl || "",
    icon: app.icon || "Bot",
    iconColor: app.iconColor || "from-blue-500 to-purple-500",
  }
  
  console.log('📝 Form populated with app data:', newApp)
  return newApp
}

// Test scenario 1: App with creator as object (from API)
console.log('\n=== Test Scenario 1: Creator as Object ===')
const apiAppWithCreatorObject = {
  id: "1",
  name: "Test AI App",
  type: "圖像生成",
  creator: {
    id: "user1",
    name: "John Doe",
    department: "ITBU"
  },
  department: "HQBU", // This should be ignored when creator is object
  description: "A test AI application",
  appUrl: "https://example.com",
  icon: "Brain",
  iconColor: "from-purple-500 to-pink-500",
  status: "published",
  views: 100,
  likes: 50,
  rating: 4.5,
  reviews: 10,
  createdAt: "2024-01-15"
}

console.log('1. Original API app with creator object:')
console.log(apiAppWithCreatorObject)

console.log('\n2. Processed by loadApps:')
const processedApp1 = processApps([apiAppWithCreatorObject])[0]
console.log(processedApp1)

console.log('\n3. handleEditApp result:')
const editResult1 = handleEditApp(processedApp1)
console.log('Department in form:', editResult1.department)

// Test scenario 2: App with creator as string (from API)
console.log('\n=== Test Scenario 2: Creator as String ===')
const apiAppWithCreatorString = {
  id: "2",
  name: "Another Test App",
  type: "語音辨識",
  creator: "Jane Smith", // String creator
  department: "MBU1", // This should be used when creator is string
  description: "Another test application",
  appUrl: "https://test2.com",
  icon: "Mic",
  iconColor: "from-green-500 to-teal-500",
  status: "draft",
  views: 50,
  likes: 25,
  rating: 4.0,
  reviews: 5,
  createdAt: "2024-01-20"
}

console.log('1. Original API app with creator string:')
console.log(apiAppWithCreatorString)

console.log('\n2. Processed by loadApps:')
const processedApp2 = processApps([apiAppWithCreatorString])[0]
console.log(processedApp2)

console.log('\n3. handleEditApp result:')
const editResult2 = handleEditApp(processedApp2)
console.log('Department in form:', editResult2.department)

// Test scenario 3: Fix the handleEditApp function
console.log('\n=== Test Scenario 3: Fixed handleEditApp ===')
function handleEditAppFixed(app) {
  console.log('📝 Editing app (FIXED):', app.name)
  console.log('📋 App object structure:', {
    name: app.name,
    creator: app.creator,
    department: app.department,
    hasCreatorObject: typeof app.creator === 'object',
    hasCreatorProperty: 'creator' in app,
    hasDepartmentProperty: 'department' in app
  })
  
  const newApp = {
    name: app.name,
    type: app.type,
    department: app.department || "HQBU", // FIXED: Use app.department directly
    creator: app.creator || "",
    description: app.description,
    appUrl: app.appUrl || app.demoUrl || "",
    icon: app.icon || "Bot",
    iconColor: app.iconColor || "from-blue-500 to-purple-500",
  }
  
  console.log('📝 Form populated with app data (FIXED):', newApp)
  return newApp
}

console.log('1. Test with processed app 1 (creator was object):')
const fixedResult1 = handleEditAppFixed(processedApp1)
console.log('Department in form (FIXED):', fixedResult1.department)

console.log('\n2. Test with processed app 2 (creator was string):')
const fixedResult2 = handleEditAppFixed(processedApp2)
console.log('Department in form (FIXED):', fixedResult2.department)

// Verify the fix
console.log('\n=== Verification ===')
const expectedDepartment1 = "ITBU" // Should be from creator.department
const expectedDepartment2 = "MBU1" // Should be from app.department

console.log('Scenario 1 - Expected:', expectedDepartment1, 'Got:', fixedResult1.department, '✅', fixedResult1.department === expectedDepartment1 ? 'PASS' : 'FAIL')
console.log('Scenario 2 - Expected:', expectedDepartment2, 'Got:', fixedResult2.department, '✅', fixedResult2.department === expectedDepartment2 ? 'PASS' : 'FAIL')

if (fixedResult1.department === expectedDepartment1 && fixedResult2.department === expectedDepartment2) {
  console.log('\n🎉 All tests passed! The department pre-fill fix is working correctly.')
} else {
  console.log('\n❌ Some tests failed. Check the handleEditApp function.')
} 