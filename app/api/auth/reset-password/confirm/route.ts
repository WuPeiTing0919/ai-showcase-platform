import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { hashPassword } from '@/lib/auth';
import { codeMap } from '../request/route';

export async function POST(request: NextRequest) {
  try {
    const { email, code, newPassword } = await request.json();
    if (!email || !code || !newPassword) return NextResponse.json({ error: '缺少參數' }, { status: 400 });
    const validCode = codeMap.get(email);
    if (!validCode || validCode !== code) return NextResponse.json({ error: '驗證碼錯誤' }, { status: 400 });
    const passwordHash = await hashPassword(newPassword);
    await db.update('users', { password_hash: passwordHash }, { email });
    codeMap.delete(email);
    return NextResponse.json({ message: '密碼重設成功' });
  } catch (error) {
    return NextResponse.json({ error: '內部伺服器錯誤', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}