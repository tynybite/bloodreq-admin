import { NextRequest } from 'next/server';
import { successResponse, errorResponse, getAuthUser } from '@/lib/api-utils';

// Fundraisers - TODO: Migrate to MongoDB when needed
export async function GET(request: NextRequest) {
  const { user, error: authError } = await getAuthUser(request);
  if (authError) return authError;

  // Return empty list for now - to be migrated when fundraisers feature is needed
  return successResponse({
    fundraisers: [],
    pagination: { page: 1, limit: 20, total: 0, total_pages: 0 },
  });
}

// Schema for creating a fundraiser
import { z } from 'zod';
import { getCollection, Collections } from '@/lib/db/mongodb';

const createFundraiserSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  patient_name: z.string().min(2, 'Patient name is required'),
  hospital: z.string().optional(),
  amount_needed: z.number().min(100, 'Amount needed must be at least 100'),
  description: z.string().optional(),
  deadline: z.string().optional(), // ISO date string
  documents: z.array(z.object({
    url: z.string().url().or(z.string().startsWith('data:')), // Accept URL or Base64 data URI
    type: z.string().optional(),
    name: z.string().optional()
  })).optional().default([])
});

export async function POST(request: NextRequest) {
  try {
    const { user, error: authError } = await getAuthUser(request);
    if (authError) return authError;

    const body = await request.json();
    const result = createFundraiserSchema.safeParse(body);

    if (!result.success) {
      const errors = result.error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
      return errorResponse(errors, 'VALIDATION_ERROR', 400);
    }

    const data = result.data;
    const collection = await getCollection(Collections.FUNDRAISERS);

    // Limit document size/count if needed
    if (data.documents && data.documents.length > 5) {
       return errorResponse('Too many documents (max 5)', 'VALIDATION_ERROR', 400);
    }
    
    // Create new fundraiser
    const newFundraiser = {
      ...data,
      amount_needed: Number(data.amount_needed), // Ensure number
      amount_raised: 0,
      status: 'pending',
      requester_id: user!.id,
      deadline: data.deadline ? new Date(data.deadline) : undefined,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const insertResult = await collection.insertOne(newFundraiser);

    return successResponse({
      id: insertResult.insertedId.toString(),
      message: 'Fundraiser created successfully',
      status: 'pending'
    }, 'Fundraiser created successfully', 201);

  } catch (error: any) {
    console.error('Error creating fundraiser:', error);
    return errorResponse(
      'Failed to create fundraiser', 
      'SERVER_ERROR', 
      500, 
      (error as Error).message
    );
  }
}
