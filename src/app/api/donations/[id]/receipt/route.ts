import { NextRequest } from 'next/server';
import { successResponse, errorResponse, getAuthUser } from '@/lib/api-utils';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/donations/:id/receipt
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { user, error: authError } = await getAuthUser(request);
  if (authError) return authError;

  return errorResponse('Donation receipt generation coming soon', 'NOT_IMPLEMENTED', 501);
}
