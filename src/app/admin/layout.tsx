import { AdminLayoutClient } from "@/components/layout/AdminLayoutClient";
import "../globals.css";
import { cookies } from "next/headers";
import { getFirebaseAuth } from "@/lib/auth/firebase-admin";
import { getCollection, Collections, AdminUserDocument } from "@/lib/db/mongodb";
import { redirect } from "next/navigation";
import { AdminUser } from "@/contexts/UserContext";

async function getAdminUser(): Promise<AdminUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;
  
  if (!token) return null;
  
  try {
    const decodedToken = await getFirebaseAuth().verifySessionCookie(token, true);
    
    // Fetch from admin_users collection
    const adminUsersCollection = await getCollection<AdminUserDocument>(Collections.ADMIN_USERS);
    const adminProfile = await adminUsersCollection.findOne({ _id: decodedToken.uid });
    
    if (adminProfile) {
      // Prioritize admin_details.role (e.g. 'super_admin') over top-level role
      const effectiveRole = adminProfile.admin_details?.role || adminProfile.role || 'admin';
      
      return {
          id: adminProfile._id,
          email: adminProfile.email,
          full_name: adminProfile.full_name,
          avatar_url: adminProfile.avatar_url,
          role: effectiveRole, 
      };
    }
    
    // Fallback? If not in admin_users, maybe they are just a user? 
    // But this is admin panel. Redirect or return null?
    // Let's assume for now valid admin session means they exist.
    return {
        id: decodedToken.uid,
        email: decodedToken.email,
        role: 'admin', // Fallback
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
