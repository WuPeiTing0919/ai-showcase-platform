import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { db } from '@/lib/database';

export async function GET(request: NextRequest) {
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

    // 優化：使用單一查詢獲取所有統計數據，減少資料庫查詢次數
    const stats = await db.queryOne(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin,
        COUNT(CASE WHEN role = 'developer' THEN 1 END) as developer,
        COUNT(CASE WHEN role = 'user' THEN 1 END) as user,
        COUNT(CASE WHEN DATE(created_at) = CURDATE() THEN 1 END) as today
      FROM users
    `);

    // 優化：並行查詢應用和評價統計
    const [appsResult, reviewsResult] = await Promise.all([
      db.queryOne('SELECT COUNT(*) as count FROM apps'),
      db.queryOne('SELECT COUNT(*) as count FROM judge_scores')
    ]);

    return NextResponse.json({
      total: stats?.total || 0,
      admin: stats?.admin || 0,
      developer: stats?.developer || 0,
      user: stats?.user || 0,
      today: stats?.today || 0,
      totalApps: appsResult?.count || 0,
      totalReviews: reviewsResult?.count || 0
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}