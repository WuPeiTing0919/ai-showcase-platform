import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { authenticateUser, requireDeveloperOrAdmin } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { AppUpdateRequest } from '@/types/app';

// GET /api/apps/[id] - 獲取單個應用程式詳細資料
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const startTime = Date.now();
  
  try {
    // 驗證用戶權限
    const user = await authenticateUser(request);
    if (!user) {
      return NextResponse.json(
        { error: '需要登入才能查看應用程式' },
        { status: 401 }
      );
    }

    const { id } = params;

    // 查詢應用程式詳細資料
    const sql = `
      SELECT 
        a.*,
        u.name as user_creator_name,
        u.email as creator_email,
        u.department as creator_department,
        u.role as creator_role,
        t.name as team_name,
        t.department as team_department,
        t.contact_email as team_contact_email,
        t.leader_id as team_leader_id
      FROM apps a
      LEFT JOIN users u ON a.creator_id = u.id
      LEFT JOIN teams t ON a.team_id = t.id
      WHERE a.id = ?
    `;

    const app = await db.queryOne(sql, [id]);

    if (!app) {
      return NextResponse.json(
        { error: '應用程式不存在' },
        { status: 404 }
      );
    }

    // 格式化回應資料
    const formattedApp = {
      id: app.id,
      name: app.name,
      description: app.description,
      creatorId: app.creator_id,
      teamId: app.team_id,
      status: app.status,
      type: app.type,
      filePath: app.file_path,
      techStack: app.tech_stack ? JSON.parse(app.tech_stack) : [],
      tags: app.tags ? JSON.parse(app.tags) : [],
      screenshots: app.screenshots ? JSON.parse(app.screenshots) : [],
      demoUrl: app.demo_url,
      githubUrl: app.github_url,
      docsUrl: app.docs_url,
      version: app.version,
      icon: app.icon,
      iconColor: app.icon_color,
      likesCount: app.likes_count,
      viewsCount: app.views_count,
      rating: app.rating,
      createdAt: app.created_at,
      updatedAt: app.updated_at,
      lastUpdated: app.last_updated,
      department: app.department,
      creator: {
        id: app.creator_id,
        name: app.creator_name || app.user_creator_name,
        email: app.creator_email,
        department: app.department || app.creator_department,
        role: app.creator_role
      },
      team: app.team_id ? {
        id: app.team_id,
        name: app.team_name,
        department: app.team_department,
        contactEmail: app.team_contact_email,
        leaderId: app.team_leader_id
      } : undefined
    };

    // 增加瀏覽次數
    await db.update(
      'apps',
      { views_count: app.views_count + 1 },
      { id }
    );

    const duration = Date.now() - startTime;
    logger.logRequest('GET', `/api/apps/${id}`, 200, duration, user.id);

    return NextResponse.json(formattedApp);

  } catch (error) {
    logger.logError(error as Error, 'Apps API - GET by ID');
    
    const duration = Date.now() - startTime;
    logger.logRequest('GET', `/api/apps/${params.id}`, 500, duration);

    return NextResponse.json(
      { error: '獲取應用程式詳細資料失敗' },
      { status: 500 }
    );
  }
}

