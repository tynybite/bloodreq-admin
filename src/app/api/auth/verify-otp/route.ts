import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { 
  successResponse, 
  errorResponse, 
  parseBody, 
  phoneSchema,
  bloodGroupSchema 
} from '@/lib/api-utils';

// Validation schema for OTP verification
const verifyOtpSchema = z.object({
  phone_number: phoneSchema,
  otp: z.string().length(6, 'OTP must be 6 digits'),
  type: z.enum(['signup', 'signin']),
  // Profile data for signup
  profile_data: z.object({
    full_name: z.string().min(2),
    blood_group: bloodGroupSchema,
    country: z.string().min(2),
    city: z.string().min(2),
    area: z.string().optional(),
  }).optional(),
});

export async function POST(request: NextRequest) {
  // Parse and validate request body
  const { data, error: parseError } = await parseBody(request, verifyOtpSchema);
  if (parseError) return parseError;

  const { phone_number, otp, type, profile_data } = data;

  try {
    const supabase = await createClient();

    // Verify OTP with Supabase
    const { data: authData, error: authError } = await supabase.auth.verifyOtp({
      phone: phone_number,
      token: otp,
      type: 'sms',
    });

    if (authError) {
      if (authError.message.includes('expired')) {
        return errorResponse('OTP has expired. Please request a new one.', 'OTP_EXPIRED', 400);
      }
      if (authError.message.includes('invalid')) {
        return errorResponse('Invalid OTP. Please try again.', 'OTP_INVALID', 400);
      }
      return errorResponse(authError.message, 'OTP_ERROR', 400);
    }

    if (!authData.user || !authData.session) {
      return errorResponse('Failed to verify OTP', 'AUTH_ERROR', 500);
    }

    // If signup, create/update profile
    if (type === 'signup' && profile_data) {
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: authData.user.id,
        phone_number,
        full_name: profile_data.full_name,
        blood_group: profile_data.blood_group,
        country: profile_data.country,
        city: profile_data.city,
        area: profile_data.area,
        status: 'active',
        is_available_to_donate: true,
      });

      if (profileError) {
        console.error('Profile creation error:', profileError);
      }
    }

    // Fetch user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    return successResponse({
      user: {
        id: authData.user.id,
        phone: authData.user.phone,
        profile: profile || null,
      },
      access_token: authData.session.access_token,
      refresh_token: authData.session.refresh_token,
      expires_at: authData.session.expires_at,
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    return errorResponse('An unexpected error occurred', 'SERVER_ERROR', 500);
  }
}
