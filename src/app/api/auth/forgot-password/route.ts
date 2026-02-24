import { NextRequest } from 'next/server';
import { z } from 'zod';
import { successResponse, errorResponse, parseBody } from '@/lib/api-utils';
import { getFirebaseAuth } from '@/lib/auth/firebase-admin';
import { sendEmail } from '@/lib/email/email-service';

// POST /api/auth/forgot-password - Send password reset email
const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email'),
});

export async function POST(request: NextRequest) {
  const { data, error: parseError } = await parseBody(request, forgotPasswordSchema);
  if (parseError) return parseError;

  try {
    // Generate password reset link using Firebase Admin
    const resetLink = await getFirebaseAuth().generatePasswordResetLink(data.email);

    // Send the reset link via email
    await sendEmail({
      to: data.email,
      subject: 'Reset your BloodReq Password',
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 20px;">
          <h2 style="color: #1a1a1a; margin-bottom: 16px;">Password Reset</h2>
          <p style="color: #555; font-size: 15px; line-height: 1.6;">
            We received a request to reset your password. Click the button below to choose a new one.
          </p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${resetLink}"
               style="display: inline-block; background-color: #e53935; color: #ffffff; text-decoration: none; padding: 14px 36px; border-radius: 8px; font-weight: bold; font-size: 15px;">
              Reset Password
            </a>
          </div>
          <p style="color: #888; font-size: 13px; line-height: 1.5;">
            If you didn't request this, you can safely ignore this email. The link expires in 1 hour.
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
          <p style="color: #aaa; font-size: 12px;">BloodReq — Connecting donors, saving lives.</p>
        </div>
      `,
    });

    return successResponse(
      { sent: true },
      'If an account exists with this email, you will receive a password reset link.'
    );
  } catch (error: any) {
    // Always return success to prevent email enumeration
    console.error('Forgot password error:', error);
    return successResponse(
      { sent: true },
      'If an account exists with this email, you will receive a password reset link.'
    );
  }
}
