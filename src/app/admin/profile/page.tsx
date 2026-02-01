import { getCollection, Collections, UserDocument } from "@/lib/db/mongodb";
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
  
  const usersCollection = await getCollection<UserDocument>(Collections.USERS);
  const userProfile = await usersCollection.findOne({ _id: user.uid });
  
  // Format for client - all data now in users collection
  const profileData = {
    id: user.uid,
    email: user.email || userProfile?.email || null,
    full_name: userProfile?.full_name || null,
    avatar_url: userProfile?.avatar_url || null,
    phone_number: userProfile?.phone_number || null,
    city: userProfile?.city || null,
    country: userProfile?.country || null,
    role: userProfile?.blood_group || null, // Displayed as "Detailed Role" in UI
    
    // Admin specific (from admin_details)
    admin_role: userProfile?.admin_details?.role || userProfile?.role || null,
    permissions: userProfile?.admin_details?.permissions || {},
    created_at: (userProfile?.created_at || new Date()).toISOString(),
  };

  return <ProfileClient initialProfile={profileData} />;
}
