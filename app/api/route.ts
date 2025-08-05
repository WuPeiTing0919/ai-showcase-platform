import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    // 健康檢查
    const isHealthy = await db.healthCheck();
    
    if (!isHealthy) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 503 }
      );
    }

    // 獲取基本統計
    const stats = await db.getDatabaseStats();

    return NextResponse.json({
      message: 'AI Platform API is running',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      database: {
        status: 'connected',
        stats
      }
    });
  } catch (error) {
    console.error('API Health Check Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 