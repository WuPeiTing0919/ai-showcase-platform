const mysql = require('mysql2/promise');

// Database connection configuration - using environment variables directly
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ai_showcase_platform',
  port: process.env.DB_PORT || 3306
};

async function testAppOperations() {
  let connection;
  
  try {
    console.log('🔗 連接到資料庫...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 資料庫連接成功');

    // Test 1: Check existing apps
    console.log('\n📋 測試 1: 檢查現有應用程式');
    const [apps] = await connection.execute('SELECT id, name, status, type FROM apps LIMIT 5');
    console.log(`找到 ${apps.length} 個應用程式:`);
    apps.forEach(app => {
      console.log(`  - ID: ${app.id}, 名稱: ${app.name}, 狀態: ${app.status}, 類型: ${app.type}`);
    });

    if (apps.length === 0) {
      console.log('❌ 沒有找到應用程式，無法進行操作測試');
      return;
    }

    const testApp = apps[0];
    console.log(`\n🎯 使用應用程式進行測試: ${testApp.name} (ID: ${testApp.id})`);

    // Test 2: Test GET /api/apps/[id] (View Details)
    console.log('\n📖 測試 2: 查看應用程式詳情');
    try {
      const token = 'test-token'; // In real scenario, this would be a valid JWT
      const response = await fetch(`http://localhost:3000/api/apps/${testApp.id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const appDetails = await response.json();
        console.log('✅ 應用程式詳情獲取成功:');
        console.log(`  - 名稱: ${appDetails.name}`);
        console.log(`  - 描述: ${appDetails.description}`);
        console.log(`  - 狀態: ${appDetails.status}`);
        console.log(`  - 類型: ${appDetails.type}`);
        console.log(`  - 創建者: ${appDetails.creator?.name || '未知'}`);
      } else {
        console.log(`❌ 獲取應用程式詳情失敗: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.log(`❌ 測試應用程式詳情時發生錯誤: ${error.message}`);
    }

    // Test 3: Test PUT /api/apps/[id] (Edit Application)
    console.log('\n✏️ 測試 3: 編輯應用程式');
    try {
      const updateData = {
        name: `${testApp.name}_updated_${Date.now()}`,
        description: '這是更新後的應用程式描述',
        type: 'productivity'
      };

      const response = await fetch(`http://localhost:3000/api/apps/${testApp.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ 應用程式更新成功:', result.message);
        
        // Verify the update in database
        const [updatedApp] = await connection.execute(
          'SELECT name, description, type FROM apps WHERE id = ?',
          [testApp.id]
        );
        if (updatedApp.length > 0) {
          console.log('✅ 資料庫更新驗證成功:');
          console.log(`  - 新名稱: ${updatedApp[0].name}`);
          console.log(`  - 新描述: ${updatedApp[0].description}`);
          console.log(`  - 新類型: ${updatedApp[0].type}`);
        }
      } else {
        const errorData = await response.json();
        console.log(`❌ 更新應用程式失敗: ${errorData.error || response.statusText}`);
      }
    } catch (error) {
      console.log(`❌ 測試應用程式更新時發生錯誤: ${error.message}`);
    }

    // Test 4: Test status change (Publish/Unpublish)
    console.log('\n📢 測試 4: 發布/下架應用程式');
    try {
      const currentStatus = testApp.status;
      const newStatus = currentStatus === 'published' ? 'draft' : 'published';
      
      const response = await fetch(`http://localhost:3000/api/apps/${testApp.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        console.log(`✅ 應用程式狀態更新成功: ${currentStatus} → ${newStatus}`);
        
        // Verify the status change in database
        const [statusCheck] = await connection.execute(
          'SELECT status FROM apps WHERE id = ?',
          [testApp.id]
        );
        if (statusCheck.length > 0) {
          console.log(`✅ 資料庫狀態驗證成功: ${statusCheck[0].status}`);
        }
      } else {
        const errorData = await response.json();
        console.log(`❌ 狀態更新失敗: ${errorData.error || response.statusText}`);
      }
    } catch (error) {
      console.log(`❌ 測試狀態更新時發生錯誤: ${error.message}`);
    }

    // Test 5: Check app statistics
    console.log('\n📊 測試 5: 檢查應用程式統計');
    try {
      const [stats] = await connection.execute(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END) as published,
          SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
          SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as draft,
          SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected
        FROM apps
      `);
      
      console.log('✅ 應用程式統計:');
      console.log(`  - 總數: ${stats[0].total}`);
      console.log(`  - 已發布: ${stats[0].published}`);
      console.log(`  - 待審核: ${stats[0].pending}`);
      console.log(`  - 草稿: ${stats[0].draft}`);
      console.log(`  - 已拒絕: ${stats[0].rejected}`);
    } catch (error) {
      console.log(`❌ 檢查統計時發生錯誤: ${error.message}`);
    }

    // Test 6: Test DELETE /api/apps/[id] (Delete Application)
    console.log('\n🗑️ 測試 6: 刪除應用程式');
    
    // First, create a test app to delete
    const [newApp] = await connection.execute(`
      INSERT INTO apps (name, description, type, status, creator_id, version, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, [
      `Test App for Delete ${Date.now()}`,
      'This is a test app for deletion',
      'productivity',
      'draft',
      1, // Assuming user ID 1 exists
      '1.0.0'
    ]);
    
    const testDeleteAppId = newApp.insertId;
    console.log(`✅ 創建測試應用程式成功 (ID: ${testDeleteAppId})`);

    try {
      const response = await fetch(`http://localhost:3000/api/apps/${testDeleteAppId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ 應用程式刪除成功:', result.message);
        
        // Verify deletion in database
        const [deletedApp] = await connection.execute(
          'SELECT id FROM apps WHERE id = ?',
          [testDeleteAppId]
        );
        if (deletedApp.length === 0) {
          console.log('✅ 資料庫刪除驗證成功: 應用程式已從資料庫中移除');
        } else {
          console.log('❌ 資料庫刪除驗證失敗: 應用程式仍然存在');
        }
      } else {
        const errorData = await response.json();
        console.log(`❌ 刪除應用程式失敗: ${errorData.error || response.statusText}`);
      }
    } catch (error) {
      console.log(`❌ 測試應用程式刪除時發生錯誤: ${error.message}`);
    }

    console.log('\n🎉 所有測試完成！');

  } catch (error) {
    console.error('❌ 測試過程中發生錯誤:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 資料庫連接已關閉');
    }
  }
}

// Run the test
testAppOperations().catch(console.error); 