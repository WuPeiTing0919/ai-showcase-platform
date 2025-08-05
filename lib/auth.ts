import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import { db } from './database';
import bcrypt from 'bcrypt';

// JWT 配置
const JWT_SECRET = process.env.JWT_SECRET || 'ai_platform_jwt_secret_key_2024';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// 用戶角色類型
export type UserRole = 'user' | 'developer' | 'admin';

// 用戶介面
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  department: string;
  role: UserRole;
  joinDate: string;
  totalLikes: number;
  totalViews: number;
  createdAt: string;
  updatedAt: string;
}

// JWT Payload 介面
export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}

// 生成 JWT Token
export function generateToken(user: { id: string; email: string; role: UserRole }): string {
  const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
    userId: user.id,
    email: user.email,
    role: user.role
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  });
}

// 驗證 JWT Token
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

// 從請求中提取 Token
export function extractToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

// 驗證用戶權限
export function hasPermission(userRole: UserRole, requiredRole: UserRole): boolean {
  const roleHierarchy = {
    user: 1,
    developer: 2,
    admin: 3
  };
  
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

// 用戶認證中間件
export async function authenticateUser(request: NextRequest): Promise<User | null> {
  try {
    const token = extractToken(request);
    if (!token) {
      return null;
    }

    const payload = verifyToken(token);
    if (!payload) {
      return null;
    }

    // 從資料庫獲取最新用戶資料
    const user = await db.queryOne<User>(
      'SELECT * FROM users WHERE id = ? AND email = ?',
      [payload.userId, payload.email]
    );

    return user;
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

// 檢查管理員權限
export async function requireAdmin(request: NextRequest): Promise<User> {
  const user = await authenticateUser(request);
  
  if (!user) {
    throw new Error('Authentication required');
  }
  
  if (user.role !== 'admin') {
    throw new Error('Admin permission required');
  }
  
  return user;
}

// 檢查開發者或管理員權限
export async function requireDeveloperOrAdmin(request: NextRequest): Promise<User> {
  const user = await authenticateUser(request);
  
  if (!user) {
    throw new Error('Authentication required');
  }
  
  if (user.role !== 'developer' && user.role !== 'admin') {
    throw new Error('Developer or admin permission required');
  }
  
  return user;
}

// 密碼驗證
export async function validatePassword(password: string): Promise<{ isValid: boolean; errors: string[] }> {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('密碼長度至少需要8個字符');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('密碼需要包含至少一個大寫字母');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('密碼需要包含至少一個小寫字母');
  }
  
  if (!/\d/.test(password)) {
    errors.push('密碼需要包含至少一個數字');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// 加密密碼
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

// 驗證密碼
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// 生成隨機密碼
export function generateRandomPassword(length: number = 12): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  
  return password;
}

// 用戶資料驗證
export function validateUserData(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!data.name || data.name.trim().length < 2) {
    errors.push('姓名至少需要2個字符');
  }
  
  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('請提供有效的電子郵件地址');
  }
  
  if (!data.department || data.department.trim().length < 2) {
    errors.push('部門名稱至少需要2個字符');
  }
  
  if (data.role && !['user', 'developer', 'admin'].includes(data.role)) {
    errors.push('無效的用戶角色');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
} 