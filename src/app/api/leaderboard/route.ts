import { NextRequest } from 'next/server';
import { getCollection, Collections } from '@/lib/db/mongodb';
import { successResponse, errorResponse, getAuthUser } from '@/lib/api-utils';

// GET /api/leaderboard - Get donation leaderboard
export async function GET(request: NextRequest) {
  const { user, error: authError } = await getAuthUser(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'all'; // all, monthly, weekly
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);

    const donationsCollection = await getCollection(Collections.DONATIONS);
    const usersCollection = await getCollection(Collections.USERS);

    // Build date filter for period
    let dateFilter = {};
    const now = new Date();
    if (period === 'weekly') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      dateFilter = { created_at: { $gte: weekAgo } };
    } else if (period === 'monthly') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      dateFilter = { created_at: { $gte: monthAgo } };
    }

    // Aggregate donations by donor
    const leaderboard = await donationsCollection.aggregate([
      { $match: { status: 'completed', ...dateFilter } },
      { $group: { _id: '$donor_id', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: limit },
    ]).toArray();

    // Fetch user details
    const leaderboardWithUsers = await Promise.all(
      leaderboard.map(async (entry: any, index: number) => {
        const userDoc = await usersCollection.findOne({ _id: entry._id });
        
        let badgeTier = 'none';
        if (entry.count >= 31) badgeTier = 'platinum';
        else if (entry.count >= 16) badgeTier = 'gold';
        else if (entry.count >= 6) badgeTier = 'silver';
        else if (entry.count >= 1) badgeTier = 'bronze';

        return {
          rank: index + 1,
          user_id: entry._id,
          full_name: userDoc?.full_name || 'Anonymous',
          avatar_url: userDoc?.avatar_url,
          blood_group: userDoc?.blood_group,
          donation_count: entry.count,
          points: entry.count * 100,
          badge_tier: badgeTier,
          is_current_user: entry._id === user!.id,
        };
      })
    );

    // Get current user's rank if not in top N
    let currentUserRank = leaderboardWithUsers.find((e: any) => e.is_current_user);
    if (!currentUserRank) {
      const userDonationCount = await donationsCollection.countDocuments({
        donor_id: user!.id,
        status: 'completed',
        ...dateFilter,
      });
      
      if (userDonationCount > 0) {
        const higherCount = await donationsCollection.aggregate([
          { $match: { status: 'completed', ...dateFilter } },
          { $group: { _id: '$donor_id', count: { $sum: 1 } } },
          { $match: { count: { $gt: userDonationCount } } },
        ]).toArray();
        
        const userDoc = await usersCollection.findOne({ _id: user!.id });
        currentUserRank = {
          rank: higherCount.length + 1,
          user_id: user!.id,
          full_name: userDoc?.full_name || 'You',
          avatar_url: userDoc?.avatar_url,
          donation_count: userDonationCount,
          points: userDonationCount * 100,
          is_current_user: true,
        };
      }
    }

    return successResponse({
      leaderboard: leaderboardWithUsers,
      current_user: currentUserRank,
      period,
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    return errorResponse('An unexpected error occurred', 'SERVER_ERROR', 500);
  }
}
