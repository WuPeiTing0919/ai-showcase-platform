import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { generateToken, validatePassword, comparePassword } from '@/lib/auth';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body = await request.json();
    const { email, password } = body;

    // 驗證輸入
    if (!email || !password) {
      return NextResponse.json(
        { error: '請提供電子郵件和密碼' },
        { status: 400 }
      );
    }

    // 驗證密碼格式
    const passwordValidation = await validatePassword(password);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { error: '密碼格式不正確', details: passwordValidation.errors },
        { status: 400 }
      );
    }

    // 查詢用戶
    const user = await db.queryOne<{
      id: string;
      name: string;
      email: string;
      password_hash: string;
      avatar?: string;
      department: string;
      role: 'user' | 'developer' | 'admin';
      join_date: string;
      total_likes: number;
      total_views: number;
      created_at: string;
      updated_at: string;
    }>(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (!user) {
      logger.logAuth('login', email, false, request.ip || 'unknown');
      return NextResponse.json(
        { error: '電子郵件或密碼不正確' },
        { status: 401 }
      );
    }

    // 驗證密碼
    const isPasswordValid = await comparePassword(password, user.password_hash);
    if (!isPasswordValid) {
      logger.logAuth('login', email, false, request.ip || 'unknown');
      return NextResponse.json(
        { error: '電子郵件或密碼不正確' },
        { status: 401 }
      );
    }

    // 生成 JWT Token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role
    });

    // 更新最後登入時間
    await db.update(
      'users',
      { updated_at: new Date().toISOString().slice(0, 19).replace('T', ' ') },
      { id: user.id }
    );

    // 記錄成功登入
    logger.logAuth('login', email, true, request.ip || 'unknown');

    const duration = Date.now() - startTime;
    logger.logRequest('POST', '/api/auth/login', 200, duration, user.id);

    return NextResponse.json({
      message: '登入成功',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        department: user.department,
        role: user.role,
        joinDate: user.join_date,
        totalLikes: user.total_likes,
        totalViews: user.total_views
      },
      token,
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });

  } catch (error) {
    logger.logError(error as Error, 'Login API');
    
    const duration = Date.now() - startTime;
    logger.logRequest('POST', '/api/auth/login', 500, duration);

    return NextResponse.json(
      { error: '內部伺服器錯誤' },
      { status: 500 }
    );
  }
} 