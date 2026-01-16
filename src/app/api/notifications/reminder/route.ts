import { NextRequest } from 'next/server';
import { successResponse, getAuthUser } from '@/lib/api-utils';

// POST /api/notifications/reminder - Set donation reminder
export async function POST(request: NextRequest) {
  const { user, error: authError } = await getAuthUser(request);
  if (authError) return authError;

  return successResponse({ reminder_set: true }, 'Reminder set');
}
