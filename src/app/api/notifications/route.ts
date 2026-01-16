import { NextRequest } from 'next/server';
import { successResponse, errorResponse, getAuthUser } from '@/lib/api-utils';

// GET /api/notifications - Get user notifications
export async function GET(request: NextRequest) {
  const { user, error: authError } = await getAuthUser(request);
  if (authError) return authError;

  // TODO: Migrate to MongoDB when needed
  return successResponse({
    notifications: [],
    pagination: { page: 1, limit: 20, total: 0, total_pages: 0 },
  });
}
