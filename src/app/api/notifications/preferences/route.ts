import { NextRequest } from 'next/server';
import { successResponse, getAuthUser } from '@/lib/api-utils';

// GET/PATCH notification preferences
export async function GET(request: NextRequest) {
  const { user, error: authError } = await getAuthUser(request);
  if (authError) return authError;

  return successResponse({
    push_enabled: true,
    email_enabled: true,
    sms_enabled: false,
    urgent_requests: true,
    all_requests: false,
  });
}

export async function PATCH(request: NextRequest) {
  const { user, error: authError } = await getAuthUser(request);
  if (authError) return authError;

  return successResponse({ updated: true }, 'Preferences updated');
}
