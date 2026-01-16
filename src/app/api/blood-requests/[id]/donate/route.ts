import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';
import { successResponse, errorResponse, getAuthUser, parseBody } from '@/lib/api-utils';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/blood-requests/:id/donate - Offer to donate blood
const donateSchema = z.object({
  message: z.string().max(200).optional(),
});

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  
  // Verify authentication
  const { user, error: authError } = await getAuthUser(request);
  if (authError) return authError;

  // Parse and validate request body
  const { data, error: parseError } = await parseBody(request, donateSchema);
  if (parseError) return parseError;

  try {
    // Use admin client since we already verified auth
    const supabase = createAdminClient();

    // Check if request exists and is active
    const { data: bloodRequest, error: fetchError } = await supabase
      .from('blood_requests')
      .select('id, requester_id, status, blood_group')
      .eq('id', id)
      .single();

    if (fetchError || !bloodRequest) {
      return errorResponse('Blood request not found', 'NOT_FOUND', 404);
    }

    // Can't donate to your own request
    if (bloodRequest.requester_id === user!.id) {
      return errorResponse('You cannot donate to your own request', 'FORBIDDEN', 403);
    }

    // Request must be approved or in_progress
    if (!['approved', 'in_progress'].includes(bloodRequest.status)) {
      return errorResponse('This request is not accepting donations', 'FORBIDDEN', 403);
    }

    // Check if already offered
    const { data: existingOffer } = await supabase
      .from('blood_donations')
      .select('id, status')
      .eq('request_id', id)
      .eq('donor_id', user!.id)
      .single();

    if (existingOffer) {
      return errorResponse('You have already offered to donate for this request', 'CONFLICT', 409);
    }

    // Create donation offer
    const { data: donation, error: insertError } = await supabase
      .from('blood_donations')
      .insert({
        request_id: id,
        donor_id: user!.id,
        status: 'offered',
        message: data.message,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      return errorResponse('Failed to create donation offer', 'DATABASE_ERROR', 500);
    }

    // Update request status to in_progress if it was approved
    if (bloodRequest.status === 'approved') {
      await supabase
        .from('blood_requests')
        .update({ status: 'in_progress' })
        .eq('id', id);
    }

    // TODO: Send notification to requester

    return successResponse(
      {
        donation_id: donation.id,
        status: 'offered',
      },
      'Donation offer sent. The requester will be notified.',
      201
    );
  } catch (error) {
    console.error('Donate error:', error);
    return errorResponse('An unexpected error occurred', 'SERVER_ERROR', 500);
  }
}
