// Test script to verify app type editing issue
console.log('Testing app type editing issue...')

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

// Simulate API response with different app types
const mockApiResponse = {
  apps: [
    {
      id: '1',
      name: 'Productivity App',
      type: 'productivity', // API type
      description: 'A productivity tool'
    },
    {
      id: '2',
      name: 'AI Model App',
      type: 'ai_model', // API type
      description: 'An AI model'
    },
    {
      id: '3',
      name: 'Data Analysis App',
      type: 'data_analysis', // API type
      description: 'A data analysis tool'
    }
  ]
}

// Simulate loadApps processing
console.log('=== Original API Data ===')
mockApiResponse.apps.forEach((app, index) => {
  console.log(`App ${index + 1}: ${app.name} - API type: ${app.type}`)
})

const formattedApps = mockApiResponse.apps.map(app => ({
  ...app,
  type: mapApiTypeToDisplayType(app.type), // Convert to Chinese display type
  creator: 'Test User',
  department: 'HQBU'
}))

console.log('\n=== After loadApps Processing ===')
formattedApps.forEach((app, index) => {
  console.log(`App ${index + 1}: ${app.name} - Display type: ${app.type}`)
})

// Simulate handleEditApp
const simulateHandleEditApp = (app) => {
  console.log(`\n=== Editing App: ${app.name} ===`)
  console.log('Input app.type:', app.type)
  
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
  
  console.log('newApp.type after handleEditApp:', newApp.type)
  
  // Check if this type is valid for the Select component
  const validSelectValues = [
    '文字處理', '圖像生成', '圖像處理', '語音辨識', '推薦系統', '音樂生成',
    '程式開發', '影像處理', '對話系統', '數據分析', '設計工具', '語音技術',
    '教育工具', '健康醫療', '金融科技', '物聯網', '區塊鏈', 'AR/VR',
    '機器學習', '電腦視覺', '自然語言處理', '機器人', '網路安全', '雲端服務', '其他'
  ]
  
  const isValidSelectValue = validSelectValues.includes(newApp.type)
  console.log('Is valid Select value?', isValidSelectValue)
  
  return newApp
}

// Test all apps
console.log('\n=== Testing handleEditApp for all apps ===')
const validSelectValues = [
  '文字處理', '圖像生成', '圖像處理', '語音辨識', '推薦系統', '音樂生成',
  '程式開發', '影像處理', '對話系統', '數據分析', '設計工具', '語音技術',
  '教育工具', '健康醫療', '金融科技', '物聯網', '區塊鏈', 'AR/VR',
  '機器學習', '電腦視覺', '自然語言處理', '機器人', '網路安全', '雲端服務', '其他'
]

formattedApps.forEach((app, index) => {
  const newApp = simulateHandleEditApp(app)
  console.log(`App ${index + 1} result: ${newApp.type} (valid: ${validSelectValues.includes(newApp.type)})`)
})

// Test the update process
console.log('\n=== Testing Update Process ===')
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

formattedApps.forEach((app, index) => {
  const displayType = app.type
  const apiType = mapTypeToApiType(displayType)
  const backToDisplay = mapApiTypeToDisplayType(apiType)
  
  console.log(`App ${index + 1}:`)
  console.log(`  Display: ${displayType}`)
  console.log(`  API: ${apiType}`)
  console.log(`  Round trip: ${backToDisplay}`)
  console.log(`  Round trip matches: ${backToDisplay === displayType}`)
})

console.log('\n=== Test completed ===') 