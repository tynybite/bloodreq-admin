import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { successResponse, errorResponse, getAuthUser, parseBody } from '@/lib/api-utils';

// GET /api/notifications/preferences - Get notification preferences
export async function GET(request: NextRequest) {
  // Verify authentication
  const { user, error: authError } = await getAuthUser(request);
  if (authError) return authError;

  try {
    const supabase = await createClient();

    // Fetch user's notification preferences
    const { data: profile } = await supabase
      .from('profiles')
      .select('notification_preferences')
      .eq('id', user!.id)
      .single();

    const defaults = {
      blood_requests: true,
      donation_reminders: true,
      fundraiser_updates: true,
      marketing: false,
      email_notifications: true,
      push_notifications: true,
      sms_notifications: false,
    };

    return successResponse({
      preferences: {
        ...defaults,
        ...(profile?.notification_preferences || {}),
      },
    });
  } catch (error) {
    console.error('Get preferences error:', error);
    return errorResponse('An unexpected error occurred', 'SERVER_ERROR', 500);
  }
}

// PATCH /api/notifications/preferences - Update notification preferences
const preferencesSchema = z.object({
  blood_requests: z.boolean().optional(),
  donation_reminders: z.boolean().optional(),
  fundraiser_updates: z.boolean().optional(),
  marketing: z.boolean().optional(),
  email_notifications: z.boolean().optional(),
  push_notifications: z.boolean().optional(),
  sms_notifications: z.boolean().optional(),
});

export async function PATCH(request: NextRequest) {
  // Verify authentication
  const { user, error: authError } = await getAuthUser(request);
  if (authError) return authError;

  // Parse and validate request body
  const { data, error: parseError } = await parseBody(request, preferencesSchema);
  if (parseError) return parseError;

  try {
    const supabase = await createClient();

    // Get current preferences
    const { data: profile } = await supabase
      .from('profiles')
      .select('notification_preferences')
      .eq('id', user!.id)
      .single();

    const currentPrefs = profile?.notification_preferences || {};
    const updatedPrefs = { ...currentPrefs, ...data };

    // Update preferences
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        notification_preferences: updatedPrefs,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user!.id);

    if (updateError) {
      return errorResponse('Failed to update preferences', 'DATABASE_ERROR', 500);
    }

    return successResponse(
      { preferences: updatedPrefs },
      'Notification preferences updated'
    );
  } catch (error) {
    console.error('Update preferences error:', error);
    return errorResponse('An unexpected error occurred', 'SERVER_ERROR', 500);
  }
}
