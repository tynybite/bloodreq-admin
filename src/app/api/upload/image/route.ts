
import { NextRequest, NextResponse } from 'next/server';
import { errorResponse, successResponse } from '@/lib/api-utils';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

// POST /api/upload/image
// Handles file uploads (multipart/form-data)
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'uploads';

    if (!file) {
      return errorResponse('No file uploaded', 'VALIDATION_ERROR', 400);
    }

    // Basic validation
    if (!file.type.startsWith('image/')) {
        return errorResponse('Only image files are allowed', 'VALIDATION_ERROR', 400);
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = file.name.split('.').pop() || 'jpg';
    const filename = `${uniqueSuffix}.${extension}`;

    // Target directory (public/uploads/[folder])
    const uploadDir = join(process.cwd(), 'public', folder);
    
    try {
        await mkdir(uploadDir, { recursive: true });
    } catch (e) {
        // Ignore if exists
    }

    const filepath = join(uploadDir, filename);

    // Write file
    await writeFile(filepath, buffer);

    // Construct public URL
    // In production, this would be the CDN or Plesk URL
    const publicUrl = `/${folder}/${filename}`;

    return successResponse({ 
        url: publicUrl,
        filename: filename,
        original_name: file.name
    }, 'File uploaded successfully');

  } catch (error) {
    console.error('Upload error:', error);
    return errorResponse('Failed to upload file', 'SERVER_ERROR', 500);
  }
}
