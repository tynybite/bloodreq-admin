import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getCollection } from '@/lib/db/mongodb';
import { successResponse, errorResponse, parseBody } from '@/lib/api-utils';
import { generateOtp } from '@/lib/auth/otp-service';
import { sendEmail } from '@/lib/email/email-service';

const resendSchema = z.object({
  email: z.string().email(),
});

export async function POST(request: NextRequest) {
  const { data, error: parseError } = await parseBody(request, resendSchema);
  if (parseError) return parseError;

  try {
    // Check if there is a pending registration
    const pendingCollection = await getCollection('pending_registrations' as any);
    const pendingData = await pendingCollection.findOne({ email: data.email });

    if (!pendingData) {
      return errorResponse('No pending registration found for this email', 'NOT_FOUND', 404);
    }

    // Rate Limiting Check (Simple impl: check last otp created time)
    const otpsCollection = await getCollection('otps' as any);
    const existingOtp = await otpsCollection.findOne({ email: data.email });

    if (existingOtp) {
       const timeDiff = Date.now() - new Date(existingOtp.created_at).getTime();
       if (timeDiff < 60 * 1000) { // 60 seconds cooldown
         const waitSeconds = Math.ceil((60000 - timeDiff) / 1000);
         return errorResponse(`Please wait ${waitSeconds}s before requesting a new code`, 'RATE_LIMIT', 429);
       }
    }

    // Generate new OTP
    const otp = await generateOtp(data.email);

    // Send Email
    await sendEmail({
      to: data.email,
      subject: 'Resend: Verify your BloodReq Account',
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>Verify your Email</h2>
          <p>Your new verification code is:</p>
          <h1 style="color: #e53935; letter-spacing: 5px;">${otp}</h1>
          <p>This code is valid for 10 minutes.</p>
        </div>
      `
    });

    return successResponse(
      { email: data.email },
      'Verification code resent successfully',
      200
    );

  } catch (error) {
    console.error('Resend OTP error:', error);
    return errorResponse('Failed to resend OTP', 'SERVER_ERROR', 500);
  }
}
