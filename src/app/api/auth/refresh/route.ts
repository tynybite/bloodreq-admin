import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api-utils';

// Token refresh - Firebase handles this client-side
export async function POST(request: NextRequest) {
  return successResponse(
    { message: 'Token refresh handled by Firebase SDK' },
    'Use Firebase Auth SDK for token refresh'
  );
}
