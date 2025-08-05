// 測試類型轉換函數
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

// 測試轉換
console.log('🧪 測試類型轉換...')
console.log('productivity ->', mapApiTypeToDisplayType('productivity'))
console.log('ai_model ->', mapApiTypeToDisplayType('ai_model'))
console.log('automation ->', mapApiTypeToDisplayType('automation'))
console.log('unknown ->', mapApiTypeToDisplayType('unknown'))
console.log('✅ 類型轉換測試完成') 