import { NextRequest } from 'next/server';
import { successResponse, errorResponse, getAuthUser } from '@/lib/api-utils';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/fundraisers/:id
import { ObjectId } from 'mongodb';
import { getCollection, Collections } from '@/lib/db/mongodb';

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { user, error: authError } = await getAuthUser(request);
    if (authError) return authError;

    const { id } = await params;
    
    if (!ObjectId.isValid(id)) {
      return errorResponse('Invalid Fundraiser ID', 'INVALID_ID', 400);
    }

    const collection = await getCollection(Collections.FUNDRAISERS);
    const fundraiser = await collection.findOne({ _id: new ObjectId(id) });

    if (!fundraiser) {
      return errorResponse('Fundraiser not found', 'NOT_FOUND', 404);
    }

    // Transform _id to id string
    const data = {
      ...fundraiser,
      id: fundraiser._id.toString(),
    };

    return successResponse(data);
  } catch (error) {
    console.error('Error fetching fundraiser:', error);
    return errorResponse('Internal Server Error', 'SERVER_ERROR', 500);
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { user, error: authError } = await getAuthUser(request);
    if (authError) return authError;

    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return errorResponse('Invalid Fundraiser ID', 'INVALID_ID', 400);
    }

    const body = await request.json();
    const collection = await getCollection(Collections.FUNDRAISERS);

    // Prepare update data
    const updateData: any = {
      ...body,
      updated_at: new Date(),
    };

    // If updating status to approved, ensure documents exist (optional enforcement)
    if (body.status === 'approved') {
       const existing = await collection.findOne({ _id: new ObjectId(id) });
       if (!existing?.documents || existing.documents.length === 0) {
          // You might uncomment this if strict backend enforcement is desired, 
          // but for now we trust the caller or allow override.
          // return errorResponse('Cannot approve without documents', 'VALIDATION_ERROR', 400);
       }
    }

    // Convert date strings if present
    if (updateData.deadline) {
      updateData.deadline = new Date(updateData.deadline);
    }
    
    // Remove immutable fields
    delete updateData._id;
    delete updateData.created_at;
    delete updateData.requester_id; // Usually shouldn't change requester

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return errorResponse('Fundraiser not found', 'NOT_FOUND', 404);
    }

    return successResponse({ message: 'Fundraiser updated successfully' });
  } catch (error) {
    console.error('Error updating fundraiser:', error);
    return errorResponse('Internal Server Error', 'SERVER_ERROR', 500);
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { user, error: authError } = await getAuthUser(request);
    if (authError) return authError;

    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return errorResponse('Invalid Fundraiser ID', 'INVALID_ID', 400);
    }

    const collection = await getCollection(Collections.FUNDRAISERS);
    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return errorResponse('Fundraiser not found', 'NOT_FOUND', 404);
    }

    return successResponse({ message: 'Fundraiser deleted successfully' });
  } catch (error) {
    console.error('Error deleting fundraiser:', error);
    return errorResponse('Internal Server Error', 'SERVER_ERROR', 500);
  }
}
