import { getCollection, Collections, SupportTicketDocument } from "@/lib/db/mongodb";
import SupportClient from "./SupportClient";

export default async function SupportPage() {
  const ticketsCollection = await getCollection<SupportTicketDocument>(Collections.SUPPORT_TICKETS);

  const ticketsRaw = await ticketsCollection.find({})
    .sort({ last_message_at: -1 })
    .limit(50)
    .toArray();

  const tickets = ticketsRaw.map(t => ({
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
          text: t.messages[t.messages.length - 1].text.substring(0, 120),
          is_admin: t.messages[t.messages.length - 1].is_admin,
          created_at: t.messages[t.messages.length - 1].created_at?.toISOString(),
        }
      : null,
    created_at: t.created_at?.toISOString(),
    updated_at: t.updated_at?.toISOString(),
  }));

  // Stats
  const totalTickets = await ticketsCollection.countDocuments({});
  const openTickets = await ticketsCollection.countDocuments({ status: 'open' });
  const inProgressTickets = await ticketsCollection.countDocuments({ status: 'in_progress' });
  const resolvedTickets = await ticketsCollection.countDocuments({ status: 'resolved' });

  const stats = [
    { label: 'Total Tickets', value: totalTickets, gradient: 'from-blue-500 to-cyan-400' },
    { label: 'Open', value: openTickets, gradient: 'from-amber-500 to-orange-400' },
    { label: 'In Progress', value: inProgressTickets, gradient: 'from-violet-500 to-purple-400' },
    { label: 'Resolved', value: resolvedTickets, gradient: 'from-emerald-500 to-teal-400' },
  ];

  return <SupportClient initialTickets={tickets} stats={stats} />;
}
