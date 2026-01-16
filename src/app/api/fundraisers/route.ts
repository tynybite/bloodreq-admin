import { NextRequest } from 'next/server';
import { successResponse, errorResponse, getAuthUser } from '@/lib/api-utils';

// Fundraisers - TODO: Migrate to MongoDB when needed
export async function GET(request: NextRequest) {
  const { user, error: authError } = await getAuthUser(request);
  if (authError) return authError;

  // Return empty list for now - to be migrated when fundraisers feature is needed
  return successResponse({
    fundraisers: [],
    pagination: { page: 1, limit: 20, total: 0, total_pages: 0 },
  });
}

export async function POST(request: NextRequest) {
  const { user, error: authError } = await getAuthUser(request);
  if (authError) return authError;

  return errorResponse('Fundraisers feature coming soon', 'NOT_IMPLEMENTED', 501);
}
