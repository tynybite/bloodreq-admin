import { NextRequest } from 'next/server';
import { getCollection, Collections } from '@/lib/db/mongodb';
import { successResponse, errorResponse, getAuthUser } from '@/lib/api-utils';

// GET /api/blood-requests/my - Get user's own blood requests
export async function GET(request: NextRequest) {
  const { user, error: authError } = await getAuthUser(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);

    const requestsCollection = await getCollection(Collections.BLOOD_REQUESTS);
    const donationsCollection = await getCollection(Collections.DONATIONS);

    const filter: any = { requester_id: user!.id };
    if (status) filter.status = status;

    const offset = (page - 1) * limit;
    const total = await requestsCollection.countDocuments(filter);
    const requests = await requestsCollection
      .find(filter)
      .sort({ created_at: -1 })
      .skip(offset)
      .limit(limit)
      .toArray();

    // Get donation counts
    const requestsWithStats = await Promise.all(
      requests.map(async (req: any) => {
        const donorsCount = await donationsCollection.countDocuments({
          request_id: req._id?.toString(),
        });
        return {
          id: req._id?.toString(),
          ...req,
          _id: undefined,
          donors_count: donorsCount,
        };
      })
    );

    return successResponse({
      requests: requestsWithStats,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get my requests error:', error);
    return errorResponse('An unexpected error occurred', 'SERVER_ERROR', 500);
  }
}
