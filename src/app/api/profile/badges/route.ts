import { NextRequest } from 'next/server';
import { getCollection, Collections } from '@/lib/db/mongodb';
import { successResponse, errorResponse, getAuthUser } from '@/lib/api-utils';

// GET /api/profile/badges - Get user's badges
export async function GET(request: NextRequest) {
  const { user, error: authError } = await getAuthUser(request);
  if (authError) return authError;

  try {
    const donationsCollection = await getCollection(Collections.DONATIONS);
    
    const donationCount = await donationsCollection.countDocuments({
      donor_id: user!.id,
      status: 'completed',
    });

    let badgeTier = 'none';
    let nextTier = 'bronze';
    let donationsToNextTier = 1;
    
    if (donationCount >= 31) {
      badgeTier = 'platinum';
      nextTier = 'platinum';
      donationsToNextTier = 0;
    } else if (donationCount >= 16) {
      badgeTier = 'gold';
      nextTier = 'platinum';
      donationsToNextTier = 31 - donationCount;
    } else if (donationCount >= 6) {
      badgeTier = 'silver';
      nextTier = 'gold';
      donationsToNextTier = 16 - donationCount;
    } else if (donationCount >= 1) {
      badgeTier = 'bronze';
      nextTier = 'silver';
      donationsToNextTier = 6 - donationCount;
    }

    return successResponse({
      current_tier: badgeTier,
      next_tier: nextTier,
      donation_count: donationCount,
      donations_to_next_tier: donationsToNextTier,
      points: donationCount * 100,
    });
  } catch (error) {
    console.error('Get badges error:', error);
    return errorResponse('An unexpected error occurred', 'SERVER_ERROR', 500);
  }
}
