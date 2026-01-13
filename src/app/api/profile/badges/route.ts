import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { successResponse, errorResponse, getAuthUser } from '@/lib/api-utils';

// GET /api/profile/badges - Get user's badges and achievements
export async function GET(request: NextRequest) {
  // Verify authentication
  const { user, error: authError } = await getAuthUser(request);
  if (authError) return authError;

  try {
    const supabase = await createClient();

    // Get user's donation stats
    const { data: profile } = await supabase
      .from('profiles')
      .select('total_donations, points, created_at')
      .eq('id', user!.id)
      .single();

    const totalDonations = profile?.total_donations || 0;
    const points = profile?.points || 0;
    const memberSince = profile?.created_at;

    // Define all badges
    const allBadges = [
      { id: 'first_blood', name: 'First Blood', description: 'Complete your first donation', icon: '🩸', requirement: 1 },
      { id: 'bronze', name: 'Bronze Donor', description: 'Complete 5 donations', icon: '🥉', requirement: 5 },
      { id: 'silver', name: 'Silver Donor', description: 'Complete 15 donations', icon: '🥈', requirement: 15 },
      { id: 'gold', name: 'Gold Donor', description: 'Complete 30 donations', icon: '🥇', requirement: 30 },
      { id: 'platinum', name: 'Platinum Donor', description: 'Complete 50 donations', icon: '💎', requirement: 50 },
      { id: 'lifesaver', name: 'Lifesaver', description: 'Your donations have helped 10+ patients', icon: '❤️', requirement: 10 },
      { id: 'regular', name: 'Regular Donor', description: 'Donated 4 times in one year', icon: '📅', requirement: 4 },
      { id: 'veteran', name: 'Veteran', description: 'Member for over 2 years', icon: '⭐', requirement: 2 },
    ];

    // Calculate which badges are earned
    const badges = allBadges.map(badge => {
      let earned = false;
      let progress = 0;

      if (badge.id === 'veteran') {
        const yearsAsMember = memberSince 
          ? (Date.now() - new Date(memberSince).getTime()) / (365 * 24 * 60 * 60 * 1000)
          : 0;
        progress = Math.min(100, (yearsAsMember / badge.requirement) * 100);
        earned = yearsAsMember >= badge.requirement;
      } else {
        progress = Math.min(100, (totalDonations / badge.requirement) * 100);
        earned = totalDonations >= badge.requirement;
      }

      return {
        ...badge,
        earned,
        progress: Math.round(progress),
        earned_at: earned ? new Date().toISOString() : null, // Would come from DB
      };
    });

    // Calculate current tier
    let currentTier = 'none';
    if (totalDonations >= 50) currentTier = 'platinum';
    else if (totalDonations >= 30) currentTier = 'gold';
    else if (totalDonations >= 15) currentTier = 'silver';
    else if (totalDonations >= 5) currentTier = 'bronze';
    else if (totalDonations >= 1) currentTier = 'first_blood';

    return successResponse({
      badges,
      current_tier: currentTier,
      total_donations: totalDonations,
      points,
      earned_count: badges.filter(b => b.earned).length,
      total_badges: badges.length,
    });
  } catch (error) {
    console.error('Get badges error:', error);
    return errorResponse('An unexpected error occurred', 'SERVER_ERROR', 500);
  }
}
