import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { successResponse, errorResponse, getAuthUser, parseBody } from '@/lib/api-utils';

// GET /api/notifications - Get user's notification history
export async function GET(request: NextRequest) {
  // Verify authentication
  const { user, error: authError } = await getAuthUser(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const unread = searchParams.get('unread') === 'true';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);

    const supabase = await createClient();

    // Build query
    let query = supabase
      .from('user_notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false });

    if (unread) {
      query = query.eq('read', false);
    }

    // Pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data: notifications, error: queryError, count } = await query;

    if (queryError) {
      // Table might not exist yet
      console.error('Query error:', queryError);
      return successResponse({
        notifications: [],
        unread_count: 0,
        pagination: { page: 1, limit, total: 0, total_pages: 0 },
      });
    }

    // Get unread count
    const { count: unreadCount } = await supabase
      .from('user_notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user!.id)
      .eq('read', false);

    return successResponse({
      notifications: notifications || [],
      unread_count: unreadCount || 0,
      pagination: {
        page,
        limit,
        total: count || 0,
        total_pages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    return errorResponse('An unexpected error occurred', 'SERVER_ERROR', 500);
  }
}

// POST /api/notifications - Mark notifications as read
const markReadSchema = z.object({
  notification_ids: z.array(z.string()).optional(),
  mark_all: z.boolean().optional(),
});

export async function POST(request: NextRequest) {
  // Verify authentication
  const { user, error: authError } = await getAuthUser(request);
  if (authError) return authError;

  // Parse and validate request body
  const { data, error: parseError } = await parseBody(request, markReadSchema);
  if (parseError) return parseError;

  try {
    const supabase = await createClient();

    if (data.mark_all) {
      // Mark all as read
      await supabase
        .from('user_notifications')
        .update({ read: true, read_at: new Date().toISOString() })
        .eq('user_id', user!.id)
        .eq('read', false);
    } else if (data.notification_ids && data.notification_ids.length > 0) {
      // Mark specific notifications as read
      await supabase
        .from('user_notifications')
        .update({ read: true, read_at: new Date().toISOString() })
        .eq('user_id', user!.id)
        .in('id', data.notification_ids);
    }

    return successResponse({ marked: true }, 'Notifications marked as read');
  } catch (error) {
    console.error('Mark read error:', error);
    return errorResponse('An unexpected error occurred', 'SERVER_ERROR', 500);
  }
}
