import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { locale } = await request.json();
  
  const response = NextResponse.json({ success: true });
  
  // Set locale cookie
  response.cookies.set('locale', locale, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sameSite: 'lax',
  });
  
  return response;
}
