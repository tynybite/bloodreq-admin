import { NextRequest } from 'next/server';
import { successResponse, errorResponse, getAuthUser } from '@/lib/api-utils';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/fundraisers/:id
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { user, error: authError } = await getAuthUser(request);
  if (authError) return authError;

  return errorResponse('Fundraiser not found', 'NOT_FOUND', 404);
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { user, error: authError } = await getAuthUser(request);
  if (authError) return authError;

  return errorResponse('Fundraisers feature coming soon', 'NOT_IMPLEMENTED', 501);
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { user, error: authError } = await getAuthUser(request);
  if (authError) return authError;

  return errorResponse('Fundraisers feature coming soon', 'NOT_IMPLEMENTED', 501);
}
