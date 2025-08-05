import { NextRequest, NextResponse } from 'next/server';
import { db, generateId } from '@/lib/database';
import { validateUserData, validatePassword, hashPassword } from '@/lib/auth';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    console.log('開始處理註冊請求...');
    
    const body = await request.json();
    console.log('請求體:', body);
    
    const { name, email, password, department, role = 'user' } = body;

    // 驗證用戶資料
    console.log('驗證用戶資料...');
    const userValidation = validateUserData({ name, email, department, role });
    if (!userValidation.isValid) {
      console.log('用戶資料驗證失敗:', userValidation.errors);
      return NextResponse.json(
        { error: '用戶資料驗證失敗', details: userValidation.errors },
        { status: 400 }
      );
    }

    // 驗證密碼
    console.log('驗證密碼...');
    const passwordValidation = await validatePassword(password);
    if (!passwordValidation.isValid) {
      console.log('密碼驗證失敗:', passwordValidation.errors);
      return NextResponse.json(
        { error: '密碼格式不正確', details: passwordValidation.errors },
        { status: 400 }
      );
    }

    // 檢查電子郵件是否已存在
    console.log('檢查電子郵件是否已存在...');
    const existingUser = await db.queryOne(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUser) {
      console.log('電子郵件已存在');
      return NextResponse.json(
        { error: '此電子郵件地址已被註冊' },
        { status: 409 }
      );
    }

    // 加密密碼
    console.log('加密密碼...');
    const passwordHash = await hashPassword(password);
    console.log('密碼加密完成');

    // 準備用戶資料
    console.log('準備用戶資料...');
    const userId = generateId();
    const userData = {
      id: userId,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password_hash: passwordHash,
      department: department.trim(),
      role,
      join_date: new Date().toISOString().split('T')[0],
      total_likes: 0,
      total_views: 0,
      created_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
      updated_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
    };

    console.log('插入用戶資料...');
    // 插入用戶資料
    await db.insert('users', userData);
    console.log('用戶資料插入成功');

    // 記錄註冊成功
    logger.logAuth('register', email, true, 'unknown');

    const duration = Date.now() - startTime;
    logger.logRequest('POST', '/api/auth/register', 201, duration, userId);

    return NextResponse.json({
      message: '註冊成功',
      user: {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        department: userData.department,
        role: userData.role,
        joinDate: userData.join_date,
        totalLikes: userData.total_likes,
        totalViews: userData.total_views
      }
    }, { status: 201 });

  } catch (error) {
    console.error('註冊 API 錯誤:', error);
    logger.logError(error as Error, 'Register API');
    
    const duration = Date.now() - startTime;
    logger.logRequest('POST', '/api/auth/register', 500, duration);

    return NextResponse.json(
      { error: '內部伺服器錯誤', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 