import { NextRequest } from 'next/server';
import { ObjectId, getCollection, Collections, SupportTicketDocument } from '@/lib/db/mongodb';
import { successResponse, errorResponse, getAuthUser } from '@/lib/api-utils';

// GET /api/support/tickets/[id] - Get a single ticket with all messages
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error: authError } = await getAuthUser(request);
  if (authError) return authError;

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

    // Non-admins can only view their own tickets
    if (ticket.user_id !== user!.id) {
      // Check if admin
      const usersCollection = await getCollection(Collections.USERS);
      const userDoc = await usersCollection.findOne({ _id: user!.id as any });
      if (userDoc?.role !== 'admin') {
        return errorResponse('Unauthorized', 'FORBIDDEN', 403);
      }
    }

    return successResponse({
      id: ticket._id?.toString(),
      user_id: ticket.user_id,
      user_email: ticket.user_email,
      user_name: ticket.user_name,
      subject: ticket.subject,
      category: ticket.category,
      status: ticket.status,
      priority: ticket.priority,
      messages: ticket.messages.map((m) => ({
        sender_id: m.sender_id,
        text: m.text,
        is_admin: m.is_admin,
        created_at: m.created_at,
        attachment_url: m.attachment_url,
      })),
      created_at: ticket.created_at,
      updated_at: ticket.updated_at,
    });
  } catch (error) {
    console.error('Get ticket detail error:', error);
    return errorResponse('An unexpected error occurred', 'SERVER_ERROR', 500);
  }
}

// PATCH /api/support/tickets/[id] - Update ticket status/priority
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error: authError } = await getAuthUser(request);
  if (authError) return authError;

  try {
    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return errorResponse('Invalid ticket ID', 'INVALID_ID', 400);
    }

    const body = await request.json();
    const updates: any = { updated_at: new Date() };

    if (body.status && ['open', 'in_progress', 'resolved'].includes(body.status)) {
      updates.status = body.status;
    }
    if (body.priority && ['low', 'medium', 'high'].includes(body.priority)) {
      updates.priority = body.priority;
    }

    const ticketsCollection = await getCollection<SupportTicketDocument>(Collections.SUPPORT_TICKETS);
    const result = await ticketsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updates }
    );

    if (result.matchedCount === 0) {
      return errorResponse('Ticket not found', 'NOT_FOUND', 404);
    }

    return successResponse({ id, ...updates }, 'Ticket updated successfully');
  } catch (error) {
    console.error('Update ticket error:', error);
    return errorResponse('An unexpected error occurred', 'SERVER_ERROR', 500);
  }
}
