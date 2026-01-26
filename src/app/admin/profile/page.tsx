import { getCollection, Collections, AdminUserDocument, UserDocument } from "@/lib/db/mongodb";
import { getFirebaseAuth } from "@/lib/auth/firebase-admin";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ProfileClient from "./ProfileClient";

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;

  if (!token) {
    redirect('/login');
  }

  let user;
  try {
    user = await getFirebaseAuth().verifySessionCookie(token, true);
  } catch {
    redirect('/login');
  }
  
  const adminUsersCollection = await getCollection<AdminUserDocument>('admin_users');
  const usersCollection = await getCollection<UserDocument>(Collections.USERS);
  
  const [adminUser, userProfile] = await Promise.all([
    adminUsersCollection.findOne({ _id: user.uid }),
    usersCollection.findOne({ _id: user.uid })
  ]);
  
  // Format for client
  // We prioritize adminUser data if it exists, but usually profile data is in users collection
  const profileData = {
    id: user.uid,
    email: user.email || null,
    full_name: userProfile?.full_name || null,
    avatar_url: userProfile?.avatar_url || null,
    phone_number: userProfile?.phone_number || null,
    city: userProfile?.city || null,
    country: userProfile?.country || null,
    role: userProfile?.blood_group || null, // Mapping blood_group to role used in profile client display if that's what it was? Or maybe previously 'role' was 'donor'/'admin'
    // Actually looking at ProfileClient, role seems to be 'Detailed Role'
    
    // Admin specific
    admin_role: adminUser?.role || null,
    permissions: adminUser?.permissions || {},
    created_at: (adminUser?.created_at || userProfile?.created_at || new Date()).toISOString(),
  };

  return <ProfileClient initialProfile={profileData} />;
}
