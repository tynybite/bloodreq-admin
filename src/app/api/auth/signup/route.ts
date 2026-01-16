import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getCollection, Collections } from '@/lib/db/mongodb';
import { successResponse, errorResponse, getAuthUser, parseBody } from '@/lib/api-utils';

// POST /api/auth/signup - Create user profile after Firebase signup
const signupSchema = z.object({
  full_name: z.string().min(2, 'Full name is required'),
  phone_number: z.string().min(7, 'Phone number is required'),
  blood_group: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
  country: z.string().min(2, 'Country is required'),
  city: z.string().min(2, 'City is required'),
  area: z.string().optional(),
});

export async function POST(request: NextRequest) {
  // User must already be authenticated with Firebase
  const { user, error: authError } = await getAuthUser(request);
  if (authError) return authError;

  const { data, error: parseError } = await parseBody(request, signupSchema);
  if (parseError) return parseError;

  try {
    const usersCollection = await getCollection(Collections.USERS);

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ _id: user!.id });
    if (existingUser) {
      return errorResponse('User profile already exists', 'ALREADY_EXISTS', 409);
    }

    // Create user profile
    const newUser = {
      _id: user!.id,
      email: user!.email,
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

    await usersCollection.insertOne(newUser);

    return successResponse(
      {
        id: user!.id,
        email: user!.email,
        ...data,
      },
      'Profile created successfully',
      201
    );
  } catch (error) {
    console.error('Signup error:', error);
    return errorResponse('Failed to create profile', 'SERVER_ERROR', 500);
  }
}
