'use server';

import { createClient } from "@/lib/supabase/server";
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
    email: string; // From auth.users join via profiles view if possible, or just what we have
    avatar_url: string | null;
    phone_number: string | null;
  };
};

export async function getModerators() {
  const supabase = createAdminClient();
  
  // Join admin_users with profiles
  const { data, error } = await supabase
    .from('admin_users')
    .select(`
      *,
      profile:profiles(full_name, avatar_url, phone_number)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching moderators:', error);
    return [];
  }

  // Note: Email is strictly in auth.users. 
  // Getting email usually requires a secure view or RPC if we don't sync it to profiles.
  // For now, we will rely on profile data. if email is needed, we might need a separate strategy 
  // (e.g. syncing email to profiles on signup/update or using an admin-only RPC).
  // Assuming profile might have email if we synced it, or we just show name/phone.

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

import { createAdminClient } from "@/lib/supabase/admin";

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
