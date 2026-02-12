import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getCollection, Collections, ObjectId } from '@/lib/db/mongodb';
import { getFirebaseAuth } from '@/lib/auth/firebase-admin';
import { 
  successResponse, 
  errorResponse, 
  getAuthUser,
  parseBody,
  bloodGroupSchema,
  phoneSchema
} from '@/lib/api-utils';

// User document interface
interface UserDocument {
  _id: string; // Firebase UID
  email?: string;
  full_name?: string;
  blood_group?: string;
  phone_number?: string;
  country?: string;
  city?: string;
  area?: string;
  emergency_contact?: string;
  is_available_to_donate: boolean;
  avatar_url?: string;
  gender?: string; // Added gender
  created_at: Date;
  updated_at: Date;
}

// GET /api/profile - Get current user's profile
export async function GET(request: NextRequest) {
  const { user, error: authError } = await getAuthUser(request);
  if (authError) return authError;

  try {
    const usersCollection = await getCollection<UserDocument>(Collections.USERS);
    const donationsCollection = await getCollection(Collections.DONATIONS);

    // Fetch profile
    const profile = await usersCollection.findOne({ _id: user!.id } as any);

    if (!profile) {
      return errorResponse('Profile not found', 'NOT_FOUND', 404);
    }

    // Get donation stats
    const donationCount = await donationsCollection.countDocuments({
      donor_id: user!.id,
      status: 'completed',
    });

    // Calculate badge tier
    const totalDonations = donationCount || 0;
    let badgeTier = 'none';
    if (totalDonations >= 31) badgeTier = 'platinum';
    else if (totalDonations >= 16) badgeTier = 'gold';
    else if (totalDonations >= 6) badgeTier = 'silver';
    else if (totalDonations >= 1) badgeTier = 'bronze';

    return successResponse({
      id: profile._id,
      email: profile.email,
      full_name: profile.full_name,
      blood_group: profile.blood_group,
      phone_number: profile.phone_number,
      country: profile.country,
      city: profile.city,
      area: profile.area,
      emergency_contact: profile.emergency_contact,
      is_available_to_donate: profile.is_available_to_donate,
      avatar_url: profile.avatar_url,
      gender: profile.gender,
      created_at: profile.created_at,
      updated_at: profile.updated_at,
      total_donations: totalDonations,
      badge_tier: badgeTier,
      points: totalDonations * 100,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return errorResponse('An unexpected error occurred', 'SERVER_ERROR', 500);
  }
}

// PATCH /api/profile - Update profile
const updateProfileSchema = z.object({
  full_name: z.string().min(2).optional(),
  blood_group: bloodGroupSchema.optional(),
  phone_number: phoneSchema.optional(),
  country: z.string().min(2).optional(),
  city: z.string().min(2).optional(),
  area: z.string().optional(),
  emergency_contact: z.string().optional(),
  is_available_to_donate: z.boolean().optional(),
  gender: z.string().optional(),
  avatar_url: z.string().optional(), // Accepts URL or Base64 data URI
});

export async function PATCH(request: NextRequest) {
  const { user, error: authError } = await getAuthUser(request);
  if (authError) return authError;

  const { data, error: parseError } = await parseBody(request, updateProfileSchema);
  if (parseError) return parseError;

  try {
    const usersCollection = await getCollection<UserDocument>(Collections.USERS);

    // Build update object with only provided fields
    const updateData: Partial<UserDocument> = {
      updated_at: new Date(),
    };

    if (data.full_name !== undefined) updateData.full_name = data.full_name;
    if (data.blood_group !== undefined) updateData.blood_group = data.blood_group;
    if (data.phone_number !== undefined) updateData.phone_number = data.phone_number;
    if (data.country !== undefined) updateData.country = data.country;
    if (data.city !== undefined) updateData.city = data.city;
    if (data.area !== undefined) updateData.area = data.area;
    if (data.emergency_contact !== undefined) updateData.emergency_contact = data.emergency_contact;
    if (data.is_available_to_donate !== undefined) updateData.is_available_to_donate = data.is_available_to_donate;
    if (data.gender !== undefined) updateData.gender = data.gender;
    if (data.avatar_url !== undefined) updateData.avatar_url = data.avatar_url;

    console.log('Updating profile for user:', user!.id, 'with data:', updateData);

    // Upsert profile (create if doesn't exist, update if exists)
    // Build $setOnInsert - only include is_available_to_donate if it's not being set
    const setOnInsert: Record<string, any> = {
      _id: user!.id,
      email: user!.email,
      created_at: new Date(),
    };
    // Only add default is_available_to_donate if not being set via $set
    if (data.is_available_to_donate === undefined) {
      setOnInsert.is_available_to_donate = true;
    }

    const result = await usersCollection.findOneAndUpdate(
      { _id: user!.id } as any,
      { 
        $set: updateData,
        $setOnInsert: setOnInsert
      },
      { upsert: true, returnDocument: 'after' }
    );

    if (!result) {
      return errorResponse('Failed to update profile', 'DATABASE_ERROR', 500);
    }

    return successResponse({
      id: result._id,
      ...result,
    }, 'Profile updated successfully');
  } catch (error: any) {
    console.error('Update profile error:', {
      message: error?.message,
      code: error?.code,
      stack: error?.stack?.split('\n').slice(0, 5),
    });
    return errorResponse(`Profile update failed: ${error?.message || 'Unknown error'}`, 'SERVER_ERROR', 500);
  }
}

// DELETE /api/profile - Delete account
export async function DELETE(request: NextRequest) {
  const { user, error: authError } = await getAuthUser(request);
  if (authError) return authError;

  try {
    const usersCollection = await getCollection<UserDocument>(Collections.USERS);

    // Delete profile from MongoDB
    const { deletedCount } = await usersCollection.deleteOne({ _id: user!.id } as any);

    if (deletedCount === 0) {
      console.error('Profile not found for deletion:', user!.id);
    }

    // Delete auth user from Firebase
    try {
      await getFirebaseAuth().deleteUser(user!.id);
    } catch (firebaseError) {
      console.error('Firebase user delete error:', firebaseError);
      // Continue anyway since profile is deleted
    }

    return successResponse(
      { deleted: true },
      "Account has been deleted. We're sorry to see you go."
    );
  } catch (error) {
    console.error('Delete profile error:', error);
    return errorResponse('An unexpected error occurred', 'SERVER_ERROR', 500);
  }
}
