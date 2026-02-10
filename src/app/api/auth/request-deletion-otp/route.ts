import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getCollection, Collections } from '@/lib/db/mongodb';
import { successResponse, errorResponse, parseBody } from '@/lib/api-utils';
import { generateOtp } from '@/lib/auth/otp-service';
import { sendEmail } from '@/lib/email/email-service';

const requestDeletionSchema = z.object({
  email: z.string().email(),
});

export async function POST(request: NextRequest) {
  const { data, error: parseError } = await parseBody(request, requestDeletionSchema);
  if (parseError) return parseError;

  try {
    // Check if user exists
    const usersCollection = await getCollection(Collections.USERS);
    const user = await usersCollection.findOne({ email: data.email });

    if (!user) {
       return errorResponse('User with this email does not exist', 'NOT_FOUND', 404);
    }

    // Rate Limiting Check
    const otpsCollection = await getCollection('otps' as any);
    const existingOtp = await otpsCollection.findOne({ email: data.email });

    if (existingOtp) {
       const timeDiff = Date.now() - new Date(existingOtp.created_at).getTime();
       if (timeDiff < 60 * 1000) { // 60 seconds cooldown
         return successResponse(
             { email: data.email },
             'Verification code sent to your email.',
             200
         );
       }
    }

    // Generate OTP
    const otp = await generateOtp(data.email);

    // Send Email
    await sendEmail({
      to: data.email,
      subject: 'SECURITY WARNING: Account Deletion Request',
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #d32f2f;">Account Deletion Request</h2>
          <p>We received a request to permanently delete your BloodReq account associated with this email.</p>
          <p>If you did not request this, please ignore this email. Your account remains safe.</p>
          <p>To confirm deletion, use the following code:</p>
          <h1 style="color: #d32f2f; letter-spacing: 5px; font-size: 32px;">${otp}</h1>
          <p><strong>Warning:</strong> This action is irreversible. All your data will be permanently removed.</p>
          <p>This code is valid for 10 minutes.</p>
        </div>
      `
    });

    return successResponse(
      { email: data.email },
      'Verification code sent to your email (if registered).',
      200
    );

  } catch (error) {
    console.error('Request deletion OTP error:', error);
    return errorResponse('Failed to process request', 'SERVER_ERROR', 500);
  }
}
