import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getCollection, Collections, UserDocument } from '@/lib/db/mongodb';
import { successResponse, errorResponse, getAuthUser, parseBody, AuthUser } from '@/lib/api-utils';
import { getFirebaseAuth } from '@/lib/auth/firebase-admin';

// POST /api/auth/signup - Create user profile after Firebase signup
const signupSchema = z.object({
  email: z.string().email().optional(), // Required for mobile flow
  password: z.string().min(6).optional(), // Required for mobile flow
  full_name: z.string().min(2, 'Full name is required'),
  phone_number: z.string().min(7, 'Phone number is required'),
  blood_group: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
  country: z.string().min(2, 'Country is required'),
  city: z.string().min(2, 'City is required'),
  area: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const { data, error: parseError } = await parseBody(request, signupSchema);
  if (parseError) return parseError;

  let firebaseUser: { id: string; email?: string } | null = null;

  // 1. Try to get authenticated user from Header (Web flow)
  const { user: authedUser } = await getAuthUser(request);
  
  if (authedUser) {
    firebaseUser = authedUser;
  } else if (data.email && data.password) {
    // 2. Mobile flow: Create user in Firebase via Admin SDK
    try {
      const userRecord = await getFirebaseAuth().createUser({
        email: data.email,
        password: data.password,
        displayName: data.full_name,
      });
      firebaseUser = { id: userRecord.uid, email: userRecord.email };
      console.log('Created new Firebase user via Admin SDK:', firebaseUser.id);
    } catch (error: any) {
      console.error('Firebase user creation failed:', error.message);
      if (error.code === 'auth/email-already-exists') {
        return errorResponse('Email already in use', 'EMAIL_EXISTS', 409);
      }
      return errorResponse('Failed to create account', 'AUTH_ERROR', 501);
    }
  } else {
    return errorResponse('Authentication required or missing credentials', 'AUTH_REQUIRED', 401);
  }

  if (!firebaseUser) {
    return errorResponse('Authentication failed during signup', 'AUTH_ERROR', 500);
  }

  try {
    const usersCollection = await getCollection<UserDocument>(Collections.USERS);

    // Check if user profile already exists
    const existingUser = await usersCollection.findOne({ _id: firebaseUser.id });
    if (existingUser) {
      return errorResponse('User profile already exists', 'ALREADY_EXISTS', 409);
    }

    // Create user profile in MongoDB
    const newUser: UserDocument = {
      _id: firebaseUser.id,
      email: firebaseUser.email,
      full_name: data.full_name,
      phone_number: data.phone_number,
      blood_group: data.blood_group,
      country: data.country,
      city: data.city,
      area: data.area,
      is_available_to_donate: true,
      created_at: new Date(),
      updated_at: new Date(),
    };

    await usersCollection.insertOne(newUser as any);

    // For mobile flow, we need to return a token.
    // Since we're server-side, we can't easily get an ID token for a newly created user 
    // without their password on the client. 
    // However, the mobile app can now sign In immediately after this call.
    
    return successResponse(
      {
        id: firebaseUser.id,
        email: firebaseUser.email,
        ...data,
        // We inform the mobile app it needs to sign in to get the token
        // or we could return a custom token if we wanted to be fancy.
        requires_signin: true, 
      },
      'Profile created successfully. Please sign in.',
      201
    );
  } catch (error) {
    console.error('Signup profile creation error:', error);
    return errorResponse('Failed to create profile', 'SERVER_ERROR', 500);
  }
}
