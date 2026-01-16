import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api-utils';

// Phone signup - Firebase handles this client-side
export async function POST(request: NextRequest) {
  return successResponse(
    { message: 'Phone signup handled by Firebase SDK' },
    'Use Firebase Auth SDK for phone authentication'
  );
}
