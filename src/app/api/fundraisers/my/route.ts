import { NextRequest } from 'next/server';
import { successResponse, getAuthUser, errorResponse } from '@/lib/api-utils';
import { getCollection, Collections, FundraiserDocument } from '@/lib/db/mongodb';

// GET /api/fundraisers/my
export async function GET(request: NextRequest) {
  try {
    const { user, error: authError } = await getAuthUser(request);
    if (authError) return authError;

    // Parse pagination params
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const collection = await getCollection<FundraiserDocument>(Collections.FUNDRAISERS);
    
    // Query for fundraisers created by the current user
    const query = { requester_id: user!.id };

    const total = await collection.countDocuments(query);
    const total_pages = Math.ceil(total / limit);

    const fundraisers = await collection
      .find(query)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    // Map _id to id for frontend consistency if needed, though usually handled by serialization
    const mappedFundraisers = fundraisers.map(f => ({
      ...f,
      id: f._id!.toString(),
      _id: undefined // Optional: remove internal _id
    }));

    return successResponse({
      fundraisers: mappedFundraisers,
      pagination: { 
        page, 
        limit, 
        total, 
        total_pages 
      },
    });
  } catch (error) {
    console.error('Error fetching my fundraisers:', error);
    return errorResponse(
      'Failed to fetch my fundraisers', 
      'DB_ERROR', 
      500, 
      (error as Error).message || 'Unknown error'
    );
  }
}
