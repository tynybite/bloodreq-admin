import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { successResponse, errorResponse, getAuthUser, parseBody } from '@/lib/api-utils';

// PATCH /api/profile/location - Update user's location
const updateLocationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  country: z.string().min(2).optional(),
  city: z.string().min(2).optional(),
  area: z.string().optional(),
});

export async function PATCH(request: NextRequest) {
  // Verify authentication
  const { user, error: authError } = await getAuthUser(request);
  if (authError) return authError;

  // Parse and validate request body
  const { data, error: parseError } = await parseBody(request, updateLocationSchema);
  if (parseError) return parseError;

  try {
    const supabase = await createClient();

    // Update profile with new location
    const { data: profile, error: updateError } = await supabase
      .from('profiles')
      .update({
        latitude: data.latitude,
        longitude: data.longitude,
        country: data.country,
        city: data.city,
        area: data.area,
        location_updated_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', user!.id)
      .select('id, latitude, longitude, country, city, area')
      .single();

    if (updateError) {
      return errorResponse('Failed to update location', 'DATABASE_ERROR', 500);
    }

    return successResponse(profile, 'Location updated successfully');
  } catch (error) {
    console.error('Update location error:', error);
    return errorResponse('An unexpected error occurred', 'SERVER_ERROR', 500);
  }
}
