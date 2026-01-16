import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { currency } = await request.json();
    
    if (!currency || !['USD', 'BDT', 'INR', 'EUR'].includes(currency)) {
      return NextResponse.json({ error: 'Invalid currency' }, { status: 400 });
    }

    const cookieStore = await cookies();
    cookieStore.set('currency', currency, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });

    return NextResponse.json({ success: true, currency });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to set currency' }, { status: 500 });
  }
}

export async function GET() {
  const cookieStore = await cookies();
  const currency = cookieStore.get('currency')?.value || 'USD';
  
  return NextResponse.json({ currency });
}
