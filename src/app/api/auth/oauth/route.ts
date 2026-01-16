import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';
import { successResponse, errorResponse, parseBody } from '@/lib/api-utils';

// Validation schema for OAuth
const oauthSchema = z.object({
  provider: z.enum(['google', 'facebook']),
  id_token: z.string().min(1, 'ID token is required'),
  access_token: z.string().optional(),
});

export async function POST(request: NextRequest) {
  // Parse and validate request body
  const { data, error: parseError } = await parseBody(request, oauthSchema);
  if (parseError) return parseError;

  const { provider, id_token, access_token } = data;

  try {
    const supabase = createAdminClient();

    // Sign in with the ID token from Google Sign-In
    const { data: authData, error: authError } = await supabase.auth.signInWithIdToken({
      provider: provider,
      token: id_token,
      access_token: access_token,
    });

    if (authError) {
      console.error('OAuth sign in error:', authError);
      return errorResponse(authError.message, 'OAUTH_ERROR', 400);
    }

    if (!authData.session) {
      return errorResponse('Failed to create session', 'SESSION_ERROR', 500);
    }

    // Return session tokens for the mobile app to store
    return successResponse({
      access_token: authData.session.access_token,
      refresh_token: authData.session.refresh_token,
      expires_in: authData.session.expires_in,
      user: {
        id: authData.user?.id,
        email: authData.user?.email,
        full_name: authData.user?.user_metadata?.full_name || authData.user?.user_metadata?.name,
        avatar_url: authData.user?.user_metadata?.avatar_url || authData.user?.user_metadata?.picture,
      },
    }, 'Signed in successfully');
  } catch (error) {
    console.error('OAuth error:', error);
    return errorResponse('OAuth processing failed', 'OAUTH_ERROR', 500);
  }
}
