import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAuth } from '@/lib/auth/firebase-admin';
import { getCollection, Collections, UserDocument } from '@/lib/db/mongodb';
import { successResponse, errorResponse } from '@/lib/api-utils';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { provider, id_token, access_token: googleAccessToken } = body;

    if (!id_token || provider !== 'google') {
      return errorResponse('Missing or invalid provider/token', 'VALIDATION_ERROR', 400);
    }

    // Verify the Google ID token via Firebase Admin
    // Note: If the ID token is from Google but not exchanged for a Firebase token on the client,
    // verifyIdToken might fail with an "audience mismatch" if it's checking for the Firebase Project ID.
    let decodedToken;
    try {
      decodedToken = await getFirebaseAuth().verifyIdToken(id_token);
    } catch (error: any) {
      console.error('Google token verification failed via Firebase:', error.message);
      
      // Fallback: If it's a direct Google ID token, we'd normally use google-auth-library here.
      // But since we want to use Firebase as our source of truth, the best fix is ensuring 
      // the mobile app correctly initializes Google Sign-in with the Web Client ID linked to Firebase.
      return errorResponse('Invalid Google token or audience mismatch', 'AUTH_ERROR', 401, error.message);
    }

    const { uid, email, name, picture } = decodedToken;

    // Ensure user exists in MongoDB
    const usersCollection = await getCollection<UserDocument>(Collections.USERS);
    let user = await usersCollection.findOne({ _id: uid });

    if (!user) {
      // Create a basic profile for the new social user
      const newUser: UserDocument = {
        _id: uid,
        email: email,
        full_name: name || '',
        avatar_url: picture,
        is_available_to_donate: true,
        created_at: new Date(),
        updated_at: new Date(),
      };
      await usersCollection.insertOne(newUser as any);
      user = await usersCollection.findOne({ _id: uid });
    }

    // Determine if user needs to complete profile (e.g., blood group missing)
    const needsProfile = !user?.blood_group || !user?.phone_number;

    // Optional: Update avatar if missing for existing user
    if (user && !user.avatar_url && picture) {
      await usersCollection.updateOne(
        { _id: uid },
        { $set: { avatar_url: picture, updated_at: new Date() } }
      );
      user.avatar_url = picture; // Update local obj for response
    }

    // Create session cookie for web convenience (optional for mobile)
    const expiresIn = 60 * 60 * 24 * 14 * 1000; // 14 days
    const sessionCookie = await getFirebaseAuth().createSessionCookie(id_token, { expiresIn });
    const cookieStore = await cookies();
    cookieStore.set('session', sessionCookie, {
      maxAge: expiresIn / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'lax',
    });

    // Determine if user needs to complete profile (e.g., blood group missing)
    // needsProfile already calculated above

    return successResponse({
      access_token: id_token, // On Firebase, the ID token acts as the access token
      refresh_token: 'FIREBASE_MANAGED', // Firebase handles refresh internally on client
      user: {
        id: uid,
        email: email,
        full_name: user?.full_name,
        blood_group: user?.blood_group,
        phone_number: user?.phone_number,
        avatar_url: user?.avatar_url,
      },
      needs_profile: needsProfile,
    }, 'Signed in with Google successfully');

  } catch (error: any) {
    console.error('OAuth error:', error);
    return errorResponse('Failed to process social sign-in', 'SERVER_ERROR', 500);
  }
}
