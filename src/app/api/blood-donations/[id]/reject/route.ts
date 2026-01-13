import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { successResponse, errorResponse, getAuthUser, parseBody } from '@/lib/api-utils';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/blood-donations/:id/reject - Requester rejects/disputes donation
const rejectSchema = z.object({
  reason: z.string().min(5, 'Please provide a reason').max(200),
});

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  
  // Verify authentication
  const { user, error: authError } = await getAuthUser(request);
  if (authError) return authError;

  // Parse and validate request body
  const { data, error: parseError } = await parseBody(request, rejectSchema);
  if (parseError) return parseError;

  try {
    const supabase = await createClient();

    // Fetch donation with request info
    const { data: donation, error: fetchError } = await supabase
      .from('blood_donations')
      .select(`
        id, donor_id, status, request_id,
        request:blood_requests!blood_donations_request_id_fkey(requester_id)
      `)
      .eq('id', id)
      .single();

    if (fetchError || !donation) {
      return errorResponse('Donation not found', 'NOT_FOUND', 404);
    }

    // Only the requester can reject
    if ((donation.request as any)?.requester_id !== user!.id) {
      return errorResponse('Only the request owner can reject donations', 'FORBIDDEN', 403);
    }

    // Can only reject if status is 'pending_confirmation'
    if (donation.status !== 'pending_confirmation') {
      return errorResponse(`Cannot reject. Current status: ${donation.status}`, 'CONFLICT', 409);
    }

    // Update donation status to rejected
    const { data: updated, error: updateError } = await supabase
      .from('blood_donations')
      .update({
        status: 'rejected',
        rejection_reason: data.reason,
        rejected_at: new Date().toISOString(),
        rejected_by: user!.id,
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      return errorResponse('Failed to reject donation', 'DATABASE_ERROR', 500);
    }

    // TODO: Send notification to donor about rejection

    return successResponse(
      {
        id: updated.id,
        status: 'rejected',
      },
      'Donation has been rejected.'
    );
  } catch (error) {
    console.error('Reject donation error:', error);
    return errorResponse('An unexpected error occurred', 'SERVER_ERROR', 500);
  }
}
