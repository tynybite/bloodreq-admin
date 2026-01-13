import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { successResponse, errorResponse, getAuthUser } from '@/lib/api-utils';

export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated
    const { user, error: authError } = await getAuthUser(request);
    if (authError) return authError;

    const supabase = await createClient();

    // Sign out the user
    const { error: signOutError } = await supabase.auth.signOut();

    if (signOutError) {
      console.error('Sign out error:', signOutError);
      // Still return success as the token will be invalidated client-side
    }

    return successResponse(
      { success: true },
      'Signed out successfully'
    );
  } catch (error) {
    console.error('Signout error:', error);
    return errorResponse('An unexpected error occurred', 'SERVER_ERROR', 500);
  }
}
