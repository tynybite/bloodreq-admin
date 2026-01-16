'use server';

import { getCollection, Collections, NotificationLogDocument, UserDocument } from '@/lib/db/mongodb';
import { getFirebaseAuth } from '@/lib/auth/firebase-admin';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { 
  sendBroadcast, 
  sendToBloodGroup, 
  sendNotification 
} from '@/lib/onesignal';

export interface NotificationFormData {
  title: string;
  message: string;
  segment: 'all' | 'blood_group';
  blood_group?: string;
}

// Helper to get current user
async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;
  if (!token) return null;
  try {
    return await getFirebaseAuth().verifyIdToken(token);
  } catch {
    return null;
  }
}

/**
 * Send a notification from the admin panel
 */
export async function sendAdminNotification(data: NotificationFormData) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  let result;
  
  if (data.segment === 'blood_group' && data.blood_group) {
    result = await sendToBloodGroup(data.blood_group, {
      title: data.title,
      message: data.message,
    });
  } else {
    result = await sendBroadcast({
      title: data.title,
      message: data.message,
    });
  }

  // Log the notification
  try {
    const notificationsLogCollection = await getCollection<NotificationLogDocument>(Collections.NOTIFICATIONS);
    await notificationsLogCollection.insertOne({
      title: data.title,
      message: data.message,
      segment: data.segment === 'all' ? 'All' : `Blood Group: ${data.blood_group}`,
      blood_group: data.blood_group || null,
      sent_by: user.uid,
      recipients: result.recipients || 0,
      onesignal_id: result.id || null,
      success: result.success,
      error: result.errors ? result.errors.join(', ') : null,
      created_at: new Date(),
    });

    revalidatePath('/admin/notifications');

    if (!result.success) {
      throw new Error(result.errors?.join(', ') || 'Failed to send notification');
    }

    return result;
  } catch (error) {
    console.error('Error logging notification:', error);
    // Don't fail if logging fails but send succeeded
    if (!result.success && error instanceof Error) throw error;
    return result;
  }
}

/**
 * Get notification history
 */
export async function getNotificationHistory(limit = 20) {
  try {
    const notificationsLogCollection = await getCollection<NotificationLogDocument>(Collections.NOTIFICATIONS);
    const usersCollection = await getCollection<UserDocument>(Collections.USERS);
    
    const logs = await notificationsLogCollection
      .find({})
      .sort({ created_at: -1 })
      .limit(limit)
      .toArray();

    if (!logs || logs.length === 0) return [];

    // Fetch profiles for sender names
    const userIds = [...new Set(logs.map((log) => log.sent_by).filter(Boolean))];
    const profiles = await usersCollection.find({ _id: { $in: userIds } }).toArray();
    
    const profileMap = new Map(profiles.map((p) => [p._id, p.full_name]));

    // Map logs to include sender name
    return logs.map((log) => ({
      id: log._id?.toString(),
      title: log.title,
      message: log.message,
      segment: log.segment,
      blood_group: log.blood_group,
      sent_by: log.sent_by,
      recipients: log.recipients,
      success: log.success,
      created_at: log.created_at,
      admin_users: {
          full_name: profileMap.get(log.sent_by) || 'Unknown'
      }
    }));
  } catch (error) {
    console.error('Failed to fetch notification history:', error);
    return [];
  }
}

/**
 * Send blood request notification (called from blood requests actions)
 */
export async function notifyBloodRequest(request: {
  blood_group: string;
  hospital: string;
  city?: string;
  units: number;
  urgency: string;
  patient_name: string;
}, sentBy: string) {
  const urgencyEmoji = request.urgency === 'critical' ? '🚨' : request.urgency === 'urgent' ? '⚠️' : '🩸';
  const title = `${urgencyEmoji} ${request.blood_group} Blood Needed`;
  const message = `${request.units} unit(s) needed at ${request.hospital}${request.city ? `, ${request.city}` : ''}`;

  const result = await sendToBloodGroup(request.blood_group, { title, message });

  // Log the notification
  try {
    const notificationsLogCollection = await getCollection<NotificationLogDocument>(Collections.NOTIFICATIONS);
    await notificationsLogCollection.insertOne({
      title,
      message,
      segment: `Blood Group: ${request.blood_group}`,
      blood_group: request.blood_group,
      sent_by: sentBy,
      recipients: result.recipients || 0,
      onesignal_id: result.id || null,
      success: result.success,
      error: result.errors ? result.errors.join(', ') : null,
      created_at: new Date(),
    });
  } catch (error) {
    console.error('Error logging blood request notification:', error);
  }

  return result;
}
