import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getCollection, Collections } from '@/lib/db/mongodb';
import { successResponse, errorResponse, getAuthUser, parseBody } from '@/lib/api-utils';

// PATCH /api/profile/location - Update user location
const locationSchema = z.object({
  country: z.string().min(2).optional(),
  city: z.string().min(2).optional(),
  area: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export async function PATCH(request: NextRequest) {
  const { user, error: authError } = await getAuthUser(request);
  if (authError) return authError;

  const { data, error: parseError } = await parseBody(request, locationSchema);
  if (parseError) return parseError;

  try {
    const usersCollection = await getCollection(Collections.USERS);
    
    const updateData: any = { updated_at: new Date() };
    if (data.country) updateData.country = data.country;
    if (data.city) updateData.city = data.city;
    if (data.area !== undefined) updateData.area = data.area;
    if (data.latitude) updateData.latitude = data.latitude;
    if (data.longitude) updateData.longitude = data.longitude;

    const result = await usersCollection.findOneAndUpdate(
      { _id: user!.id },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    return successResponse({
      country: result?.country,
      city: result?.city,
      area: result?.area,
    }, 'Location updated');
  } catch (error) {
    console.error('Update location error:', error);
    return errorResponse('An unexpected error occurred', 'SERVER_ERROR', 500);
  }
}
