import { NextRequest } from 'next/server';
import { successResponse, errorResponse, getAuthUser } from '@/lib/api-utils';
import { getCollection, Collections, NotificationDocument, UserDocument } from '@/lib/db/mongodb';

// GET /api/notifications - Get user notifications
// GET /api/notifications - Get user notifications
// GET /api/notifications - Get user notifications and broadcasts
export async function GET(request: NextRequest) {
  const { user, error: authError } = await getAuthUser(request);
  if (authError) return authError;

  try {
    const db = await getCollection<NotificationDocument>(Collections.NOTIFICATIONS);
    const usersCollection = await getCollection<UserDocument>(Collections.USERS);

    // 1. Fetch full user profile to get blood group
    // (getAuthUser only returns basic token claims)
    const userProfile = await usersCollection.findOne({ _id: user!.id });
    const userBloodGroup = userProfile?.blood_group;

    // 2. Build Query
    // Match:
    // - Specific user_id
    // - OR (segment exists AND (segment == 'All' OR segment == 'Blood Group: {MyGroup}'))
    // - AND created_at >= 3 days ago
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const query = {
      $and: [
        {
          $or: [
            { user_id: user!.id },
            { 
              segment: { $exists: true },
              $or: [
                { segment: 'All' },
                { segment: 'all' }, // Legacy/Lower safety
                { blood_group: userBloodGroup } // For targeted blood group logs
              ]
            }
          ]
        },
        { created_at: { $gte: threeDaysAgo } }
      ]
    };

    // 3. Fetch & Sort
    const rawNotifications = await db
      .find(query)
      .sort({ created_at: -1 })
      .limit(50)
      .toArray();

    // 4. Transform/Normalize
    // We have two types of docs in the same collection: 
    // - NotificationDocument (Direct)
    // - NotificationLogDocument (Broadcast)
    const notifications = rawNotifications.map((doc: any) => {
      // Is this a broadcast log?
      if (doc.segment) {
        return {
          _id: doc._id,
          title: doc.title,
          message: doc.message,
          type: doc.data?.type || 'system', // Extract type from custom data if available
          payload: doc.data || {},
          is_actionable: doc.data?.is_actionable || false, // Check payload for actionable flag
          is_read: false, // Broadcasts are always "unread" in this simplistic view (or check a separate read-receipts table in future)
          created_at: doc.created_at,
          image_url: doc.image_url
        };
      }
      // Standard personal notification
      return doc;
    });

    // Check for unread count (for badge)
    // Note: For broadcasts, we can't easily track "read" status without a join table.
    // For MVP, we only count personal unread notifications.
    const unreadCount = notifications.filter(n => !n.is_read).length;

    return successResponse({
      notifications,
      unread_count: unreadCount,
      pagination: { page: 1, limit: 50, total: notifications.length, total_pages: 1 },
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return errorResponse('Failed to fetch notifications', 'DB_ERROR', 500);
  }
}

// PUT /api/notifications - Mark all as read
export async function PUT(request: NextRequest) {
  const { user, error: authError } = await getAuthUser(request);
  if (authError) return authError;

  try {
    const db = await getCollection<NotificationDocument>(Collections.NOTIFICATIONS);
    
    // Only update personal notifications
    // Broadcasts don't have per-user read state in this MVP schema
    await db.updateMany(
      { user_id: user!.id, is_read: false },
      { $set: { is_read: true } }
    );

    return successResponse({ success: true }, 'All notifications marked as read');
  } catch (error) {
    return errorResponse('Failed to mark notifications as read', 'DB_ERROR', 500);
  }
}

// POST /api/notifications - Create a notification (Internal/Testing)
export async function POST(request: NextRequest) {
  const { user, error: authError } = await getAuthUser(request);
  if (authError) return authError;
  
  // For now, allow anyone to create a notification for themselves for testing
  try {
    const body = await request.json();
    const notificationsCollection = await getCollection<NotificationDocument>(Collections.NOTIFICATIONS);
    
    const newNotification: NotificationDocument = {
      user_id: user!.id,
      type: body.type || 'system',
      title: body.title || 'New Notification',
      message: body.message || 'This is a test notification',
      payload: body.payload || {},
      is_actionable: body.is_actionable || false,
      is_read: false,
      created_at: new Date(),
    } as NotificationDocument;
    
    await notificationsCollection.insertOne(newNotification);
    
    return successResponse(newNotification, 'Notification created', 201);
  } catch (error) {
    return errorResponse('Failed to create notification', 'DB_ERROR', 500);
  }
}
