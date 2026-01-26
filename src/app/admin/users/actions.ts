'use server';

import { getCollection, Collections, UserDocument } from "@/lib/db/mongodb";
import { revalidatePath } from "next/cache";

import { getFirebaseAuth } from "@/lib/auth/firebase-admin";
import { cookies } from "next/headers";

async function verifyAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;
  if (!token) throw new Error('Unauthorized');
  try {
    await getFirebaseAuth().verifySessionCookie(token, true);
  } catch {
    throw new Error('Unauthorized');
  }
}

export async function suspendUser(userId: string) {
  await verifyAuth();
  try {
    const usersCollection = await getCollection<UserDocument>(Collections.USERS);
    await usersCollection.updateOne(
      { _id: userId } as any,
      { $set: { status: 'suspended', updated_at: new Date() } }
    );
    revalidatePath('/admin/users');
    return { success: true };
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function banUser(userId: string) {
  await verifyAuth();
  try {
    const usersCollection = await getCollection<UserDocument>(Collections.USERS);
    await usersCollection.updateOne(
      { _id: userId } as any,
      { $set: { status: 'banned', updated_at: new Date() } }
    );
    revalidatePath('/admin/users');
    return { success: true };
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function activateUser(userId: string) {
  await verifyAuth();
  try {
    const usersCollection = await getCollection<UserDocument>(Collections.USERS);
    await usersCollection.updateOne(
      { _id: userId } as any,
      { $set: { status: 'active', updated_at: new Date() } }
    );
    revalidatePath('/admin/users');
    return { success: true };
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function bulkSuspendUsers(userIds: string[]) {
  await verifyAuth();
  try {
    const usersCollection = await getCollection<UserDocument>(Collections.USERS);
    await usersCollection.updateMany(
      { _id: { $in: userIds } } as any,
      { $set: { status: 'suspended', updated_at: new Date() } }
    );
    revalidatePath('/admin/users');
    return { success: true };
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function bulkBanUsers(userIds: string[]) {
  await verifyAuth();
  try {
    const usersCollection = await getCollection<UserDocument>(Collections.USERS);
    await usersCollection.updateMany(
      { _id: { $in: userIds } } as any,
      { $set: { status: 'banned', updated_at: new Date() } }
    );
    revalidatePath('/admin/users');
    return { success: true };
  } catch (error: any) {
    throw new Error(error.message);
  }
}
