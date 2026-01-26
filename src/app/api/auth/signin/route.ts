// POST /api/auth/signin - Exchange Firebase token for Session Cookie
import { NextRequest, NextResponse } from 'next/server';
import { getCollection, Collections, UserDocument, AdminUserDocument } from '@/lib/db/mongodb';
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
    // We now use the 'users' collection (consolidated)
    const usersCollection = await getCollection<UserDocument>(Collections.USERS);
    const profile = await usersCollection.findOne({ _id: decodedToken.uid });
    
    // Check if role is admin
    const isAdmin = profile?.role === 'admin';

    // Profile already fetched above

    if (!profile) {
      // User authenticated but no profile
      return successResponse(
        {
          id: decodedToken.uid,
          email: decodedToken.email,
          needs_profile: true,
          is_admin: isAdmin,
        },
        'User authenticated but profile not found. Complete signup.'
      );
    }

    // Return user profile
    return successResponse({
      id: profile._id,
      email: profile.email,
      full_name: profile.full_name,
      blood_group: profile.blood_group,
      phone_number: profile.phone_number,
      country: profile.country,
      city: profile.city,
      area: profile.area,
      is_available_to_donate: profile.is_available_to_donate,
      avatar_url: profile.avatar_url,
      created_at: profile.created_at,
      need_profile: false,
      is_admin: isAdmin,
    }, 'Signed in successfully');

  } catch (error) {
    console.error('Signin error:', error);
    return errorResponse('Failed to sign in', 'SERVER_ERROR', 500);
  }
}
