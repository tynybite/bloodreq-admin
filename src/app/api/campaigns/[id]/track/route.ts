import { NextRequest } from 'next/server';
import { getCollection, Collections, CampaignDocument, ObjectId } from '@/lib/db/mongodb';
import { successResponse, errorResponse } from '@/lib/api-utils';

// POST /api/campaigns/[id]/track - Track view or click
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { action } = body; // 'view' or 'click'
    
    if (!action || !['view', 'click'].includes(action)) {
      return errorResponse('Invalid action. Must be "view" or "click"', 'VALIDATION_ERROR', 400);
    }
    
    const collection = await getCollection<CampaignDocument>(Collections.CAMPAIGNS);
    
    const updateField = action === 'view' ? 'views' : 'clicks';
    
    await collection.updateOne(
      { _id: new ObjectId(id) },
      { $inc: { [updateField]: 1 } }
    );
    
    return successResponse({ tracked: true });
  } catch (error: any) {
    console.error('Campaign track error:', error);
    return errorResponse('Failed to track', 'SERVER_ERROR', 500);
  }
}
