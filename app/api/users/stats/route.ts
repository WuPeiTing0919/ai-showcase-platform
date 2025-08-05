import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    const total = await db.queryOne<{ count: number }>('SELECT COUNT(*) as count FROM users');
    const admin = await db.queryOne<{ count: number }>("SELECT COUNT(*) as count FROM users WHERE role = 'admin'");
    const developer = await db.queryOne<{ count: number }>("SELECT COUNT(*) as count FROM users WHERE role = 'developer'");
    const user = await db.queryOne<{ count: number }>("SELECT COUNT(*) as count FROM users WHERE role = 'user'");
    const today = await db.queryOne<{ count: number }>("SELECT COUNT(*) as count FROM users WHERE join_date = CURDATE()");
    return NextResponse.json({
      total: total?.count || 0,
      admin: admin?.count || 0,
      developer: developer?.count || 0,
      user: user?.count || 0,
      today: today?.count || 0
    });
  } catch (error) {
    return NextResponse.json({ error: '內部伺服器錯誤', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}