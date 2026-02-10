"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Send,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  Shield,
  Loader2,
} from "lucide-react";
import { auth } from "@/lib/auth/firebase-client";

interface Message {
  sender_id: string;
  text: string;
  is_admin: boolean;
  created_at: string;
  attachment_url?: string;
}

interface TicketData {
  id: string;
  user_id: string;
  user_email?: string;
  user_name?: string;
  subject: string;
  category: string;
  status: string;
  priority: string;
  messages: Message[];
  created_at: string;
  updated_at: string;
}

interface TicketDetailClientProps {
  ticket: TicketData;
}

const statusConfig: Record<string, { icon: any; label: string; color: string; bg: string }> = {
  open: { icon: AlertCircle, label: "Open", color: "text-amber-500", bg: "bg-amber-500/10 border-amber-500/20" },
  in_progress: { icon: Clock, label: "In Progress", color: "text-blue-500", bg: "bg-blue-500/10 border-blue-500/20" },
  resolved: { icon: CheckCircle, label: "Resolved", color: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/20" },
};

const priorityColors: Record<string, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  high: "bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400",
};

export default function TicketDetailClient({ ticket }: TicketDetailClientProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>(ticket.messages);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(ticket.status);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendReply = async () => {
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Not authenticated");
      const token = await user.getIdToken();

      const res = await fetch(`/api/support/tickets/${ticket.id}/reply`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ message: newMessage }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [
          ...prev,
          {
            sender_id: "admin",
            text: newMessage,
            is_admin: true,
            created_at: new Date().toISOString(),
          },
        ]);
        setNewMessage("");
        if (currentStatus === "open") setCurrentStatus("in_progress");
      }
    } catch (err) {
      console.error("Failed to send reply:", err);
    } finally {
      setSending(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setUpdatingStatus(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Not authenticated");
      const token = await user.getIdToken();

      const res = await fetch(`/api/support/tickets/${ticket.id}`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setCurrentStatus(newStatus);
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendReply();
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const statusInfo = statusConfig[currentStatus] || statusConfig.open;
  const StatusIcon = statusInfo.icon;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-border/40 bg-card/50 backdrop-blur-sm p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/admin/support")}
              className="p-2 rounded-xl hover:bg-accent transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-lg font-bold">{ticket.subject}</h1>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                <span>{ticket.user_name || ticket.user_email}</span>
                <span>•</span>
                <span className="capitalize">{ticket.category}</span>
                <span>•</span>
                <span>{formatTime(ticket.created_at)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Priority Badge */}
            <span
              className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${
                priorityColors[ticket.priority] || priorityColors.medium
              }`}
            >
              {ticket.priority}
            </span>

            {/* Status Badge + Action */}
            <div className="flex items-center gap-2">
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold ${statusInfo.bg} ${statusInfo.color}`}
              >
                <StatusIcon className="h-3.5 w-3.5" />
                {statusInfo.label}
              </div>

              {currentStatus !== "resolved" && (
                <button
                  onClick={() => handleStatusChange("resolved")}
                  disabled={updatingStatus}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500 text-white text-xs font-semibold hover:bg-emerald-600 transition-colors disabled:opacity-50"
                >
                  {updatingStatus ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <CheckCircle className="h-3.5 w-3.5" />
                  )}
                  Resolve
                </button>
              )}

              {currentStatus === "resolved" && (
                <button
                  onClick={() => handleStatusChange("open")}
                  disabled={updatingStatus}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500 text-white text-xs font-semibold hover:bg-amber-600 transition-colors disabled:opacity-50"
                >
                  Reopen
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className={`flex gap-3 ${msg.is_admin ? "flex-row-reverse" : ""}`}
          >
            {/* Avatar */}
            <div
              className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                msg.is_admin
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {msg.is_admin ? (
                <Shield className="h-4 w-4" />
              ) : (
                <User className="h-4 w-4" />
              )}
            </div>

            {/* Bubble */}
            <div
              className={`max-w-[65%] rounded-2xl px-4 py-3 ${
                msg.is_admin
                  ? "bg-primary text-primary-foreground rounded-tr-sm"
                  : "bg-muted rounded-tl-sm"
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
              <p
                className={`text-[10px] mt-1.5 ${
                  msg.is_admin ? "text-primary-foreground/60" : "text-muted-foreground"
                }`}
              >
                {formatTime(msg.created_at)}
              </p>
            </div>
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Reply Input */}
      {currentStatus !== "resolved" && (
        <div className="flex-shrink-0 border-t border-border/40 bg-card/50 backdrop-blur-sm p-4">
          <div className="flex items-end gap-3">
            <textarea
              ref={textareaRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your reply... (Enter to send, Shift+Enter for new line)"
              rows={1}
              className="flex-1 resize-none rounded-xl border border-border/60 bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[44px] max-h-[120px]"
              style={{ height: "auto" }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "auto";
                target.style.height = Math.min(target.scrollHeight, 120) + "px";
              }}
            />
            <button
              onClick={handleSendReply}
              disabled={!newMessage.trim() || sending}
              className="flex items-center justify-center h-11 w-11 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
