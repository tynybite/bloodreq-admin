import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { successResponse, errorResponse, getAuthUser, parseBody } from '@/lib/api-utils';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/blood-donations/:id/mark-donated - Donor marks donation as done
const markDonatedSchema = z.object({
  units_donated: z.number().int().min(1).max(3).default(1),
  donation_date: z.string().optional(), // ISO date string
  notes: z.string().max(200).optional(),
});

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  
  // Verify authentication
  const { user, error: authError } = await getAuthUser(request);
  if (authError) return authError;

  // Parse and validate request body
  const { data, error: parseError } = await parseBody(request, markDonatedSchema);
  if (parseError) return parseError;

  try {
    const supabase = await createClient();

    // Check if donation exists and user is the donor
    const { data: donation, error: fetchError } = await supabase
      .from('blood_donations')
      .select('id, donor_id, status, request_id')
      .eq('id', id)
      .single();

    if (fetchError || !donation) {
      return errorResponse('Donation not found', 'NOT_FOUND', 404);
    }

    if (donation.donor_id !== user!.id) {
      return errorResponse('You can only update your own donations', 'FORBIDDEN', 403);
    }

    // Can only mark as donated if status is 'offered'
    if (donation.status !== 'offered') {
      return errorResponse(`Cannot mark donation as done. Current status: ${donation.status}`, 'CONFLICT', 409);
    }

    // Update donation status to pending_confirmation
    const { data: updated, error: updateError } = await supabase
      .from('blood_donations')
      .update({
        status: 'pending_confirmation',
        units_donated: data.units_donated,
        donation_date: data.donation_date || new Date().toISOString(),
        donor_notes: data.notes,
        marked_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      return errorResponse('Failed to update donation', 'DATABASE_ERROR', 500);
    }

    // TODO: Send notification to requester to confirm

    return successResponse(
      {
        id: updated.id,
        status: 'pending_confirmation',
      },
      'Donation marked as done. Awaiting confirmation from requester.'
    );
  } catch (error) {
    console.error('Mark donated error:', error);
    return errorResponse('An unexpected error occurred', 'SERVER_ERROR', 500);
  }
}
