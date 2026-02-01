import { NextRequest } from 'next/server';
import { getCollection, Collections, CampaignDocument } from '@/lib/db/mongodb';
import { successResponse, errorResponse } from '@/lib/api-utils';

// GET /api/campaigns - Public endpoint for mobile app
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    const collection = await getCollection<CampaignDocument>(Collections.CAMPAIGNS);
    
    const now = new Date();
    
    // Build query for active campaigns
    const query: any = {
      is_active: true,
      status: 'active',
      start_date: { $lte: now },
      end_date: { $gte: now }
    };
    
    // City targeting - include campaigns that target this city or have no targeting (global)
    if (city) {
      query.$or = [
        { target_cities: city },
        { target_cities: { $size: 0 } },
        { target_cities: { $exists: false } }
      ];
    }
    
    // Fetch campaigns
    const campaigns = await collection
      .find(query)
      .sort({ priority: -1, end_date: 1 })
      .limit(limit)
      .toArray();
    
    // Calculate urgency boost for ending-soon campaigns
    const campaignsWithUrgency = campaigns.map(c => {
      const daysUntilEnd = Math.ceil((new Date(c.end_date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const urgencyBoost = daysUntilEnd <= 3 ? 20 : daysUntilEnd <= 7 ? 10 : 0;
      
      return {
        id: c._id?.toString(),
        title: c.title,
        description: c.description,
        type: c.type,
        banners: c.banners,
        sponsor: {
          name: c.sponsor.name,
          logo_url: c.sponsor.logo_url
        },
        action: c.action,
        start_date: c.start_date,
        end_date: c.end_date,
        priority: c.priority + urgencyBoost, // Boost priority for ending soon
        days_until_end: daysUntilEnd
      };
    });
    
    // Re-sort with urgency boost applied
    campaignsWithUrgency.sort((a, b) => b.priority - a.priority);
    
    return successResponse({ campaigns: campaignsWithUrgency });
  } catch (error: any) {
    console.error('Campaigns fetch error:', error);
    return errorResponse('Failed to fetch campaigns', 'SERVER_ERROR', 500);
  }
}
