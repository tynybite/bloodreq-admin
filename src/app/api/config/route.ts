import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { successResponse, errorResponse, getAuthUser } from '@/lib/api-utils';

// GET /api/config - Get app configuration
export async function GET(request: NextRequest) {
  // Verify authentication
  const { user, error: authError } = await getAuthUser(request);
  if (authError) return authError;

  try {
    const supabase = await createClient();

    // Fetch system settings
    const { data: settings } = await supabase
      .from('system_settings')
      .select('key, value')
      .in('key', ['app_config', 'feature_flags', 'maintenance_mode']);

    const appConfig = settings?.find(s => s.key === 'app_config')?.value || {};
    const featureFlags = settings?.find(s => s.key === 'feature_flags')?.value || {};
    const maintenanceMode = settings?.find(s => s.key === 'maintenance_mode')?.value || { enabled: false };

    return successResponse({
      app: {
        name: 'BloodReq',
        version: '1.0.0',
        min_version: '1.0.0',
        update_url: {
          android: 'https://play.google.com/store/apps/details?id=com.bloodreq.app',
          ios: 'https://apps.apple.com/app/bloodreq/id123456789',
        },
        ...appConfig,
      },
      maintenance: maintenanceMode,
      features: {
        blood_requests: true,
        fundraisers: true,
        donations: true,
        leaderboard: true,
        stories: true,
        phone_auth: true,
        social_auth: true,
        ...featureFlags,
      },
      blood_groups: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      urgency_levels: ['critical', 'urgent', 'planned'],
      donation_interval_days: 90, // Minimum days between donations
      support: {
        email: 'support@bloodreq.com',
        phone: '+8801712345678',
      },
    });
  } catch (error) {
    console.error('Get config error:', error);
    return errorResponse('An unexpected error occurred', 'SERVER_ERROR', 500);
  }
}
