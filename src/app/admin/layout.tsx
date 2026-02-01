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
    
    // Fetch from users collection (consolidated)
    const usersCollection = await getCollection<UserDocument>(Collections.USERS);
    const userProfile = await usersCollection.findOne({ _id: decodedToken.uid });
    
    if (userProfile) {
      // Prioritize admin_details.role over top-level role
      const effectiveRole = userProfile.admin_details?.role || userProfile.role || 'user';
      
      return {
          id: userProfile._id,
          email: userProfile.email,
          full_name: userProfile.full_name,
          avatar_url: userProfile.avatar_url,
          role: effectiveRole, 
      };
    }
    
    // User exists in Firebase but not in DB yet
    return {
        id: decodedToken.uid,
        email: decodedToken.email,
        role: 'user', // Default, will be blocked by RBAC check
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

  // Security Audit Fix: Enforce RBAC
  const allowedRoles = ['admin', 'super_admin', 'moderator'];
  if (!user.role || !allowedRoles.includes(user.role)) {
    console.warn(`Unauthorized access attempt by user ${user.id} with role ${user.role}`);
    // Redirect to home or a dedicated forbidden page. 
    // Since this is the admin panel, sending them back to login or root is safer.
    redirect('/'); 
  }

  return <AdminLayoutClient user={user}>{children}</AdminLayoutClient>;
}
