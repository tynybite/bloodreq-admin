import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getCollection, Collections, ObjectId } from '@/lib/db/mongodb';
import { successResponse, errorResponse, getAuthUser, parseBody, bloodGroupSchema } from '@/lib/api-utils';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/blood-donations/:id - Get donation details
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  
  const { user, error: authError } = await getAuthUser(request);
  if (authError) return authError;

  try {
    const donationsCollection = await getCollection(Collections.DONATIONS);
    const requestsCollection = await getCollection(Collections.BLOOD_REQUESTS);
    const usersCollection = await getCollection(Collections.USERS);

    const donation = await donationsCollection.findOne({ _id: new ObjectId(id) });

    if (!donation) {
      return errorResponse('Donation not found', 'NOT_FOUND', 404);
    }

    // Only donor or requester can see details
    const request = await requestsCollection.findOne({ _id: new ObjectId(donation.request_id) });
    if (donation.donor_id !== user!.id && request?.requester_id !== user!.id) {
      return errorResponse('Access denied', 'FORBIDDEN', 403);
    }

    const donor = await usersCollection.findOne({ _id: donation.donor_id });

    return successResponse({
      id: donation._id?.toString(),
      status: donation.status,
      message: donation.message,
      created_at: donation.created_at,
      donor: donor ? {
        id: donor._id,
        full_name: donor.full_name,
        blood_group: donor.blood_group,
        phone_number: donor.phone_number,
      } : null,
      request: request ? {
        id: request._id?.toString(),
        patient_name: request.patient_name,
        blood_group: request.blood_group,
        hospital: request.hospital,
      } : null,
    });
  } catch (error) {
    console.error('Get donation error:', error);
    return errorResponse('An unexpected error occurred', 'SERVER_ERROR', 500);
  }
}

// PATCH /api/blood-donations/:id - Update donation status
const updateDonationSchema = z.object({
  status: z.enum(['accepted', 'completed', 'cancelled']),
});

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  
  const { user, error: authError } = await getAuthUser(request);
  if (authError) return authError;

  const { data, error: parseError } = await parseBody(request, updateDonationSchema);
  if (parseError) return parseError;

  try {
    const donationsCollection = await getCollection(Collections.DONATIONS);
    const requestsCollection = await getCollection(Collections.BLOOD_REQUESTS);

    const donation = await donationsCollection.findOne({ _id: new ObjectId(id) });
    if (!donation) {
      return errorResponse('Donation not found', 'NOT_FOUND', 404);
    }

    const bloodRequest = await requestsCollection.findOne({ _id: new ObjectId(donation.request_id) });

    // Only requester can accept/complete, donor can cancel
    if (data.status === 'cancelled' && donation.donor_id !== user!.id) {
      return errorResponse('Only donor can cancel', 'FORBIDDEN', 403);
    }
    if (['accepted', 'completed'].includes(data.status) && bloodRequest?.requester_id !== user!.id) {
      return errorResponse('Only requester can accept/complete', 'FORBIDDEN', 403);
    }

    const result = await donationsCollection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { status: data.status, updated_at: new Date() } },
      { returnDocument: 'after' }
    );

    return successResponse({
      id: result?._id?.toString(),
      status: result?.status,
    }, `Donation ${data.status}`);
  } catch (error) {
    console.error('Update donation error:', error);
    return errorResponse('An unexpected error occurred', 'SERVER_ERROR', 500);
  }
}
