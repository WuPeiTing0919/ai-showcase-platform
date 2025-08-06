// Test script to verify type handling in app management
console.log('Testing type handling in app management...')

// Simulate the type mapping functions
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
  }
  return typeMap[apiType] || '其他'
}

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
  }
  return typeMap[frontendType] || 'other'
}

// Simulate API response
const mockApiResponse = {
  apps: [
    {
      id: '1',
      name: 'Test App',
      type: 'productivity', // API type (English)
      description: 'Test description',
      creator: {
        name: 'John Doe',
        department: 'HQBU'
      }
    },
    {
      id: '2', 
      name: 'AI App',
      type: 'ai_model', // API type (English)
      description: 'AI description',
      creator: {
        name: 'Jane Smith',
        department: 'ITBU'
      }
    }
  ]
}

// Simulate loadApps processing
console.log('=== API Response ===')
console.log('Original API data:', mockApiResponse.apps)

const formattedApps = mockApiResponse.apps.map(app => ({
  ...app,
  type: mapApiTypeToDisplayType(app.type), // Convert to Chinese display type
  creator: typeof app.creator === 'object' ? app.creator.name : app.creator,
  department: typeof app.creator === 'object' ? app.creator.department : app.department
}))

console.log('=== After loadApps processing ===')
console.log('Formatted apps:', formattedApps)

// Simulate handleEditApp
const simulateHandleEditApp = (app) => {
  console.log('=== handleEditApp simulation ===')
  console.log('Input app:', app)
  
  const newApp = {
    name: app.name,
    type: app.type, // This should be the Chinese display type
    department: app.department || "HQBU",
    creator: app.creator || "",
    description: app.description,
    appUrl: app.appUrl || app.demoUrl || "",
    icon: app.icon || "Bot",
    iconColor: app.iconColor || "from-blue-500 to-purple-500",
  }
  
  console.log('newApp after handleEditApp:', newApp)
  return newApp
}

// Test both apps
console.log('\n=== Testing handleEditApp for both apps ===')
formattedApps.forEach((app, index) => {
  console.log(`\n--- App ${index + 1} ---`)
  const newApp = simulateHandleEditApp(app)
  console.log('Final newApp.type:', newApp.type)
  console.log('Is this a valid Select value?', ['文字處理', '圖像生成', '程式開發', '數據分析', '教育工具', '健康醫療', '金融科技', '物聯網', '區塊鏈', 'AR/VR', '機器學習', '電腦視覺', '自然語言處理', '機器人', '網路安全', '雲端服務', '其他'].includes(newApp.type))
})

// Test the reverse mapping for update
console.log('\n=== Testing update mapping ===')
formattedApps.forEach((app, index) => {
  console.log(`\n--- App ${index + 1} update test ---`)
  const displayType = app.type
  const apiType = mapTypeToApiType(displayType)
  console.log('Display type:', displayType)
  console.log('Mapped to API type:', apiType)
  console.log('Round trip test:', mapApiTypeToDisplayType(apiType) === displayType)
})

console.log('\n=== Test completed ===') 