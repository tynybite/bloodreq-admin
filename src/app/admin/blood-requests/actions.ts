'use server';

import { getCollection, Collections, BloodRequestDocument } from "@/lib/db/mongodb";
import { getFirebaseAuth } from "@/lib/auth/firebase-admin";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { notifyBloodRequest } from "@/app/admin/notifications/actions";
import { ObjectId } from "mongodb";

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

export async function approveRequest(requestId: string, currentData: any) {
  const user = await getAuthenticatedUser();
  if (!user) throw new Error("Unauthorized");

  const collection = await getCollection<BloodRequestDocument>(Collections.BLOOD_REQUESTS);
  
  await collection.updateOne(
    { _id: new ObjectId(requestId) },
    { 
      $set: { 
        status: 'approved',
        admin_notes: currentData?.admin_notes,
        patient_name: currentData?.patient_name,
        hospital: currentData?.hospital,
        units: currentData?.units,
        contact_number: currentData?.contact_number,
        updated_by: user.uid,
        updated_at: new Date()
      }
    }
  );

  revalidatePath('/admin/blood-requests');
  revalidatePath('/admin/dashboard');
  return { success: true };
}

export async function createRequest(data: any) {
  const user = await getAuthenticatedUser();
  if (!user) throw new Error("Unauthorized");

  const collection = await getCollection<BloodRequestDocument>(Collections.BLOOD_REQUESTS);

  const newRequest: any = {
    patient_name: data.patient_name,
    blood_group: data.blood_group,
    units: data.units,
    hospital: data.hospital,
    city: data.city,
    country: "Bangladesh",
    contact_number: data.contact_number,
    urgency: data.urgency,
    admin_notes: data.notes ? `[Request Created via Admin Panel] ${data.notes}` : `[Request Created via Admin Panel]`,
    status: 'approved',
    requester_id: user.uid,
    updated_by: user.uid,
    location: {
      type: "Point",
      coordinates: [90.4125, 23.8103] // Default Dhaka coordinates
    },
    created_at: new Date(),
    updated_at: new Date()
  };

  await collection.insertOne(newRequest);

  // Send push notification to users with matching blood type
  try {
    await notifyBloodRequest({
      blood_group: data.blood_group,
      hospital: data.hospital,
      city: data.city,
      units: data.units,
      urgency: data.urgency,
      patient_name: data.patient_name,
    }, user.uid);
  } catch (notifyError) {
    console.error('Failed to send notification:', notifyError);
  }

  revalidatePath('/admin/blood-requests');
  revalidatePath('/admin/dashboard');
  return { success: true };
}

export async function rejectRequest(requestId: string, currentData: any) {
  const user = await getAuthenticatedUser();
  if (!user) throw new Error("Unauthorized");

  const collection = await getCollection<BloodRequestDocument>(Collections.BLOOD_REQUESTS);
  
  await collection.updateOne(
    { _id: new ObjectId(requestId) },
    { 
      $set: { 
        status: 'rejected',
        admin_notes: currentData?.admin_notes,
        updated_by: user.uid,
        updated_at: new Date()
      }
    }
  );

  revalidatePath('/admin/blood-requests');
}

export async function deleteRequest(requestId: string) {
  const user = await getAuthenticatedUser();
  if (!user) throw new Error("Unauthorized");

  const collection = await getCollection<BloodRequestDocument>(Collections.BLOOD_REQUESTS);
  
  await collection.deleteOne({ _id: new ObjectId(requestId) });

  revalidatePath('/admin/blood-requests');
}

export async function updateRequest(requestId: string, updates: any) {
  const user = await getAuthenticatedUser();
  if (!user) throw new Error("Unauthorized");

  const collection = await getCollection<BloodRequestDocument>(Collections.BLOOD_REQUESTS);
    
  await collection.updateOne(
    { _id: new ObjectId(requestId) },
    { 
      $set: {
        admin_notes: updates.admin_notes,
        patient_name: updates.patient_name,
        hospital: updates.hospital,
        units: updates.units,
        contact_number: updates.contact_number,
        updated_by: user.uid,
        updated_at: new Date()
      }
    }
  );

  revalidatePath('/admin/blood-requests');
  return { success: true };
}
