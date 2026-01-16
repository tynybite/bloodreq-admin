
import { NextRequest, NextResponse } from 'next/server';
import { successResponse } from '@/lib/api-utils';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  cookieStore.delete('session');
  
  return successResponse({ success: true }, 'Signed out successfully');
}
