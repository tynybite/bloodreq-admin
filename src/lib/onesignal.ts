'use server';

/**
 * OneSignal Push Notification Service
 * 
 * This utility provides functions to send push notifications via OneSignal REST API.
 * 
 * Required environment variables:
 * - ONESIGNAL_APP_ID: Your OneSignal App ID
 * - ONESIGNAL_REST_API_KEY: Your OneSignal REST API Key
 */

const ONESIGNAL_API_URL = 'https://onesignal.com/api/v1/notifications';

interface NotificationPayload {
  title: string;
  message: string;
  data?: Record<string, any>;
  url?: string;
  imageUrl?: string;
}

interface NotificationOptions {
  segment?: 'All' | string;
  filters?: Array<{ field: string; key?: string; relation: string; value: string }>;
  includeExternalUserIds?: string[];
}

interface OneSignalResponse {
  success: boolean;
  id?: string;
  recipients?: number;
  errors?: string[];
}

/**
 * Send a notification to all users or a specific segment
 */
export async function sendNotification(
  payload: NotificationPayload,
  options: NotificationOptions = {}
): Promise<OneSignalResponse> {
  const appId = process.env.ONESIGNAL_APP_ID;
  const apiKey = process.env.ONESIGNAL_REST_API_KEY;

  if (!appId || !apiKey) {
    console.error('OneSignal credentials not configured');
    return { success: false, errors: ['OneSignal credentials not configured'] };
  }

  const body: Record<string, any> = {
    app_id: appId,
    headings: { en: payload.title },
    contents: { en: payload.message },
    data: payload.data || {},
  };

  // Rich Media Support
  if (payload.imageUrl) {
    body.big_picture = payload.imageUrl; // Android
    body.ios_attachments = { id1: payload.imageUrl }; // iOS
    body.chrome_web_image = payload.imageUrl; // Web
  }

  // Target selection
  if (options.includeExternalUserIds && options.includeExternalUserIds.length > 0) {
    body.include_external_user_ids = options.includeExternalUserIds;
  } else if (options.filters && options.filters.length > 0) {
    body.filters = options.filters;
  } else {
    body.included_segments = [options.segment || 'All'];
  }

  // Optional URL
  if (payload.url) {
    body.url = payload.url;
  }

  try {
    const response = await fetch(ONESIGNAL_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('OneSignal API error:', data);
      return { 
        success: false, 
        errors: data.errors || ['Failed to send notification'] 
      };
    }

    return {
      success: true,
      id: data.id,
      recipients: data.recipients,
    };
  } catch (error) {
    console.error('OneSignal request failed:', error);
    return { 
      success: false, 
      errors: [(error as Error).message] 
    };
  }
}

/**
 * Send notification to users with a specific blood type
 * Requires users to be tagged with 'blood_type' in OneSignal
 */
export async function sendToBloodGroup(
  bloodGroup: string,
  payload: NotificationPayload
): Promise<OneSignalResponse> {
  return sendNotification(payload, {
    filters: [
      { field: 'tag', key: 'blood_type', relation: '=', value: bloodGroup }
    ]
  });
}

/**
 * Send blood request alert notification
 * Pre-formatted notification for blood requests
 */
export async function sendBloodRequestAlert(request: {
  blood_group: string;
  hospital: string;
  city?: string;
  units: number;
  urgency: string;
  patient_name: string;
}): Promise<OneSignalResponse> {
  const urgencyEmoji = request.urgency === 'critical' ? '🚨' : request.urgency === 'urgent' ? '⚠️' : '🩸';
  
  const payload: NotificationPayload = {
    title: `${urgencyEmoji} ${request.blood_group} Blood Needed`,
    message: `${request.units} unit(s) needed at ${request.hospital}${request.city ? `, ${request.city}` : ''}`,
    data: {
      type: 'blood_request',
      blood_group: request.blood_group,
      hospital: request.hospital,
      urgency: request.urgency,
    }
  };

  // Send to users with matching blood type
  return sendToBloodGroup(request.blood_group, payload);
}

/**
 * Send notification to all users (broadcast)
 */
export async function sendBroadcast(
  payload: NotificationPayload
): Promise<OneSignalResponse> {
  return sendNotification(payload, { segment: 'All' });
}
