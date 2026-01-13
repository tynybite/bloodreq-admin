import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { successResponse, errorResponse, parseBody, emailSchema, passwordSchema } from '@/lib/api-utils';

// Validation schema for email signin
const signinSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export async function POST(request: NextRequest) {
  // Parse and validate request body
  const { data, error: parseError } = await parseBody(request, signinSchema);
  if (parseError) return parseError;

  const { email, password } = data;

  try {
    const supabase = await createClient();

    // Sign in with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      if (authError.message.includes('Invalid login credentials')) {
        return errorResponse('Invalid email or password', 'AUTH_ERROR', 401);
      }
      if (authError.message.includes('Email not confirmed')) {
        return errorResponse('Please verify your email first', 'EMAIL_NOT_VERIFIED', 401);
      }
      return errorResponse(authError.message, 'AUTH_ERROR', 401);
    }

    if (!authData.user || !authData.session) {
      return errorResponse('Failed to sign in', 'AUTH_ERROR', 500);
    }

    // Fetch user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    return successResponse({
      user: {
        id: authData.user.id,
        email: authData.user.email,
        profile: profile || null,
      },
      access_token: authData.session.access_token,
      refresh_token: authData.session.refresh_token,
      expires_at: authData.session.expires_at,
    });
  } catch (error) {
    console.error('Signin error:', error);
    return errorResponse('An unexpected error occurred', 'SERVER_ERROR', 500);
  }
}
