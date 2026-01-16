import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
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
    // Use admin client to bypass RLS for profile upsert
    const supabase = createAdminClient();

    // Build update object with only provided fields
    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    // Only include fields that are explicitly provided
    if (data.full_name !== undefined) updateData.full_name = data.full_name;
    if (data.blood_group !== undefined) updateData.blood_group = data.blood_group;
    if (data.phone_number !== undefined) updateData.phone_number = data.phone_number;
    if (data.country !== undefined) updateData.country = data.country;
    if (data.city !== undefined) updateData.city = data.city;
    if (data.area !== undefined) updateData.area = data.area;
    if (data.emergency_contact !== undefined) updateData.emergency_contact = data.emergency_contact;
    if (data.is_available_to_donate !== undefined) updateData.is_available_to_donate = data.is_available_to_donate;

    // Add user id for upsert
    updateData.id = user!.id;

    console.log('Upserting profile for user:', user!.id, 'with data:', updateData);

    // Upsert profile (create if doesn't exist, update if exists)
    const { data: profile, error: updateError } = await supabase
      .from('profiles')
      .upsert(updateData, { onConflict: 'id' })
      .select()
      .single();

    if (updateError) {
      console.error('Profile update error:', updateError);
      return errorResponse(`Failed to update profile: ${updateError.message}`, 'DATABASE_ERROR', 500);
    }

    return successResponse(profile, 'Profile updated successfully');
  } catch (error) {
    console.error('Update profile error:', error);
    return errorResponse('An unexpected error occurred', 'SERVER_ERROR', 500);
  }
}

// DELETE /api/profile - Delete account
export async function DELETE(request: NextRequest) {
  // Verify authentication
  const { user, error: authError } = await getAuthUser(request);
  if (authError) return authError;

  try {
    // Use admin client to bypass RLS
    const supabase = createAdminClient();

    // Delete profile first
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', user!.id);

    if (profileError) {
      console.error('Profile delete error:', profileError);
      return errorResponse('Failed to delete profile', 'DATABASE_ERROR', 500);
    }

    // Delete auth user using admin API
    const { error: authDeleteError } = await supabase.auth.admin.deleteUser(user!.id);

    if (authDeleteError) {
      console.error('Auth delete error:', authDeleteError);
      return errorResponse('Failed to delete account', 'AUTH_ERROR', 500);
    }

    return successResponse(
      { deleted: true },
      'Account has been deleted. We\'re sorry to see you go.'
    );
  } catch (error) {
    console.error('Delete profile error:', error);
    return errorResponse('An unexpected error occurred', 'SERVER_ERROR', 500);
  }
}
