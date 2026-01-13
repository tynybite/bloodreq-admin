import { NextRequest } from 'next/server';
import { successResponse, errorResponse, getAuthUser } from '@/lib/api-utils';

// GET /api/locations/areas - Get areas/neighborhoods for a city
export async function GET(request: NextRequest) {
  // Verify authentication
  const { user, error: authError } = await getAuthUser(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city') || 'Dhaka';

    // Hardcoded areas by city - in production, use a database or external API
    const areasByCity: Record<string, string[]> = {
      'Dhaka': [
        'Dhanmondi', 'Gulshan', 'Banani', 'Uttara', 'Mirpur',
        'Mohammadpur', 'Motijheel', 'Puran Dhaka', 'Tejgaon', 'Badda',
        'Khilgaon', 'Rampura', 'Malibagh', 'Mogbazar', 'Farmgate'
      ],
      'Chittagong': [
        'Agrabad', 'Nasirabad', 'Khulshi', 'Halishahar', 'Panchlaish',
        'GEC Circle', 'Muradpur', 'Chandgaon', 'Kotwali', 'Bakalia'
      ],
      'Khulna': ['Khalishpur', 'Sonadanga', 'Daulatpur', 'Khan Jahan Ali'],
      'Sylhet': ['Zindabazar', 'Amberkhana', 'Subid Bazar', 'Uposhohor'],
    };

    const areas = (areasByCity[city] || []).map(name => ({
      name,
      city,
    }));

    return successResponse({
      areas,
      city,
      total: areas.length,
    });
  } catch (error) {
    console.error('Get areas error:', error);
    return errorResponse('An unexpected error occurred', 'SERVER_ERROR', 500);
  }
}
