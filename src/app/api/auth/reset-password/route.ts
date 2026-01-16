import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api-utils';

// Reset password - Firebase handles this via email link
export async function POST(request: NextRequest) {
  return successResponse(
    { message: 'Password reset handled via Firebase email link' },
    'Use the link sent to your email to reset your password'
  );
}
