import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { db } from '@/lib/database'

// PATCH /api/users/[id]/status - 停用/啟用用戶
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
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
    const { status } = body

    // 驗證狀態值
    if (!status || !['active', 'inactive'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status value' }, { status: 400 })
    }

    // 檢查用戶是否存在
    const user = await db.queryOne('SELECT id, role FROM users WHERE id = ?', [userId])
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // 檢查是否為最後一個管理員
    if (status === 'inactive' && user.role === 'admin') {
      const adminCount = await db.queryOne('SELECT COUNT(*) as count FROM users WHERE role = "admin" AND status = "active"')
      if (adminCount?.count <= 1) {
        return NextResponse.json({ error: 'Cannot disable the last admin user' }, { status: 400 })
      }
    }

    // 更新用戶狀態
    await db.query('UPDATE users SET status = ? WHERE id = ?', [status, userId])

    return NextResponse.json({ message: 'User status updated successfully' })
  } catch (error) {
    console.error('Error updating user status:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 