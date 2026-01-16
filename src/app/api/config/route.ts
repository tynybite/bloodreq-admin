import { NextRequest } from 'next/server';
import { successResponse, getAuthUser } from '@/lib/api-utils';

// GET /api/config - Get app configuration
export async function GET(request: NextRequest) {
  const { user, error: authError } = await getAuthUser(request);
  if (authError) return authError;

  return successResponse({
    version: '1.0.0',
    min_app_version: '1.0.0',
    features: {
      google_signin: true,
      phone_auth: true,
      fundraisers: true,
      notifications: true,
    },
    support_email: 'support@bloodreq.com',
    privacy_url: 'https://bloodreq.com/privacy',
    terms_url: 'https://bloodreq.com/terms',
  });
}
