import { NextRequest } from 'next/server';
import { successResponse, errorResponse, getAuthUser } from '@/lib/api-utils';

// POST /api/upload/document - Document upload handled by Plesk
export async function POST(request: NextRequest) {
  const { user, error: authError } = await getAuthUser(request);
  if (authError) return authError;

  return errorResponse('Document upload will be handled by Plesk server', 'NOT_IMPLEMENTED', 501);
}
