import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/lib/database';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  try {
    // 驗證管理員權限
    const admin = await requireAdmin(request);
    // 查詢參數
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '20', 10)));
    const offset = (page - 1) * limit;
    
    // 查詢用戶總數
    const countResult = await db.queryOne<{ total: number }>('SELECT COUNT(*) as total FROM users');
    const total = countResult?.total || 0;
    
    // 查詢用戶列表，包含應用和評價統計
    const users = await db.query(`
      SELECT 
        u.id, 
        u.name, 
        u.email, 
        u.avatar, 
        u.department, 
        u.role, 
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
      GROUP BY u.id
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
        status: "active", // 預設狀態為活躍
        joinDate: formatDate(user.join_date),
        lastLogin: formatDate(user.updated_at), // 使用 updated_at 作為最後登入時間
        totalApps: user.total_apps || 0,
        totalReviews: user.total_reviews || 0,
        totalLikes: user.total_likes || 0,
        createdAt: formatDate(user.created_at),
        updatedAt: formatDate(user.updated_at)
      })),
      pagination: { page, limit, total, totalPages, hasNext, hasPrev }
    });
  } catch (error) {
    logger.logError(error as Error, 'Users List API');
    return NextResponse.json({ error: '內部伺服器錯誤', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
} 