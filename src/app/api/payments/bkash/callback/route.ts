/**
 * GET /api/payments/bkash/callback
 * Query params from bKash redirect:
 *   paymentID, status (success|failure|cancel), fundraiser_id, user_id, invoice
 *
 * This is a server-side redirect handler — NOT called by the app directly.
 * After success: redirects to bloodreq://payment/success?...
 * After failure: redirects to bloodreq://payment/failure?reason=...
 */
import { NextRequest, NextResponse } from 'next/server';
import { executeBkashPayment, queryBkashPayment } from '@/lib/payments/bkash';
import { getCollection, Collections } from '@/lib/db/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const paymentID = searchParams.get('paymentID');
  const status = searchParams.get('status');
  const fundraiserId = searchParams.get('fundraiser_id');
  const userId = searchParams.get('user_id');

  const failureRedirect = (reason: string) =>
    NextResponse.redirect(`bloodreq://payment/failure?reason=${encodeURIComponent(reason)}`);

  if (status === 'failure' || status === 'cancel') {
    return failureRedirect(status === 'cancel' ? 'cancelled' : 'payment_failed');
  }

  if (!paymentID || !fundraiserId || !userId) {
    return failureRedirect('missing_params');
  }

  try {
    // Server-side verification FIRST
    const statusData = await queryBkashPayment(paymentID);
    if (statusData.transactionStatus === 'Completed') {
      // Already executed (idempotency) — redirect to success
      const pendingCol = await getCollection('pending_bkash_payments');
      const pending = await pendingCol.findOne({ payment_id: paymentID });
      const amount = pending?.amount_bdt ?? 0;
      return NextResponse.redirect(
        `bloodreq://payment/success?amount=${amount}&currency=BDT&fundraiser_id=${fundraiserId}`,
      );
    }

    // Execute the payment with bKash
    const result = await executeBkashPayment(paymentID);

    if (result.transactionStatus !== 'Completed') {
      return failureRedirect(`transaction_status_${result.transactionStatus}`);
    }

    const donatedAmount = Math.round(Number(result.amount));

    // Idempotency guard — check if donation already recorded
    const donationsCol = await getCollection(Collections.DONATIONS);
    const existing = await donationsCol.findOne({ bkash_payment_id: paymentID });
    if (!existing) {
      // Record donation
      await donationsCol.insertOne({
        fundraiser_id: fundraiserId,
        donor_id: userId,
        bkash_payment_id: paymentID,
        bkash_trx_id: result.trxID,
        amount: donatedAmount,
        currency: 'BDT',
        payment_method: 'bkash',
        status: 'completed',
        created_at: new Date(),
      });

      // Atomically update amount_raised on fundraiser
      if (ObjectId.isValid(fundraiserId)) {
        const fundraiserCol = await getCollection(Collections.FUNDRAISERS);
        await fundraiserCol.updateOne(
          { _id: new ObjectId(fundraiserId) },
          {
            $inc: { amount_raised: donatedAmount },
            $set: { updated_at: new Date() },
          },
        );
      }
    }

    // Mark pending as complete
    const pendingCol = await getCollection('pending_bkash_payments');
    await pendingCol.updateOne({ payment_id: paymentID }, { $set: { status: 'completed' } });

    return NextResponse.redirect(
      `bloodreq://payment/success?amount=${donatedAmount}&currency=BDT&fundraiser_id=${fundraiserId}`,
    );
  } catch (error: any) {
    console.error('bKash callback error:', error);
    return failureRedirect(encodeURIComponent(error.message ?? 'server_error'));
  }
}
