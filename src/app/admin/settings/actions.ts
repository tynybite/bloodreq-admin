'use server';

import { getCollection, Collections, UserDocument } from "@/lib/db/mongodb";
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

export async function getSettings() {
  const user = await getAuthenticatedUser();
  if (!user) {
    console.log('getSettings: No authenticated user');
    return null;
  }

  console.log('getSettings: Fetching settings for user:', user.uid);
  
  const collection = await getCollection<UserDocument>(Collections.USERS);
  const userDoc = await collection.findOne({ _id: user.uid } as any);

  if (!userDoc) {
    console.log('getSettings: No user document found');
    return null;
  }
  
  console.log('getSettings: Found settings:', userDoc.admin_details?.settings);
  
  // Settings are stored in admin_details.settings
  return userDoc.admin_details?.settings || null;
}

export async function updateSettings(settings: any) {
  const user = await getAuthenticatedUser();
  if (!user) throw new Error("Unauthorized");

  console.log('updateSettings: Saving settings for user:', user.uid);
  console.log('updateSettings: Settings data:', JSON.stringify(settings, null, 2));

  const collection = await getCollection<UserDocument>(Collections.USERS);
  
  const result = await collection.updateOne(
    { _id: user.uid } as any,
    { 
      $set: { 
        'admin_details.settings': settings,
        updated_at: new Date()
      }
    },
    { upsert: false }
  );

  console.log('updateSettings: MongoDB result:', result);

  if (result.matchedCount === 0) {
    console.log('updateSettings: No matching user document found, trying to create admin_details');
    // User document exists but admin_details might not exist, try with upsert
    await collection.updateOne(
      { _id: user.uid } as any,
      { 
        $set: { 
          admin_details: { settings },
          updated_at: new Date()
        }
      }
    );
  }

  revalidatePath('/admin/settings');
  return { success: true };
}
