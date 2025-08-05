import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { authenticateUser, requireDeveloperOrAdmin } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { AppSearchParams, AppCreateRequest } from '@/types/app';

// GET /api/apps - 獲取應用程式列表
export async function GET(request: NextRequest) {
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

    // 解析查詢參數
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type') || '';
    const status = searchParams.get('status') || '';
    const creatorId = searchParams.get('creatorId') || '';
    const teamId = searchParams.get('teamId') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // 確保參數是數字類型
    const limitNum = Number(limit);
    const offsetNum = Number((page - 1) * limit);
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // 構建查詢條件
    const conditions: string[] = [];
    const params: any[] = [];

    if (search) {
      conditions.push('(a.name LIKE ? OR a.description LIKE ? OR u.name LIKE ?)');
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (type) {
      conditions.push('a.type = ?');
      params.push(type);
    }

    if (status) {
      conditions.push('a.status = ?');
      params.push(status);
    }

    if (creatorId) {
      conditions.push('a.creator_id = ?');
      params.push(creatorId);
    }

    if (teamId) {
      conditions.push('a.team_id = ?');
      params.push(teamId);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // 計算總數
    const countSql = `
      SELECT COUNT(*) as total
      FROM apps a
      LEFT JOIN users u ON a.creator_id = u.id
      ${whereClause}
    `;

    const totalResults = await db.query<{ total: number }>(countSql, params);
    const total = totalResults.length > 0 ? totalResults[0].total : 0;

    // 計算分頁
    const totalPages = Math.ceil(total / limit);
    
    // 計算各狀態的統計
    const statsSql = `
      SELECT a.status, COUNT(*) as count
      FROM apps a
      LEFT JOIN users u ON a.creator_id = u.id
      ${whereClause}
      GROUP BY a.status
    `;
    const statsResults = await db.query(statsSql, params);
    const stats = {
      published: 0,
      pending: 0,
      draft: 0,
      rejected: 0
    };
    statsResults.forEach((row: any) => {
      if (stats.hasOwnProperty(row.status)) {
        stats[row.status] = row.count;
      }
    });
    


    // 構建排序
    const validSortFields = ['name', 'created_at', 'rating', 'likes_count', 'views_count'];
    const validSortOrders = ['asc', 'desc'];
    const finalSortBy = validSortFields.includes(sortBy) ? sortBy : 'created_at';
    const finalSortOrder = validSortOrders.includes(sortOrder) ? sortOrder : 'desc';

    // 查詢應用程式列表
    const sql = `
      SELECT 
        a.*,
        u.name as creator_name,
        u.email as creator_email,
        u.department as creator_department,
        u.role as creator_role
      FROM apps a
      LEFT JOIN users u ON a.creator_id = u.id
      ${whereClause}
      ORDER BY a.created_at DESC
      LIMIT ${limitNum} OFFSET ${offsetNum}
    `;

    const apps = await db.query(sql, params);

    // 格式化回應資料
    const formattedApps = apps.map((app: any) => ({
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
      likesCount: app.likes_count,
      viewsCount: app.views_count,
      rating: app.rating,
      createdAt: app.created_at,
      updatedAt: app.updated_at,
      lastUpdated: app.last_updated,
      creator: {
        id: app.creator_id,
        name: app.creator_name,
        email: app.creator_email,
        department: app.creator_department,
        role: app.creator_role
      },
      team: app.team_id ? {
        id: app.team_id,
        name: app.team_name,
        department: app.team_department,
        contactEmail: app.team_contact_email
      } : undefined
    }));

    const duration = Date.now() - startTime;
    logger.logRequest('GET', '/api/apps', 200, duration, user.id);

    return NextResponse.json({
      apps: formattedApps,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      stats
    });

  } catch (error) {
    logger.logError(error as Error, 'Apps API - GET');
    
    const duration = Date.now() - startTime;
    logger.logRequest('GET', '/api/apps', 500, duration);

    console.error('詳細錯誤信息:', error);
    
    return NextResponse.json(
      { 
        error: '獲取應用程式列表失敗',
        details: error instanceof Error ? error.message : '未知錯誤'
      },
      { status: 500 }
    );
  }
}

// POST /api/apps - 創建新應用程式
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // 驗證用戶權限
    const user = await requireDeveloperOrAdmin(request);

    const body = await request.json();
    const {
      name,
      description,
      type,
      teamId,
      techStack,
      tags,
      demoUrl,
      githubUrl,
      docsUrl,
      version = '1.0.0'
    }: AppCreateRequest = body;

    // 驗證必填欄位
    if (!name || !description || !type) {
      return NextResponse.json(
        { error: '請提供應用程式名稱、描述和類型' },
        { status: 400 }
      );
    }

    // 驗證應用程式名稱長度
    if (name.length < 2 || name.length > 200) {
      return NextResponse.json(
        { error: '應用程式名稱長度必須在 2-200 個字符之間' },
        { status: 400 }
      );
    }

    // 驗證描述長度
    if (description.length < 10) {
      return NextResponse.json(
        { error: '應用程式描述至少需要 10 個字符' },
        { status: 400 }
      );
    }

    // 驗證類型
    const validTypes = [
      'web_app', 'mobile_app', 'desktop_app', 'api_service', 'ai_model', 
      'data_analysis', 'automation', 'productivity', 'educational', 'healthcare', 
      'finance', 'iot_device', 'blockchain', 'ar_vr', 'machine_learning', 
      'computer_vision', 'nlp', 'robotics', 'cybersecurity', 'cloud_service', 'other'
    ];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: '無效的應用程式類型' },
        { status: 400 }
      );
    }

    // 如果指定了團隊，驗證團隊存在且用戶是團隊成員
    if (teamId) {
      const teamMember = await db.queryOne(
        'SELECT * FROM team_members WHERE team_id = ? AND user_id = ?',
        [teamId, user.id]
      );

      if (!teamMember) {
        return NextResponse.json(
          { error: '您不是該團隊的成員，無法為該團隊創建應用程式' },
          { status: 403 }
        );
      }
    }

    // 生成應用程式 ID
    const appId = Date.now().toString(36) + Math.random().toString(36).substr(2);

    // 準備插入資料
    const appData = {
      id: appId,
      name,
      description,
      creator_id: user.id,
      team_id: teamId || null,
      type,
      tech_stack: techStack ? JSON.stringify(techStack) : null,
      tags: tags ? JSON.stringify(tags) : null,
      demo_url: demoUrl || null,
      github_url: githubUrl || null,
      docs_url: docsUrl || null,
      version,
      status: 'draft'
    };

    // 插入應用程式
    await db.insert('apps', appData);

    // 記錄活動
    logger.logActivity(user.id, 'app', appId, 'create', {
      name,
      type,
      teamId
    });

    const duration = Date.now() - startTime;
    logger.logRequest('POST', '/api/apps', 201, duration, user.id);

    return NextResponse.json({
      message: '應用程式創建成功',
      appId,
      app: {
        id: appId,
        name,
        description,
        type,
        status: 'draft',
        creatorId: user.id,
        teamId,
        version
      }
    }, { status: 201 });

  } catch (error) {
    logger.logError(error as Error, 'Apps API - POST');
    
    const duration = Date.now() - startTime;
    logger.logRequest('POST', '/api/apps', 500, duration);

    console.error('詳細錯誤信息:', error);
    
    return NextResponse.json(
      { 
        error: '創建應用程式失敗',
        details: error instanceof Error ? error.message : '未知錯誤'
      },
      { status: 500 }
    );
  }
} 