import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { authenticateUser } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { AppStats } from '@/types/app';

// GET /api/apps/stats - 獲取應用程式統計資料
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // 驗證用戶權限
    const user = await authenticateUser(request);
    if (!user) {
      return NextResponse.json(
        { error: '需要登入才能查看統計資料' },
        { status: 401 }
      );
    }

    // 查詢總體統計
    const totalStats = await db.queryOne<{ total: number }>('SELECT COUNT(*) as total FROM apps');
    const publishedStats = await db.queryOne<{ published: number }>('SELECT COUNT(*) as published FROM apps WHERE status = "published"');
    const pendingReviewStats = await db.queryOne<{ pending: number }>('SELECT COUNT(*) as pending FROM apps WHERE status = "submitted" OR status = "under_review"');
    const draftStats = await db.queryOne<{ draft: number }>('SELECT COUNT(*) as draft FROM apps WHERE status = "draft"');
    const approvedStats = await db.queryOne<{ approved: number }>('SELECT COUNT(*) as approved FROM apps WHERE status = "approved"');
    const rejectedStats = await db.queryOne<{ rejected: number }>('SELECT COUNT(*) as rejected FROM apps WHERE status = "rejected"');

    // 查詢按類型統計
    const typeStats = await db.query(`
      SELECT type, COUNT(*) as count 
      FROM apps 
      GROUP BY type
    `);

    // 查詢按狀態統計
    const statusStats = await db.query(`
      SELECT status, COUNT(*) as count 
      FROM apps 
      GROUP BY status
    `);

    // 查詢按創建者統計
    const creatorStats = await db.query(`
      SELECT 
        u.name as creator_name,
        COUNT(a.id) as app_count,
        SUM(a.likes_count) as total_likes,
        SUM(a.views_count) as total_views,
        AVG(a.rating) as avg_rating
      FROM apps a
      LEFT JOIN users u ON a.creator_id = u.id
      GROUP BY a.creator_id, u.name
      ORDER BY app_count DESC
      LIMIT 10
    `);

    // 查詢按團隊統計
    const teamStats = await db.query(`
      SELECT 
        t.name as team_name,
        COUNT(a.id) as app_count,
        SUM(a.likes_count) as total_likes,
        SUM(a.views_count) as total_views,
        AVG(a.rating) as avg_rating
      FROM apps a
      LEFT JOIN teams t ON a.team_id = t.id
      WHERE a.team_id IS NOT NULL
      GROUP BY a.team_id, t.name
      ORDER BY app_count DESC
      LIMIT 10
    `);

    // 查詢最近創建的應用程式
    const recentApps = await db.query(`
      SELECT 
        a.id,
        a.name,
        a.type,
        a.status,
        a.created_at,
        u.name as creator_name
      FROM apps a
      LEFT JOIN users u ON a.creator_id = u.id
      ORDER BY a.created_at DESC
      LIMIT 5
    `);

    // 查詢最受歡迎的應用程式
    const popularApps = await db.query(`
      SELECT 
        a.id,
        a.name,
        a.type,
        a.likes_count,
        a.views_count,
        a.rating,
        u.name as creator_name
      FROM apps a
      LEFT JOIN users u ON a.creator_id = u.id
      ORDER BY a.likes_count DESC, a.views_count DESC
      LIMIT 5
    `);

    // 查詢評分最高的應用程式
    const topRatedApps = await db.query(`
      SELECT 
        a.id,
        a.name,
        a.type,
        a.rating,
        a.likes_count,
        a.views_count,
        u.name as creator_name
      FROM apps a
      LEFT JOIN users u ON a.creator_id = u.id
      WHERE a.rating > 0
      ORDER BY a.rating DESC
      LIMIT 5
    `);

    // 格式化按類型統計
    const byType: Record<string, number> = {};
    typeStats.forEach((stat: any) => {
      byType[stat.type] = stat.count;
    });

    // 格式化按狀態統計
    const byStatus: Record<string, number> = {};
    statusStats.forEach((stat: any) => {
      byStatus[stat.status] = stat.count;
    });

    // 構建統計回應
    const stats: AppStats = {
      total: totalStats?.total || 0,
      published: publishedStats?.published || 0,
      pendingReview: pendingReviewStats?.pending || 0,
      draft: draftStats?.draft || 0,
      approved: approvedStats?.approved || 0,
      rejected: rejectedStats?.rejected || 0,
      byType,
      byStatus
    };

    const duration = Date.now() - startTime;
    logger.logRequest('GET', '/api/apps/stats', 200, duration, user.id);

    return NextResponse.json({
      stats,
      creatorStats,
      teamStats,
      recentApps,
      popularApps,
      topRatedApps
    });

  } catch (error) {
    logger.logError(error as Error, 'Apps Stats API');
    
    const duration = Date.now() - startTime;
    logger.logRequest('GET', '/api/apps/stats', 500, duration);

    return NextResponse.json(
      { error: '獲取應用程式統計資料失敗' },
      { status: 500 }
    );
  }
} 