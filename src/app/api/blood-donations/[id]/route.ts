import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { successResponse, errorResponse, getAuthUser, parseBody } from '@/lib/api-utils';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// DELETE /api/blood-donations/:id - Cancel donation offer (donor only)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  
  // Verify authentication
  const { user, error: authError } = await getAuthUser(request);
  if (authError) return authError;

  try {
    const supabase = await createClient();

    // Check if donation exists and user is the donor
    const { data: donation, error: fetchError } = await supabase
      .from('blood_donations')
      .select('id, donor_id, status')
      .eq('id', id)
      .single();

    if (fetchError || !donation) {
      return errorResponse('Donation not found', 'NOT_FOUND', 404);
    }

    if (donation.donor_id !== user!.id) {
      return errorResponse('You can only cancel your own donation offers', 'FORBIDDEN', 403);
    }

    // Can only cancel if status is 'offered'
    if (donation.status !== 'offered') {
      return errorResponse('Can only cancel pending offers', 'CONFLICT', 409);
    }

    // Delete the donation offer
    const { error: deleteError } = await supabase
      .from('blood_donations')
      .delete()
      .eq('id', id);

    if (deleteError) {
      return errorResponse('Failed to cancel donation', 'DATABASE_ERROR', 500);
    }

    return successResponse({ cancelled: true }, 'Donation offer cancelled');
  } catch (error) {
    console.error('Cancel donation error:', error);
    return errorResponse('An unexpected error occurred', 'SERVER_ERROR', 500);
  }
}
