import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getCollection, Collections, UserDocument } from '@/lib/db/mongodb';
import { successResponse, errorResponse, parseBody } from '@/lib/api-utils';
import { getFirebaseAuth } from '@/lib/auth/firebase-admin';
import { verifyOtp } from '@/lib/auth/otp-service';

const verifySchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
});

export async function POST(request: NextRequest) {
  const { data, error: parseError } = await parseBody(request, verifySchema);
  if (parseError) return parseError;

  try {
    // 1. Verify OTP
    const isValid = await verifyOtp(data.email, data.otp);
    if (!isValid) {
      return errorResponse('Invalid or expired OTP', 'INVALID_OTP', 400);
    }

    // 2. Retrieve Pending Registration Data
    const pendingCollection = await getCollection('pending_registrations' as any);
    const pendingData = await pendingCollection.findOne({ email: data.email });

    if (!pendingData) {
      return errorResponse('Registration data not found or expired', 'DATA_NOT_FOUND', 404);
    }

    // 3. Create Firebase User
    let uid: string;
    try {
        // Build display name
        const displayName = pendingData.full_name;
        
        const userRecord = await getFirebaseAuth().createUser({
            email: pendingData.email,
            password: pendingData.password,
            displayName: displayName,
            emailVerified: true // They verified OTP, so it's verified
        });
        uid = userRecord.uid;
    } catch (e: any) {
        if (e.code === 'auth/email-already-exists') {
            // Edge case: User already exists in Firebase but not in Mongo (or Mongo check failed earlier)
            // Or race condition. Try to fetch existing UID.
            try {
                const existing = await getFirebaseAuth().getUserByEmail(pendingData.email);
                uid = existing.uid;
            } catch (inner) {
                return errorResponse('Failed to create account', 'AUTH_ERROR', 500);
            }
        } else {
            console.error('Firebase create error:', e);
            return errorResponse('Failed to create account', 'AUTH_ERROR', 500);
        }
    }

    // 4. Create MongoDB User Profile
    const usersCollection = await getCollection<UserDocument>(Collections.USERS);
    
    // Check again just in case
    const existingProfile = await usersCollection.findOne({ _id: uid });
    if (!existingProfile) {
        const newUser: UserDocument = {
            _id: uid,
            email: pendingData.email,
            full_name: pendingData.full_name,
            phone_number: pendingData.phone_number,
            blood_group: pendingData.blood_group,
            country: pendingData.country,
            city: pendingData.city,
            area: pendingData.area,
            is_available_to_donate: pendingData.is_available_to_donate ?? true,
            is_verified: true,
            created_at: new Date(),
            updated_at: new Date(),
        };
        await usersCollection.insertOne(newUser as any);
    }

    // 5. Clean up pending
    await pendingCollection.deleteOne({ _id: pendingData._id });

    // 6. Generate Custom Token for Login
    const customToken = await getFirebaseAuth().createCustomToken(uid);

    return successResponse(
      { 
        token: customToken,
        email: data.email,
        message: 'Account verified and created successfully'
      },
      'Verified successfully',
      200
    );

  } catch (error) {
    console.error('Verify OTP error:', error);
    return errorResponse('Verification failed', 'SERVER_ERROR', 500);
  }
}
