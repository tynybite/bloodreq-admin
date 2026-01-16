'use server';

import { getCollection } from "@/lib/db/mongodb";
import { getFirebaseAuth } from "@/lib/auth/firebase-admin";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

// Helper for auth
async function getAuthenticatedUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;
  if (!token) return null;
  try {
    return await getFirebaseAuth().verifySessionCookie(token);
  } catch (e) {
    return null;
  }
}

// Using a simple Document type since system_settings uses string _id
interface SystemSettingDoc {
  _id: string;
  value: any;
  updated_at?: Date;
  updated_by?: string;
}

export async function getAdSettings(key: string) {
  const collection = await getCollection<SystemSettingDoc>('system_settings');
  const doc = await collection.findOne({ _id: key } as any);
  
  if (!doc) return null;
  return doc.value;
}

export async function updateAdSettings(key: string, value: any) {
  const user = await getAuthenticatedUser();
  if (!user) throw new Error("Unauthorized");

  const collection = await getCollection<SystemSettingDoc>('system_settings');
  
  await collection.updateOne(
    { _id: key } as any,
    { 
      $set: { 
        value,
        updated_at: new Date(),
        updated_by: user.uid
      }
    },
    { upsert: true }
  );

  revalidatePath('/admin/ads');
  return { success: true };
}
