import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser } from '@/lib/auth';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // 驗證用戶
    const user = await authenticateUser(request);
    
    if (!user) {
      return NextResponse.json(
        { error: '未授權訪問' },
        { status: 401 }
      );
    }

    const duration = Date.now() - startTime;
    logger.logRequest('GET', '/api/auth/me', 200, duration, user.id);

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        department: user.department,
        role: user.role,
        joinDate: user.joinDate,
        totalLikes: user.totalLikes,
        totalViews: user.totalViews
      }
    });

  } catch (error) {
    logger.logError(error as Error, 'Get Current User API');
    
    const duration = Date.now() - startTime;
    logger.logRequest('GET', '/api/auth/me', 500, duration);

    return NextResponse.json(
      { error: '內部伺服器錯誤' },
      { status: 500 }
    );
  }
} 