import { NextRequest } from 'next/server';
import { successResponse, errorResponse, getAuthUser } from '@/lib/api-utils';

// GET /api/locations/cities - Get cities for a country
export async function GET(request: NextRequest) {
  // Public endpoint - no auth required


  try {
    const { searchParams } = new URL(request.url);
    const country = searchParams.get('country') || 'BD';

    // Hardcoded cities by country - in production, use a database
    const citiesByCountry: Record<string, string[]> = {
      BD: [
        'Dhaka', 'Chittagong', 'Khulna', 'Rajshahi', 'Sylhet',
        'Rangpur', 'Barisal', 'Comilla', 'Gazipur', 'Narayanganj',
        'Mymensingh', 'Bogra', 'Cox\'s Bazar', 'Jessore', 'Dinajpur'
      ],
      IN: [
        'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai',
        'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow'
      ],
      PK: [
        'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad',
        'Multan', 'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala'
      ],
      AE: ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah'],
      SA: ['Riyadh', 'Jeddah', 'Mecca', 'Medina', 'Dammam'],
      MY: ['Kuala Lumpur', 'George Town', 'Johor Bahru', 'Ipoh', 'Shah Alam'],
      SG: ['Singapore'],
      US: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'],
      GB: ['London', 'Birmingham', 'Manchester', 'Glasgow', 'Liverpool'],
    };

    const cities = (citiesByCountry[country] || []).map(name => ({
      name,
      country,
    }));

    return successResponse({
      cities,
      country,
      total: cities.length,
    });
  } catch (error) {
    console.error('Get cities error:', error);
    return errorResponse('An unexpected error occurred', 'SERVER_ERROR', 500);
  }
}
