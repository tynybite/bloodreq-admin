'use server';

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function suspendUser(userId: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('profiles')
    .update({ status: 'suspended' })
    .eq('id', userId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/admin/users');
  return { success: true };
}

export async function banUser(userId: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('profiles')
    .update({ status: 'banned' })
    .eq('id', userId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/admin/users');
  return { success: true };
}

export async function activateUser(userId: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('profiles')
    .update({ status: 'active' })
    .eq('id', userId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/admin/users');
  return { success: true };
}

export async function bulkSuspendUsers(userIds: string[]) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('profiles')
    .update({ status: 'suspended' })
    .in('id', userIds);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/admin/users');
  return { success: true };
}

export async function bulkBanUsers(userIds: string[]) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('profiles')
    .update({ status: 'banned' })
    .in('id', userIds);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/admin/users');
  return { success: true };
}
