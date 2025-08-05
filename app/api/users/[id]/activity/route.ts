import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { db } from '@/lib/database'

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

    // 檢查用戶是否存在
    const user = await db.queryOne('SELECT id FROM users WHERE id = ?', [userId])
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // 獲取用戶活動記錄
    // 這裡可以根據實際需求查詢不同的活動表
    // 目前先返回空數組，因為還沒有活動記錄表
    const activities = []

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

    return NextResponse.json(activities)
  } catch (error) {
    console.error('Error fetching user activity:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 