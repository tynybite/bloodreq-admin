import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { 
  successResponse, 
  errorResponse, 
  getAuthUser,
  parseBody,
  bloodGroupSchema,
  phoneSchema
} from '@/lib/api-utils';

// GET /api/profile - Get current user's profile
export async function GET(request: NextRequest) {
  // Verify authentication
  const { user, error: authError } = await getAuthUser(request);
  if (authError) return authError;

  try {
    const supabase = await createClient();

    // Fetch profile with stats
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user!.id)
      .single();

    if (profileError) {
      if (profileError.code === 'PGRST116') {
        return errorResponse('Profile not found', 'NOT_FOUND', 404);
      }
      return errorResponse('Failed to fetch profile', 'DATABASE_ERROR', 500);
    }

    // Get donation stats
    const { count: donationCount } = await supabase
      .from('blood_donations')
      .select('*', { count: 'exact', head: true })
      .eq('donor_id', user!.id)
      .eq('status', 'completed');

    // Calculate badge tier
    const totalDonations = donationCount || 0;
    let badgeTier = 'none';
    if (totalDonations >= 31) badgeTier = 'platinum';
    else if (totalDonations >= 16) badgeTier = 'gold';
    else if (totalDonations >= 6) badgeTier = 'silver';
    else if (totalDonations >= 1) badgeTier = 'bronze';

    return successResponse({
      ...profile,
      total_donations: totalDonations,
      badge_tier: badgeTier,
      points: totalDonations * 100, // 100 points per donation
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return errorResponse('An unexpected error occurred', 'SERVER_ERROR', 500);
  }
}

// PATCH /api/profile - Update profile
const updateProfileSchema = z.object({
  full_name: z.string().min(2).optional(),
  blood_group: bloodGroupSchema.optional(),
  phone_number: phoneSchema.optional(),
  country: z.string().min(2).optional(),
  city: z.string().min(2).optional(),
  area: z.string().optional(),
  emergency_contact: z.string().optional(),
  is_available_to_donate: z.boolean().optional(),
});

export async function PATCH(request: NextRequest) {
  // Verify authentication
  const { user, error: authError } = await getAuthUser(request);
  if (authError) return authError;

  // Parse and validate request body
  const { data, error: parseError } = await parseBody(request, updateProfileSchema);
  if (parseError) return parseError;

  try {
    const supabase = await createClient();

    // Update profile
    const { data: profile, error: updateError } = await supabase
      .from('profiles')
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user!.id)
      .select()
      .single();

    if (updateError) {
      return errorResponse('Failed to update profile', 'DATABASE_ERROR', 500);
    }

    return successResponse(profile, 'Profile updated successfully');
  } catch (error) {
    console.error('Update profile error:', error);
    return errorResponse('An unexpected error occurred', 'SERVER_ERROR', 500);
  }
}

// DELETE /api/profile - Delete account
const deleteProfileSchema = z.object({
  confirmation: z.literal('DELETE MY ACCOUNT'),
});

export async function DELETE(request: NextRequest) {
  // Verify authentication
  const { user, error: authError } = await getAuthUser(request);
  if (authError) return authError;

  // Parse and validate request body
  const { data, error: parseError } = await parseBody(request, deleteProfileSchema);
  if (parseError) return parseError;

  try {
    const supabase = await createClient();

    // Soft delete - set status to 'deleted'
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        status: 'deleted',
        updated_at: new Date().toISOString(),
      })
      .eq('id', user!.id);

    if (updateError) {
      return errorResponse('Failed to delete account', 'DATABASE_ERROR', 500);
    }

    // Sign out the user
    await supabase.auth.signOut();

    return successResponse(
      { deleted: true },
      'Account has been deleted. We\'re sorry to see you go.'
    );
  } catch (error) {
    console.error('Delete profile error:', error);
    return errorResponse('An unexpected error occurred', 'SERVER_ERROR', 500);
  }
}