// PUT /api/apps/[id] - 更新應用程式
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const startTime = Date.now();
  
  try {
    // 驗證用戶權限
    const user = await requireDeveloperOrAdmin(request);

    const { id } = params;
    const body = await request.json();
    const {
      name,
      description,
      type,
      teamId,
      status,
      techStack,
      tags,
      screenshots,
      demoUrl,
      githubUrl,
      docsUrl,
      version,
      icon,
      iconColor
    }: AppUpdateRequest = body;

    // 檢查應用程式是否存在
    const existingApp = await db.queryOne('SELECT * FROM apps WHERE id = ?', [id]);
    if (!existingApp) {
      return NextResponse.json(
        { error: '應用程式不存在' },
        { status: 404 }
      );
    }

    // 檢查權限：只有創建者或管理員可以編輯
    if (existingApp.creator_id !== user.id && user.role !== 'admin') {
      return NextResponse.json(
        { error: '您沒有權限編輯此應用程式' },
        { status: 403 }
      );
    }

    // 驗證更新資料
    const updateData: any = {};

    if (name !== undefined) {
      if (name.length < 2 || name.length > 200) {
        return NextResponse.json(
          { error: '應用程式名稱長度必須在 2-200 個字符之間' },
          { status: 400 }
        );
      }
      updateData.name = name;
    }

    if (description !== undefined) {
      if (description.length < 10) {
        return NextResponse.json(
          { error: '應用程式描述至少需要 10 個字符' },
          { status: 400 }
        );
      }
      updateData.description = description;
    }

    if (type !== undefined) {
      const validTypes = [
        'productivity', 'ai_model', 'automation', 'data_analysis', 'educational', 
        'healthcare', 'finance', 'iot_device', 'blockchain', 'ar_vr', 
        'machine_learning', 'computer_vision', 'nlp', 'robotics', 'cybersecurity', 
        'cloud_service', 'other'
      ];
      if (!validTypes.includes(type)) {
        return NextResponse.json(
          { error: '無效的應用程式類型' },
          { status: 400 }
        );
      }
      updateData.type = type;
    }

    if (status !== undefined) {
      const validStatuses = ['draft', 'submitted', 'under_review', 'approved', 'rejected', 'published'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: '無效的應用程式狀態' },
          { status: 400 }
        );
      }
      updateData.status = status;
    }

    if (teamId !== undefined) {
      // 如果指定了團隊，驗證團隊存在且用戶是團隊成員
      if (teamId) {
        const teamMember = await db.queryOne(
          'SELECT * FROM team_members WHERE team_id = ? AND user_id = ?',
          [teamId, user.id]
        );

        if (!teamMember) {
          return NextResponse.json(
            { error: '您不是該團隊的成員，無法將應用程式分配給該團隊' },
            { status: 403 }
          );
        }
      }
      updateData.team_id = teamId || null;
    }

    if (techStack !== undefined) {
      updateData.tech_stack = techStack ? JSON.stringify(techStack) : null;
    }

    if (tags !== undefined) {
      updateData.tags = tags ? JSON.stringify(tags) : null;
    }

    if (screenshots !== undefined) {
      updateData.screenshots = screenshots ? JSON.stringify(screenshots) : null;
    }

    if (demoUrl !== undefined) {
      updateData.demo_url = demoUrl || null;
    }

    if (githubUrl !== undefined) {
      updateData.github_url = githubUrl || null;
    }

    if (docsUrl !== undefined) {
      updateData.docs_url = docsUrl || null;
    }

    if (version !== undefined) {
      updateData.version = version;
    }

    if (icon !== undefined) {
      updateData.icon = icon;
    }

    if (iconColor !== undefined) {
      updateData.icon_color = iconColor;
    }

    // 更新應用程式
    if (Object.keys(updateData).length > 0) {
      await db.update('apps', updateData, { id });

      // 記錄活動
      logger.logActivity(user.id, 'app', id, 'update', updateData);
    }

    const duration = Date.now() - startTime;
    logger.logRequest('PUT', `/api/apps/${id}`, 200, duration, user.id);

    return NextResponse.json({
      message: '應用程式更新成功',
      appId: id
    });

  } catch (error) {
    logger.logError(error as Error, 'Apps API - PUT');
    
    const duration = Date.now() - startTime;
    logger.logRequest('PUT', `/api/apps/${params.id}`, 500, duration);

    return NextResponse.json(
      { error: '更新應用程式失敗' },
      { status: 500 }
    );
  }
}

// DELETE /api/apps/[id] - 刪除應用程式
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const startTime = Date.now();
  
  try {
    // 驗證用戶權限
    const user = await requireDeveloperOrAdmin(request);

    const { id } = params;

    // 檢查應用程式是否存在
    const existingApp = await db.queryOne('SELECT * FROM apps WHERE id = ?', [id]);
    if (!existingApp) {
      return NextResponse.json(
        { error: '應用程式不存在' },
        { status: 404 }
      );
    }

    // 檢查權限：只有創建者或管理員可以刪除
    if (existingApp.creator_id !== user.id && user.role !== 'admin') {
      return NextResponse.json(
        { error: '您沒有權限刪除此應用程式' },
        { status: 403 }
      );
    }

    // 開始事務
    const connection = await db.beginTransaction();

    try {
      // 刪除相關的按讚記錄
      await connection.execute('DELETE FROM user_likes WHERE app_id = ?', [id]);

      // 刪除相關的收藏記錄
      await connection.execute('DELETE FROM user_favorites WHERE app_id = ?', [id]);

      // 刪除相關的評分記錄
      await connection.execute('DELETE FROM judge_scores WHERE app_id = ?', [id]);

      // 刪除應用程式
      await connection.execute('DELETE FROM apps WHERE id = ?', [id]);

      // 提交事務
      await db.commitTransaction(connection);

      // 記錄活動
      logger.logActivity(user.id, 'app', id, 'delete', {
        name: existingApp.name,
        type: existingApp.type
      });

      const duration = Date.now() - startTime;
      logger.logRequest('DELETE', `/api/apps/${id}`, 200, duration, user.id);

      return NextResponse.json({
        message: '應用程式刪除成功',
        appId: id
      });

    } catch (error) {
      // 回滾事務
      await db.rollbackTransaction(connection);
      throw error;
    }

  } catch (error) {
    logger.logError(error as Error, 'Apps API - DELETE');
    
    const duration = Date.now() - startTime;
    logger.logRequest('DELETE', `/api/apps/${params.id}`, 500, duration);

    return NextResponse.json(
      { error: '刪除應用程式失敗' },
      { status: 500 }
    );
  }
} 