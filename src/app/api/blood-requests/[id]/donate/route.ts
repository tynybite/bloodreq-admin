import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getCollection, Collections, ObjectId, BloodRequestDocument, UserDocument, DonationDocument } from '@/lib/db/mongodb';
import { successResponse, errorResponse, getAuthUser, parseBody } from '@/lib/api-utils';

interface RouteParams {
  params: Promise<{ id: string }>;
}

const donateSchema = z.object({
  message: z.string().optional(),
});

// POST /api/blood-requests/:id/donate - Offer to donate
export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  
  const { user, error: authError } = await getAuthUser(request);
  if (authError) return authError;

  const { data, error: parseError } = await parseBody(request, donateSchema);
  if (parseError) return parseError;

  try {
    const requestsCollection = await getCollection<BloodRequestDocument>(Collections.BLOOD_REQUESTS);
    const donationsCollection = await getCollection<DonationDocument>(Collections.DONATIONS);
    const usersCollection = await getCollection<UserDocument>(Collections.USERS);

    // 1. Check if request exists and is active
    const bloodRequest = await requestsCollection.findOne({ _id: new ObjectId(id) });
    if (!bloodRequest) {
      return errorResponse('Blood request not found', 'NOT_FOUND', 404);
    }

    if (bloodRequest.status !== 'pending' && bloodRequest.status !== 'in_progress') {
      return errorResponse('Blood request is no longer accepting donations', 'CONFLICT', 409);
    }

    if (bloodRequest.requester_id === user!.id) {
      return errorResponse('You cannot donate to your own request', 'CONFLICT', 409);
    }

    // 2. Check if user is eligible (basic check)
    const donor = await usersCollection.findOne({ _id: user!.id });
    if (!donor) {
      return errorResponse('Donor profile not found', 'NOT_FOUND', 404);
    }

    if (!donor.is_available_to_donate) {
      // return errorResponse('Please update your availability status to donate', 'CONFLICT', 409);
      // Optional: Auto-update availability or just warn
    }

    // 3. Check for existing donation offer
    const existingDonation = await donationsCollection.findOne({
      request_id: id,
      donor_id: user!.id,
      status: { $in: ['offered', 'accepted', 'completed'] }
    });

    if (existingDonation) {
      return errorResponse('You have already offered to donate for this request', 'CONFLICT', 409);
    }

    // 4. Create donation record
    const newDonation: DonationDocument = {
      // _id auto-generated
      request_id: id,
      donor_id: user!.id,
      status: 'offered',
      message: data.message,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const result = await donationsCollection.insertOne(newDonation as any);

    // 5. Update request status to in_progress if it was pending
    if (bloodRequest.status === 'pending') {
      await requestsCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { status: 'in_progress', updated_at: new Date() } }
      );
    }

    return successResponse({
      id: result.insertedId.toString(),
      status: 'offered',
      request_id: id,
    }, 'Donation offer sent successfully', 201);
  } catch (error) {
    console.error('Donate error:', error);
    return errorResponse('An unexpected error occurred', 'SERVER_ERROR', 500);
  }
}
