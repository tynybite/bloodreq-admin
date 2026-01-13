import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

// ============================================
// Response Helpers
// ============================================

export interface ApiResponse<T = any> {
  success: boolean;
  data: T | null;
  message: string;
  error: {
    code: string;
    details?: string;
  } | null;
}

export function successResponse<T>(
  data: T,
  message = 'Success',
  status = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
      error: null,
    },
    { status }
  );
}

export function errorResponse(
  message: string,
  code = 'ERROR',
  status = 400,
  details?: string
): NextResponse<ApiResponse<null>> {
  return NextResponse.json(
    {
      success: false,
      data: null,
      message,
      error: {
        code,
        details,
      },
    },
    { status }
  );
}

// ============================================
// Request Parsing & Validation
// ============================================

export async function parseBody<T>(
  request: Request,
  schema: z.ZodSchema<T>
): Promise<{ data: T; error: null } | { data: null; error: NextResponse }> {
  try {
    const body = await request.json();
    const result = schema.safeParse(body);

    if (!result.success) {
      const errors = result.error.issues.map((e) => `${String(e.path.join('.'))}: ${e.message}`).join(', ');
      return {
        data: null,
        error: errorResponse(errors, 'VALIDATION_ERROR', 400),
      };
    }

    return { data: result.data, error: null };
  } catch (e) {
    return {
      data: null,
      error: errorResponse('Invalid JSON body', 'PARSE_ERROR', 400),
    };
  }
}

// ============================================
// Auth Helpers
// ============================================

export async function getAuthUser(request: Request) {
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { user: null, error: errorResponse('Missing or invalid authorization header', 'AUTH_REQUIRED', 401) };
  }

  const token = authHeader.replace('Bearer ', '');
  const supabase = await createClient();

  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return { user: null, error: errorResponse('Invalid or expired token', 'AUTH_EXPIRED', 401) };
  }

  return { user, error: null };
}

// ============================================
// Common Validation Schemas
// ============================================

export const bloodGroupSchema = z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']);

export const phoneSchema = z.string().regex(/^\+[1-9]\d{6,14}$/, 'Invalid phone number format (E.164)');

export const emailSchema = z.string().email('Invalid email format');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[a-zA-Z]/, 'Password must contain a letter')
  .regex(/[0-9]/, 'Password must contain a number');
