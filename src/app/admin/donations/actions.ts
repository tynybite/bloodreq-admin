'use server';

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

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

export async function getFinancialDonations() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('donations')
    .select(`
      *,
      fundraiser:fundraisers(title)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching financial donations:', error);
    return [];
  }

  return data as FinancialDonation[];
}

export async function getBloodDonations() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('blood_donations')
    .select(`
      *,
      request:blood_requests(patient_name, blood_group, hospital),
      donor:profiles(full_name, phone_number, avatar_url)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching blood donations:', error);
    return [];
  }

  return data as BloodDonation[];
}

export async function verifyFinancialDonation(id: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('donations')
    .update({ status: 'completed' })
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/admin/donations');
}

export async function failFinancialDonation(id: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('donations')
    .update({ status: 'failed' })
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/admin/donations');
}
