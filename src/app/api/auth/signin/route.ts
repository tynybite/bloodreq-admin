// POST /api/auth/signin - Exchange Firebase token for Session Cookie
import { NextRequest, NextResponse } from 'next/server';
import { getCollection, Collections, UserDocument } from '@/lib/db/mongodb';
import { successResponse, errorResponse } from '@/lib/api-utils';
import { getFirebaseAuth } from '@/lib/auth/firebase-admin';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { idToken, rememberMe } = body;

    if (!idToken) {
      return errorResponse('Missing ID token', 'VALIDATION_ERROR', 400);
    }

    // Verify the ID token first
    const decodedToken = await getFirebaseAuth().verifyIdToken(idToken);
    console.log("Login attempt - UID:", decodedToken.uid);
    
    // Create session cookie: 14 days if remembered, 24 hours if not
    const expiresIn = rememberMe 
      ? 60 * 60 * 24 * 14 * 1000 
      : 60 * 60 * 24 * 1 * 1000;
    
    const sessionCookie = await getFirebaseAuth().createSessionCookie(idToken, { expiresIn });

    const cookieStore = await cookies();
    cookieStore.set('session', sessionCookie, {
      maxAge: rememberMe ? expiresIn / 1000 : undefined, // Session cookie (lasts until browser close) id undefined
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'lax',
    });

    // Check if user is an admin
    // We check the 'users' collection with admin_details for admin panel access
    const usersCollection = await getCollection<UserDocument>(Collections.USERS);
    const userProfile = await usersCollection.findOne({ _id: decodedToken.uid });
    
    // Check if role is admin or super_admin (in admin_details or top-level role)
    const role = userProfile?.admin_details?.role || userProfile?.role;
    const isAdmin = role === 'admin' || role === 'super_admin' || role === 'moderator';

    if (!userProfile || !isAdmin) {
      // User authenticated but no admin profile
      return successResponse(
        {
          id: decodedToken.uid,
          email: decodedToken.email,
          needs_profile: true,
          is_admin: false,
        },
        'User authenticated but not authorized as admin.'
      );
    }

    // Return user profile and token for mobile
    return successResponse({
      access_token: idToken,
      refresh_token: 'FIREBASE_MANAGED',
      id: userProfile._id,
      email: decodedToken.email || userProfile.email || "",
      full_name: userProfile.full_name || 'Admin User',
      role: role,
      permissions: userProfile.admin_details?.permissions,
      is_active: userProfile.admin_details?.is_active ?? true,
      created_at: userProfile.created_at,
      need_profile: false,
      is_admin: isAdmin,
    }, 'Signed in successfully');

  } catch (error) {
    console.error('Signin error:', error);
    return errorResponse('Failed to sign in', 'SERVER_ERROR', 500);
  }
}
