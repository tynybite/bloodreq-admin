'use server';

import { getCollection, Collections } from "@/lib/db/mongodb";
import { getFirebaseAuth } from "@/lib/auth/firebase-admin";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

// Global Settings Types
interface AppSetting {
  key: string;
  value: any;
  updated_at: Date;
  updated_by?: string;
}

// User Preferences Type
interface UserPreferences {
  _id: string; // User ID
  appearance?: any;
  notifications?: any;
  updated_at: Date;
}

// Helper for auth
async function getAuthenticatedUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;
  if (!token) return null;
  try {
    return await getFirebaseAuth().verifySessionCookie(token, true);
  } catch (e) {
    return null;
  }
}

export async function getSettings() {
  const user = await getAuthenticatedUser();
  if (!user) return null; // Or return just public global settings if any? Admin panel requires auth.

  // 1. Fetch Global Settings
  const appSettingsCollection = await getCollection<AppSetting>('app_settings');
  const globalSettings = await appSettingsCollection.find({
    key: { $in: ['global_general', 'global_api_keys', 'global_security'] }
  }).toArray();

  const global: Record<string, any> = {};
  globalSettings.forEach(doc => {
    if (doc.key === 'global_general') global.general = doc.value;
    if (doc.key === 'global_api_keys') global.apiKeys = doc.value;
    if (doc.key === 'global_security') global.security = doc.value;
  });

  // 2. Fetch User Preferences
  const prefsCollection = await getCollection<UserPreferences>('user_preferences');
  const userPrefs = await prefsCollection.findOne({ _id: user.uid } as any);

  // 3. Combine
  return {
    general: global.general || {
      platformName: "BloodReq",
      supportEmail: "support@bloodreq.com",
      language: "en",
      timezone: "asia_dhaka"
    },
    apiKeys: global.apiKeys || {
        mongodbUri: "",
        firebaseProjectId: "",
        admobAppId: "",
        facebookAppId: ""
    },
    security: global.security || {
        twoFactor: false,
        ipRestriction: false,
        sessionTimeout: "30"
    },
    appearance: userPrefs?.appearance || {
        theme: "light",
        primaryColor: "#dc2626",
        enableAnimations: true
    },
    notifications: userPrefs?.notifications || {
        push: true,
        sms: true,
        email: true,
        radius: "10"
    }
  };
}

export async function updateSettings(settings: any) {
  const user = await getAuthenticatedUser();
  if (!user) throw new Error("Unauthorized");

  const { general, apiKeys, security, appearance, notifications } = settings;

  // 1. Update Global Settings (app_settings)
  const appSettingsCollection = await getCollection<AppSetting>('app_settings');
  const now = new Date();
  
  // Parallel updates for global settings
  const globalUpdates = [
    appSettingsCollection.updateOne(
      { key: 'global_general' },
      { $set: { key: 'global_general', value: general, updated_at: now, updated_by: user.uid } },
      { upsert: true }
    ),
    appSettingsCollection.updateOne(
      { key: 'global_api_keys' },
      { $set: { key: 'global_api_keys', value: apiKeys, updated_at: now, updated_by: user.uid } },
      { upsert: true }
    ),
    appSettingsCollection.updateOne(
      { key: 'global_security' },
      { $set: { key: 'global_security', value: security, updated_at: now, updated_by: user.uid } },
      { upsert: true }
    )
  ];

  // 2. Update User Preferences (user_preferences)
  const prefsCollection = await getCollection<UserPreferences>('user_preferences');
  const userUpdate = prefsCollection.updateOne(
    { _id: user.uid } as any,
    { 
      $set: { 
        appearance,
        notifications,
        updated_at: now 
      }
    },
    { upsert: true }
  );

  await Promise.all([...globalUpdates, userUpdate]);

  /* 
     Optional: Clear old embedded settings from admin_users to reduce document size?
     Maybe inconsistent if we still want fallback. 
     For now, we just stop writing there. The existing data stays until manually cleaned or we add a clean-up step.
  */

  revalidatePath('/admin/settings');
  return { success: true };
}
