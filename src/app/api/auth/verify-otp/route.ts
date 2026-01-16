import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api-utils';

// OTP verification - Firebase handles this client-side
export async function POST(request: NextRequest) {
  return successResponse(
    { message: 'OTP verification handled by Firebase SDK' },
    'Use Firebase Auth SDK for OTP verification'
  );
}
