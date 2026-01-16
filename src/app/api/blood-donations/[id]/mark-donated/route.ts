import { NextRequest } from 'next/server';
import { getCollection, Collections, ObjectId } from '@/lib/db/mongodb';
import { successResponse, errorResponse, getAuthUser } from '@/lib/api-utils';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/blood-donations/:id/mark-donated - Mark donation as completed
export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  
  const { user, error: authError } = await getAuthUser(request);
  if (authError) return authError;

  try {
    const donationsCollection = await getCollection(Collections.DONATIONS);
    const requestsCollection = await getCollection(Collections.BLOOD_REQUESTS);

    const donation = await donationsCollection.findOne({ _id: new ObjectId(id) });
    if (!donation) {
      return errorResponse('Donation not found', 'NOT_FOUND', 404);
    }

    const bloodRequest = await requestsCollection.findOne({ _id: new ObjectId(donation.request_id) });
    if (bloodRequest?.requester_id !== user!.id) {
      return errorResponse('Only requester can mark as donated', 'FORBIDDEN', 403);
    }

    await donationsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { status: 'completed', completed_at: new Date(), updated_at: new Date() } }
    );

    return successResponse({ status: 'completed' }, 'Donation marked as completed. Thank you!');
  } catch (error) {
    console.error('Mark donated error:', error);
    return errorResponse('An unexpected error occurred', 'SERVER_ERROR', 500);
  }
}
