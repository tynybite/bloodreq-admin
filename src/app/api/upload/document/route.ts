import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { successResponse, errorResponse, getAuthUser } from '@/lib/api-utils';

// POST /api/upload/document - Upload a document (for fundraisers)
export async function POST(request: NextRequest) {
  // Verify authentication
  const { user, error: authError } = await getAuthUser(request);
  if (authError) return authError;

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const fundraiserId = formData.get('fundraiser_id') as string || null;
    const documentType = formData.get('document_type') as string || 'other';

    if (!file) {
      return errorResponse('No file provided', 'VALIDATION_ERROR', 400);
    }

    // Validate file type
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (!allowedTypes.includes(file.type)) {
      return errorResponse('Invalid file type. Only images, PDF, and Word documents are allowed.', 'VALIDATION_ERROR', 400);
    }

    // Validate file size (max 20MB for documents)
    const maxSize = 20 * 1024 * 1024;
    if (file.size > maxSize) {
      return errorResponse('File too large. Maximum size is 20MB.', 'VALIDATION_ERROR', 400);
    }

    const supabase = await createClient();

    // If fundraiser_id provided, verify ownership
    if (fundraiserId) {
      const { data: fundraiser } = await supabase
        .from('fundraisers')
        .select('user_id')
        .eq('id', fundraiserId)
        .single();

      if (!fundraiser || fundraiser.user_id !== user!.id) {
        return errorResponse('You can only upload documents for your own fundraisers', 'FORBIDDEN', 403);
      }
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${user!.id}-${Date.now()}.${fileExt}`;
    const filePath = `documents/${fundraiserId || 'general'}/${fileName}`;

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('private')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return errorResponse('Failed to upload document', 'UPLOAD_ERROR', 500);
    }

    // Get signed URL (private bucket)
    const { data: urlData } = await supabase.storage
      .from('private')
      .createSignedUrl(filePath, 60 * 60 * 24); // 24 hour expiry

    // If fundraiser, save to fundraiser_documents table
    if (fundraiserId) {
      await supabase.from('fundraiser_documents').insert({
        fundraiser_id: fundraiserId,
        file_name: file.name,
        file_url: filePath, // Store path, not signed URL
        document_type: documentType,
        file_size: file.size,
        content_type: file.type,
      });
    }

    return successResponse(
      {
        url: urlData?.signedUrl,
        file_path: filePath,
        file_name: file.name,
        file_size: file.size,
        content_type: file.type,
        document_type: documentType,
      },
      'Document uploaded successfully'
    );
  } catch (error) {
    console.error('Document upload error:', error);
    return errorResponse('An unexpected error occurred', 'SERVER_ERROR', 500);
  }
}
