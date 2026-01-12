'use server';

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getSettings() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from('admin_users')
    .select('settings')
    .eq('id', user.id)
    .single();

  if (error && error.code !== 'PGRST116') { // Ignore "no rows" error, return null/default
    console.error('Error fetching settings:', error);
    return null;
  }

  return data?.settings || null;
}

export async function updateSettings(settings: any) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  // Upsert into admin_users (create if not exists, though admin should exist)
  // We need to ensure the admin_user record exists. Since this is an admin panel for existing admins, 
  // we assume the record exists or we might fail. 
  // However, specifically updating the 'settings' column requires the row to exist.
  
  const { error } = await supabase
    .from('admin_users')
    .update({ settings })
    .eq('id', user.id);

  if (error) {
    console.error('Error updating settings:', error);
    throw new Error('Failed to update settings');
  }

  revalidatePath('/admin/settings');
  return { success: true };
}
