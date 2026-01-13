import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { successResponse, errorResponse, getAuthUser } from '@/lib/api-utils';

// GET /api/locations/countries - Get list of countries
export async function GET(request: NextRequest) {
  // Verify authentication
  const { user, error: authError } = await getAuthUser(request);
  if (authError) return authError;

  try {
    // Hardcoded list of supported countries
    // In production, this could come from a database
    const countries = [
      { code: 'BD', name: 'Bangladesh', dial_code: '+880', currency: 'BDT' },
      { code: 'IN', name: 'India', dial_code: '+91', currency: 'INR' },
      { code: 'PK', name: 'Pakistan', dial_code: '+92', currency: 'PKR' },
      { code: 'NP', name: 'Nepal', dial_code: '+977', currency: 'NPR' },
      { code: 'LK', name: 'Sri Lanka', dial_code: '+94', currency: 'LKR' },
      { code: 'AE', name: 'United Arab Emirates', dial_code: '+971', currency: 'AED' },
      { code: 'SA', name: 'Saudi Arabia', dial_code: '+966', currency: 'SAR' },
      { code: 'MY', name: 'Malaysia', dial_code: '+60', currency: 'MYR' },
      { code: 'SG', name: 'Singapore', dial_code: '+65', currency: 'SGD' },
      { code: 'US', name: 'United States', dial_code: '+1', currency: 'USD' },
      { code: 'GB', name: 'United Kingdom', dial_code: '+44', currency: 'GBP' },
    ];

    return successResponse({
      countries,
      total: countries.length,
    });
  } catch (error) {
    console.error('Get countries error:', error);
    return errorResponse('An unexpected error occurred', 'SERVER_ERROR', 500);
  }
}
