'use server';

import { getCollection, Collections } from "@/lib/db/mongodb";
import { getFirebaseAuth } from "@/lib/auth/firebase-admin";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;
  if (!token) return null;
  try {
    return await getFirebaseAuth().verifySessionCookie(token, true);
  } catch {
    return null;
  }
}

// Global app settings collection
interface AppSettingsDocument {
  _id: string;
  key: string;
  value: any;
  updated_at: Date;
  updated_by?: string;
}

export async function getPaymentSettings(key: string) {
    const user = await getCurrentUser();
    if (!user) return null;

    try {
        const settingsCollection = await getCollection<AppSettingsDocument>('app_settings');
        const setting = await settingsCollection.findOne({ key });
        return setting?.value || null;
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
        const settingsCollection = await getCollection<AppSettingsDocument>('app_settings');
        
        await settingsCollection.updateOne(
            { key },
            { 
                $set: { 
                    key,
                    value,
                    updated_at: new Date(),
                    updated_by: user.uid,
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

// Get all payment settings - for page load
export async function getAllPaymentSettings() {
    const user = await getCurrentUser();
    if (!user) return { bkash: null, paypal: null, cryptomus: null };

    try {
        const settingsCollection = await getCollection<AppSettingsDocument>('app_settings');
        const settings = await settingsCollection.find({
            key: { $in: ['payment_bkash', 'payment_paypal', 'payment_cryptomus', 'payment_stripe'] }
        }).toArray();
        
        const result: Record<string, any> = {};
        for (const s of settings) {
            result[s.key] = s.value;
        }
        
        return {
            bkash: result['payment_bkash'] || null,
            paypal: result['payment_paypal'] || null,
            cryptomus: result['payment_cryptomus'] || null,
            stripe: result['payment_stripe'] || null,
        };
    } catch (error) {
        console.error('Error fetching all payment settings:', error);
        return { bkash: null, paypal: null, cryptomus: null };
    }
}
