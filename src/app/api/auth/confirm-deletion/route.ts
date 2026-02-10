import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getCollection, Collections, UserDocument } from '@/lib/db/mongodb';
import { successResponse, errorResponse, parseBody } from '@/lib/api-utils';
import { verifyOtp } from '@/lib/auth/otp-service';
import { getFirebaseAuth } from '@/lib/auth/firebase-admin';

const confirmDeletionSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
});

export async function POST(request: NextRequest) {
  const { data, error: parseError } = await parseBody(request, confirmDeletionSchema);
  if (parseError) return parseError;

  try {
    // 1. Verify OTP
    const isValid = await verifyOtp(data.email, data.otp);
    if (!isValid) {
      return errorResponse('Invalid or expired verification code', 'INVALID_OTP', 400);
    }

    // 2. Find User
    const usersCollection = await getCollection<UserDocument>(Collections.USERS);
    const user = await usersCollection.findOne({ email: data.email });

    if (!user) {
      return errorResponse('User not found', 'NOT_FOUND', 404);
    }

    // 3. Delete from MongoDB
    const { deletedCount } = await usersCollection.deleteOne({ _id: user._id });

    if (deletedCount === 0) {
      console.error('Failed to delete user from MongoDB:', user._id);
      return errorResponse('Failed to delete account data', 'DATABASE_ERROR', 500);
    }

    // 4. Delete from Firebase Auth
    try {
      await getFirebaseAuth().deleteUser(user._id);
    } catch (firebaseError: any) {
      console.error('Firebase user delete error:', firebaseError);
      // We continue since the main data is gone, but we should probably log this for manual cleanup
      // if it fails. 'auth/user-not-found' is fine.
      if (firebaseError.code !== 'auth/user-not-found') {
         console.warn(`User ${user._id} deleted from DB but failed to delete from Firebase.`);
      }
    }

    return successResponse(
      { deleted: true, email: data.email },
      'Account successfully deleted.',
      200
    );

  } catch (error) {
    console.error('Confirm deletion error:', error);
    return errorResponse('Failed to complete account deletion', 'SERVER_ERROR', 500);
  }
}
