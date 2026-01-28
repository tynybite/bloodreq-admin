import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getCollection, Collections, ObjectId } from '@/lib/db/mongodb';
import { 
  successResponse, 
  errorResponse, 
  getAuthUser,
  parseBody,
  bloodGroupSchema
} from '@/lib/api-utils';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/blood-requests/:id - Get blood request details
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  
  const { user, error: authError } = await getAuthUser(request);
  if (authError) return authError;

  try {
    const requestsCollection = await getCollection(Collections.BLOOD_REQUESTS);
    const usersCollection = await getCollection(Collections.USERS);
    const donationsCollection = await getCollection(Collections.DONATIONS);

    // Try Querying by ObjectId first, then String
    let bloodRequest;
    try {
      bloodRequest = await requestsCollection.findOne({ _id: new ObjectId(id) });
    } catch (e) {
      // If id is not a valid ObjectId, try as string
      // @ts-ignore - Allow querying by string ID for legacy data
      bloodRequest = await requestsCollection.findOne({ _id: id });
    }

    if (!bloodRequest) {
      // Final attempt: explicit string query in case catch didn't catch logical mismatch
      // @ts-ignore - Allow querying by string ID for legacy data
      bloodRequest = await requestsCollection.findOne({ _id: id });
    }

    if (!bloodRequest) {
      return errorResponse('Blood request not found', 'NOT_FOUND', 404);
    }

    // Normalize IDs for comparison
    const requesterId = bloodRequest.requester_id.toString();
    const currentUserId = user!.id.toString();

    // Only show approved/in_progress requests to non-owners
    // Owners (requesterId === currentUserId) can see everything
    if (requesterId !== currentUserId && 
        !['pending', 'approved', 'in_progress', 'completed'].includes(bloodRequest.status)) {
      console.log(`Access denied: User ${currentUserId} is not owner ${requesterId} and status is ${bloodRequest.status}`);
      return errorResponse('Blood request not found', 'NOT_FOUND', 404);
    }

    // Fetch requester info
    const requester = await usersCollection.findOne({ _id: bloodRequest.requester_id });

    // Fetch donors who have offered
    const donorDocs = await donationsCollection
      .find({ request_id: id })
      .sort({ created_at: -1 })
      .toArray();

    // Get donor details
    const donors = await Promise.all(
      donorDocs.map(async (d: any) => {
        const donor = await usersCollection.findOne({ _id: d.donor_id });
        return {
          id: d._id?.toString(),
          status: d.status,
          created_at: d.created_at,
          donor: donor ? {
            id: donor._id,
            full_name: donor.full_name,
            avatar_url: donor.avatar_url,
            blood_group: donor.blood_group,
          } : null,
        };
      })
    );

    return successResponse({
      id: bloodRequest._id?.toString(),
      request_type: 'blood_request',
      ...bloodRequest,
      _id: undefined,
      // Ensure specific fields key names match mobile expectations
      patient_age: bloodRequest.patient_age,
      alternate_contact: bloodRequest.alternate_contact,
      notes: bloodRequest.notes || bloodRequest.admin_notes,
      updated_at: bloodRequest.updated_at,
      location: bloodRequest.city, // Mobile expects 'location' string often as city/address
      requester: requester ? {
        id: requester._id,
        full_name: requester.full_name,
        avatar_url: requester.avatar_url,
        phone_number: requester.phone_number,
      } : null,
      donors,
      donors_count: donors.length,
    });
  } catch (error) {
    console.error('Get blood request error:', error);
    return errorResponse('An unexpected error occurred', 'SERVER_ERROR', 500);
  }
}

// PATCH /api/blood-requests/:id - Update blood request
const updateRequestSchema = z.object({
  patient_name: z.string().min(2).optional(),
  patient_age: z.number().int().min(0).max(120).optional(),
  blood_group: bloodGroupSchema.optional(),
  units: z.number().int().min(1).max(10).optional(),
  hospital: z.string().min(2).optional(),
  address: z.string().optional(),
  city: z.string().min(2).optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  urgency: z.enum(['critical', 'urgent', 'planned']).optional(),
  contact_number: z.string().min(10).optional(),
  alternate_contact: z.string().optional(),
  notes: z.string().max(500).optional(),
});

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  
  const { user, error: authError } = await getAuthUser(request);
  if (authError) return authError;

  const { data, error: parseError } = await parseBody(request, updateRequestSchema);
  if (parseError) return parseError;

  try {
    const requestsCollection = await getCollection(Collections.BLOOD_REQUESTS);

    const existing = await requestsCollection.findOne({ _id: new ObjectId(id) });

    if (!existing) {
      return errorResponse('Blood request not found', 'NOT_FOUND', 404);
    }

    if (existing.requester_id !== user!.id) {
      return errorResponse('You can only edit your own requests', 'FORBIDDEN', 403);
    }

    if (['completed', 'cancelled'].includes(existing.status)) {
      return errorResponse('Cannot edit a completed or cancelled request', 'FORBIDDEN', 403);
    }

    const result = await requestsCollection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { ...data, updated_at: new Date() } },
      { returnDocument: 'after' }
    );

    return successResponse({
      id: result?._id?.toString(),
      ...result,
      _id: undefined,
    }, 'Blood request updated successfully');
  } catch (error) {
    console.error('Update blood request error:', error);
    return errorResponse('An unexpected error occurred', 'SERVER_ERROR', 500);
  }
}

// DELETE /api/blood-requests/:id - Cancel blood request
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  
  const { user, error: authError } = await getAuthUser(request);
  if (authError) return authError;

  try {
    const requestsCollection = await getCollection(Collections.BLOOD_REQUESTS);

    const existing = await requestsCollection.findOne({ _id: new ObjectId(id) });

    if (!existing) {
      return errorResponse('Blood request not found', 'NOT_FOUND', 404);
    }

    if (existing.requester_id !== user!.id) {
      return errorResponse('You can only cancel your own requests', 'FORBIDDEN', 403);
    }

    if (['completed', 'cancelled'].includes(existing.status)) {
      return errorResponse('Request is already ' + existing.status, 'CONFLICT', 409);
    }

    await requestsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { status: 'cancelled', updated_at: new Date() } }
    );

    return successResponse({ cancelled: true }, 'Blood request cancelled successfully');
  } catch (error) {
    console.error('Delete blood request error:', error);
    return errorResponse('An unexpected error occurred', 'SERVER_ERROR', 500);
  }
}
