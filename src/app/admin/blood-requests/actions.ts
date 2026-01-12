'use server';

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { notifyBloodRequest } from "@/app/admin/notifications/actions";

export async function approveRequest(requestId: string, currentData: any) {
  const supabase = await createClient();
  
  // First, apply any edits if provided + update status
  const { error } = await supabase
    .from('blood_requests')
    .update({ 
        status: 'approved',
        admin_notes: currentData?.admin_notes,
        patient_name: currentData?.patient_name,
        hospital: currentData?.hospital,
        units: currentData?.units,
        contact_number: currentData?.contact_number
    })
    .eq('id', requestId);

  if (error) {
    console.error('Error approving request:', error);
    throw new Error('Failed to approve request');
  }

  revalidatePath('/admin/blood-requests');
  revalidatePath('/admin/dashboard');
  return { success: true };
}

export async function createRequest(data: any) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("Unauthorized");
    }

    const { error } = await supabase
        .from('blood_requests')
        .insert({
            patient_name: data.patient_name,
            blood_group: data.blood_group,
            units: data.units,
            hospital: data.hospital,
            city: data.city,
            contact_number: data.contact_number,
            urgency: data.urgency,
            admin_notes: data.notes ? `[Request Created via Admin Panel] ${data.notes}` : `[Request Created via Admin Panel]`,
            status: 'approved', // Admin created requests are auto-approved usually? Or maybe pending? Let's say approved for now or let admin choose. 
            // Ideally we'd link to a requester. 
            // If we leave requester_id null, it might violate FK or app logic if app expects a profile.
            // But we can link it to the admin's profile if they have one in 'profiles' table.
            requester_id: user.id, 
            updated_by: user.id
        });

    if (error) {
        console.error('Error creating request:', error);
        throw new Error('Failed to create request');
    }

    // Send push notification to users with matching blood type
    try {
        await notifyBloodRequest({
            blood_group: data.blood_group,
            hospital: data.hospital,
            city: data.city,
            units: data.units,
            urgency: data.urgency,
            patient_name: data.patient_name,
        }, user.id);
    } catch (notifyError) {
        console.error('Failed to send notification:', notifyError);
        // Don't throw - notification failure shouldn't fail the request creation
    }

    revalidatePath('/admin/blood-requests');
    revalidatePath('/admin/dashboard');
    return { success: true };
}

export async function rejectRequest(requestId: string, currentData: any) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('blood_requests')
    .update({ 
        status: 'rejected',
        admin_notes: currentData?.admin_notes 
    })
    .eq('id', requestId);

  if (error) {
    console.error('Error rejecting request:', error);
    throw new Error('Failed to reject request');
  }

  revalidatePath('/admin/blood-requests');
}

export async function deleteRequest(requestId: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('blood_requests')
    .delete()
    .eq('id', requestId);

  if (error) {
    console.error('Error deleting request:', error);
    throw new Error('Failed to delete request');
  }

  revalidatePath('/admin/blood-requests');
}

export async function updateRequest(requestId: string, updates: any) {
    const supabase = await createClient();
    
    const { error } = await supabase
      .from('blood_requests')
      .update({
        admin_notes: updates.admin_notes,
        patient_name: updates.patient_name,
        hospital: updates.hospital,
        units: updates.units,
        contact_number: updates.contact_number
      })
      .eq('id', requestId);
  
    if (error) {
      console.error('Error updating request:', error);
      throw new Error('Failed to update request');
    }
  
    revalidatePath('/admin/blood-requests');
    return { success: true };
}
