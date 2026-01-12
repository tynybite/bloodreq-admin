'use server';

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function approveRequest(requestId: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('blood_requests')
    .update({ status: 'approved' })
    .eq('id', requestId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/admin/blood-requests');
  revalidatePath('/admin/dashboard');
  return { success: true };
}

export async function rejectRequest(requestId: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('blood_requests')
    .update({ status: 'rejected' }) // Assuming 'rejected' exists in enum, otherwise 'cancelled'
    .eq('id', requestId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/admin/blood-requests');
  return { success: true };
}

export async function deleteRequest(requestId: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('blood_requests')
    .delete()
    .eq('id', requestId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/admin/blood-requests');
  return { success: true };
}
