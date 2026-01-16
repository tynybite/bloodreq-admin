'use server';

import { getCollection, Collections, AdminUserDocument } from "@/lib/db/mongodb";
import { getFirebaseAuth } from "@/lib/auth/firebase-admin";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;
  if (!token) return null;
  try {
    return await getFirebaseAuth().verifyIdToken(token);
  } catch {
    return null;
  }
}

export async function getPaymentSettings(key: string) {
    const user = await getCurrentUser();
    if (!user) return null;

    try {
        const adminUsersCollection = await getCollection<AdminUserDocument>('admin_users');
        const adminUser = await adminUsersCollection.findOne({ _id: user.uid });
        
        // Retrieve generic settings or specific payment settings
        const settings = adminUser?.settings || {};
        return settings[key] || null;
    } catch (error) {
        console.error(`Error fetching setting ${key}:`, error);
        return null;
    }
}

export async function updatePaymentSettings(key: string, value: any) {
    const user = await getCurrentUser();
    if (!user) {
        throw new Error("Unauthorized");
    }

    try {
        const adminUsersCollection = await getCollection<AdminUserDocument>('admin_users');
        const updateField = `settings.${key}`;
        
        await adminUsersCollection.updateOne(
            { _id: user.uid },
            { 
                $set: { 
                    [updateField]: value,
                    updated_at: new Date()
                }
            },
            { upsert: true }
        );

        revalidatePath('/admin/payment-settings');
        return { success: true };
    } catch (error: any) {
        console.error(`Error updating setting ${key}:`, error);
        throw new Error(`Failed to update ${key}`);
    }
}
