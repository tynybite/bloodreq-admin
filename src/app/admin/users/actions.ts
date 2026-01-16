'use server';

import { getCollection, Collections, UserDocument } from "@/lib/db/mongodb";
import { revalidatePath } from "next/cache";

export async function suspendUser(userId: string) {
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
