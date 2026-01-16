import { NextRequest } from 'next/server';
import { successResponse, errorResponse, getAuthUser } from '@/lib/api-utils';

// POST/DELETE /api/profile/avatar - Avatar upload handled by Plesk
export async function POST(request: NextRequest) {
  const { user, error: authError } = await getAuthUser(request);
  if (authError) return authError;

  return errorResponse('Avatar upload will be handled by Plesk server', 'NOT_IMPLEMENTED', 501);
}

export async function DELETE(request: NextRequest) {
  const { user, error: authError } = await getAuthUser(request);
  if (authError) return authError;

  return errorResponse('Avatar deletion will be handled by Plesk server', 'NOT_IMPLEMENTED', 501);
}
