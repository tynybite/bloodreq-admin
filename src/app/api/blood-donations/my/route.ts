import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { successResponse, errorResponse, getAuthUser } from '@/lib/api-utils';

// GET /api/blood-donations/my - Get user's donation history
export async function GET(request: NextRequest) {
  // Verify authentication
  const { user, error: authError } = await getAuthUser(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // offered, pending_confirmation, completed, rejected
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);

    const supabase = await createClient();

    // Build query
    let query = supabase
      .from('blood_donations')
      .select(`
        *,
        request:blood_requests!blood_donations_request_id_fkey(
          id, patient_name, blood_group, hospital, city, urgency
        )
      `, { count: 'exact' })
      .eq('donor_id', user!.id)
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

    // Calculate stats
    const { count: totalCompleted } = await supabase
      .from('blood_donations')
      .select('*', { count: 'exact', head: true })
      .eq('donor_id', user!.id)
      .eq('status', 'completed');

    const { count: pendingConfirmation } = await supabase
      .from('blood_donations')
      .select('*', { count: 'exact', head: true })
      .eq('donor_id', user!.id)
      .eq('status', 'pending_confirmation');

    // Sum units donated
    const { data: unitsData } = await supabase
      .from('blood_donations')
      .select('units_donated')
      .eq('donor_id', user!.id)
      .eq('status', 'completed');

    const totalUnits = (unitsData || []).reduce((sum: number, d: any) => sum + (d.units_donated || 1), 0);

    return successResponse({
      donations: donations || [],
      stats: {
        total_donations: totalCompleted || 0,
        pending_confirmation: pendingConfirmation || 0,
        total_units: totalUnits,
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
