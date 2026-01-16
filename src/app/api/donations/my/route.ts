import { NextRequest } from 'next/server';
import { successResponse, getAuthUser } from '@/lib/api-utils';

// GET /api/donations/my (different from blood-donations/my)
export async function GET(request: NextRequest) {
  const { user, error: authError } = await getAuthUser(request);
  if (authError) return authError;

  // Alias to blood-donations/my - return empty for now
  return successResponse({
    donations: [],
    pagination: { page: 1, limit: 20, total: 0, total_pages: 0 },
  });
}
