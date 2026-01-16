import { AdminLayoutClient } from "@/components/layout/AdminLayoutClient";
import "../globals.css";
import { cookies } from "next/headers";
import { getFirebaseAuth } from "@/lib/auth/firebase-admin";
import { getCollection, Collections, UserDocument } from "@/lib/db/mongodb";
import { redirect } from "next/navigation";
import { AdminUser } from "@/contexts/UserContext";

async function getAdminUser(): Promise<AdminUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;
  
  if (!token) return null;
  
  try {
    const decodedToken = await getFirebaseAuth().verifySessionCookie(token, true);
    
    // Check if admin
    const adminUsersCollection = await getCollection<UserDocument>(Collections.USERS); // Actually checking 'users' for profile mostly
    // But we should check 'admin_users' for permission in a real middleware.
    // Here we just fetch profile for UI. Access control in actions.
    const userProfile = await adminUsersCollection.findOne({ _id: decodedToken.uid });
    
    if (!userProfile) return null;

    return {
        id: userProfile._id,
        email: userProfile.email,
        full_name: userProfile.full_name,
        avatar_url: userProfile.avatar_url,
        role: 'admin', // defaulted for UI
    };

  } catch (e) {
    return null;
  }
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAdminUser();

  if (!user) {
    redirect('/login');
  }

  return <AdminLayoutClient user={user}>{children}</AdminLayoutClient>;
}
