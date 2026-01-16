import { NextRequest } from 'next/server';
import { successResponse, errorResponse, getAuthUser } from '@/lib/api-utils';

// Payments - To be implemented when needed
export async function POST(request: NextRequest) {
  const { user, error: authError } = await getAuthUser(request);
  if (authError) return authError;

  return errorResponse('Payments feature coming soon', 'NOT_IMPLEMENTED', 501);
}
