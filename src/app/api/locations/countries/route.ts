import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api-utils';
import { getCollection, Collections, LocationDocument } from '@/lib/db/mongodb';

// GET /api/locations/countries
export async function GET(request: NextRequest) {
  try {
    const locationsCollection = await getCollection<LocationDocument>(Collections.LOCATIONS);
    
    const countries = await locationsCollection
      .find({}, { projection: { _id: 1, name: 1, code: 1 } })
      .sort({ name: 1 })
      .toArray();

    return successResponse({ 
      countries, 
      total: countries.length 
    });
  } catch (error) {
    console.error('Error fetching countries:', error);
    return errorResponse('Failed to fetch countries', 'SERVER_ERROR', 500);
  }
}
