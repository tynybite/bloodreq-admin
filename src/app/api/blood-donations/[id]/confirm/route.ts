import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { successResponse, errorResponse, getAuthUser } from '@/lib/api-utils';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/blood-donations/:id/confirm - Requester confirms donation happened
export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  
  // Verify authentication
  const { user, error: authError } = await getAuthUser(request);
  if (authError) return authError;

  try {
    const supabase = await createClient();

    // Fetch donation with request info
    const { data: donation, error: fetchError } = await supabase
      .from('blood_donations')
      .select(`
        id, donor_id, status, request_id, units_donated,
        request:blood_requests!blood_donations_request_id_fkey(requester_id)
      `)
      .eq('id', id)
      .single();

    if (fetchError || !donation) {
      return errorResponse('Donation not found', 'NOT_FOUND', 404);
    }

    // Only the requester can confirm
    if ((donation.request as any)?.requester_id !== user!.id) {
      return errorResponse('Only the request owner can confirm donations', 'FORBIDDEN', 403);
    }

    // Can only confirm if status is 'pending_confirmation'
    if (donation.status !== 'pending_confirmation') {
      return errorResponse(`Cannot confirm. Current status: ${donation.status}`, 'CONFLICT', 409);
    }

    // Update donation status to completed
    const { data: updated, error: updateError } = await supabase
      .from('blood_donations')
      .update({
        status: 'completed',
        confirmed_at: new Date().toISOString(),
        confirmed_by: user!.id,
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      return errorResponse('Failed to confirm donation', 'DATABASE_ERROR', 500);
    }

    // Update donor's profile stats (optional: could use a trigger instead)
    await supabase.rpc('increment_donation_count', { user_id: donation.donor_id });

    // Calculate badge tier update
    const { data: donorProfile } = await supabase
      .from('profiles')
      .select('total_donations')
      .eq('id', donation.donor_id)
      .single();

    const totalDonations = (donorProfile?.total_donations || 0) + 1;
    let newBadge = null;
    if (totalDonations === 1) newBadge = 'bronze';
    else if (totalDonations === 6) newBadge = 'silver';
    else if (totalDonations === 16) newBadge = 'gold';
    else if (totalDonations === 31) newBadge = 'platinum';

    // TODO: Send notification to donor

    return successResponse(
      {
        id: updated.id,
        status: 'completed',
        points_awarded: 100,
        new_badge: newBadge,
      },
      'Donation confirmed! Thank you for saving a life.'
    );
  } catch (error) {
    console.error('Confirm donation error:', error);
    return errorResponse('An unexpected error occurred', 'SERVER_ERROR', 500);
  }
}
