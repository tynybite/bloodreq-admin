import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { successResponse, errorResponse, getAuthUser } from '@/lib/api-utils';

// GET /api/donations/my - Get user's donation history
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
      .from('donations')
      .select(`
        *,
        fundraiser:fundraisers!donations_fundraiser_id_fkey(id, title, user_id, goal_amount, amount_raised)
      `, { count: 'exact' })
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false });

    // Filter by status
    if (status) {
      query = query.eq('status', status);
    }

    // Pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data: donations, error: queryError, count } = await query;

    if (queryError) {
      return errorResponse('Failed to fetch donations', 'DATABASE_ERROR', 500);
    }

    // Calculate total donated
    const { data: totalData } = await supabase
      .from('donations')
      .select('amount')
      .eq('user_id', user!.id)
      .eq('status', 'completed');

    const totalDonated = (totalData || []).reduce((sum: number, d: any) => sum + (d.amount || 0), 0);

    return successResponse({
      donations: donations || [],
      stats: {
        total_donated: totalDonated,
        donation_count: count || 0,
      },
      pagination: {
        page,
        limit,
        total: count || 0,
        total_pages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Get my donations error:', error);
    return errorResponse('An unexpected error occurred', 'SERVER_ERROR', 500);
  }
}
