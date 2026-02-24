'use server';

import { getCollection, Collections, ObjectId, UserDocument } from "@/lib/db/mongodb";
import { getFirebaseAuth } from "@/lib/auth/firebase-admin";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export type Moderator = {
  id: string;
  role: string;
  permissions: any; // JSONB
  assigned_countries: string[];
  assigned_cities: string[];
  is_active: boolean;
  created_at: Date;
  profile?: {
    full_name: string;
    email?: string;
    avatar_url: string | null;
    phone_number: string | null;
    blood_group?: string;
    country?: string;
    city?: string;
    address?: string;
  };
};

export async function getModerators() {
  try {
    const usersCollection = await getCollection<UserDocument>(Collections.USERS);

    // Find users with admin_details (i.e., admins/moderators)
    const adminUsers = await usersCollection
      .find({ 'admin_details.role': { $exists: true } })
      .sort({ created_at: -1 })
      .toArray();

    const moderators = adminUsers.map((user) => ({
      id: user._id,
      role: user.admin_details?.role || user.role || 'user',
      permissions: user.admin_details?.permissions || {},
      assigned_countries: user.admin_details?.assigned_countries || [],
      assigned_cities: user.admin_details?.assigned_cities || [],
      is_active: user.admin_details?.is_active ?? true,
      created_at: user.created_at,
      profile: {
        full_name: user.full_name || 'Unknown',
        email: user.email,
        avatar_url: user.avatar_url || null,
        phone_number: user.phone_number || null,
        blood_group: user.blood_group,
        country: user.country,
        city: user.city,
        address: user.area,
      }
    }));

    return moderators;
  } catch (error) {
    console.error('Error fetching moderators:', error);
    return [];
  }
}

export async function toggleModeratorStatus(id: string, isActive: boolean) {
  const usersCollection = await getCollection<UserDocument>(Collections.USERS);
  
  await usersCollection.updateOne(
    { _id: id },
    { $set: { 'admin_details.is_active': isActive, updated_at: new Date() } }
  );

  revalidatePath('/admin/moderators');
}

export async function inviteModerator(email: string, role: string, countries: string[]) {
  try {
    // Check if user exists in Firebase
    let uid;
    try {
      const userRecord = await getFirebaseAuth().getUserByEmail(email);
      uid = userRecord.uid;
    } catch (e: any) {
      if (e.code === 'auth/user-not-found') {
        const tempPassword = Math.random().toString(36).slice(-8) + 'Aa1!';
        const userRecord = await getFirebaseAuth().createUser({
          email,
          password: tempPassword,
          emailVerified: true,
        });
        uid = userRecord.uid;
        console.log(`Created user ${email} with temp password: ${tempPassword}`);
      } else {
        throw e;
      }
    }

    // Add/update admin_details in users collection
    const usersCollection = await getCollection<UserDocument>(Collections.USERS);
    
    // Check if already an admin
    const existing = await usersCollection.findOne({ _id: uid, 'admin_details.role': { $exists: true } });
    if (existing) {
       return { success: false, message: "User is already a moderator/admin." };
    }

    await usersCollection.updateOne(
      { _id: uid },
      { 
        $set: { 
          email: email,
          admin_details: {
            role: role,
            assigned_countries: countries,
            assigned_cities: [],
            permissions: {},
            is_active: true,
          },
          updated_at: new Date()
        },
        $setOnInsert: {
          full_name: email.split('@')[0],
          is_available_to_donate: false,
          status: 'active',
          created_at: new Date(),
        }
      },
      { upsert: true }
    );

    revalidatePath('/admin/moderators');
    return { success: true };
  } catch (error: any) {
    console.error("Invite error:", error);
    return { success: false, message: error.message };
  }
}

