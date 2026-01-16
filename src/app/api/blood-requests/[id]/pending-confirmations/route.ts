import { NextRequest } from 'next/server';
import { getCollection, Collections, ObjectId } from '@/lib/db/mongodb';
import { successResponse, errorResponse, getAuthUser } from '@/lib/api-utils';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/blood-requests/:id/pending-confirmations
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  
  const { user, error: authError } = await getAuthUser(request);
  if (authError) return authError;

  try {
    const donationsCollection = await getCollection(Collections.DONATIONS);
    const usersCollection = await getCollection(Collections.USERS);

    const pendingDonations = await donationsCollection
      .find({ request_id: id, status: 'offered' })
      .toArray();

    const donationsWithDonorInfo = await Promise.all(
      pendingDonations.map(async (d: any) => {
        const donor = await usersCollection.findOne({ _id: d.donor_id });
        return {
          id: d._id?.toString(),
          status: d.status,
          message: d.message,
          created_at: d.created_at,
          donor: donor ? {
            id: donor._id,
            full_name: donor.full_name,
            blood_group: donor.blood_group,
            phone_number: donor.phone_number,
          } : null,
        };
      })
    );

    return successResponse({
      pending_confirmations: donationsWithDonorInfo,
      count: donationsWithDonorInfo.length,
    });
  } catch (error) {
    console.error('Get pending confirmations error:', error);
    return errorResponse('An unexpected error occurred', 'SERVER_ERROR', 500);
  }
}
