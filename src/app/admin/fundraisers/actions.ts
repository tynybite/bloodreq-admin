'use server';

import { getCollection, Collections, FundraiserDocument, DonationDocument } from "@/lib/db/mongodb";
import { getFirebaseAuth } from "@/lib/auth/firebase-admin";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { ObjectId } from "mongodb";

// Helper for auth
async function getAuthenticatedUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;
  if (!token) return null;
  try {
    return await getFirebaseAuth().verifySessionCookie(token, true);
  } catch (e) {
    return null;
  }
}

export async function getFundraisers(status?: string) {
    const collection = await getCollection<FundraiserDocument>(Collections.FUNDRAISERS);
    let query: any = {};
    
    if (status && status !== 'all') {
        query.status = status;
    }
    
    const fundraisersRaw = await collection.find(query)
        .sort({ created_at: -1 })
        .toArray();

    return fundraisersRaw.map(f => ({
        ...f,
        id: f._id.toString(),
        _id: undefined,
        fundraiser_documents: f.documents || [] // Map internal documents to expected key if UI expects it
    }));
}

export async function createFundraiser(data: any) {
    const user = await getAuthenticatedUser();
    if (!user) throw new Error("Unauthorized");

    const collection = await getCollection<FundraiserDocument>(Collections.FUNDRAISERS);

    const documents = (data.documents || []).map((url: string) => ({
        url,
        type: 'unknown',
        id: new ObjectId().toString()
    }));

    const newFundraiser: any = {
        title: data.title,
        patient_name: data.patient_name,
        condition: data.condition,
        hospital: data.hospital,
        location: data.location,
        amount_needed: data.amount_needed,
        amount_raised: 0,
        deadline: data.deadline ? new Date(data.deadline) : undefined,
        status: 'pending',
        description: data.description,
        requester_id: user.uid,
        cover_image_url: data.cover_image_url,
        documents: documents,
        created_at: new Date(),
        updated_at: new Date(),
    };

    await collection.insertOne(newFundraiser);

    revalidatePath('/admin/fundraisers');
    return { success: true };
}

export async function updateFundraiser(id: string, updates: any) {
    const user = await getAuthenticatedUser();
    if (!user) throw new Error("Unauthorized");

    const collection = await getCollection<FundraiserDocument>(Collections.FUNDRAISERS);

    const updateFields: any = {
        updated_at: new Date()
    };
    if (updates.title) updateFields.title = updates.title;
    if (updates.patient_name) updateFields.patient_name = updates.patient_name;
    if (updates.condition) updateFields.condition = updates.condition;
    if (updates.hospital) updateFields.hospital = updates.hospital;
    if (updates.location) updateFields.location = updates.location;
    if (updates.amount_needed) updateFields.amount_needed = updates.amount_needed;
    if (updates.deadline) updateFields.deadline = new Date(updates.deadline);
    if (updates.description) updateFields.description = updates.description;
    if (updates.status) updateFields.status = updates.status as any;
    if (updates.cover_image_url) updateFields.cover_image_url = updates.cover_image_url;

    // Handle new documents
    // We use push to add to array
    const operations: any = { $set: updateFields };
    
    if (updates.new_documents && updates.new_documents.length > 0) {
        const newDocs = updates.new_documents.map((url: string) => ({
            url,
            type: 'unknown',
            id: new ObjectId().toString()
        }));
        operations.$push = { documents: { $each: newDocs } };
    }

    await collection.updateOne(
        { _id: new ObjectId(id) },
        operations
    );

    revalidatePath('/admin/fundraisers');
    return { success: true };
}

export async function deleteFundraiser(id: string) {
    const user = await getAuthenticatedUser();
    if (!user) throw new Error("Unauthorized");

    const collection = await getCollection<FundraiserDocument>(Collections.FUNDRAISERS);
    await collection.deleteOne({ _id: new ObjectId(id) });
    revalidatePath('/admin/fundraisers');
}

export async function updateFundraiserStatus(id: string, status: string) {
    const user = await getAuthenticatedUser();
    if (!user) throw new Error("Unauthorized");
    
    const collection = await getCollection<FundraiserDocument>(Collections.FUNDRAISERS);

    if (status === 'approved') {
        const fundraiser = await collection.findOne({ _id: new ObjectId(id) });
        if (!fundraiser) throw new Error('Fundraiser not found');
        
        if (!fundraiser.documents || fundraiser.documents.length === 0) {
             throw new Error('Cannot approve: Fundraiser must have at least one document.');
        }
    }

    await collection.updateOne(
        { _id: new ObjectId(id) },
        { 
            $set: { 
                status: status as any, 
                updated_at: new Date() 
            } 
        }
    );
    revalidatePath('/admin/fundraisers');
}

export async function deleteDocument(fundraiserId: string, docId: string) {
    // NOTE: Changed signature to include fundraiserId because MongoDB needs parent ID to pull from array
    // If frontend only passes docId, we might need to search or frontend needs update.
    // Assuming we can pass fundraiserId or we search.
    // For now, if we only get docId, we can search.
    
    const user = await getAuthenticatedUser();
    if (!user) throw new Error("Unauthorized");

    const collection = await getCollection<FundraiserDocument>(Collections.FUNDRAISERS);
    
    // Attempt to pull from ANY fundraiser with this doc id (inefficient but works if docId is unknown parent)
    // Or better, update frontend to pass fundraiserId. 
    // Assuming docId is the document's string ID we generated.
    
    // If fundraiserId is NOT known, we have to find it.
    // However, the previous action signature only took docId.
    // To keep compatibility, let's try to find which fundraiser has this doc.
    // But `docId` in previous implementation was just a row ID.
    
    await collection.updateOne(
        { "documents.id": docId },
        { $pull: { documents: { id: docId } } as any }
    );

    revalidatePath('/admin/fundraisers');
}

export async function getDonations(fundraiserId: string) {
    const collection = await getCollection<DonationDocument>(Collections.DONATIONS);
    // Fetch donations for this fundraiser
    const donationsRaw = await collection.find({ request_id: fundraiserId })
        .sort({ created_at: -1 })
        .toArray();
        
    return donationsRaw.map(d => ({
        ...d,
        id: d._id?.toString(),
        _id: undefined
    }));
}
