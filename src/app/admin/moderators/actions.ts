'use server';

import { getCollection, Collections, ObjectId, AdminUserDocument, UserDocument } from "@/lib/db/mongodb";
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
    const adminUsersCollection = await getCollection<AdminUserDocument>('admin_users');
    const usersCollection = await getCollection<UserDocument>(Collections.USERS);

    const adminUsers = await adminUsersCollection.find({}).sort({ created_at: -1 }).toArray();

    // Fetch profiles
    const moderators = await Promise.all(adminUsers.map(async (admin) => {
      const profile = await usersCollection.findOne({ _id: admin._id }); // admin._id matches user uid (string)
      
      return {
        id: admin._id,
        role: admin.role,
        permissions: admin.permissions || {},
        assigned_countries: admin.assigned_countries || [],
        assigned_cities: admin.assigned_cities || [],
        is_active: admin.is_active,
        created_at: admin.created_at,
        profile: profile ? {
          full_name: profile.full_name || 'Unknown', // Fallback
          email: profile.email,
          avatar_url: profile.avatar_url || null,
          phone_number: profile.phone_number || null,
          blood_group: profile.blood_group,
          country: profile.country,
          city: profile.city,
          address: profile.area, // Mapping area to address
        } : undefined
      };
    }));

    return moderators;
  } catch (error) {
    console.error('Error fetching moderators:', error);
    return [];
  }
}

export async function toggleModeratorStatus(id: string, isActive: boolean) {
  const adminUsersCollection = await getCollection<AdminUserDocument>('admin_users');
  
  await adminUsersCollection.updateOne(
    { _id: id as unknown as string }, // explicit string cast if needed, but AdminUserDocument defines _id as string
    { $set: { is_active: isActive } }
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

    // Add to admin_users collection
    const adminUsersCollection = await getCollection<AdminUserDocument>('admin_users');
    
    // Check if already exists to avoid overwriting
    const existing = await adminUsersCollection.findOne({ _id: uid });
    if (existing) {
       return { success: false, message: "User is already a moderator/admin." };
    }

    await adminUsersCollection.insertOne({
      _id: uid,
      role: role,
      assigned_countries: countries,
      assigned_cities: [],
      permissions: {},
      is_active: true,
      created_at: new Date()
    });

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

  const adminUsersCollection = await getCollection<AdminUserDocument>('admin_users');
  const adminUser = await adminUsersCollection.findOne({ _id: currentUser.uid });
  
  if (!adminUser) {
    return { success: false, message: 'Failed to verify your permissions' };
  }

  const currentUserLevel = ROLE_HIERARCHY[adminUser.role] ?? 0;

  // Only super_admin and admin can change roles
  if (currentUserLevel < ROLE_HIERARCHY['admin']) {
    return { success: false, message: 'You do not have permission to edit moderators' };
  }

  // Get target moderator's current role
  const targetMod = await adminUsersCollection.findOne({ _id: moderatorId });

  if (!targetMod) {
    return { success: false, message: 'Moderator not found' };
  }

  const targetLevel = ROLE_HIERARCHY[targetMod.role] ?? 0;

  // Can't edit someone with equal or higher role (unless super_admin)
  if (currentUserLevel <= targetLevel && adminUser.role !== 'super_admin') {
    return { success: false, message: 'Cannot edit a user with equal or higher role' };
  }

  // If changing role, check the new role is below current user's level
  if (data.role) {
    const newRoleLevel = ROLE_HIERARCHY[data.role] ?? 0;
    if (newRoleLevel >= currentUserLevel && adminUser.role !== 'super_admin') {
      return { success: false, message: 'Cannot assign a role equal to or higher than your own' };
    }
  }

  // Update admin_users collection
  const updateFields: any = {};
  if (data.role) updateFields.role = data.role;
  if (data.assigned_countries) updateFields.assigned_countries = data.assigned_countries;
  if (data.assigned_cities) updateFields.assigned_cities = data.assigned_cities;

  if (Object.keys(updateFields).length > 0) {
    updateFields.updated_at = new Date();
    await adminUsersCollection.updateOne(
      { _id: moderatorId },
      { $set: updateFields }
    );
  }

  // Update profiles collection if profile data provided
  if (data.profile) {
    const usersCollection = await getCollection<UserDocument>(Collections.USERS);
    const profileUpdate: any = {};
    if (data.profile.full_name) profileUpdate.full_name = data.profile.full_name;
    if (data.profile.phone_number !== undefined) profileUpdate.phone_number = data.profile.phone_number;
    if (data.profile.blood_group !== undefined) profileUpdate.blood_group = data.profile.blood_group;
    if (data.profile.country !== undefined) profileUpdate.country = data.profile.country;
    if (data.profile.city !== undefined) profileUpdate.city = data.profile.city;
    if (data.profile.address !== undefined) profileUpdate.area = data.profile.address;

    if (Object.keys(profileUpdate).length > 0) {
      profileUpdate.updated_at = new Date();
      await usersCollection.updateOne(
        { _id: moderatorId },
        { $set: profileUpdate }
      );
    }
  }

  revalidatePath('/admin/moderators');
  return { success: true };
}
