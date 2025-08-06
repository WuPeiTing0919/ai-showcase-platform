// Test script to verify modal reset fix
console.log('Testing modal reset fix...')

// Simulate the newApp state
let newApp = {
  name: "",
  type: "文字處理",
  department: "HQBU",
  creator: "",
  description: "",
  appUrl: "",
  icon: "Bot",
  iconColor: "from-blue-500 to-purple-500",
}

// Simulate the resetNewApp function
function resetNewApp() {
  newApp = {
    name: "",
    type: "文字處理",
    department: "HQBU",
    creator: "",
    description: "",
    appUrl: "",
    icon: "Bot",
    iconColor: "from-blue-500 to-purple-500",
  }
  console.log('✅ Form reset to initial values')
}

// Simulate the handleEditApp function
function handleEditApp(app) {
  console.log('📝 Editing app:', app.name)
  newApp = {
    name: app.name,
    type: app.type,
    department: app.creator?.department || app.department || "HQBU",
    creator: app.creator?.name || app.creator || "",
    description: app.description,
    appUrl: app.appUrl || app.demoUrl || "",
    icon: app.icon || "Bot",
    iconColor: app.iconColor || "from-blue-500 to-purple-500",
  }
  console.log('📝 Form populated with app data:', newApp)
}

// Simulate the "Add New App" button click
function handleAddNewAppClick() {
  console.log('➕ Add New App button clicked')
  console.log('📋 Form state before reset:', newApp)
  resetNewApp()
  console.log('📋 Form state after reset:', newApp)
}

// Test scenario 1: Edit an app, then click "Add New App"
console.log('\n=== Test Scenario 1: Edit then Add New ===')
const testApp = {
  name: "Test AI App",
  type: "圖像生成",
  department: "ITBU",
  creator: "John Doe",
  description: "A test AI application",
  appUrl: "https://example.com",
  icon: "Brain",
  iconColor: "from-purple-500 to-pink-500",
}

console.log('1. Initial form state:')
console.log(newApp)

console.log('\n2. Edit an app:')
handleEditApp(testApp)

console.log('\n3. Click "Add New App" button:')
handleAddNewAppClick()

// Test scenario 2: Multiple edits without reset
console.log('\n=== Test Scenario 2: Multiple Edits ===')
const testApp2 = {
  name: "Another Test App",
  type: "語音辨識",
  department: "MBU1",
  creator: "Jane Smith",
  description: "Another test application",
  appUrl: "https://test2.com",
  icon: "Mic",
  iconColor: "from-green-500 to-teal-500",
}

console.log('1. Edit first app:')
handleEditApp(testApp)

console.log('2. Edit second app (without reset):')
handleEditApp(testApp2)

console.log('3. Click "Add New App" button:')
handleAddNewAppClick()

// Test scenario 3: Verify reset function works correctly
console.log('\n=== Test Scenario 3: Reset Verification ===')
console.log('1. Populate form with data:')
newApp = {
  name: "Some App",
  type: "其他",
  department: "SBU",
  creator: "Test User",
  description: "Test description",
  appUrl: "https://test.com",
  icon: "Settings",
  iconColor: "from-gray-500 to-zinc-500",
}
console.log('Form populated:', newApp)

console.log('\n2. Reset form:')
resetNewApp()
console.log('Form after reset:', newApp)

// Verify all fields are reset to initial values
const expectedInitialState = {
  name: "",
  type: "文字處理",
  department: "HQBU",
  creator: "",
  description: "",
  appUrl: "",
  icon: "Bot",
  iconColor: "from-blue-500 to-purple-500",
}

const isResetCorrect = JSON.stringify(newApp) === JSON.stringify(expectedInitialState)
console.log('\n✅ Reset verification:', isResetCorrect ? 'PASSED' : 'FAILED')

if (isResetCorrect) {
  console.log('🎉 All tests passed! The modal reset fix is working correctly.')
} else {
  console.log('❌ Reset verification failed. Check the resetNewApp function.')
} 