import { NextRequest } from 'next/server';
import { successResponse, getAuthUser } from '@/lib/api-utils';

// GET /api/payments/methods
export async function GET(request: NextRequest) {
  const { user, error: authError } = await getAuthUser(request);
  if (authError) return authError;

  return successResponse({
    methods: [
      { id: 'bkash', name: 'bKash', enabled: true },
      { id: 'nagad', name: 'Nagad', enabled: true },
      { id: 'card', name: 'Card', enabled: false },
    ],
  });
}
