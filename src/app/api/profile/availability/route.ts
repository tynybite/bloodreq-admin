import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getCollection, Collections } from '@/lib/db/mongodb';
import { successResponse, errorResponse, getAuthUser, parseBody } from '@/lib/api-utils';

// PATCH /api/profile/availability - Toggle donation availability
const availabilitySchema = z.object({
  is_available_to_donate: z.boolean(),
});

export async function PATCH(request: NextRequest) {
  const { user, error: authError } = await getAuthUser(request);
  if (authError) return authError;

  const { data, error: parseError } = await parseBody(request, availabilitySchema);
  if (parseError) return parseError;

  try {
    const usersCollection = await getCollection(Collections.USERS);
    
    const result = await usersCollection.findOneAndUpdate(
      { _id: user!.id },
      { $set: { is_available_to_donate: data.is_available_to_donate, updated_at: new Date() } },
      { returnDocument: 'after' }
    );

    return successResponse({
      is_available_to_donate: result?.is_available_to_donate,
    }, 'Availability updated');
  } catch (error) {
    console.error('Update availability error:', error);
    return errorResponse('An unexpected error occurred', 'SERVER_ERROR', 500);
  }
}
