import { NextRequest } from 'next/server';
import { ObjectId } from 'mongodb';
import { getCollection, Collections, AdminNotificationDocument } from '@/lib/db/mongodb';
import { successResponse, errorResponse, getAuthUser } from '@/lib/api-utils';

// GET /api/admin/notifications - Fetch recent notifications
export async function GET(request: NextRequest) {
  const { user, error: authError } = await getAuthUser(request);
  if (authError) return authError;

  // Optional: Check if user is admin
  // if (user?.role !== 'admin') return errorResponse('Unauthorized', 'FORBIDDEN', 403);

  try {
    const notificationsCollection = await getCollection<AdminNotificationDocument>(Collections.ADMIN_NOTIFICATIONS);
    
    // Fetch unread first, then read, limit to 20
    const notifications = await notificationsCollection
      .find({})
      .sort({ is_read: 1, created_at: -1 }) // Unread (false=0) first, then newest
      .limit(20)
      .toArray();

    // Count unread
    const unreadCount = await notificationsCollection.countDocuments({ is_read: false });

    return successResponse({
      notifications: notifications.map(n => ({
        id: n._id.toString(),
        type: n.type,
        title: n.title,
        message: n.message,
        link: n.link,
        is_read: n.is_read,
        created_at: n.created_at,
      })),
      unreadCount
    });
  } catch (error) {
    console.error('Fetch admin notifications error:', error);
    return errorResponse('Failed to fetch notifications', 'SERVER_ERROR', 500);
  }
}

// PATCH /api/admin/notifications - Mark notifications as read
export async function PATCH(request: NextRequest) {
  const { user, error: authError } = await getAuthUser(request);
  if (authError) return authError;

  try {
    const { id, markAll } = await request.json();
    const notificationsCollection = await getCollection<AdminNotificationDocument>(Collections.ADMIN_NOTIFICATIONS);

    if (markAll) {
      await notificationsCollection.updateMany(
        { is_read: false },
        { $set: { is_read: true } }
      );
      return successResponse({ marked: true }, 'All notifications marked as read');
    }

    if (id && ObjectId.isValid(id)) {
      await notificationsCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { is_read: true } }
      );
      return successResponse({ marked: true }, 'Notification marked as read');
    }

    return errorResponse('Invalid request', 'BAD_REQUEST', 400);
  } catch (error) {
    console.error('Update admin notification error:', error);
    return errorResponse('Failed to update notifications', 'SERVER_ERROR', 500);
  }
}
