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
    // 查詢用戶列表
    const users = await db.query(
      `SELECT id, name, email, avatar, department, role, join_date, total_likes, total_views, created_at, updated_at FROM users ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`
    );
    // 分頁資訊
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;
    return NextResponse.json({
      users: users.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        department: user.department,
        role: user.role,
        joinDate: user.join_date,
        totalLikes: user.total_likes,
        totalViews: user.total_views,
        createdAt: user.created_at,
        updatedAt: user.updated_at
      })),
      pagination: { page, limit, total, totalPages, hasNext, hasPrev }
    });
  } catch (error) {
    logger.logError(error as Error, 'Users List API');
    return NextResponse.json({ error: '內部伺服器錯誤', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
} 