'use server';

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export type Moderator = {
  id: string;
  role: string;
  permissions: any; // JSONB
  assigned_countries: string[];
  assigned_cities: string[];
  is_active: boolean;
  created_at: string;
  profile?: {
    full_name: string;
    email?: string;
    avatar_url: string | null;
    phone_number: string | null;
    blood_group?: string;
    country?: string;
    city?: string;
    address?: string;
  };
};

export async function getModerators() {
  const supabase = createAdminClient();
  
  // Join admin_users with profiles
  const { data, error } = await supabase
    .from('admin_users')
    .select(`
      *,
      profile:profiles(*)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching moderators:', error.message || error);
    return [];
  }

  return data as unknown as Moderator[];
}

export async function toggleModeratorStatus(id: string, isActive: boolean) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('admin_users')
    .update({ is_active: isActive })
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/admin/moderators');
}

export async function inviteModerator(email: string, role: string, countries: string[]) {
  const supabaseAdmin = createAdminClient();
  const supabase = await createClient();

  // 1. Invite User
  const { data: authData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
    data: { role: 'admin' }, // Mark as admin in metadata initially if needed
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback`
  });

  if (inviteError) {
    console.error("Invite error:", inviteError);
    return { success: false, message: inviteError.message };
  }

  if (!authData.user) {
    return { success: false, message: "Failed to create user." };
  }

  // 2. Add to admin_users table
  // We need to check if profile exists (managed by trigger usually)
  // But for admin_users, we explicitly insert.
  const { error: dbError } = await supabaseAdmin
    .from('admin_users')
    .insert({
      id: authData.user.id,
      role: role,
      assigned_countries: countries,
      permissions: {}, // Default empty
      is_active: true
    });

  if (dbError) {
    console.error("DB Error:", dbError);
    // If insertion fails (e.g. duplicate), we might need to handle it. 
    // For now simple error return.
    return { success: false, message: "User invited but failed to add to admin list: " + dbError.message };
  }

  revalidatePath('/admin/moderators');
  return { success: true };
}

export async function updateModeratorPassword(id: string, password: string) {
  const supabaseAdmin = createAdminClient();
  
  const { error } = await supabaseAdmin.auth.admin.updateUserById(
    id,
    { password: password }
  );

  if (error) {
    return { success: false, message: error.message };
  }

  return { success: true };
}

// Role hierarchy for permission checks
const ROLE_HIERARCHY: Record<string, number> = {
  'super_admin': 4,
  'admin': 3,
  'moderator': 2,
  'finance': 1,
  'support': 0,
};

export async function updateModerator(
  currentUserId: string,
  moderatorId: string, 
  data: { 
    role?: string; 
    assigned_countries?: string[]; 
    assigned_cities?: string[];
    profile?: {
      full_name?: string;
      phone_number?: string;
      blood_group?: string;
      country?: string;
      city?: string;
      address?: string;
    };
  }
) {
  const supabase = await createClient();
  const supabaseAdmin = createAdminClient();

  // Get current user's role
  const { data: currentUser, error: currentUserError } = await supabase
    .from('admin_users')
    .select('role')
    .eq('id', currentUserId)
    .single();

  if (currentUserError || !currentUser) {
    return { success: false, message: 'Failed to verify your permissions' };
  }

  const currentUserLevel = ROLE_HIERARCHY[currentUser.role] ?? 0;

  // Only super_admin and admin can change roles
  if (currentUserLevel < ROLE_HIERARCHY['admin']) {
    return { success: false, message: 'You do not have permission to edit moderators' };
  }

  // Get target moderator's current role
  const { data: targetMod, error: targetError } = await supabase
    .from('admin_users')
    .select('role')
    .eq('id', moderatorId)
    .single();

  if (targetError || !targetMod) {
    return { success: false, message: 'Moderator not found' };
  }

  const targetLevel = ROLE_HIERARCHY[targetMod.role] ?? 0;

  // Can't edit someone with equal or higher role (unless super_admin)
  if (currentUserLevel <= targetLevel && currentUser.role !== 'super_admin') {
    return { success: false, message: 'Cannot edit a user with equal or higher role' };
  }

  // If changing role, check the new role is below current user's level
  if (data.role) {
    const newRoleLevel = ROLE_HIERARCHY[data.role] ?? 0;
    if (newRoleLevel >= currentUserLevel && currentUser.role !== 'super_admin') {
      return { success: false, message: 'Cannot assign a role equal to or higher than your own' };
    }
  }

  // Update admin_users table (role & countries)
  const { error: updateError } = await supabaseAdmin
    .from('admin_users')
    .update({
      ...(data.role && { role: data.role }),
      ...(data.assigned_countries && { assigned_countries: data.assigned_countries }),
      ...(data.assigned_cities && { assigned_cities: data.assigned_cities }),
    })
    .eq('id', moderatorId);

  if (updateError) {
    return { success: false, message: updateError.message };
  }

  // Update profiles table if profile data provided
  // Only update fields that exist in the profiles table
  if (data.profile) {
    const profileUpdate: Record<string, any> = {};
    if (data.profile.full_name) profileUpdate.full_name = data.profile.full_name;
    if (data.profile.phone_number !== undefined) profileUpdate.phone_number = data.profile.phone_number;
    // Note: blood_group, country, city may not exist in all schemas
    // Add them only if they're commonly used in your profiles table
    if (data.profile.blood_group !== undefined) profileUpdate.blood_group = data.profile.blood_group;
    if (data.profile.country !== undefined) profileUpdate.country = data.profile.country;
    if (data.profile.city !== undefined) profileUpdate.city = data.profile.city;
    // Skip 'address' as it doesn't exist in the database schema
    
    if (Object.keys(profileUpdate).length > 0) {
      profileUpdate.updated_at = new Date().toISOString();
      
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .update(profileUpdate)
        .eq('id', moderatorId);

      if (profileError) {
        console.error('Profile update error:', profileError);
        // Don't fail the whole operation, admin_users was already updated
      }
    }
  }

  revalidatePath('/admin/moderators');
  return { success: true };
}


