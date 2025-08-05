import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';

const codeMap = new Map();

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    if (!email) return NextResponse.json({ error: '請提供 email' }, { status: 400 });
    const user = await db.queryOne('SELECT id FROM users WHERE email = ?', [email]);
    if (!user) return NextResponse.json({ error: '用戶不存在' }, { status: 404 });
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    codeMap.set(email, code);
    // 實際應發送 email，這裡直接回傳
    return NextResponse.json({ message: '驗證碼已產生', code });
  } catch (error) {
    return NextResponse.json({ error: '內部伺服器錯誤', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
export { codeMap };