import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { successResponse, errorResponse, getAuthUser } from '@/lib/api-utils';

// GET /api/fundraisers/my - Get user's own fundraisers
export async function GET(request: NextRequest) {
  // Verify authentication
  const { user, error: authError } = await getAuthUser(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);

    const supabase = await createClient();

    // Build query
    let query = supabase
      .from('fundraisers')
      .select('*', { count: 'exact' })
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false });

    // Filter by status
    if (status) {
      query = query.eq('status', status);
    }

    // Pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data: fundraisers, error: queryError, count } = await query;

    if (queryError) {
      return errorResponse('Failed to fetch your fundraisers', 'DATABASE_ERROR', 500);
    }

    // Calculate progress for each
    const fundraisersWithStats = (fundraisers || []).map((f: any) => ({
      ...f,
      progress_percent: f.goal_amount > 0 
        ? Math.min(100, Math.round((f.amount_raised / f.goal_amount) * 100))
        : 0,
    }));

    return successResponse({
      fundraisers: fundraisersWithStats,
      pagination: {
        page,
        limit,
        total: count || 0,
        total_pages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Get my fundraisers error:', error);
    return errorResponse('An unexpected error occurred', 'SERVER_ERROR', 500);
  }
}
