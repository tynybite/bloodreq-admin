import { NextRequest } from 'next/server';
import { successResponse, getAuthUser } from '@/lib/api-utils';

// GET /api/fundraisers/my
export async function GET(request: NextRequest) {
  const { user, error: authError } = await getAuthUser(request);
  if (authError) return authError;

  return successResponse({
    fundraisers: [],
    pagination: { page: 1, limit: 20, total: 0, total_pages: 0 },
  });
}
