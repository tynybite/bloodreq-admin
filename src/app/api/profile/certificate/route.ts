import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { successResponse, errorResponse, getAuthUser } from '@/lib/api-utils';

// GET /api/profile/certificate - Get donation certificate
export async function GET(request: NextRequest) {
  // Verify authentication
  const { user, error: authError } = await getAuthUser(request);
  if (authError) return authError;

  try {
    const supabase = await createClient();

    // Get user profile and donation stats
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, total_donations, created_at, badge_tier')
      .eq('id', user!.id)
      .single();

    if (!profile || !profile.total_donations || profile.total_donations < 1) {
      return errorResponse(
        'You need at least 1 donation to get a certificate',
        'NO_DONATIONS',
        400
      );
    }

    // Get last donation date
    const { data: lastDonation } = await supabase
      .from('blood_donations')
      .select('confirmed_at')
      .eq('donor_id', user!.id)
      .eq('status', 'completed')
      .order('confirmed_at', { ascending: false })
      .limit(1)
      .single();

    // Calculate tier
    let tier = 'Donor';
    if (profile.total_donations >= 50) tier = 'Platinum Donor';
    else if (profile.total_donations >= 30) tier = 'Gold Donor';
    else if (profile.total_donations >= 15) tier = 'Silver Donor';
    else if (profile.total_donations >= 5) tier = 'Bronze Donor';

    // Build certificate data
    const certificate = {
      certificate_id: `BR-CERT-${user!.id.slice(0, 8).toUpperCase()}`,
      recipient_name: profile.full_name,
      tier,
      total_donations: profile.total_donations,
      member_since: profile.created_at,
      last_donation: lastDonation?.confirmed_at,
      issued_date: new Date().toISOString(),
      organization: {
        name: 'BloodReq',
        tagline: 'Connecting Blood Donors with Those in Need',
        website: process.env.NEXT_PUBLIC_APP_URL,
      },
      message: `This certificate recognizes ${profile.full_name} for their generous contribution of ${profile.total_donations} blood donation(s), helping save lives in our community.`,
      download_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/profile/certificate/download`,
    };

    return successResponse(certificate);
  } catch (error) {
    console.error('Get certificate error:', error);
    return errorResponse('An unexpected error occurred', 'SERVER_ERROR', 500);
  }
}
