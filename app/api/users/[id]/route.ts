import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { db } from '@/lib/database'

// GET /api/users/[id] - 查看用戶資料
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // 驗證管理員權限
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const userId = await params.id

    // 查詢用戶詳細資料
    const user = await db.queryOne(`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.avatar,
        u.department,
        u.role,
        u.status,
        u.join_date,
        u.total_likes,
        u.total_views,
        u.created_at,
        u.updated_at,
        COUNT(DISTINCT a.id) as total_apps,
        COUNT(DISTINCT js.id) as total_reviews
      FROM users u
      LEFT JOIN apps a ON u.id = a.creator_id
      LEFT JOIN judge_scores js ON u.id = js.judge_id
      WHERE u.id = ?
      GROUP BY u.id
    `, [userId])

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // 格式化日期函數
    const formatDate = (dateString: string | null) => {
      if (!dateString) return "-";
      const date = new Date(dateString);
      return date.toLocaleString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }).replace(/\//g, '/');
    };

    // 計算登入天數（基於最後更新時間）
    const loginDays = user.updated_at ? 
      Math.floor((Date.now() - new Date(user.updated_at).getTime()) / (1000 * 60 * 60 * 24)) : 0;

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      department: user.department,
      role: user.role,
      status: user.status || "active",
      joinDate: formatDate(user.join_date),
      lastLogin: formatDate(user.updated_at),
      totalApps: user.total_apps || 0,
      totalReviews: user.total_reviews || 0,
      totalLikes: user.total_likes || 0,
      loginDays: loginDays,
      createdAt: formatDate(user.created_at),
      updatedAt: formatDate(user.updated_at)
    })
  } catch (error) {
    console.error('Error fetching user details:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/users/[id] - 編輯用戶資料
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // 驗證管理員權限
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const userId = await params.id
    const body = await request.json()
    const { name, email, department, role, status } = body

    // 驗證必填欄位
    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 })
    }

    // 驗證電子郵件格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    // 檢查電子郵件唯一性（排除當前用戶）
    const existingUser = await db.queryOne('SELECT id FROM users WHERE email = ? AND id != ?', [email, userId])
    if (existingUser) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 409 })
    }

    // 更新用戶資料
    await db.query(
      'UPDATE users SET name = ?, email = ?, department = ?, role = ? WHERE id = ?',
      [name, email, department, role, userId]
    )

    return NextResponse.json({ message: 'User updated successfully' })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/users/[id] - 刪除用戶
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // 驗證管理員權限
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const userId = await params.id

    // 檢查用戶是否存在
    const user = await db.queryOne('SELECT id FROM users WHERE id = ?', [userId])
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // 檢查是否為最後一個管理員
    const adminCount = await db.queryOne('SELECT COUNT(*) as count FROM users WHERE role = "admin"')
    const userRole = await db.queryOne('SELECT role FROM users WHERE id = ?', [userId])
    
    if (adminCount?.count === 1 && userRole?.role === 'admin') {
      return NextResponse.json({ error: 'Cannot delete the last admin user' }, { status: 400 })
    }

    // 級聯刪除相關資料
    await db.query('DELETE FROM judge_scores WHERE judge_id = ?', [userId])
    await db.query('DELETE FROM apps WHERE creator_id = ?', [userId])
    
    // 刪除用戶
    await db.query('DELETE FROM users WHERE id = ?', [userId])

    return NextResponse.json({ message: 'User deleted successfully' })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 