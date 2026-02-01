'use server';

import { getCollection, Collections, CampaignDocument, ObjectId } from "@/lib/db/mongodb";
import { getFirebaseAuth } from "@/lib/auth/firebase-admin";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { sendCampaignNotification } from "@/lib/onesignal";

// Helper for auth
async function getAuthenticatedUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;
  if (!token) return null;
  try {
    return await getFirebaseAuth().verifySessionCookie(token, true);
  } catch {
    return null;
  }
}

// Get all campaigns (for admin)
export async function getCampaigns(filters?: { status?: string; type?: string }) {
  const collection = await getCollection<CampaignDocument>(Collections.CAMPAIGNS);
  
  const query: any = {};
  if (filters?.status) query.status = filters.status;
  if (filters?.type) query.type = filters.type;
  
  const campaigns = await collection
    .find(query)
    .sort({ priority: -1, end_date: 1, created_at: -1 })
    .toArray();
  
  return campaigns.map(c => ({
    ...c,
    _id: c._id?.toString()
  }));
}

// Get single campaign
export async function getCampaign(id: string) {
  const collection = await getCollection<CampaignDocument>(Collections.CAMPAIGNS);
  const campaign = await collection.findOne({ _id: new ObjectId(id) });
  
  if (!campaign) return null;
  return { ...campaign, _id: campaign._id?.toString() };
}

// Create campaign
export async function createCampaign(data: Partial<CampaignDocument>) {
  const user = await getAuthenticatedUser();
  if (!user) throw new Error("Unauthorized");
  
  const collection = await getCollection<CampaignDocument>(Collections.CAMPAIGNS);
  
  const now = new Date();
  const campaign: Omit<CampaignDocument, '_id'> = {
    title: data.title || '',
    description: data.description || '',
    type: data.type || 'partner_promo',
    banners: data.banners || [],
    sponsor: data.sponsor || { name: '' },
    billing: data.billing || { amount_paid: 0, payment_status: 'pending' },
    target_cities: data.target_cities || [],
    start_date: data.start_date ? new Date(data.start_date) : now,
    end_date: data.end_date ? new Date(data.end_date) : now,
    priority: data.priority || 50,
    is_active: data.is_active ?? false,
    status: data.status || 'draft',
    action: data.action || { type: 'link', value: '', button_text: 'Learn More' },
    views: 0,
    clicks: 0,
    created_at: now,
    updated_at: now,
    created_by: user.uid,
  };
  
  const result = await collection.insertOne(campaign as any);
  const campaignId = result.insertedId.toString();
  
  // Send push notification if campaign is active
  if (campaign.is_active && campaign.status === 'active') {
    try {
      await sendCampaignNotification({
        title: campaign.title,
        description: campaign.description,
        sponsor_name: campaign.sponsor.name,
        banner_url: campaign.banners?.[0]?.url,
        target_cities: campaign.target_cities,
        campaign_id: campaignId,
      });
    } catch (error) {
      console.error('Failed to send campaign notification:', error);
      // Don't fail the campaign creation if notification fails
    }
  }
  
  revalidatePath('/admin/ads');
  
  return { success: true, id: campaignId };
}

// Update campaign
export async function updateCampaign(id: string, data: Partial<CampaignDocument>) {
  const user = await getAuthenticatedUser();
  if (!user) throw new Error("Unauthorized");
  
  const collection = await getCollection<CampaignDocument>(Collections.CAMPAIGNS);
  
  // Remove _id from update data if present
  const { _id, ...updateData } = data as any;
  
  await collection.updateOne(
    { _id: new ObjectId(id) },
    { 
      $set: {
        ...updateData,
        updated_at: new Date()
      }
    }
  );
  
  revalidatePath('/admin/ads');
  return { success: true };
}

// Delete campaign
export async function deleteCampaign(id: string) {
  const user = await getAuthenticatedUser();
  if (!user) throw new Error("Unauthorized");
  
  const collection = await getCollection<CampaignDocument>(Collections.CAMPAIGNS);
  await collection.deleteOne({ _id: new ObjectId(id) });
  
  revalidatePath('/admin/ads');
  return { success: true };
}

// Toggle campaign active status
export async function toggleCampaignStatus(id: string) {
  const user = await getAuthenticatedUser();
  if (!user) throw new Error("Unauthorized");
  
  const collection = await getCollection<CampaignDocument>(Collections.CAMPAIGNS);
  const campaign = await collection.findOne({ _id: new ObjectId(id) });
  
  if (!campaign) throw new Error("Campaign not found");
  
  const newStatus = campaign.status === 'active' ? 'paused' : 'active';
  const isActive = newStatus === 'active';
  
  await collection.updateOne(
    { _id: new ObjectId(id) },
    { $set: { status: newStatus, is_active: isActive, updated_at: new Date() } }
  );
  
  revalidatePath('/admin/ads');
  return { success: true, status: newStatus };
}

// Get campaign types (from system_settings)
export async function getCampaignTypes(): Promise<string[]> {
  const collection = await getCollection<{ _id: string; value: string[] }>('system_settings');
  const doc = await collection.findOne({ _id: 'campaign_types' } as any);
  
  if (!doc) {
    // Return defaults
    return ['lab_offer', 'blood_camp', 'health_checkup', 'partner_promo'];
  }
  return doc.value;
}

// Add new campaign type
export async function addCampaignType(type: string) {
  const user = await getAuthenticatedUser();
  if (!user) throw new Error("Unauthorized");
  
  const collection = await getCollection<{ _id: string; value: string[] }>('system_settings');
  
  await collection.updateOne(
    { _id: 'campaign_types' } as any,
    { 
      $addToSet: { value: type },
      $set: { updated_at: new Date() }
    },
    { upsert: true }
  );
  
  revalidatePath('/admin/ads');
  return { success: true };
}
