import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { successResponse, errorResponse, getAuthUser } from '@/lib/api-utils';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/blood-requests/:id/pending-confirmations - Get donations awaiting confirmation
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  
  // Verify authentication
  const { user, error: authError } = await getAuthUser(request);
  if (authError) return authError;

  try {
    const supabase = await createClient();

    // Check if user owns this request
    const { data: bloodRequest, error: fetchError } = await supabase
      .from('blood_requests')
      .select('requester_id')
      .eq('id', id)
      .single();

    if (fetchError || !bloodRequest) {
      return errorResponse('Blood request not found', 'NOT_FOUND', 404);
    }

    if (bloodRequest.requester_id !== user!.id) {
      return errorResponse('You can only view pending confirmations for your own requests', 'FORBIDDEN', 403);
    }

    // Get pending confirmations
    const { data: donations, error: queryError } = await supabase
      .from('blood_donations')
      .select(`
        id,
        units_donated,
        donation_date,
        donor_notes,
        marked_at,
        status,
        donor:profiles!blood_donations_donor_id_fkey(id, full_name, avatar_url, blood_group, phone_number)
      `)
      .eq('request_id', id)
      .eq('status', 'pending_confirmation')
      .order('marked_at', { ascending: false });

    if (queryError) {
      return errorResponse('Failed to fetch pending confirmations', 'DATABASE_ERROR', 500);
    }

    return successResponse({
      donations: donations || [],
    });
  } catch (error) {
    console.error('Get pending confirmations error:', error);
    return errorResponse('An unexpected error occurred', 'SERVER_ERROR', 500);
  }
}
