import { NextRequest } from 'next/server';
import { successResponse, errorResponse, getAuthUser } from '@/lib/api-utils';
import { getCollection, Collections } from '@/lib/db/mongodb';
import { ObjectId } from 'mongodb';

// GET /api/donations/my
// Returns the current user's fundraiser payment donations (Stripe + bKash)
export async function GET(request: NextRequest) {
  const { user, error: authError } = await getAuthUser(request);
  if (authError) return authError;

  try {
    const donationsCol = await getCollection(Collections.DONATIONS);
    const fundraisersCol = await getCollection(Collections.FUNDRAISERS);

    // Fetch all fundraiser payment donations by this user
    const raw = await donationsCol
      .find({ donor_id: user!.id, fundraiser_id: { $exists: true } })
      .sort({ created_at: -1 })
      .toArray();

    const donations = await Promise.all(
      raw.map(async (d: any) => {
        let fundraiserTitle = '';
        if (d.fundraiser_id) {
          try {
            const f = await fundraisersCol.findOne({
              _id: new ObjectId(d.fundraiser_id.toString()),
            });
            fundraiserTitle = f?.title ?? '';
          } catch { /* ignore */ }
        }

        return {
          id: d._id?.toString(),
          amount: d.amount,
          currency: d.currency ?? 'BDT',
          payment_method: d.payment_method,       // 'stripe' | 'bkash'
          transaction_id: d.payment_intent_id ?? d.bkash_trx_id ?? d.transaction_id ?? null,
          status: d.status,
          created_at: d.created_at?.toISOString?.() ?? String(d.created_at),
          fundraiser_id: d.fundraiser_id,
          fundraiser_title: fundraiserTitle,
        };
      }),
    );

    return successResponse({ donations });
  } catch (error: any) {
    return errorResponse(error.message ?? 'Failed to load donations', 'SERVER_ERROR', 500);
  }
}

