import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { successResponse, errorResponse, getAuthUser } from '@/lib/api-utils';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/donations/:id/receipt - Get donation receipt
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  
  // Verify authentication
  const { user, error: authError } = await getAuthUser(request);
  if (authError) return authError;

  try {
    const supabase = await createClient();

    // Fetch donation with fundraiser info
    const { data: donation, error: fetchError } = await supabase
      .from('donations')
      .select(`
        *,
        fundraiser:fundraisers!donations_fundraiser_id_fkey(id, title, patient_name, hospital, city),
        donor:profiles!donations_user_id_fkey(id, full_name, email, phone_number)
      `)
      .eq('id', id)
      .single();

    if (fetchError || !donation) {
      return errorResponse('Donation not found', 'NOT_FOUND', 404);
    }

    // Only donor can view their receipt
    if (donation.user_id !== user!.id) {
      return errorResponse('You can only view your own receipts', 'FORBIDDEN', 403);
    }

    if (donation.status !== 'completed') {
      return errorResponse('Receipt only available for completed donations', 'FORBIDDEN', 403);
    }

    // Build receipt data
    const receipt = {
      receipt_id: `BR-${donation.id.slice(0, 8).toUpperCase()}`,
      donation_id: donation.id,
      amount: donation.amount,
      currency: donation.currency,
      payment_method: donation.payment_method,
      transaction_id: donation.transaction_id,
      date: donation.completed_at,
      donor: {
        name: (donation.donor as any)?.full_name || 'Anonymous',
        email: (donation.donor as any)?.email,
      },
      fundraiser: {
        title: (donation.fundraiser as any)?.title,
        patient_name: (donation.fundraiser as any)?.patient_name,
        hospital: (donation.fundraiser as any)?.hospital,
        city: (donation.fundraiser as any)?.city,
      },
      message: donation.message,
      organization: {
        name: 'BloodReq',
        address: 'Dhaka, Bangladesh',
        website: process.env.NEXT_PUBLIC_APP_URL,
      },
    };

    return successResponse(receipt);
  } catch (error) {
    console.error('Get receipt error:', error);
    return errorResponse('An unexpected error occurred', 'SERVER_ERROR', 500);
  }
}
