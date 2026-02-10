import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getCollection, Collections, SupportTicketDocument, UserDocument } from '@/lib/db/mongodb';
import { successResponse, errorResponse, getAuthUser, parseBody } from '@/lib/api-utils';
import { createAdminNotification } from '@/lib/notifications/admin-notifications';

// Schema for creating a support ticket (from mobile app)
const createTicketSchema = z.object({
  subject: z.string().min(3, 'Subject is required'),
  category: z.enum(['general', 'technical', 'account', 'report', 'feedback']),
  message: z.string().min(10, 'Please describe your issue in detail'),
  priority: z.enum(['low', 'medium', 'high']).optional().default('medium'),
});

// GET /api/support/tickets - List tickets
// For admins: all tickets. For users: only their own.
export async function GET(request: NextRequest) {
  const { user, error: authError } = await getAuthUser(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Check if user is admin
    const usersCollection = await getCollection<UserDocument>(Collections.USERS);
    const userDoc = await usersCollection.findOne({ _id: user!.id });
    const isAdmin = userDoc?.role === 'admin';

    const query: any = {};

    // Non-admins can only see their own tickets
    if (!isAdmin) {
      query.user_id = user!.id;
    }

    if (status && status !== 'all') {
      query.status = status;
    }
    if (category && category !== 'all') {
      query.category = category;
    }

    const ticketsCollection = await getCollection<SupportTicketDocument>(Collections.SUPPORT_TICKETS);
    const total = await ticketsCollection.countDocuments(query);
    const tickets = await ticketsCollection
      .find(query)
      .sort({ last_message_at: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const formatted = tickets.map((t) => ({
      id: t._id?.toString(),
      user_id: t.user_id,
      user_email: t.user_email,
      user_name: t.user_name,
      subject: t.subject,
      category: t.category,
      status: t.status,
      priority: t.priority,
      message_count: t.messages?.length || 0,
      last_message: t.messages?.length
        ? {
            text: t.messages[t.messages.length - 1].text.substring(0, 100),
            is_admin: t.messages[t.messages.length - 1].is_admin,
            created_at: t.messages[t.messages.length - 1].created_at,
          }
        : null,
      created_at: t.created_at,
      updated_at: t.updated_at,
    }));

    return successResponse({
      tickets: formatted,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get support tickets error:', error);
    return errorResponse('An unexpected error occurred', 'SERVER_ERROR', 500);
  }
}

// POST /api/support/tickets - Create a new ticket (from mobile app)
export async function POST(request: NextRequest) {
  const { user, error: authError } = await getAuthUser(request);
  if (authError) return authError;

  const { data, error: parseError } = await parseBody(request, createTicketSchema);
  if (parseError) return parseError;

  try {
    const ticketsCollection = await getCollection<SupportTicketDocument>(Collections.SUPPORT_TICKETS);
    const now = new Date();

    const newTicket: SupportTicketDocument = {
      user_id: user!.id,
      user_email: user!.email || '',
      user_name: user!.name || 'User',
      subject: data.subject,
      category: data.category,
      status: 'open',
      priority: data.priority,
      messages: [
        {
          sender_id: user!.id,
          text: data.message,
          is_admin: false,
          created_at: now,
        },
      ],
      created_at: now,
      updated_at: now,
      last_message_at: now,
    };

    const result = await ticketsCollection.insertOne(newTicket);

    // Notify Admins
    await createAdminNotification(
      'ticket',
      result.insertedId.toString(),
      `New Support Ticket: ${data.subject}`,
      `User ${user!.name || user!.email} created a new ticket in ${data.category}.`,
      `/admin/support/${result.insertedId}`
    );

    return successResponse(
      {
        id: result.insertedId.toString(),
        subject: data.subject,
        category: data.category,
        status: 'open',
      },
      'Support ticket created successfully',
      201
    );
  } catch (error) {
    console.error('Create support ticket error:', error);
    return errorResponse('An unexpected error occurred', 'SERVER_ERROR', 500);
  }
}
