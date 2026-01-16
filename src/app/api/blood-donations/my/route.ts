import { NextRequest } from 'next/server';
import { getCollection, Collections } from '@/lib/db/mongodb';
import { successResponse, errorResponse, getAuthUser } from '@/lib/api-utils';

// GET /api/blood-donations/my - Get user's donation history
export async function GET(request: NextRequest) {
  const { user, error: authError } = await getAuthUser(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);

    const donationsCollection = await getCollection(Collections.DONATIONS);
    const requestsCollection = await getCollection(Collections.BLOOD_REQUESTS);

    const filter: any = { donor_id: user!.id };
    if (status) filter.status = status;

    const offset = (page - 1) * limit;
    const total = await donationsCollection.countDocuments(filter);
    const donations = await donationsCollection
      .find(filter)
      .sort({ created_at: -1 })
      .skip(offset)
      .limit(limit)
      .toArray();

    // Fetch request details for each donation
    const donationsWithDetails = await Promise.all(
      donations.map(async (d: any) => {
        const request = await requestsCollection.findOne({ _id: d.request_id });
        return {
          id: d._id?.toString(),
          status: d.status,
          message: d.message,
          created_at: d.created_at,
          request: request ? {
            id: request._id?.toString(),
            patient_name: request.patient_name,
            blood_group: request.blood_group,
            hospital: request.hospital,
            city: request.city,
          } : null,
        };
      })
    );

    return successResponse({
      donations: donationsWithDetails,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get my donations error:', error);
    return errorResponse('An unexpected error occurred', 'SERVER_ERROR', 500);
  }
}
