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

    // 查詢參數
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '20', 10)));
    const offset = (page - 1) * limit;
    
    // 優化：使用 COUNT(*) 查詢用戶總數
    const countResult = await db.queryOne('SELECT COUNT(*) as total FROM users');
    const total = countResult?.total || 0;
    
    // 優化：使用子查詢減少 JOIN 複雜度，提升查詢效能
    const users = await db.query(`
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
        COALESCE(app_stats.total_apps, 0) as total_apps,
        COALESCE(review_stats.total_reviews, 0) as total_reviews
      FROM users u
      LEFT JOIN (
        SELECT creator_id, COUNT(*) as total_apps 
        FROM apps 
        GROUP BY creator_id
      ) app_stats ON u.id = app_stats.creator_id
      LEFT JOIN (
        SELECT judge_id, COUNT(*) as total_reviews 
        FROM judge_scores 
        GROUP BY judge_id
      ) review_stats ON u.id = review_stats.judge_id
      ORDER BY u.created_at DESC 
      LIMIT ${limit} OFFSET ${offset}
    `);
    
    // 分頁資訊
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;
    
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
    
    return NextResponse.json({
      users: users.map(user => ({
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
        createdAt: formatDate(user.created_at),
        updatedAt: formatDate(user.updated_at)
      })),
      pagination: { page, limit, total, totalPages, hasNext, hasPrev }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 