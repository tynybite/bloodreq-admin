import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { 
  successResponse, 
  errorResponse, 
  getAuthUser,
  parseBody,
  bloodGroupSchema
} from '@/lib/api-utils';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/blood-requests/:id - Get blood request details
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  
  // Verify authentication
  const { user, error: authError } = await getAuthUser(request);
  if (authError) return authError;

  try {
    const supabase = await createClient();

    // Fetch blood request with requester and donors
    const { data: bloodRequest, error: queryError } = await supabase
      .from('blood_requests')
      .select(`
        *,
        requester:profiles!blood_requests_requester_id_fkey(id, full_name, avatar_url, phone_number)
      `)
      .eq('id', id)
      .single();

    if (queryError) {
      if (queryError.code === 'PGRST116') {
        return errorResponse('Blood request not found', 'NOT_FOUND', 404);
      }
      return errorResponse('Failed to fetch blood request', 'DATABASE_ERROR', 500);
    }

    // Only show approved/in_progress requests to non-owners
    if (bloodRequest.requester_id !== user!.id && 
        !['approved', 'in_progress', 'completed'].includes(bloodRequest.status)) {
      return errorResponse('Blood request not found', 'NOT_FOUND', 404);
    }

    // Fetch donors who have offered
    const { data: donors } = await supabase
      .from('blood_donations')
      .select(`
        id,
        status,
        created_at,
        donor:profiles!blood_donations_donor_id_fkey(id, full_name, avatar_url, blood_group)
      `)
      .eq('request_id', id)
      .order('created_at', { ascending: false });

    return successResponse({
      ...bloodRequest,
      donors: donors || [],
      donors_count: donors?.length || 0,
    });
  } catch (error) {
    console.error('Get blood request error:', error);
    return errorResponse('An unexpected error occurred', 'SERVER_ERROR', 500);
  }
}

// PATCH /api/blood-requests/:id - Update blood request (owner only)
const updateRequestSchema = z.object({
  patient_name: z.string().min(2).optional(),
  patient_age: z.number().int().min(0).max(120).optional(),
  blood_group: bloodGroupSchema.optional(),
  units: z.number().int().min(1).max(10).optional(),
  hospital: z.string().min(2).optional(),
  address: z.string().optional(),
  city: z.string().min(2).optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  urgency: z.enum(['critical', 'urgent', 'planned']).optional(),
  contact_number: z.string().min(10).optional(),
  alternate_contact: z.string().optional(),
  notes: z.string().max(500).optional(),
});

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  
  // Verify authentication
  const { user, error: authError } = await getAuthUser(request);
  if (authError) return authError;

  // Parse and validate request body
  const { data, error: parseError } = await parseBody(request, updateRequestSchema);
  if (parseError) return parseError;

  try {
    const supabase = await createClient();

    // Check ownership
    const { data: existing, error: fetchError } = await supabase
      .from('blood_requests')
      .select('requester_id, status')
      .eq('id', id)
      .single();

    if (fetchError || !existing) {
      return errorResponse('Blood request not found', 'NOT_FOUND', 404);
    }

    if (existing.requester_id !== user!.id) {
      return errorResponse('You can only edit your own requests', 'FORBIDDEN', 403);
    }

    // Can't edit completed or cancelled requests
    if (['completed', 'cancelled'].includes(existing.status)) {
      return errorResponse('Cannot edit a completed or cancelled request', 'FORBIDDEN', 403);
    }

    // Update the request
    const { data: updated, error: updateError } = await supabase
      .from('blood_requests')
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      return errorResponse('Failed to update blood request', 'DATABASE_ERROR', 500);
    }

    return successResponse(updated, 'Blood request updated successfully');
  } catch (error) {
    console.error('Update blood request error:', error);
    return errorResponse('An unexpected error occurred', 'SERVER_ERROR', 500);
  }
}

// DELETE /api/blood-requests/:id - Cancel blood request (owner only)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  
  // Verify authentication
  const { user, error: authError } = await getAuthUser(request);
  if (authError) return authError;

  try {
    const supabase = await createClient();

    // Check ownership
    const { data: existing, error: fetchError } = await supabase
      .from('blood_requests')
      .select('requester_id, status')
      .eq('id', id)
      .single();

    if (fetchError || !existing) {
      return errorResponse('Blood request not found', 'NOT_FOUND', 404);
    }

    if (existing.requester_id !== user!.id) {
      return errorResponse('You can only cancel your own requests', 'FORBIDDEN', 403);
    }

    // Already completed or cancelled
    if (['completed', 'cancelled'].includes(existing.status)) {
      return errorResponse('Request is already ' + existing.status, 'CONFLICT', 409);
    }

    // Soft delete - set status to cancelled
    const { error: updateError } = await supabase
      .from('blood_requests')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (updateError) {
      return errorResponse('Failed to cancel blood request', 'DATABASE_ERROR', 500);
    }

    return successResponse({ cancelled: true }, 'Blood request cancelled successfully');
  } catch (error) {
    console.error('Delete blood request error:', error);
    return errorResponse('An unexpected error occurred', 'SERVER_ERROR', 500);
  }
}
