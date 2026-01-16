import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { 
  successResponse, 
  errorResponse, 
  getAuthUser,
  parseBody
} from '@/lib/api-utils';

// GET /api/fundraisers - List fundraisers
export async function GET(request: NextRequest) {
  // Verify authentication
  const { user, error: authError } = await getAuthUser(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'approved';
    const country = searchParams.get('country');
    const city = searchParams.get('city');
    const sort = searchParams.get('sort') || 'newest';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);

    const supabase = await createClient();

    // Build query
    let query = supabase
      .from('fundraisers')
      .select(`
        *,
        fundraiser_documents(*)
      `, { count: 'exact' })
      .in('status', status === 'all' ? ['approved', 'in_progress', 'completed'] : [status]);

    // Filters
    if (country) query = query.eq('country', country);
    if (city) query = query.eq('city', city);

    // Sorting
    switch (sort) {
      case 'trending':
        query = query.order('amount_raised', { ascending: false });
        break;
      case 'ending_soon':
        query = query.order('deadline', { ascending: true });
        break;
      case 'newest':
      default:
        query = query.order('created_at', { ascending: false });
    }

    // Pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data: fundraisers, error: queryError, count } = await query;

    if (queryError) {
      console.error('Fundraisers query error:', queryError);
      return errorResponse('Failed to fetch fundraisers', 'DATABASE_ERROR', 500);
    }

    // Calculate progress for each (using amount_needed instead of goal_amount)
    const fundraisersWithProgress = (fundraisers || []).map((f: any) => ({
      ...f,
      progress_percent: f.amount_needed > 0 
        ? Math.min(100, Math.round((f.amount_raised / f.amount_needed) * 100))
        : 0,
      days_remaining: f.deadline 
        ? Math.max(0, Math.ceil((new Date(f.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
        : null,
    }));

    return successResponse({
      fundraisers: fundraisersWithProgress,
      pagination: {
        page,
        limit,
        total: count || 0,
        total_pages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('List fundraisers error:', error);
    return errorResponse('An unexpected error occurred', 'SERVER_ERROR', 500);
  }
}

// POST /api/fundraisers - Create a new fundraiser
const createFundraiserSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(100),
  description: z.string().min(50, 'Description must be at least 50 characters').max(2000),
  goal_amount: z.number().positive('Goal amount must be positive'),
  currency: z.string().default('BDT'),
  category: z.enum(['medical', 'education', 'emergency', 'other']).default('medical'),
  patient_name: z.string().min(2).optional(),
  hospital: z.string().optional(),
  city: z.string().min(2),
  country: z.string().min(2),
  end_date: z.string().optional(), // ISO date
  beneficiary_relation: z.string().optional(),
});

export async function POST(request: NextRequest) {
  // Verify authentication
  const { user, error: authError } = await getAuthUser(request);
  if (authError) return authError;

  // Parse and validate request body
  const { data, error: parseError } = await parseBody(request, createFundraiserSchema);
  if (parseError) return parseError;

  try {
    const supabase = await createClient();

    // Create fundraiser (status = pending, awaiting admin approval)
    const { data: fundraiser, error: insertError } = await supabase
      .from('fundraisers')
      .insert({
        ...data,
        user_id: user!.id,
        status: 'pending', // Must be approved by admin
        amount_raised: 0,
        donors_count: 0,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      return errorResponse('Failed to create fundraiser', 'DATABASE_ERROR', 500);
    }

    return successResponse(
      {
        id: fundraiser.id,
        status: 'pending',
      },
      'Fundraiser submitted. Please upload supporting documents for verification.',
      201
    );
  } catch (error) {
    console.error('Create fundraiser error:', error);
    return errorResponse('An unexpected error occurred', 'SERVER_ERROR', 500);
  }
}