export async function updateModeratorPassword(id: string, password: string) {
  try {
    await getFirebaseAuth().updateUser(id, { password });
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

// Role hierarchy for permission checks
const ROLE_HIERARCHY: Record<string, number> = {
  'super_admin': 4,
  'admin': 3,
  'moderator': 2,
  'finance': 1,
  'support': 0,
};

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

export async function updateModerator(
  currentUserId: string,
  moderatorId: string, 
  data: { 
    role?: string; 
    assigned_countries?: string[]; 
    assigned_cities?: string[];
    profile?: {
      full_name?: string;
      phone_number?: string;
      blood_group?: string;
      country?: string;
      city?: string;
      address?: string;
    };
  }
) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.uid !== currentUserId) {
    return { success: false, message: 'Unauthorized' };
  }

  const usersCollection = await getCollection<UserDocument>(Collections.USERS);
  const adminUser = await usersCollection.findOne({ _id: currentUser.uid });
  
  if (!adminUser || !adminUser.admin_details) {
    return { success: false, message: 'Failed to verify your permissions' };
  }

  const currentUserLevel = ROLE_HIERARCHY[adminUser.admin_details.role || ''] ?? 0;

  // Only super_admin and admin can change roles
  if (currentUserLevel < ROLE_HIERARCHY['admin']) {
    return { success: false, message: 'You do not have permission to edit moderators' };
  }

  // Get target moderator's current role
  const targetMod = await usersCollection.findOne({ _id: moderatorId });

  if (!targetMod || !targetMod.admin_details) {
    return { success: false, message: 'Moderator not found' };
  }

  const targetLevel = ROLE_HIERARCHY[targetMod.admin_details.role || ''] ?? 0;

  // Can't edit someone with equal or higher role (unless super_admin)
  if (currentUserLevel <= targetLevel && adminUser.admin_details.role !== 'super_admin') {
    return { success: false, message: 'Cannot edit a user with equal or higher role' };
  }

  // If changing role, check the new role is below current user's level
  if (data.role) {
    const newRoleLevel = ROLE_HIERARCHY[data.role] ?? 0;
    if (newRoleLevel >= currentUserLevel && adminUser.admin_details.role !== 'super_admin') {
      return { success: false, message: 'Cannot assign a role equal to or higher than your own' };
    }
  }

  // Update user document
  const updateFields: any = { updated_at: new Date() };
  
  if (data.role) updateFields['admin_details.role'] = data.role;
  if (data.assigned_countries) updateFields['admin_details.assigned_countries'] = data.assigned_countries;
  if (data.assigned_cities) updateFields['admin_details.assigned_cities'] = data.assigned_cities;
  
  // Profile fields
  if (data.profile?.full_name) updateFields.full_name = data.profile.full_name;
  if (data.profile?.phone_number !== undefined) updateFields.phone_number = data.profile.phone_number;
  if (data.profile?.blood_group !== undefined) updateFields.blood_group = data.profile.blood_group;
  if (data.profile?.country !== undefined) updateFields.country = data.profile.country;
  if (data.profile?.city !== undefined) updateFields.city = data.profile.city;
  if (data.profile?.address !== undefined) updateFields.area = data.profile.address;

  await usersCollection.updateOne(
    { _id: moderatorId },
    { $set: updateFields }
  );

  revalidatePath('/admin/moderators');
  return { success: true };
}

export async function deleteModerator(currentUserId: string, moderatorId: string) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.uid !== currentUserId) {
    return { success: false, message: 'Unauthorized' };
  }

  // Prevent self-deletion
  if (currentUserId === moderatorId) {
    return { success: false, message: 'You cannot delete your own account' };
  }

  const usersCollection = await getCollection<UserDocument>(Collections.USERS);
  const adminUser = await usersCollection.findOne({ _id: currentUser.uid });

  if (!adminUser || !adminUser.admin_details) {
    return { success: false, message: 'Failed to verify your permissions' };
  }

  const currentUserLevel = ROLE_HIERARCHY[adminUser.admin_details.role || ''] ?? 0;

  // Only admin+ can delete
  if (currentUserLevel < ROLE_HIERARCHY['admin']) {
    return { success: false, message: 'You do not have permission to delete moderators' };
  }

  // Get target moderator
  const targetMod = await usersCollection.findOne({ _id: moderatorId });
  if (!targetMod || !targetMod.admin_details) {
    return { success: false, message: 'Moderator not found' };
  }

  const targetLevel = ROLE_HIERARCHY[targetMod.admin_details.role || ''] ?? 0;

  // Can't delete someone with equal or higher role (unless super_admin)
  if (currentUserLevel <= targetLevel && adminUser.admin_details.role !== 'super_admin') {
    return { success: false, message: 'Cannot delete a user with equal or higher role' };
  }

  // Remove admin_details (demote to regular user) rather than full delete
  await usersCollection.updateOne(
    { _id: moderatorId },
    { $unset: { admin_details: '' }, $set: { updated_at: new Date() } }
  );

  // Delete from Firebase Auth
  try {
    await getFirebaseAuth().deleteUser(moderatorId);
  } catch (firebaseError: any) {
    console.error('Firebase delete error (non-critical):', firebaseError.message);
  }

  revalidatePath('/admin/moderators');
  return { success: true };
}
