import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { successResponse, errorResponse, getAuthUser, parseBody } from '@/lib/api-utils';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/payments/:id/confirm - Confirm payment completion
const confirmPaymentSchema = z.object({
  transaction_id: z.string().optional(),
  payment_reference: z.string().optional(),
});

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  
  // Verify authentication
  const { user, error: authError } = await getAuthUser(request);
  if (authError) return authError;

  // Parse and validate request body
  const { data, error: parseError } = await parseBody(request, confirmPaymentSchema);
  if (parseError) return parseError;

  try {
    const supabase = await createClient();

    // Fetch donation
    const { data: donation, error: fetchError } = await supabase
      .from('donations')
      .select('*, fundraiser:fundraisers!donations_fundraiser_id_fkey(id, title, amount_raised, donors_count)')
      .eq('id', id)
      .single();

    if (fetchError || !donation) {
      return errorResponse('Payment not found', 'NOT_FOUND', 404);
    }

    // Only donor can confirm their own payment
    if (donation.user_id !== user!.id) {
      return errorResponse('You can only confirm your own payments', 'FORBIDDEN', 403);
    }

    if (donation.status !== 'pending') {
      return errorResponse(`Payment already ${donation.status}`, 'CONFLICT', 409);
    }

    // Update donation to completed
    const { error: updateError } = await supabase
      .from('donations')
      .update({
        status: 'completed',
        transaction_id: data.transaction_id,
        payment_reference: data.payment_reference,
        completed_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (updateError) {
      return errorResponse('Failed to confirm payment', 'DATABASE_ERROR', 500);
    }

    // Update fundraiser totals
    const fundraiser = donation.fundraiser as any;
    await supabase
      .from('fundraisers')
      .update({
        amount_raised: (fundraiser.amount_raised || 0) + donation.amount,
        donors_count: (fundraiser.donors_count || 0) + 1,
        status: 'in_progress', // Mark as in_progress once donations start
      })
      .eq('id', donation.fundraiser_id);

    // TODO: Send notification to fundraiser owner

    return successResponse(
      {
        donation_id: id,
        status: 'completed',
        receipt_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/donations/${id}/receipt`,
      },
      'Payment confirmed! Thank you for your donation.'
    );
  } catch (error) {
    console.error('Confirm payment error:', error);
    return errorResponse('An unexpected error occurred', 'SERVER_ERROR', 500);
  }
}
