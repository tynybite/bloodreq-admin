import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { successResponse, errorResponse, parseBody } from '@/lib/api-utils';

// Validation schema for token refresh
const refreshSchema = z.object({
  refresh_token: z.string().min(1, 'Refresh token is required'),
});

export async function POST(request: NextRequest) {
  // Parse and validate request body
  const { data, error: parseError } = await parseBody(request, refreshSchema);
  if (parseError) return parseError;

  const { refresh_token } = data;

  try {
    const supabase = await createClient();

    // Refresh the session using the refresh token
    const { data: sessionData, error: refreshError } = await supabase.auth.refreshSession({
      refresh_token,
    });

    if (refreshError) {
      if (refreshError.message.includes('expired')) {
        return errorResponse('Refresh token has expired. Please sign in again.', 'TOKEN_EXPIRED', 401);
      }
      return errorResponse('Failed to refresh token', 'REFRESH_ERROR', 401);
    }

    if (!sessionData.session) {
      return errorResponse('Failed to get new session', 'REFRESH_ERROR', 500);
    }

    return successResponse({
      access_token: sessionData.session.access_token,
      refresh_token: sessionData.session.refresh_token,
      expires_at: sessionData.session.expires_at,
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    return errorResponse('An unexpected error occurred', 'SERVER_ERROR', 500);
  }
}
