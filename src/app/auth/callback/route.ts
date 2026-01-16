import { NextRequest, NextResponse } from 'next/server';

// Auth callback - Firebase handles auth client-side, this is no longer needed
export async function GET(request: NextRequest) {
  // With Firebase, OAuth callbacks are handled client-side
  // Redirect to home page
  return NextResponse.redirect(new URL('/admin', request.url));
}
