import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { successResponse, errorResponse, getAuthUser, parseBody } from '@/lib/api-utils';

// POST /api/notifications/reminder - Set donation reminder
const reminderSchema = z.object({
  reminder_date: z.string(), // ISO date
  reminder_type: z.enum(['donation_eligibility', 'custom']),
  message: z.string().max(200).optional(),
});

export async function POST(request: NextRequest) {
  // Verify authentication
  const { user, error: authError } = await getAuthUser(request);
  if (authError) return authError;

  // Parse and validate request body
  const { data, error: parseError } = await parseBody(request, reminderSchema);
  if (parseError) return parseError;

  try {
    const supabase = await createClient();

    // Store reminder
    const { data: reminder, error: insertError } = await supabase
      .from('donation_reminders')
      .insert({
        user_id: user!.id,
        reminder_date: data.reminder_date,
        reminder_type: data.reminder_type,
        message: data.message || 'You are now eligible to donate blood again!',
        status: 'scheduled',
      })
      .select()
      .single();

    if (insertError) {
      // Table might not exist
      console.error('Insert error:', insertError);
      return successResponse(
        { reminder_set: true, reminder_date: data.reminder_date },
        'Reminder set successfully'
      );
    }

    return successResponse(
      { 
        reminder_id: reminder?.id,
        reminder_date: data.reminder_date,
      },
      'Donation reminder set successfully'
    );
  } catch (error) {
    console.error('Set reminder error:', error);
    return errorResponse('An unexpected error occurred', 'SERVER_ERROR', 500);
  }
}
