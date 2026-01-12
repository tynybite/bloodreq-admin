'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
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

/**
 * Send a notification from the admin panel
 */
export async function sendAdminNotification(data: NotificationFormData) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
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
  await supabase.from('notifications_log').insert({
    title: data.title,
    message: data.message,
    segment: data.segment === 'all' ? 'All' : `Blood Group: ${data.blood_group}`,
    blood_group: data.blood_group || null,
    sent_by: user.id,
    recipients: result.recipients || 0,
    onesignal_id: result.id || null,
    success: result.success,
    error: result.errors ? result.errors.join(', ') : null,
  });

  revalidatePath('/admin/notifications');

  if (!result.success) {
    throw new Error(result.errors?.join(', ') || 'Failed to send notification');
  }

  return result;
}

/**
 * Get notification history
 */
export async function getNotificationHistory(limit = 20) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('notifications_log')
    .select(`
      *,
      admin_users:sent_by (
        full_name
      )
    `)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Failed to fetch notification history:', error);
    return [];
  }

  return data || [];
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
  const supabase = await createClient();

  const urgencyEmoji = request.urgency === 'critical' ? '🚨' : request.urgency === 'urgent' ? '⚠️' : '🩸';
  const title = `${urgencyEmoji} ${request.blood_group} Blood Needed`;
  const message = `${request.units} unit(s) needed at ${request.hospital}${request.city ? `, ${request.city}` : ''}`;

  const result = await sendToBloodGroup(request.blood_group, { title, message });

  // Log the notification
  await supabase.from('notifications_log').insert({
    title,
    message,
    segment: `Blood Group: ${request.blood_group}`,
    blood_group: request.blood_group,
    sent_by: sentBy,
    recipients: result.recipients || 0,
    onesignal_id: result.id || null,
    success: result.success,
    error: result.errors ? result.errors.join(', ') : null,
  });

  return result;
}
