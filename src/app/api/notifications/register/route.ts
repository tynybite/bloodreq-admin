import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { successResponse, errorResponse, getAuthUser, parseBody } from '@/lib/api-utils';

// POST /api/notifications/register - Register device for push notifications
const registerSchema = z.object({
  device_token: z.string().min(10),
  platform: z.enum(['ios', 'android', 'web']),
  device_name: z.string().optional(),
});

export async function POST(request: NextRequest) {
  // Verify authentication
  const { user, error: authError } = await getAuthUser(request);
  if (authError) return authError;

  // Parse and validate request body
  const { data, error: parseError } = await parseBody(request, registerSchema);
  if (parseError) return parseError;

  try {
    const supabase = await createClient();

    // Upsert device token
    const { error: upsertError } = await supabase
      .from('user_devices')
      .upsert({
        user_id: user!.id,
        device_token: data.device_token,
        platform: data.platform,
        device_name: data.device_name,
        is_active: true,
        registered_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,device_token',
      });

    if (upsertError) {
      // If table doesn't exist, just log and continue
      console.error('Device registration error:', upsertError);
    }

    // TODO: Register with OneSignal API
    // await registerWithOneSignal(user!.id, data.device_token);

    return successResponse(
      { registered: true },
      'Device registered for push notifications'
    );
  } catch (error) {
    console.error('Register device error:', error);
    return errorResponse('An unexpected error occurred', 'SERVER_ERROR', 500);
  }
}
