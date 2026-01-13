import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { successResponse, errorResponse, parseBody, emailSchema } from '@/lib/api-utils';

// Validation schema for forgot password
const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export async function POST(request: NextRequest) {
  // Parse and validate request body
  const { data, error: parseError } = await parseBody(request, forgotPasswordSchema);
  if (parseError) return parseError;

  const { email } = data;

  try {
    const supabase = await createClient();

    // Request password reset email
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/reset-password`,
    });

    if (resetError) {
      // Don't reveal if email exists or not for security
      console.error('Password reset error:', resetError);
    }

    // Always return success to prevent email enumeration
    return successResponse(
      { email },
      'If an account with this email exists, a password reset link has been sent.'
    );
  } catch (error) {
    console.error('Forgot password error:', error);
    return errorResponse('An unexpected error occurred', 'SERVER_ERROR', 500);
  }
}
