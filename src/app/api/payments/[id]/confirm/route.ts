import { NextRequest } from 'next/server';
import { successResponse, errorResponse, getAuthUser } from '@/lib/api-utils';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/payments/:id/confirm
export async function POST(request: NextRequest, { params }: RouteParams) {
  const { user, error: authError } = await getAuthUser(request);
  if (authError) return authError;

  return errorResponse('Payment confirmation coming soon', 'NOT_IMPLEMENTED', 501);
}
