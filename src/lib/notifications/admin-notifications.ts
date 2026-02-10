import { getCollection, Collections, AdminNotificationDocument } from '@/lib/db/mongodb';

export type AdminNotificationType = 'ticket' | 'blood_request' | 'fundraiser';

export async function createAdminNotification(
  type: AdminNotificationType,
  referenceId: string,
  title: string,
  message: string,
  link: string
) {
  try {
    const notificationsCollection = await getCollection<AdminNotificationDocument>(Collections.ADMIN_NOTIFICATIONS);
    
    await notificationsCollection.insertOne({
      type,
      reference_id: referenceId,
      title,
      message,
      is_read: false,
      created_at: new Date(),
      link,
    });
    
    console.log(`[Admin Notification] Created: ${title} (${type})`);
  } catch (error) {
    console.error('[Admin Notification] Failed to create notification:', error);
    // Suppress error so main flow doesn't break
  }
}
