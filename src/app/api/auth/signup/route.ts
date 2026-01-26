import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getCollection, Collections, UserDocument } from '@/lib/db/mongodb';
import { successResponse, errorResponse, getAuthUser, parseBody, AuthUser } from '@/lib/api-utils';
import { getFirebaseAuth } from '@/lib/auth/firebase-admin';

// POST /api/auth/signup - Create user profile after Firebase signup
const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  full_name: z.string().min(2, 'Full name is required'),
  phone_number: z.string().min(7, 'Phone number is required'),
  blood_group: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
  country: z.string().min(2, 'Country is required'),
  city: z.string().min(2, 'City is required'),
  area: z.string().optional(),
});

import { generateOtp } from '@/lib/auth/otp-service';
import { sendEmail } from '@/lib/email/email-service';

export async function POST(request: NextRequest) {
  const { data, error: parseError } = await parseBody(request, signupSchema);
  if (parseError) return parseError;

  try {
    const usersCollection = await getCollection<UserDocument>(Collections.USERS);

    // Check if user profile already exists
    const existingUser = await usersCollection.findOne({ email: data.email });
    if (existingUser) {
      return errorResponse('Email already in use', 'EMAIL_EXISTS', 409);
    }

    // Store in pending_registrations
    const pendingCollection = await getCollection('pending_registrations' as any);
    await pendingCollection.updateOne(
        { email: data.email }, 
        { $set: { ...data, created_at: new Date() } }, 
        { upsert: true }
    );

    // Generate and Send OTP
    const otp = await generateOtp(data.email);
    console.log(`Generated OTP for ${data.email}: ${otp}`); // Log for dev

    await sendEmail({
      to: data.email,
      subject: 'Verify your BloodReq Account',
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>Verify your Email</h2>
          <p>Your verification code is:</p>
          <h1 style="color: #e53935; letter-spacing: 5px;">${otp}</h1>
          <p>This code is valid for 10 minutes.</p>
        </div>
      `
    });

    return successResponse(
      {
        email: data.email,
        requires_verification: true,
      },
      'Verification code sent to email',
      200
    );

  } catch (error) {
    console.error('Signup error:', error);
    return errorResponse('Failed to process signup', 'SERVER_ERROR', 500);
  }
}
