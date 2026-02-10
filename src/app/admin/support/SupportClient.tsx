"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Headset,
  Search,
  Clock,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  ChevronRight,
  Filter,
} from "lucide-react";

interface Ticket {
  id: string;
  user_id: string;
  user_email?: string;
  user_name?: string;
  subject: string;
  category: string;
  status: string;
  priority: string;
  message_count: number;
  last_message: {
    text: string;
    is_admin: boolean;
    created_at: string;
  } | null;
  created_at: string;
  updated_at: string;
}

interface Stat {
  label: string;
  value: number;
  gradient: string;
}

interface SupportClientProps {
  initialTickets: Ticket[];
  stats: Stat[];
}

const statusConfig: Record<string, { icon: any; color: string; bg: string }> = {
  open: { icon: AlertCircle, color: "text-amber-500", bg: "bg-amber-500/10" },
  in_progress: { icon: Clock, color: "text-blue-500", bg: "bg-blue-500/10" },
  resolved: { icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-500/10" },
};

const priorityColors: Record<string, string> = {
  low: "text-muted-foreground bg-muted",
  medium: "text-amber-700 bg-amber-100 dark:text-amber-400 dark:bg-amber-500/10",
  high: "text-rose-700 bg-rose-100 dark:text-rose-400 dark:bg-rose-500/10",
};

const categoryLabels: Record<string, string> = {
  general: "General",
  technical: "Technical",
  account: "Account",
  report: "Report",
  feedback: "Feedback",
};

export default function SupportClient({ initialTickets, stats }: SupportClientProps) {
  const router = useRouter();
  const [tickets] = useState(initialTickets);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const filtered = tickets.filter((t) => {
    const matchesSearch =
      !searchQuery ||
      t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.user_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.user_name?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || t.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || t.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Headset className="h-8 w-8 text-primary" />
            Support Tickets
          </h1>
          <p className="text-muted-foreground mt-1">Manage user support requests and inquiries</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="relative overflow-hidden rounded-2xl border border-border/40 bg-card p-6"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-5`} />
            <div className="relative">
              <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
              <p className="text-3xl font-bold mt-1">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by subject, user email, or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border/60 bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-border/60 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-border/60 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">All Categories</option>
            <option value="general">General</option>
            <option value="technical">Technical</option>
            <option value="account">Account</option>
            <option value="report">Report</option>
            <option value="feedback">Feedback</option>
          </select>
        </div>
      </div>

      {/* Ticket List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <MessageSquare className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground">No tickets found</h3>
            <p className="text-sm text-muted-foreground/70 mt-1">
              {searchQuery || statusFilter !== "all"
                ? "Try adjusting your filters"
                : "When users submit support requests, they will appear here"}
            </p>
          </div>
        ) : (
          filtered.map((ticket, i) => {
            const statusInfo = statusConfig[ticket.status] || statusConfig.open;
            const StatusIcon = statusInfo.icon;

            return (
              <motion.div
                key={ticket.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => router.push(`/admin/support/${ticket.id}`)}
                className="group flex items-center gap-4 p-4 rounded-2xl border border-border/40 bg-card hover:bg-accent/50 cursor-pointer transition-all hover:border-primary/20 hover:shadow-sm"
              >
                {/* Status Icon */}
                <div className={`flex-shrink-0 p-2.5 rounded-xl ${statusInfo.bg}`}>
                  <StatusIcon className={`h-5 w-5 ${statusInfo.color}`} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-sm truncate">{ticket.subject}</h3>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${priorityColors[ticket.priority] || priorityColors.medium}`}>
                      {ticket.priority}
                    </span>
                    <span className="text-[10px] font-medium uppercase px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                      {categoryLabels[ticket.category] || ticket.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{ticket.user_name || ticket.user_email}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      {ticket.message_count}
                    </span>
                    {ticket.last_message && (
                      <>
                        <span>•</span>
                        <span className="truncate max-w-[200px]">
                          {ticket.last_message.is_admin ? "You: " : ""}
                          {ticket.last_message.text}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Right Side */}
                <div className="flex-shrink-0 flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">
                    {ticket.created_at && formatDate(ticket.created_at)}
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
