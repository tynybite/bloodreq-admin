import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api-utils';
import { getCollection, Collections, LocationDocument } from '@/lib/db/mongodb';

// GET /api/locations/cities - Get cities for a country
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const countryCode = searchParams.get('country') || 'BD';

    const locationsCollection = await getCollection<LocationDocument>(Collections.LOCATIONS);
    
    // Find the country document by code OR name (for backward compatibility)
    const countryData = await locationsCollection.findOne({
      $or: [
        { code: countryCode },
        { name: countryCode } // Support full name query like "United States"
      ]
    });

    if (!countryData) {
      return successResponse({ 
        cities: [], 
        country: countryCode, 
        total: 0 
      });
    }

    // Map cities to consistent format
    const cities = countryData.cities.map(city => ({
      name: city.name,
      slug: city.slug,
      country: countryCode,
    }));

    return successResponse({
      cities,
      country: countryCode,
      total: cities.length,
    });

  } catch (error) {
    console.error('Get cities error:', error);
    return errorResponse('An unexpected error occurred', 'SERVER_ERROR', 500);
  }
}
