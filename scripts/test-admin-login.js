const jwt = require('jsonwebtoken');

// 使用環境變數的 JWT_SECRET
const JWT_SECRET = process.env.JWT_SECRET || 'good777';

async function testAdminLogin() {
  console.log('=== 測試管理員登入 ===');
  console.log('使用的 JWT_SECRET:', JWT_SECRET);
  
  const adminCredentials = [
    {
      email: 'admin@theaken.com',
      password: 'Admin123!'
    },
    {
      email: 'admin@example.com', 
      password: 'Admin123!'
    },
    {
      email: 'petty091901@gmail.com',
      password: 'Admin123!'
    }
  ];

  const ports = [3000, 3002];

  for (const port of ports) {
    console.log(`\n=== 測試端口 ${port} ===`);
    
    for (const cred of adminCredentials) {
      console.log(`\n測試管理員: ${cred.email}`);
      console.log(`使用密碼: ${cred.password}`);
      
      try {
        const response = await fetch(`http://localhost:${port}/api/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: cred.email,
            password: cred.password
          })
        });

        const data = await response.json();
        
        if (response.ok) {
          console.log('✅ 登入成功');
          console.log('用戶角色:', data.user.role);
          console.log('Token 長度:', data.token.length);
          
          // 驗證 Token
          try {
            const decoded = jwt.verify(data.token, JWT_SECRET);
            console.log('✅ Token 驗證成功');
            console.log('Token 內容:', {
              userId: decoded.userId,
              email: decoded.email,
              role: decoded.role,
              exp: new Date(decoded.exp * 1000).toLocaleString()
            });
          } catch (tokenError) {
            console.log('❌ Token 驗證失敗:', tokenError.message);
          }
        } else {
          console.log('❌ 登入失敗');
          console.log('錯誤:', data.error);
          if (data.details) {
            console.log('詳細錯誤:', data.details);
          }
        }
      } catch (error) {
        console.log('❌ 請求失敗:', error.message);
      }
    }
  }
}

testAdminLogin().catch(console.error); 