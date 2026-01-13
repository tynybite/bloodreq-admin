import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { successResponse, errorResponse, getAuthUser, parseBody } from '@/lib/api-utils';

// POST /api/payments/initiate - Initiate a donation payment
const initiatePaymentSchema = z.object({
  fundraiser_id: z.string().uuid(),
  amount: z.number().positive(),
  currency: z.string().default('BDT'),
  payment_method: z.string(), // bkash, nagad, stripe, paypal
  anonymous: z.boolean().default(false),
  message: z.string().max(200).optional(),
});

export async function POST(request: NextRequest) {
  // Verify authentication
  const { user, error: authError } = await getAuthUser(request);
  if (authError) return authError;

  // Parse and validate request body
  const { data, error: parseError } = await parseBody(request, initiatePaymentSchema);
  if (parseError) return parseError;

  try {
    const supabase = await createClient();

    // Verify fundraiser exists and is active
    const { data: fundraiser, error: fetchError } = await supabase
      .from('fundraisers')
      .select('id, status, title, user_id')
      .eq('id', data.fundraiser_id)
      .single();

    if (fetchError || !fundraiser) {
      return errorResponse('Fundraiser not found', 'NOT_FOUND', 404);
    }

    if (!['approved', 'in_progress'].includes(fundraiser.status)) {
      return errorResponse('This fundraiser is not accepting donations', 'FORBIDDEN', 403);
    }

    // Create pending donation record
    const { data: donation, error: insertError } = await supabase
      .from('donations')
      .insert({
        fundraiser_id: data.fundraiser_id,
        user_id: user!.id,
        amount: data.amount,
        currency: data.currency,
        payment_method: data.payment_method,
        anonymous: data.anonymous,
        message: data.message,
        status: 'pending',
      })
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      return errorResponse('Failed to initiate payment', 'DATABASE_ERROR', 500);
    }

    // Generate payment URL/data based on method
    let paymentData: any = {
      donation_id: donation.id,
      amount: data.amount,
      currency: data.currency,
    };

    switch (data.payment_method) {
      case 'bkash':
        // In production, integrate with bKash API
        paymentData = {
          ...paymentData,
          redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/bkash/${donation.id}`,
          instructions: 'You will be redirected to bKash to complete payment.',
        };
        break;

      case 'nagad':
        paymentData = {
          ...paymentData,
          redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/nagad/${donation.id}`,
          instructions: 'You will be redirected to Nagad to complete payment.',
        };
        break;

      case 'stripe':
        // In production, create Stripe PaymentIntent and return client_secret
        paymentData = {
          ...paymentData,
          // client_secret: stripePaymentIntent.client_secret,
          redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/stripe/${donation.id}`,
          instructions: 'Enter your card details to complete payment.',
        };
        break;

      case 'paypal':
        paymentData = {
          ...paymentData,
          redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/paypal/${donation.id}`,
          instructions: 'You will be redirected to PayPal to complete payment.',
        };
        break;

      default:
        paymentData = {
          ...paymentData,
          instructions: 'Please complete the payment using the provided method.',
        };
    }

    return successResponse(paymentData, 'Payment initiated', 201);
  } catch (error) {
    console.error('Initiate payment error:', error);
    return errorResponse('An unexpected error occurred', 'SERVER_ERROR', 500);
  }
}
