import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { 
  successResponse, 
  errorResponse, 
  parseBody, 
  emailSchema, 
  passwordSchema, 
  phoneSchema, 
  bloodGroupSchema 
} from '@/lib/api-utils';

// Validation schema for email signup
const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  full_name: z.string().min(2, 'Full name is required'),
  phone_number: phoneSchema,
  blood_group: bloodGroupSchema,
  country: z.string().min(2, 'Country is required'),
  city: z.string().min(2, 'City is required'),
  area: z.string().optional(),
});

export async function POST(request: NextRequest) {
  // Parse and validate request body
  const { data, error: parseError } = await parseBody(request, signupSchema);
  if (parseError) return parseError;

  const { email, password, full_name, phone_number, blood_group, country, city, area } = data;

  try {
    const supabase = await createClient();

    // Sign up with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name,
          phone_number,
          blood_group,
          country,
          city,
          area,
        },
      },
    });

    if (authError) {
      // Handle specific Supabase auth errors
      if (authError.message.includes('already registered')) {
        return errorResponse('An account with this email already exists', 'USER_EXISTS', 409);
      }
      return errorResponse(authError.message, 'AUTH_ERROR', 400);
    }

    if (!authData.user) {
      return errorResponse('Failed to create user', 'AUTH_ERROR', 500);
    }

    // Create profile in profiles table
    // Note: This can also be done via a database trigger on auth.users insert
    const { error: profileError } = await supabase.from('profiles').insert({
      id: authData.user.id,
      full_name,
      phone_number,
      blood_group,
      country,
      city,
      area,
      status: 'active',
      is_available_to_donate: true,
    });

    if (profileError) {
      console.error('Profile creation error:', profileError);
      // Don't fail the signup - profile can be created later
    }

    return successResponse(
      {
        user: {
          id: authData.user.id,
          email: authData.user.email,
        },
        session: authData.session,
      },
      'Account created. Please verify your email.',
      201
    );
  } catch (error) {
    console.error('Signup error:', error);
    return errorResponse('An unexpected error occurred', 'SERVER_ERROR', 500);
  }
}
