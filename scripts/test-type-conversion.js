// Test script to check type conversion and identify English types
console.log('Testing type conversion functions...')

// Simulate the type mapping functions from app-management.tsx
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
    // 處理舊的英文類型，確保它們都轉換為中文
    'web_app': '文字處理',
    'mobile_app': '文字處理',
    'desktop_app': '文字處理',
    'api_service': '程式開發',
    'other': '其他'
  }
  return typeMap[apiType] || '其他'
}

// Test different scenarios
console.log('\n=== Testing Type Conversion ===')

// Test 1: Check if there are any English types that might slip through
const possibleEnglishTypes = [
  'web_app', 'mobile_app', 'desktop_app', 'api_service', 'ai_model', 
  'data_analysis', 'automation', 'other', 'productivity', 'educational',
  'healthcare', 'finance', 'iot_device', 'blockchain', 'ar_vr',
  'machine_learning', 'computer_vision', 'nlp', 'robotics', 'cybersecurity',
  'cloud_service'
]

console.log('\n1. Testing English API types:')
possibleEnglishTypes.forEach(englishType => {
  const chineseType = mapApiTypeToDisplayType(englishType)
  console.log(`  ${englishType} -> ${chineseType}`)
})

// Test 2: Check if all Chinese types map back correctly
const chineseTypes = [
  '文字處理', '圖像生成', '圖像處理', '語音辨識', '推薦系統', '音樂生成',
  '程式開發', '影像處理', '對話系統', '數據分析', '設計工具', '語音技術',
  '教育工具', '健康醫療', '金融科技', '物聯網', '區塊鏈', 'AR/VR',
  '機器學習', '電腦視覺', '自然語言處理', '機器人', '網路安全', '雲端服務', '其他'
]

console.log('\n2. Testing Chinese display types:')
chineseTypes.forEach(chineseType => {
  const apiType = mapTypeToApiType(chineseType)
  const backToChinese = mapApiTypeToDisplayType(apiType)
  const isConsistent = chineseType === backToChinese
  console.log(`  ${chineseType} -> ${apiType} -> ${backToChinese} ${isConsistent ? '✅' : '❌'}`)
})

// Test 3: Check for any unmapped types
console.log('\n3. Checking for unmapped types:')
const allApiTypes = new Set(possibleEnglishTypes)
const mappedApiTypes = new Set(Object.values({
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
}))

const unmappedApiTypes = [...allApiTypes].filter(type => !mappedApiTypes.has(type))
console.log('  Unmapped API types:', unmappedApiTypes)

// Test 4: Simulate what happens when editing an app
console.log('\n4. Testing edit scenario:')
const mockApiResponse = {
  apps: [
    { id: '1', name: 'Test App 1', type: 'productivity' },
    { id: '2', name: 'Test App 2', type: 'ai_model' },
    { id: '3', name: 'Test App 3', type: 'web_app' }, // This should now be handled
    { id: '4', name: 'Test App 4', type: 'mobile_app' }, // This should now be handled
    { id: '5', name: 'Test App 5', type: 'other' }
  ]
}

console.log('  Simulating loadApps processing:')
mockApiResponse.apps.forEach(app => {
  const displayType = mapApiTypeToDisplayType(app.type)
  console.log(`    ${app.name}: ${app.type} -> ${displayType}`)
})

// Test 5: Test the actual database types from the update
console.log('\n5. Testing database types after update:')
const databaseTypes = [
  'productivity', 'ai_model', 'automation', 'data_analysis', 
  'educational', 'healthcare', 'finance', 'iot_device', 
  'blockchain', 'ar_vr', 'machine_learning', 'computer_vision', 
  'nlp', 'robotics', 'cybersecurity', 'cloud_service', 'other'
]

console.log('  Database types conversion:')
databaseTypes.forEach(dbType => {
  const displayType = mapApiTypeToDisplayType(dbType)
  console.log(`    ${dbType} -> ${displayType}`)
})

console.log('\n✅ Type conversion test completed!') 