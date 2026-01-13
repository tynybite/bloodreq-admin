'use server';

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getAdSettings(key: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', key)
        .single();
    
    if (error) {
        if (error.code === 'PGRST116') return null; 
        console.error(`Error fetching setting ${key}:`, error);
        return null; 
    }

    return data.value;
}

export async function updateAdSettings(key: string, value: any) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

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

    revalidatePath('/admin/ads');
    return { success: true };
}
