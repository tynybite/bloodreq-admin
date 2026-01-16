import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { 
  successResponse, 
  errorResponse, 
  getAuthUser,
  parseBody,
  bloodGroupSchema
} from '@/lib/api-utils';

// GET /api/blood-requests - List nearby blood requests
export async function GET(request: NextRequest) {
  // Verify authentication
  const { user, error: authError } = await getAuthUser(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const lat = parseFloat(searchParams.get('lat') || '0');
    const lng = parseFloat(searchParams.get('lng') || '0');
    const radius = parseInt(searchParams.get('radius') || '50'); // km
    const bloodGroup = searchParams.get('blood_group');
    const urgency = searchParams.get('urgency');
    const status = searchParams.get('status') || 'approved';
    const sort = searchParams.get('sort') || 'newest';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);

    const supabase = await createClient();

    // Build query
    let query = supabase
      .from('blood_requests')
      .select(`
        *,
        requester:profiles!blood_requests_requester_id_fkey(id, full_name, avatar_url)
      `, { count: 'exact' })
      .in('status', status === 'all' ? ['approved', 'in_progress'] : [status]);

    // Filter by blood group
    if (bloodGroup) {
      query = query.eq('blood_group', bloodGroup);
    }

    // Filter by urgency
    if (urgency) {
      query = query.eq('urgency', urgency);
    }

    // Sorting
    switch (sort) {
      case 'urgent':
        query = query.order('urgency', { ascending: true }).order('created_at', { ascending: false });
        break;
      case 'closest':
        // For closest, we'd need PostGIS or calculate distance in app
        query = query.order('created_at', { ascending: false });
        break;
      case 'newest':
      default:
        query = query.order('created_at', { ascending: false });
    }

    // Pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data: requests, error: queryError, count } = await query;

    if (queryError) {
      console.error('Query error:', queryError);
      return errorResponse('Failed to fetch blood requests', 'DATABASE_ERROR', 500);
    }

    // Calculate distance for each request (simple Haversine formula)
    const requestsWithDistance = (requests || []).map((req: any) => {
      let distance_km = null;
      if (lat && lng && req.latitude && req.longitude) {
        distance_km = calculateDistance(lat, lng, req.latitude, req.longitude);
      }
      return {
        ...req,
        distance_km,
      };
    });

    // Sort by distance if requested
    if (sort === 'closest' && lat && lng) {
      requestsWithDistance.sort((a: any, b: any) => (a.distance_km || 9999) - (b.distance_km || 9999));
    }

    // Filter by radius
    const filteredRequests = radius > 0 && lat && lng
      ? requestsWithDistance.filter((req: any) => req.distance_km === null || req.distance_km <= radius)
      : requestsWithDistance;

    return successResponse({
      requests: filteredRequests,
      pagination: {
        page,
        limit,
        total: count || 0,
        total_pages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('List blood requests error:', error);
    return errorResponse('An unexpected error occurred', 'SERVER_ERROR', 500);
  }
}

// Haversine formula to calculate distance between two points
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10; // Round to 1 decimal
}

// POST /api/blood-requests - Create a new blood request
const createRequestSchema = z.object({
  patient_name: z.string().min(2, 'Patient name is required'),
  patient_age: z.number().int().min(0).max(120).optional(),
  blood_group: bloodGroupSchema,
  units: z.number().int().min(1).max(10),
  hospital: z.string().min(2, 'Hospital name is required'),
  address: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  urgency: z.enum(['critical', 'urgent', 'planned']),
  contact_number: z.string().min(10, 'Contact number is required'),
  alternate_contact: z.string().optional(),
  notes: z.string().max(500).optional(),
});

export async function POST(request: NextRequest) {
  // Verify authentication
  const { user, error: authError } = await getAuthUser(request);
  if (authError) return authError;

  // Parse and validate request body
  const { data, error: parseError } = await parseBody(request, createRequestSchema);
  if (parseError) return parseError;

  try {
    const supabase = await createClient();

    // Create blood request (status = pending, awaiting admin approval)
    const { data: newRequest, error: insertError } = await supabase
      .from('blood_requests')
      .insert({
        ...data,
        requester_id: user!.id,
        status: 'pending', // Must be approved by admin before visible
      })
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      return errorResponse('Failed to create blood request', 'DATABASE_ERROR', 500);
    }

    return successResponse(
      {
        id: newRequest.id,
        status: 'pending',
      },
      'Blood request submitted. Awaiting admin approval.',
      201
    );
  } catch (error) {
    console.error('Create blood request error:', error);
    return errorResponse('An unexpected error occurred', 'SERVER_ERROR', 500);
  }
}
