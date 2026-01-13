import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { successResponse, errorResponse, getAuthUser, parseBody } from '@/lib/api-utils';

// POST /api/profile/availability - Toggle donation availability
const availabilitySchema = z.object({
  is_available_to_donate: z.boolean(),
});

export async function POST(request: NextRequest) {
  // Verify authentication
  const { user, error: authError } = await getAuthUser(request);
  if (authError) return authError;

  // Parse and validate request body
  const { data, error: parseError } = await parseBody(request, availabilitySchema);
  if (parseError) return parseError;

  try {
    const supabase = await createClient();

    // Update availability status
    const { data: profile, error: updateError } = await supabase
      .from('profiles')
      .update({
        is_available_to_donate: data.is_available_to_donate,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user!.id)
      .select('id, is_available_to_donate')
      .single();

    if (updateError) {
      return errorResponse('Failed to update availability', 'DATABASE_ERROR', 500);
    }

    const message = data.is_available_to_donate
      ? 'You are now available to donate blood'
      : 'You are now marked as unavailable to donate';

    return successResponse(profile, message);
  } catch (error) {
    console.error('Update availability error:', error);
    return errorResponse('An unexpected error occurred', 'SERVER_ERROR', 500);
  }
}
