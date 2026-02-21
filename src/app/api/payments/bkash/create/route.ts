/**
 * POST /api/payments/bkash/create
 * Body: { fundraiser_id: string, amount_bdt: number }
 * Returns: { payment_id, bkash_url }
 *
 * Called by Flutter before opening the bKash WebView.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser, errorResponse } from '@/lib/api-utils';
import { createBkashPayment } from '@/lib/payments/bkash';
import { getCollection, Collections } from '@/lib/db/mongodb';
import { ObjectId } from 'mongodb';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://your-app-url.com';

export async function POST(request: NextRequest) {
  try {
    const { user, error: authError } = await getAuthUser(request);
    if (authError) return authError;

    const body = await request.json();
    const { fundraiser_id, amount_bdt } = body;

    if (!fundraiser_id || !ObjectId.isValid(fundraiser_id)) {
      return errorResponse('Invalid fundraiser_id', 'VALIDATION_ERROR', 400);
    }

    const amount = Number(amount_bdt);
    if (!Number.isInteger(amount) || amount < 10) {
      return errorResponse('Minimum donation is ৳10', 'VALIDATION_ERROR', 400);
    }

    // Verify fundraiser exists and is approved
    const fundraiserCol = await getCollection(Collections.FUNDRAISERS);
    const fundraiser = await fundraiserCol.findOne({ _id: new ObjectId(fundraiser_id) });
    if (!fundraiser) return errorResponse('Fundraiser not found', 'NOT_FOUND', 404);
    if (fundraiser.status !== 'approved') {
      return errorResponse('Fundraiser not accepting donations', 'INVALID_STATUS', 400);
    }

    // Build unique merchant invoice number
    const invoiceNumber = `BRQ-${fundraiser_id.slice(-6)}-${Date.now()}`;

    // Callback URL — bKash redirects here after payment
    const callbackUrl = `${APP_URL}/api/payments/bkash/callback?fundraiser_id=${fundraiser_id}&user_id=${user!.id}&invoice=${invoiceNumber}`;

    const payment = await createBkashPayment(amount, invoiceNumber, callbackUrl);

    // Store pending payment for verification in callback
    const pendingCol = await getCollection('pending_bkash_payments');
    await pendingCol.insertOne({
      payment_id: payment.paymentID,
      fundraiser_id,
      user_id: user!.id,
      amount_bdt: amount,
      invoice_number: invoiceNumber,
      status: 'pending',
      created_at: new Date(),
      expires_at: new Date(Date.now() + 30 * 60 * 1000), // 30 min TTL
    });

    return NextResponse.json({
      success: true,
      payment_id: payment.paymentID,
      bkash_url: payment.bkashURL,
    });
  } catch (error: any) {
    console.error('bKash create error:', error);
    return errorResponse(error.message ?? 'Failed to create bKash payment', 'BKASH_ERROR', 500);
  }
}
