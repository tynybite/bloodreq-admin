import { NextRequest, NextResponse } from 'next/server';
import { errorResponse } from '@/lib/api-utils';

export async function POST(request: NextRequest) {
  try {
    // Firebase token refresh is usually handled on the client side (Mobile/Web SDK).
    // This endpoint exists to prevent 404s and provide a hook for future custom JWT logic.
    
    // For now, we return 401 to signal the mobile app that it should 
    // perform a fresh login or use its Firebase SDK to refresh the token.
    return errorResponse(
      'Session expired. Please sign in again.', 
      'AUTH_EXPIRED', 
      401,
      'Firebase server-side token refresh is not supported. Use client SDK.'
    );
  } catch (error) {
    return errorResponse('Failed to refresh token', 'SERVER_ERROR', 500);
  }
}
