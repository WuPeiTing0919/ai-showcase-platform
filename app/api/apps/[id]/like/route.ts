import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { authenticateUser } from '@/lib/auth';
import { logger } from '@/lib/logger';

// POST /api/apps/[id]/like - 按讚應用程式
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
        { error: '需要登入才能按讚' },
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

    // 檢查是否已經按讚過
    const existingLike = await db.queryOne(
      'SELECT * FROM user_likes WHERE user_id = ? AND app_id = ? AND DATE(liked_at) = CURDATE()',
      [user.id, id]
    );

    if (existingLike) {
      return NextResponse.json(
        { error: '您今天已經為此應用程式按讚過了' },
        { status: 400 }
      );
    }

    // 開始事務
    const connection = await db.beginTransaction();

    try {
      // 插入按讚記錄
      const likeId = Date.now().toString(36) + Math.random().toString(36).substr(2);
      await connection.execute(
        'INSERT INTO user_likes (id, user_id, app_id, liked_at) VALUES (?, ?, ?, NOW())',
        [likeId, user.id, id]
      );

      // 更新應用程式按讚數
      await connection.execute(
        'UPDATE apps SET likes_count = likes_count + 1 WHERE id = ?',
        [id]
      );

      // 更新用戶總按讚數
      await connection.execute(
        'UPDATE users SET total_likes = total_likes + 1 WHERE id = ?',
        [user.id]
      );

      // 提交事務
      await db.commitTransaction(connection);

      // 記錄活動
      logger.logActivity(user.id, 'app', id, 'like', {
        appName: existingApp.name
      });

      const duration = Date.now() - startTime;
      logger.logRequest('POST', `/api/apps/${id}/like`, 200, duration, user.id);

      return NextResponse.json({
        message: '按讚成功',
        appId: id,
        likeId
      });

    } catch (error) {
      // 回滾事務
      await db.rollbackTransaction(connection);
      throw error;
    }

  } catch (error) {
    logger.logError(error as Error, 'Apps Like API');
    
    const duration = Date.now() - startTime;
    logger.logRequest('POST', `/api/apps/${params.id}/like`, 500, duration);

    return NextResponse.json(
      { error: '按讚失敗' },
      { status: 500 }
    );
  }
}

// DELETE /api/apps/[id]/like - 取消按讚
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
        { error: '需要登入才能取消按讚' },
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

    // 檢查是否已經按讚過
    const existingLike = await db.queryOne(
      'SELECT * FROM user_likes WHERE user_id = ? AND app_id = ? AND DATE(liked_at) = CURDATE()',
      [user.id, id]
    );

    if (!existingLike) {
      return NextResponse.json(
        { error: '您今天還沒有為此應用程式按讚' },
        { status: 400 }
      );
    }

    // 開始事務
    const connection = await db.beginTransaction();

    try {
      // 刪除按讚記錄
      await connection.execute(
        'DELETE FROM user_likes WHERE user_id = ? AND app_id = ? AND DATE(liked_at) = CURDATE()',
        [user.id, id]
      );

      // 更新應用程式按讚數
      await connection.execute(
        'UPDATE apps SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = ?',
        [id]
      );

      // 更新用戶總按讚數
      await connection.execute(
        'UPDATE users SET total_likes = GREATEST(total_likes - 1, 0) WHERE id = ?',
        [user.id]
      );

      // 提交事務
      await db.commitTransaction(connection);

      // 記錄活動
      logger.logActivity(user.id, 'app', id, 'unlike', {
        appName: existingApp.name
      });

      const duration = Date.now() - startTime;
      logger.logRequest('DELETE', `/api/apps/${id}/like`, 200, duration, user.id);

      return NextResponse.json({
        message: '取消按讚成功',
        appId: id
      });

    } catch (error) {
      // 回滾事務
      await db.rollbackTransaction(connection);
      throw error;
    }

  } catch (error) {
    logger.logError(error as Error, 'Apps Unlike API');
    
    const duration = Date.now() - startTime;
    logger.logRequest('DELETE', `/api/apps/${params.id}/like`, 500, duration);

    return NextResponse.json(
      { error: '取消按讚失敗' },
      { status: 500 }
    );
  }
} 