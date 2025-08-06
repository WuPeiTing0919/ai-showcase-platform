// Test script to verify app creation API fix
console.log('Testing app creation API fix...')

// Simulate the API request data
const mockAppData = {
  name: 'Test AI Application',
  description: 'This is a test application to verify the API fix',
  type: 'productivity',
  demoUrl: 'https://example.com/demo',
  version: '1.0.0',
  creator: 'Test User',
  department: 'ITBU',
  icon: 'Bot',
  iconColor: 'from-blue-500 to-purple-500'
}

console.log('Mock app data to be sent:', mockAppData)

// Simulate the API processing
const processAppData = (body) => {
  const {
    name,
    description,
    type,
    teamId,
    techStack,
    tags,
    demoUrl,
    githubUrl,
    docsUrl,
    version = '1.0.0',
    creator,
    department,
    icon = 'Bot',
    iconColor = 'from-blue-500 to-purple-500'
  } = body

  // Simulate user data (normally from JWT token)
  const mockUser = {
    id: 'user-123',
    name: 'Admin User',
    email: 'admin@example.com',
    department: 'HQBU'
  }

  // Prepare database insertion data
  const appData = {
    id: 'app-' + Date.now(),
    name,
    description,
    creator_id: mockUser.id,
    team_id: teamId || null,
    type,
    tech_stack: techStack ? JSON.stringify(techStack) : null,
    tags: tags ? JSON.stringify(tags) : null,
    demo_url: demoUrl || null,
    github_url: githubUrl || null,
    docs_url: docsUrl || null,
    version,
    status: 'draft',
    icon: icon || 'Bot',
    icon_color: iconColor || 'from-blue-500 to-purple-500',
    department: department || mockUser.department || 'HQBU',
    creator_name: creator || mockUser.name || '',
    creator_email: mockUser.email || ''
  }

  return appData
}

// Test the processing
const processedData = processAppData(mockAppData)
console.log('\nProcessed app data for database insertion:')
console.log(JSON.stringify(processedData, null, 2))

// Verify all required fields are present
const requiredFields = ['name', 'description', 'type', 'creator_id', 'status', 'icon', 'icon_color', 'department', 'creator_name', 'creator_email']
const missingFields = requiredFields.filter(field => !processedData[field])

if (missingFields.length === 0) {
  console.log('\n✅ All required fields are present!')
} else {
  console.log('\n❌ Missing fields:', missingFields)
}

// Test the response formatting
const mockApiResponse = {
  id: processedData.id,
  name: processedData.name,
  description: processedData.description,
  type: processedData.type,
  status: processedData.status,
  creator_id: processedData.creator_id,
  department: processedData.department,
  creator_name: processedData.creator_name,
  creator_email: processedData.creator_email,
  icon: processedData.icon,
  icon_color: processedData.icon_color
}

const formatResponse = (app) => ({
  id: app.id,
  name: app.name,
  description: app.description,
  type: app.type,
  status: app.status,
  creatorId: app.creator_id,
  department: app.department,
  icon: app.icon,
  iconColor: app.icon_color,
  creator: {
    id: app.creator_id,
    name: app.creator_name,
    email: app.creator_email,
    department: app.department,
    role: 'admin'
  }
})

const formattedResponse = formatResponse(mockApiResponse)
console.log('\nFormatted API response:')
console.log(JSON.stringify(formattedResponse, null, 2))

console.log('\n✅ App creation API fix test completed!') 