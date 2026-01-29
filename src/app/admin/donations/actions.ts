'use server';

import { getCollection, Collections, DonationDocument, UserDocument, FundraiserDocument, BloodRequestDocument } from "@/lib/db/mongodb";
import { revalidatePath } from "next/cache";
import { ObjectId } from "mongodb";

export type FinancialDonation = {
  id: string;
  amount: number;
  currency: string;
  payment_method: string;
  transaction_id: string | null;
  donor_name: string | null;
  donor_phone: string | null;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
  fundraiser?: {
    title: string;
  };
};

export type BloodDonation = {
  id: string;
  status: 'offered' | 'accepted' | 'completed';
  created_at: string;
  request?: {
    patient_name: string;
    blood_group: string;
    hospital: string;
  };
  donor?: {
    full_name: string;
    phone_number: string;
    avatar_url: string | null;
  };
};

// Financial donations are stored in the same DONATIONS collection
// but we filter by fundraiser_id being present
export async function getFinancialDonations() {
  const donationsCollection = await getCollection<DonationDocument>(Collections.DONATIONS);
  const fundraisersCollection = await getCollection<FundraiserDocument>(Collections.FUNDRAISERS);
  
  // Get donations that have fundraiser_id (financial donations to fundraisers)
  const donationsRaw = await donationsCollection.find({ fundraiser_id: { $exists: true } })
    .sort({ created_at: -1 })
    .toArray();

  // Manually join with fundraisers
  const results = await Promise.all(donationsRaw.map(async (d: any) => {
    let fundraiser = null;
    if (d.fundraiser_id) {
      try {
        const f = await fundraisersCollection.findOne({ _id: new ObjectId(d.fundraiser_id.toString()) });
        if (f) fundraiser = { title: f.title };
      } catch (e) { /* ignore */ }
    }
    return {
      id: d._id?.toString() || '',
      amount: d.amount || 0,
      currency: 'BDT',
      payment_method: d.payment_method || 'unknown',
      transaction_id: d.transaction_id || null,
      donor_name: d.donor_name || null,
      donor_phone: null,
      status: d.status || 'pending',
      created_at: d.created_at?.toISOString() || new Date().toISOString(),
      fundraiser
    } as FinancialDonation;
  }));

  return results;
}

// Blood donations - these are offers to fulfill blood requests
export async function getBloodDonations() {
  const donationsCollection = await getCollection<DonationDocument>(Collections.DONATIONS);
  const requestsCollection = await getCollection<BloodRequestDocument>(Collections.BLOOD_REQUESTS);
  const usersCollection = await getCollection<UserDocument>(Collections.USERS);

  // Blood donations have request_id (link to blood_requests)
  const donationsRaw = await donationsCollection.find({ request_id: { $exists: true } })
    .sort({ created_at: -1 })
    .toArray();

  const results = await Promise.all(donationsRaw.map(async (d) => {
    let request = null;
    let donor = null;

    if (d.request_id) {
      try {
        const r = await requestsCollection.findOne({ _id: new ObjectId(d.request_id.toString()) });
        if (r) request = { patient_name: r.patient_name, blood_group: r.blood_group, hospital: r.hospital };
      } catch (e) { /* ignore */ }
    }

    if (d.donor_id) {
      const u = await usersCollection.findOne({ _id: d.donor_id.toString() } as any);
      if (u) donor = { full_name: u.full_name || '', phone_number: u.phone_number || '', avatar_url: u.avatar_url || null };
    }

    return {
      id: d._id?.toString() || '',
      status: d.status || 'offered',
      created_at: d.created_at?.toISOString() || new Date().toISOString(),
      request,
      donor
    } as BloodDonation;
  }));

  return results;
}

export async function verifyFinancialDonation(id: string) {
  const collection = await getCollection<DonationDocument>(Collections.DONATIONS);
  
  await collection.updateOne(
    { _id: new ObjectId(id) },
    { $set: { status: 'completed' } }
  );

  revalidatePath('/admin/donations');
}

export async function failFinancialDonation(id: string) {
  const collection = await getCollection<DonationDocument>(Collections.DONATIONS);
  
  // Using 'rejected' since 'failed' is not in DonationDocument status type
  await collection.updateOne(
    { _id: new ObjectId(id) },
    { $set: { status: 'rejected' } }
  );

  revalidatePath('/admin/donations');
}
