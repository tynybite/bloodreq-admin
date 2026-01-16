import { type NextRequest, NextResponse } from 'next/server'

export async function proxy(request: NextRequest) {
  const session = request.cookies.get('session');

  // Basic check for admin routes - existence of session cookie
  // Full verification happens in AdminLayout (Server Component) or API routes
  if (request.nextUrl.pathname.startsWith('/admin') && !session) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
