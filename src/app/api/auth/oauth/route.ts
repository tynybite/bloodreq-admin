import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api-utils';

// OAuth - Google sign-in handled by Firebase client
// This endpoint is no longer needed with Firebase
export async function POST(request: NextRequest) {
  return successResponse(
    { message: 'OAuth handled by Firebase client-side' },
    'Use Firebase Auth SDK for OAuth'
  );
}
