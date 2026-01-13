'use server';

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getPaymentSettings(key: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', key)
        .single();
    
    if (error) {
        // If it's just not found, return null
        if (error.code === 'PGRST116') return null; 
        console.error(`Error fetching setting ${key}:`, error);
        return null; // Fail gracefully
    }

    return data.value;
}

export async function updatePaymentSettings(key: string, value: any) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    // Check if key exists using upsert logic
    const { error } = await supabase
        .from('system_settings')
        .upsert({ 
            key, 
            value,
            updated_at: new Date().toISOString(),
            updated_by: user.id
        }, { onConflict: 'key' });

    if (error) {
        console.error(`Error updating setting ${key}:`, error);
        throw new Error(`Failed to update ${key}`);
    }

    revalidatePath('/admin/payment-settings');
    return { success: true };
}
