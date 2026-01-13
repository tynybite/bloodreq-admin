import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { successResponse, errorResponse, getAuthUser } from '@/lib/api-utils';

// GET /api/blood-requests/my - Get user's own blood requests
export async function GET(request: NextRequest) {
  // Verify authentication
  const { user, error: authError } = await getAuthUser(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // pending, approved, in_progress, completed, cancelled
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);

    const supabase = await createClient();

    // Build query
    let query = supabase
      .from('blood_requests')
      .select('*', { count: 'exact' })
      .eq('requester_id', user!.id)
      .order('created_at', { ascending: false });

    // Filter by status
    if (status) {
      query = query.eq('status', status);
    }

    // Pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data: requests, error: queryError, count } = await query;

    if (queryError) {
      return errorResponse('Failed to fetch your requests', 'DATABASE_ERROR', 500);
    }

    // Get donation counts for each request
    const requestsWithStats = await Promise.all(
      (requests || []).map(async (req: any) => {
        const { count: donorsCount } = await supabase
          .from('blood_donations')
          .select('*', { count: 'exact', head: true })
          .eq('request_id', req.id);
        
        return {
          ...req,
          donors_count: donorsCount || 0,
        };
      })
    );

    return successResponse({
      requests: requestsWithStats,
      pagination: {
        page,
        limit,
        total: count || 0,
        total_pages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Get my requests error:', error);
    return errorResponse('An unexpected error occurred', 'SERVER_ERROR', 500);
  }
}
