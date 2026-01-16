import { NextRequest } from 'next/server';
import { successResponse, getAuthUser } from '@/lib/api-utils';

// POST /api/notifications/register - Register device for push
export async function POST(request: NextRequest) {
  const { user, error: authError } = await getAuthUser(request);
  if (authError) return authError;

  return successResponse({ registered: true }, 'Device registered for push notifications');
}
