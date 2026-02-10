import { NextRequest } from 'next/server';
import { z } from 'zod';
import { ObjectId, getCollection, Collections, SupportTicketDocument } from '@/lib/db/mongodb';
import { successResponse, errorResponse, getAuthUser, parseBody } from '@/lib/api-utils';

const replySchema = z.object({
  message: z.string().min(1, 'Message cannot be empty'),
});

// POST /api/support/tickets/[id]/reply - Send a reply to a ticket
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error: authError } = await getAuthUser(request);
  if (authError) return authError;

  const { data, error: parseError } = await parseBody(request, replySchema);
  if (parseError) return parseError;

  try {
    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return errorResponse('Invalid ticket ID', 'INVALID_ID', 400);
    }

    const ticketsCollection = await getCollection<SupportTicketDocument>(Collections.SUPPORT_TICKETS);
    const ticket = await ticketsCollection.findOne({ _id: new ObjectId(id) });

    if (!ticket) {
      return errorResponse('Ticket not found', 'NOT_FOUND', 404);
    }

    // Determine if sender is admin
    const usersCollection = await getCollection(Collections.USERS);
    const userDoc = await usersCollection.findOne({ _id: user!.id as any });
    const isAdmin = userDoc?.role === 'admin';

    // Non-admins can only reply to their own tickets
    if (!isAdmin && ticket.user_id !== user!.id) {
      return errorResponse('Unauthorized', 'FORBIDDEN', 403);
    }

    const now = new Date();
    const newMessage = {
      sender_id: user!.id,
      text: data.message,
      is_admin: isAdmin,
      created_at: now,
    };

    // Update ticket: push message, update timestamps, set status
    const statusUpdate = isAdmin ? 'in_progress' : ticket.status;

    await ticketsCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $push: { messages: newMessage } as any,
        $set: {
          updated_at: now,
          last_message_at: now,
          status: statusUpdate,
        },
      }
    );

    return successResponse(
      {
        ticket_id: id,
        message: newMessage,
      },
      'Reply sent successfully',
      201
    );
  } catch (error) {
    console.error('Reply to ticket error:', error);
    return errorResponse('An unexpected error occurred', 'SERVER_ERROR', 500);
  }
}
