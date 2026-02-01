import { getModerators } from './actions';
import ModeratorsClient from './ModeratorsClient';
import { getFirebaseAuth } from '@/lib/auth/firebase-admin';
import { getCollection, Collections, UserDocument } from '@/lib/db/mongodb';
import { cookies } from 'next/headers';

// Helper to get current user from session cookie or token
async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;
  
  if (!token) return null;

  try {
    const decodedToken = await getFirebaseAuth().verifySessionCookie(token, true);
    return decodedToken;
  } catch (error) {
    return null;
  }
}

export default async function ModeratorsPage() {
  const moderators = await getModerators();
  const user = await getCurrentUser();
  
  let currentUserRole = 'support'; // Default lowest role
  
  if (user) {
    try {
      const usersCollection = await getCollection<UserDocument>(Collections.USERS);
      const adminUser = await usersCollection.findOne({ _id: user.uid });
      
      if (adminUser) {
        currentUserRole = adminUser.admin_details?.role || adminUser.role || 'support';
      }
    } catch (error) {
      console.error('Error fetching admin role:', error);
    }
  }

  console.log('Passing to client:', { currentUserId: user?.uid, currentUserRole });

  return (
    <ModeratorsClient 
      moderators={moderators} 
      currentUserId={user?.uid || ''} 
      currentUserRole={currentUserRole}
    />
  );
}


