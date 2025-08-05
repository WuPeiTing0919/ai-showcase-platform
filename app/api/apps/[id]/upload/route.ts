import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { requireDeveloperOrAdmin } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// POST /api/apps/[id]/upload - 上傳應用程式檔案
export async function POST(
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

    // 檢查權限：只有創建者或管理員可以上傳檔案
    if (existingApp.creator_id !== user.id && user.role !== 'admin') {
      return NextResponse.json(
        { error: '您沒有權限為此應用程式上傳檔案' },
        { status: 403 }
      );
    }

    // 解析 FormData
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string;

    if (!file) {
      return NextResponse.json(
        { error: '請選擇要上傳的檔案' },
        { status: 400 }
      );
    }

    // 驗證檔案類型
    const validTypes = ['screenshot', 'document', 'source_code'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: '無效的檔案類型' },
        { status: 400 }
      );
    }

    // 驗證檔案大小 (最大 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: '檔案大小不能超過 10MB' },
        { status: 400 }
      );
    }

    // 驗證檔案格式
    const allowedExtensions = {
      screenshot: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
      document: ['.pdf', '.doc', '.docx', '.txt', '.md'],
      source_code: ['.zip', '.rar', '.7z', '.tar.gz']
    };

    const fileName = file.name.toLowerCase();
    const fileExtension = fileName.substring(fileName.lastIndexOf('.'));
    const allowedExts = allowedExtensions[type as keyof typeof allowedExtensions];

    if (!allowedExts.includes(fileExtension)) {
      return NextResponse.json(
        { error: `此檔案類型不支援 ${type} 上傳` },
        { status: 400 }
      );
    }

    // 創建上傳目錄
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'apps', id);
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // 生成唯一檔案名
    const timestamp = Date.now();
    const uniqueFileName = `${type}_${timestamp}_${file.name}`;
    const filePath = join(uploadDir, uniqueFileName);
    const relativePath = `/uploads/apps/${id}/${uniqueFileName}`;

    // 將檔案寫入磁碟
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // 更新應用程式資料
    let updateData: any = {};

    if (type === 'screenshot') {
      // 獲取現有的截圖列表
      const currentScreenshots = existingApp.screenshots ? JSON.parse(existingApp.screenshots) : [];
      currentScreenshots.push(relativePath);
      updateData.screenshots = JSON.stringify(currentScreenshots);
    } else if (type === 'source_code') {
      // 更新檔案路徑
      updateData.file_path = relativePath;
    }

    if (Object.keys(updateData).length > 0) {
      await db.update('apps', updateData, { id });
    }

    // 記錄活動
    logger.logActivity(user.id, 'app', id, 'upload_file', {
      fileName: file.name,
      fileType: type,
      fileSize: file.size,
      filePath: relativePath
    });

    const duration = Date.now() - startTime;
    logger.logRequest('POST', `/api/apps/${id}/upload`, 200, duration, user.id);

    return NextResponse.json({
      message: '檔案上傳成功',
      fileName: file.name,
      fileType: type,
      filePath: relativePath,
      fileSize: file.size
    });

  } catch (error) {
    logger.logError(error as Error, 'Apps Upload API');
    
    const duration = Date.now() - startTime;
    logger.logRequest('POST', `/api/apps/${params.id}/upload`, 500, duration);

    return NextResponse.json(
      { error: '檔案上傳失敗' },
      { status: 500 }
    );
  }
} 