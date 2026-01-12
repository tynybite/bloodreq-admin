'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Bell, 
  Send, 
  Users, 
  Droplet, 
  CheckCircle2, 
  XCircle,
  Clock,
  Loader2,
  Megaphone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { sendAdminNotification, NotificationFormData } from './actions';

interface NotificationLog {
  id: string;
  title: string;
  message: string;
  segment: string;
  blood_group: string | null;
  recipients: number;
  success: boolean;
  error: string | null;
  created_at: string;
  admin_users?: { full_name: string } | null;
}

interface NotificationsClientProps {
  initialHistory: NotificationLog[];
}

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function NotificationsClient({ initialHistory }: NotificationsClientProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<NotificationLog[]>(initialHistory);
  const [formData, setFormData] = useState<NotificationFormData>({
    title: '',
    message: '',
    segment: 'all',
    blood_group: undefined,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.message.trim()) {
      toast.error('Please fill in title and message');
      return;
    }

    if (formData.segment === 'blood_group' && !formData.blood_group) {
      toast.error('Please select a blood group');
      return;
    }

    setIsLoading(true);
    try {
      const result = await sendAdminNotification(formData);
      toast.success(`Notification sent to ${result.recipients || 0} users`);
      
      // Add to local history
      setHistory(prev => [{
        id: result.id || 'temp',
        title: formData.title,
        message: formData.message,
        segment: formData.segment === 'all' ? 'All' : `Blood Group: ${formData.blood_group}`,
        blood_group: formData.blood_group || null,
        recipients: result.recipients || 0,
        success: true,
        error: null,
        created_at: new Date().toISOString(),
        admin_users: null,
      }, ...prev]);

      // Reset form
      setFormData({ title: '', message: '', segment: 'all', blood_group: undefined });
    } catch (error: any) {
      toast.error(error.message || 'Failed to send notification');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <Bell className="w-6 h-6 text-primary" />
            </div>
            Push Notifications
          </h1>
          <p className="text-muted-foreground mt-1">
            Send notifications to app users
          </p>
        </div>
      </motion.div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Send Notification Form */}
        <motion.div variants={itemVariants}>
          <div className="rounded-2xl border border-border bg-card p-6 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Megaphone className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold">Send Notification</h2>
                <p className="text-sm text-muted-foreground">Broadcast to users</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Target Segment */}
              <div className="space-y-2">
                <Label>Target Audience</Label>
                <Select 
                  value={formData.segment} 
                  onValueChange={(v: 'all' | 'blood_group') => setFormData(prev => ({ ...prev, segment: v }))}
                >
                  <SelectTrigger className="h-11 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        All Users
                      </div>
                    </SelectItem>
                    <SelectItem value="blood_group">
                      <div className="flex items-center gap-2">
                        <Droplet className="w-4 h-4" />
                        Blood Group
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Blood Group Selector */}
              {formData.segment === 'blood_group' && (
                <div className="space-y-2">
                  <Label>Blood Group</Label>
                  <Select 
                    value={formData.blood_group} 
                    onValueChange={(v) => setFormData(prev => ({ ...prev, blood_group: v }))}
                  >
                    <SelectTrigger className="h-11 rounded-xl">
                      <SelectValue placeholder="Select blood group" />
                    </SelectTrigger>
                    <SelectContent>
                      <div className="grid grid-cols-4 gap-1 p-1">
                        {BLOOD_GROUPS.map(bg => (
                          <SelectItem 
                            key={bg} 
                            value={bg}
                            className="justify-center text-center rounded-lg"
                          >
                            {bg}
                          </SelectItem>
                        ))}
                      </div>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Title */}
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Notification title..."
                  className="h-11 rounded-xl"
                  maxLength={100}
                />
              </div>

              {/* Message */}
              <div className="space-y-2">
                <Label>Message</Label>
                <Textarea
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Notification message..."
                  className="min-h-[100px] rounded-xl resize-none"
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {formData.message.length}/500
                </p>
              </div>

              {/* Submit */}
              <Button 
                type="submit" 
                className="w-full h-12 rounded-xl"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Notification
                  </>
                )}
              </Button>
            </form>
          </div>
        </motion.div>

        {/* Notification History */}
        <motion.div variants={itemVariants}>
          <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-secondary">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-semibold">Recent Notifications</h2>
                  <p className="text-sm text-muted-foreground">History of sent notifications</p>
                </div>
              </div>
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {history.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Bell className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>No notifications sent yet</p>
                </div>
              ) : (
                history.map((item) => (
                  <div 
                    key={item.id}
                    className="p-4 rounded-xl bg-secondary/30 border border-border/50 space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{item.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {item.message}
                        </p>
                      </div>
                      {item.success ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="secondary" className="text-[10px]">
                        {item.segment}
                      </Badge>
                      <span>•</span>
                      <span>{item.recipients} recipients</span>
                      <span>•</span>
                      <span>{new Date(item.created_at).toLocaleDateString()}</span>
                    </div>
                    {item.error && (
                      <p className="text-xs text-rose-500">{item.error}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
