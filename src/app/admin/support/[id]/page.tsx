import { getCollection, Collections, SupportTicketDocument } from "@/lib/db/mongodb";
import { ObjectId } from "mongodb";
import { notFound } from "next/navigation";
import TicketDetailClient from "./TicketDetailClient";

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!ObjectId.isValid(id)) {
    notFound();
  }

  const ticketsCollection = await getCollection<SupportTicketDocument>(Collections.SUPPORT_TICKETS);
  const ticket = await ticketsCollection.findOne({ _id: new ObjectId(id) });

  if (!ticket) {
    notFound();
  }

  const serialized = {
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
      created_at: m.created_at?.toISOString(),
      attachment_url: m.attachment_url,
    })),
    created_at: ticket.created_at?.toISOString(),
    updated_at: ticket.updated_at?.toISOString(),
  };

  return <TicketDetailClient ticket={serialized} />;
}
