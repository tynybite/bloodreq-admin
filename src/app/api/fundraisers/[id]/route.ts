import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { successResponse, errorResponse, getAuthUser, parseBody } from '@/lib/api-utils';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/fundraisers/:id - Get fundraiser details
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  
  // Verify authentication
  const { user, error: authError } = await getAuthUser(request);
  if (authError) return authError;

  try {
    const supabase = await createClient();

    // Fetch fundraiser with creator info
    const { data: fundraiser, error: queryError } = await supabase
      .from('fundraisers')
      .select(`
        *,
        creator:profiles!fundraisers_user_id_fkey(id, full_name, avatar_url, phone_number)
      `)
      .eq('id', id)
      .single();

    if (queryError) {
      if (queryError.code === 'PGRST116') {
        return errorResponse('Fundraiser not found', 'NOT_FOUND', 404);
      }
      return errorResponse('Failed to fetch fundraiser', 'DATABASE_ERROR', 500);
    }

    // Only show approved fundraisers to non-owners
    if (fundraiser.user_id !== user!.id && 
        !['approved', 'in_progress', 'completed'].includes(fundraiser.status)) {
      return errorResponse('Fundraiser not found', 'NOT_FOUND', 404);
    }

    // Fetch documents
    const { data: documents } = await supabase
      .from('fundraiser_documents')
      .select('id, file_name, file_url, document_type, uploaded_at')
      .eq('fundraiser_id', id)
      .order('uploaded_at', { ascending: false });

    // Fetch recent donations
    const { data: recentDonations } = await supabase
      .from('donations')
      .select(`
        id, amount, anonymous, created_at,
        donor:profiles!donations_user_id_fkey(id, full_name, avatar_url)
      `)
      .eq('fundraiser_id', id)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(10);

    // Calculate progress
    const progress_percent = fundraiser.goal_amount > 0 
      ? Math.min(100, Math.round((fundraiser.amount_raised / fundraiser.goal_amount) * 100))
      : 0;

    const days_remaining = fundraiser.end_date 
      ? Math.max(0, Math.ceil((new Date(fundraiser.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
      : null;

    return successResponse({
      ...fundraiser,
      documents: documents || [],
      recent_donations: (recentDonations || []).map((d: any) => ({
        ...d,
        donor: d.anonymous ? null : d.donor,
      })),
      progress_percent,
      days_remaining,
    });
  } catch (error) {
    console.error('Get fundraiser error:', error);
    return errorResponse('An unexpected error occurred', 'SERVER_ERROR', 500);
  }
}

// PATCH /api/fundraisers/:id - Update fundraiser (owner only)
const updateFundraiserSchema = z.object({
  title: z.string().min(5).max(100).optional(),
  description: z.string().min(50).max(2000).optional(),
  goal_amount: z.number().positive().optional(),
  patient_name: z.string().min(2).optional(),
  hospital: z.string().optional(),
  end_date: z.string().optional(),
});

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  
  // Verify authentication
  const { user, error: authError } = await getAuthUser(request);
  if (authError) return authError;

  // Parse and validate request body
  const { data, error: parseError } = await parseBody(request, updateFundraiserSchema);
  if (parseError) return parseError;

  try {
    const supabase = await createClient();

    // Check ownership
    const { data: existing, error: fetchError } = await supabase
      .from('fundraisers')
      .select('user_id, status')
      .eq('id', id)
      .single();

    if (fetchError || !existing) {
      return errorResponse('Fundraiser not found', 'NOT_FOUND', 404);
    }

    if (existing.user_id !== user!.id) {
      return errorResponse('You can only edit your own fundraisers', 'FORBIDDEN', 403);
    }

    // Can't edit completed or cancelled fundraisers
    if (['completed', 'cancelled'].includes(existing.status)) {
      return errorResponse('Cannot edit a completed or cancelled fundraiser', 'FORBIDDEN', 403);
    }

    // Update fundraiser
    const { data: updated, error: updateError } = await supabase
      .from('fundraisers')
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      return errorResponse('Failed to update fundraiser', 'DATABASE_ERROR', 500);
    }

    return successResponse(updated, 'Fundraiser updated successfully');
  } catch (error) {
    console.error('Update fundraiser error:', error);
    return errorResponse('An unexpected error occurred', 'SERVER_ERROR', 500);
  }
}
