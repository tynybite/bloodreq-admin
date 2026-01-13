import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { successResponse, errorResponse, parseBody, phoneSchema } from '@/lib/api-utils';

// Validation schema for phone signup
const phoneSignupSchema = z.object({
  phone_number: phoneSchema,
});

export async function POST(request: NextRequest) {
  // Parse and validate request body
  const { data, error: parseError } = await parseBody(request, phoneSignupSchema);
  if (parseError) return parseError;

  const { phone_number } = data;

  try {
    const supabase = await createClient();

    // Send OTP via Supabase Auth
    const { data: otpData, error: otpError } = await supabase.auth.signInWithOtp({
      phone: phone_number,
    });

    if (otpError) {
      return errorResponse(otpError.message, 'OTP_ERROR', 400);
    }

    return successResponse(
      {
        message_id: otpData?.messageId || null,
      },
      'OTP sent to phone number'
    );
  } catch (error) {
    console.error('Phone signup error:', error);
    return errorResponse('Failed to send OTP', 'SERVER_ERROR', 500);
  }
}
