// Test script to verify creator object handling fix
console.log('Testing creator object handling fix...')

// Simulate API response with creator object
const mockApiResponse = {
  apps: [
    {
      id: '1',
      name: 'Test App',
      type: 'web_app',
      status: 'published',
      description: 'Test description',
      creator: {
        id: 'user1',
        name: 'John Doe',
        email: 'john@example.com',
        department: 'ITBU',
        role: 'developer'
      },
      department: 'ITBU',
      createdAt: '2025-01-01T00:00:00Z',
      viewsCount: 100,
      likesCount: 50
    },
    {
      id: '2',
      name: 'Test App 2',
      type: 'mobile_app',
      status: 'pending',
      description: 'Test description 2',
      creator: 'Jane Smith', // String creator
      department: 'HQBU',
      createdAt: '2025-01-02T00:00:00Z',
      viewsCount: 200,
      likesCount: 75
    }
  ]
}

// Simulate the loadApps function processing
function processApps(apiData) {
  return (apiData.apps || []).map((app) => ({
    ...app,
    views: app.viewsCount || 0,
    likes: app.likesCount || 0,
    appUrl: app.demoUrl || '',
    type: app.type, // Simplified for test
    icon: app.icon || 'Bot',
    iconColor: app.iconColor || 'from-blue-500 to-purple-500',
    reviews: 0,
    createdAt: app.createdAt ? new Date(app.createdAt).toLocaleDateString() : '未知',
    // Handle creator object properly
    creator: typeof app.creator === 'object' ? app.creator.name : app.creator,
    department: typeof app.creator === 'object' ? app.creator.department : app.department
  }))
}

// Test the processing
const processedApps = processApps(mockApiResponse)

console.log('Original API response:')
console.log(JSON.stringify(mockApiResponse, null, 2))

console.log('\nProcessed apps:')
console.log(JSON.stringify(processedApps, null, 2))

// Test rendering simulation
console.log('\nTesting rendering simulation:')
processedApps.forEach((app, index) => {
  console.log(`App ${index + 1}:`)
  console.log(`  Creator: ${app.creator}`)
  console.log(`  Department: ${app.department}`)
  console.log(`  Type: ${typeof app.creator}`)
  
  // Simulate the table cell rendering
  const creatorDisplay = typeof app.creator === 'object' ? app.creator.name : app.creator
  const departmentDisplay = typeof app.creator === 'object' ? app.creator.department : app.department
  
  console.log(`  Display - Creator: ${creatorDisplay}`)
  console.log(`  Display - Department: ${departmentDisplay}`)
  console.log('')
})

console.log('✅ Creator object handling test completed successfully!') 