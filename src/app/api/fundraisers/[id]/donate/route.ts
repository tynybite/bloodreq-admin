import { NextRequest } from 'next/server';
import Stripe from 'stripe';
import { ObjectId } from 'mongodb';
import { getCollection, Collections } from '@/lib/db/mongodb';
import { successResponse, errorResponse, getAuthUser } from '@/lib/api-utils';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Lazily initialize Stripe with the secret key from the database
async function getStripe(): Promise<Stripe> {
  const settingsCollection = await getCollection<{ key: string; value: any }>('app_settings');
  const setting = await settingsCollection.findOne({ key: 'payment_stripe' });

  if (!setting?.value?.enabled) {
    throw new Error('Stripe is not enabled');
  }
  if (!setting?.value?.secretKey) {
    throw new Error('Stripe secret key is not configured');
  }

  return new Stripe(setting.value.secretKey, { apiVersion: '2026-01-28.clover' });
}

async function getStripePublishableKey(): Promise<string> {
  const settingsCollection = await getCollection<{ key: string; value: any }>('app_settings');
  const setting = await settingsCollection.findOne({ key: 'payment_stripe' });
  return setting?.value?.publishableKey ?? '';
}

/**
 * POST /api/fundraisers/:id/donate
 *
 * Body (Step 1 - create intent):
 *   { amount: number }  — amount in the user's currency (e.g. 100 for ৳100)
 *
 * Body (Step 2 - confirm donation after Flutter payment):
 *   { payment_intent_id: string }
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { user, error: authError } = await getAuthUser(request);
    if (authError) return authError;

    const { id: fundraiserId } = await params;

    if (!ObjectId.isValid(fundraiserId)) {
      return errorResponse('Invalid Fundraiser ID', 'INVALID_ID', 400);
    }

    const fundraiserCollection = await getCollection(Collections.FUNDRAISERS);
    const fundraiser = await fundraiserCollection.findOne({ _id: new ObjectId(fundraiserId) });

    if (!fundraiser) {
      return errorResponse('Fundraiser not found', 'NOT_FOUND', 404);
    }

    if (fundraiser.status !== 'approved') {
      return errorResponse('This fundraiser is not accepting donations', 'INVALID_STATUS', 400);
    }

    const body = await request.json();

    // ── STEP 1: Create PaymentIntent ──────────────────────────────────────────
    if (body.amount !== undefined) {
      const amountUsd = Number(body.amount); // in dollars, e.g. 5 = $5.00

      if (amountUsd <= 0 || amountUsd > 100000) {
        return errorResponse('Invalid USD amount', 'VALIDATION_ERROR', 400);
      }

      const amountCents = Math.round(amountUsd * 100); // Stripe requires cents

      let stripe: Stripe;
      try {
        stripe = await getStripe();
      } catch (e: any) {
        return errorResponse(e.message ?? 'Stripe not configured', 'STRIPE_CONFIG_ERROR', 503);
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountCents,
        currency: 'usd',
        metadata: {
          fundraiser_id: fundraiserId,
          user_id: user!.id,
          fundraiser_title: fundraiser.title ?? '',
          amount_usd: String(amountUsd),
        },
        automatic_payment_methods: { enabled: true },
      });

      const publishableKey = await getStripePublishableKey();

      return successResponse({
        client_secret: paymentIntent.client_secret,
        payment_intent_id: paymentIntent.id,
        publishable_key: publishableKey,
        amount_usd: amountUsd,
        amount_cents: amountCents,
        currency: 'USD',
      });
    }

    // ── STEP 2: Confirm & Record Donation ─────────────────────────────────────
    if (body.payment_intent_id !== undefined) {
      const paymentIntentId = String(body.payment_intent_id);

      let stripe: Stripe;
      try {
        stripe = await getStripe();
      } catch (e: any) {
        return errorResponse(e.message ?? 'Stripe not configured', 'STRIPE_CONFIG_ERROR', 503);
      }

      // Server-side verification — never trust the client for payment confirmation
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      if (paymentIntent.status !== 'succeeded') {
        return errorResponse(
          `Payment not completed (status: ${paymentIntent.status})`,
          'PAYMENT_INCOMPLETE',
          400,
        );
      }

      // Verify the payment was for this fundraiser
      if (paymentIntent.metadata.fundraiser_id !== fundraiserId) {
        return errorResponse('Payment intent mismatch', 'PAYMENT_MISMATCH', 400);
      }

      const donatedAmount = paymentIntent.amount; // already in BDT integer

      // Check for duplicate (idempotency)
      const donationsCollection = await getCollection(Collections.DONATIONS);
      const existing = await donationsCollection.findOne({ payment_intent_id: paymentIntentId });
      if (existing) {
        return successResponse({ message: 'Donation already recorded', already_recorded: true });
      }

      // Record the donation
      await donationsCollection.insertOne({
        fundraiser_id: fundraiserId,
        donor_id: user!.id,
        payment_intent_id: paymentIntentId,
        amount: donatedAmount,
        currency: 'BDT',
        payment_method: 'stripe',
        status: 'completed',
        created_at: new Date(),
      });

      // Atomically increment amount_raised
      await fundraiserCollection.updateOne(
        { _id: new ObjectId(fundraiserId) },
        {
          $inc: { amount_raised: donatedAmount },
          $set: { updated_at: new Date() },
        },
      );

      return successResponse({
        message: 'Donation recorded successfully',
        amount: donatedAmount,
      });
    }

    return errorResponse(
      'Provide either "amount" (to initiate) or "payment_intent_id" (to confirm)',
      'VALIDATION_ERROR',
      400,
    );
  } catch (error: any) {
    console.error('Donate error:', error);
    return errorResponse(error.message ?? 'Internal Server Error', 'SERVER_ERROR', 500);
  }
}
