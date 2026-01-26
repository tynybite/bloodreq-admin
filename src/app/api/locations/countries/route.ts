import { NextRequest } from 'next/server';
import { successResponse, getAuthUser } from '@/lib/api-utils';

// GET /api/locations/countries
export async function GET(request: NextRequest) {
  // Public endpoint - no auth required


  const countries = [
    { code: 'BD', name: 'Bangladesh' },
    { code: 'IN', name: 'India' },
    { code: 'PK', name: 'Pakistan' },
    { code: 'AE', name: 'United Arab Emirates' },
    { code: 'SA', name: 'Saudi Arabia' },
    { code: 'MY', name: 'Malaysia' },
    { code: 'SG', name: 'Singapore' },
    { code: 'US', name: 'United States' },
    { code: 'GB', name: 'United Kingdom' },
  ];

  return successResponse({ countries, total: countries.length });
}
