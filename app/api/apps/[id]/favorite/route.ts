import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { authenticateUser } from '@/lib/auth';
import { logger } from '@/lib/logger';

// POST /api/apps/[id]/favorite - 收藏應用程式
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const startTime = Date.now();
  
  try {
    // 驗證用戶權限
    const user = await authenticateUser(request);
    if (!user) {
      return NextResponse.json(
        { error: '需要登入才能收藏' },
        { status: 401 }
      );
    }

    const { id } = params;

    // 檢查應用程式是否存在
    const existingApp = await db.queryOne('SELECT * FROM apps WHERE id = ?', [id]);
    if (!existingApp) {
      return NextResponse.json(
        { error: '應用程式不存在' },
        { status: 404 }
      );
    }

    // 檢查是否已經收藏過
    const existingFavorite = await db.queryOne(
      'SELECT * FROM user_favorites WHERE user_id = ? AND app_id = ?',
      [user.id, id]
    );

    if (existingFavorite) {
      return NextResponse.json(
        { error: '您已經收藏過此應用程式' },
        { status: 400 }
      );
    }

    // 插入收藏記錄
    const favoriteId = Date.now().toString(36) + Math.random().toString(36).substr(2);
    await db.insert('user_favorites', {
      id: favoriteId,
      user_id: user.id,
      app_id: id
    });

    // 記錄活動
    logger.logActivity(user.id, 'app', id, 'favorite', {
      appName: existingApp.name
    });

    const duration = Date.now() - startTime;
    logger.logRequest('POST', `/api/apps/${id}/favorite`, 200, duration, user.id);

    return NextResponse.json({
      message: '收藏成功',
      appId: id,
      favoriteId
    });

  } catch (error) {
    logger.logError(error as Error, 'Apps Favorite API');
    
    const duration = Date.now() - startTime;
    logger.logRequest('POST', `/api/apps/${params.id}/favorite`, 500, duration);

    return NextResponse.json(
      { error: '收藏失敗' },
      { status: 500 }
    );
  }
}

// DELETE /api/apps/[id]/favorite - 取消收藏
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const startTime = Date.now();
  
  try {
    // 驗證用戶權限
    const user = await authenticateUser(request);
    if (!user) {
      return NextResponse.json(
        { error: '需要登入才能取消收藏' },
        { status: 401 }
      );
    }

    const { id } = params;

    // 檢查應用程式是否存在
    const existingApp = await db.queryOne('SELECT * FROM apps WHERE id = ?', [id]);
    if (!existingApp) {
      return NextResponse.json(
        { error: '應用程式不存在' },
        { status: 404 }
      );
    }

    // 檢查是否已經收藏過
    const existingFavorite = await db.queryOne(
      'SELECT * FROM user_favorites WHERE user_id = ? AND app_id = ?',
      [user.id, id]
    );

    if (!existingFavorite) {
      return NextResponse.json(
        { error: '您還沒有收藏此應用程式' },
        { status: 400 }
      );
    }

    // 刪除收藏記錄
    await db.delete('user_favorites', {
      user_id: user.id,
      app_id: id
    });

    // 記錄活動
    logger.logActivity(user.id, 'app', id, 'unfavorite', {
      appName: existingApp.name
    });

    const duration = Date.now() - startTime;
    logger.logRequest('DELETE', `/api/apps/${id}/favorite`, 200, duration, user.id);

    return NextResponse.json({
      message: '取消收藏成功',
      appId: id
    });

  } catch (error) {
    logger.logError(error as Error, 'Apps Unfavorite API');
    
    const duration = Date.now() - startTime;
    logger.logRequest('DELETE', `/api/apps/${params.id}/favorite`, 500, duration);

    return NextResponse.json(
      { error: '取消收藏失敗' },
      { status: 500 }
    );
  }
} 