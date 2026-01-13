import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { successResponse, errorResponse, parseBody, passwordSchema } from '@/lib/api-utils';

// Validation schema for password reset
const resetPasswordSchema = z.object({
  new_password: passwordSchema,
});

export async function POST(request: NextRequest) {
  // Parse and validate request body
  const { data, error: parseError } = await parseBody(request, resetPasswordSchema);
  if (parseError) return parseError;

  const { new_password } = data;

  try {
    const supabase = await createClient();

    // Check if user has a valid session (from the reset link callback)
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return errorResponse(
        'Invalid or expired reset link. Please request a new password reset.',
        'INVALID_RESET_LINK',
        401
      );
    }

    // Update the user's password
    const { error: updateError } = await supabase.auth.updateUser({
      password: new_password,
    });

    if (updateError) {
      return errorResponse(updateError.message, 'PASSWORD_UPDATE_ERROR', 400);
    }

    return successResponse(
      { success: true },
      'Password has been reset successfully. You can now sign in with your new password.'
    );
  } catch (error) {
    console.error('Reset password error:', error);
    return errorResponse('An unexpected error occurred', 'SERVER_ERROR', 500);
  }
}
