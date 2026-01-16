import { NextRequest } from 'next/server';
import { z } from 'zod';
import { successResponse, errorResponse, parseBody } from '@/lib/api-utils';
import { getFirebaseAuth } from '@/lib/auth/firebase-admin';

// POST /api/auth/forgot-password - Send password reset email
const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email'),
});

export async function POST(request: NextRequest) {
  const { data, error: parseError } = await parseBody(request, forgotPasswordSchema);
  if (parseError) return parseError;

  try {
    // Generate password reset link using Firebase Admin
    const resetLink = await getFirebaseAuth().generatePasswordResetLink(data.email);
    
    // TODO: Send the reset link via email
    console.log('Password reset link generated:', resetLink);
    
    return successResponse(
      { sent: true },
      'If an account exists with this email, you will receive a password reset link.'
    );
  } catch (error: any) {
    // Always return success to prevent email enumeration
    console.error('Forgot password error:', error);
    return successResponse(
      { sent: true },
      'If an account exists with this email, you will receive a password reset link.'
    );
  }
}
