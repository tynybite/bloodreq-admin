import { NextRequest } from 'next/server';
import { getCollection } from '@/lib/db/mongodb';
import { successResponse, errorResponse } from '@/lib/api-utils';

interface AdSettingDoc {
  _id: string;
  value: any;
}

// GET /api/ads/config - Return ad platform settings for mobile app
export async function GET(request: NextRequest) {
  try {
    const collection = await getCollection<AdSettingDoc>('system_settings');
    
    // Fetch both AdMob and Meta settings
    const [admobDoc, metaDoc] = await Promise.all([
      collection.findOne({ _id: 'ads_admob' } as any),
      collection.findOne({ _id: 'ads_meta' } as any)
    ]);
    
    const admob = admobDoc?.value || null;
    const meta = metaDoc?.value || null;
    
    // Only return enabled platforms with their IDs
    const config: any = {};
    
    if (admob?.enabled) {
      config.admob = {
        app_id: admob.appId,
        banner_id: admob.bannerId,
        interstitial_id: admob.interstitialId,
        rewarded_id: admob.rewardedId
      };
    }
    
    if (meta?.enabled) {
      config.meta = {
        app_id: meta.appId,
        banner_id: meta.bannerId,
        interstitial_id: meta.interstitialId
      };
    }
    
    return successResponse({ 
      ads_enabled: !!(admob?.enabled || meta?.enabled),
      config 
    });
  } catch (error: any) {
    console.error('Ads config fetch error:', error);
    return errorResponse('Failed to fetch ads config', 'SERVER_ERROR', 500);
  }
}
