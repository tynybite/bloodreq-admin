'use server';

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getFundraisers(status?: string) {
    const supabase = await createClient();
    let query = supabase.from('fundraisers').select('*, fundraiser_documents(*)').order('created_at', { ascending: false });
    
    if (status && status !== 'all') {
        query = query.eq('status', status);
    }
    
    const { data, error } = await query;
    if (error) {
        console.error('Error fetching fundraisers:', error);
        return [];
    }
    return data;
}

export async function createFundraiser(data: any) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    const { data: fundraiser, error } = await supabase
        .from('fundraisers')
        .insert({
            title: data.title,
            patient_name: data.patient_name,
            condition: data.condition,
            hospital: data.hospital,
            location: data.location,
            amount_needed: data.amount_needed,
            amount_raised: 0,
            deadline: data.deadline,
            status: 'pending', // Default to pending
            description: data.description,
            requester_id: user.id,
            cover_image_url: data.cover_image_url,
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating fundraiser:', error);
        throw new Error('Failed to create fundraiser');
    }

    // Handle documents if any were uploaded and urls passed
    if (data.documents && data.documents.length > 0) {
       const docsToInsert = data.documents.map((url: string) => ({
           fundraiser_id: fundraiser.id,
           document_url: url,
           document_type: 'unknown' // You might want to pass this from frontend
       }));
       const { error: docError } = await supabase.from('fundraiser_documents').insert(docsToInsert);
       if(docError) console.error('Error linking documents details:', docError);
    }

    revalidatePath('/admin/fundraisers');
    return { success: true };
}

export async function updateFundraiser(id: string, updates: any) {
    const supabase = await createClient();
    
    const { error } = await supabase
        .from('fundraisers')
        .update({
            title: updates.title,
            patient_name: updates.patient_name,
            condition: updates.condition,
            hospital: updates.hospital,
             location: updates.location,
            amount_needed: updates.amount_needed,
            deadline: updates.deadline,
            description: updates.description,
            status: updates.status, // Allow status updates here too if needed
            cover_image_url: updates.cover_image_url,
        })
        .eq('id', id);

    if (error) {
        console.error('Error updating fundraiser:', error);
        throw new Error('Failed to update fundraiser');
    }
    
     // Handle documents (simplified - assuming we just append new ones for now or manage separately)
    if (updates.new_documents && updates.new_documents.length > 0) {
       const docsToInsert = updates.new_documents.map((url: string) => ({
           fundraiser_id: id,
           document_url: url,
       }));
       await supabase.from('fundraiser_documents').insert(docsToInsert);
    }


    revalidatePath('/admin/fundraisers');
    return { success: true };
}

export async function deleteFundraiser(id: string) {
    const supabase = await createClient();
    const { error } = await supabase.from('fundraisers').delete().eq('id', id);
    if (error) {
        console.error('Error deleting fundraiser:', error);
        throw new Error('Failed to delete fundraiser');
    }
    revalidatePath('/admin/fundraisers');
}

export async function updateFundraiserStatus(id: string, status: string) {
    const supabase = await createClient();

    if (status === 'approved') {
        const { count, error: countError } = await supabase
            .from('fundraiser_documents')
            .select('*', { count: 'exact', head: true })
            .eq('fundraiser_id', id);

        if (countError) throw new Error('Failed to verify documents');
        
        if (!count || count === 0) {
            throw new Error('Cannot approve: Fundraiser must have at least one document.');
        }
    }

    const { error } = await supabase
        .from('fundraisers')
        .update({ status })
        .eq('id', id);

    if (error) {
        console.error(`Error updating fundraiser status to ${status}:`, error);
        throw new Error('Failed to update status');
    }
    revalidatePath('/admin/fundraisers');
}

export async function deleteDocument(docId: string) {
    const supabase = await createClient();
    // Ideally we should also delete from Storage bucket, but that requires knowing the path
    const { error } = await supabase.from('fundraiser_documents').delete().eq('id', docId);
    if(error) throw new Error("Failed to delete document");
    revalidatePath('/admin/fundraisers');
}

export async function getDonations(fundraiserId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('donations')
        .select('*')
        .eq('fundraiser_id', fundraiserId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching donations:', error);
        return [];
    }
    return data;
}
