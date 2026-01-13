import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { successResponse, errorResponse, getAuthUser } from '@/lib/api-utils';

// GET /api/leaderboard - Get donation leaderboard
export async function GET(request: NextRequest) {
  // Verify authentication
  const { user, error: authError } = await getAuthUser(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'all'; // all, month, year
    const country = searchParams.get('country');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);

    const supabase = await createClient();

    // Build query for top donors
    let query = supabase
      .from('profiles')
      .select('id, full_name, avatar_url, country, city, total_donations, points, badge_tier')
      .eq('status', 'active')
      .gt('total_donations', 0)
      .order('total_donations', { ascending: false })
      .limit(limit);

    if (country) {
      query = query.eq('country', country);
    }

    const { data: leaders, error: queryError } = await query;

    if (queryError) {
      return errorResponse('Failed to fetch leaderboard', 'DATABASE_ERROR', 500);
    }

    // Get current user's rank
    let userRank = null;
    if (user) {
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')
        .gt('total_donations', 0);

      // Find user's position
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('total_donations')
        .eq('id', user.id)
        .single();

      if (userProfile) {
        const { count: higherCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .gt('total_donations', userProfile.total_donations || 0);

        userRank = {
          rank: (higherCount || 0) + 1,
          total_donors: count || 0,
          donations: userProfile.total_donations || 0,
        };
      }
    }

    // Add rank to each leader
    const leadersWithRank = (leaders || []).map((leader: any, index: number) => ({
      ...leader,
      rank: index + 1,
    }));

    return successResponse({
      leaders: leadersWithRank,
      user_rank: userRank,
      period,
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    return errorResponse('An unexpected error occurred', 'SERVER_ERROR', 500);
  }
}
