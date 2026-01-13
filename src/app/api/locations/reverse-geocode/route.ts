import { NextRequest } from 'next/server';
import { z } from 'zod';
import { successResponse, errorResponse, getAuthUser, parseBody } from '@/lib/api-utils';

// POST /api/locations/reverse-geocode - Get address from coordinates
const geocodeSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export async function POST(request: NextRequest) {
  // Verify authentication
  const { user, error: authError } = await getAuthUser(request);
  if (authError) return authError;

  // Parse and validate request body
  const { data, error: parseError } = await parseBody(request, geocodeSchema);
  if (parseError) return parseError;

  try {
    const { latitude, longitude } = data;

    // In production, use Google Maps Geocoding API or similar
    // For now, return mock data based on approximate Bangladesh coordinates
    let result = {
      country: 'BD',
      country_name: 'Bangladesh',
      city: 'Unknown',
      area: null as string | null,
      formatted_address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
    };

    // Very rough coordinate-based city detection for Bangladesh
    if (latitude >= 23.6 && latitude <= 24.0 && longitude >= 90.2 && longitude <= 90.5) {
      result.city = 'Dhaka';
      result.area = 'Dhaka District';
      result.formatted_address = 'Dhaka, Bangladesh';
    } else if (latitude >= 22.2 && latitude <= 22.5 && longitude >= 91.7 && longitude <= 92.0) {
      result.city = 'Chittagong';
      result.formatted_address = 'Chittagong, Bangladesh';
    } else if (latitude >= 22.7 && latitude <= 23.0 && longitude >= 89.4 && longitude <= 89.7) {
      result.city = 'Khulna';
      result.formatted_address = 'Khulna, Bangladesh';
    } else if (latitude >= 24.3 && latitude <= 24.5 && longitude >= 88.5 && longitude <= 88.7) {
      result.city = 'Rajshahi';
      result.formatted_address = 'Rajshahi, Bangladesh';
    }

    return successResponse(result);
  } catch (error) {
    console.error('Reverse geocode error:', error);
    return errorResponse('An unexpected error occurred', 'SERVER_ERROR', 500);
  }
}
