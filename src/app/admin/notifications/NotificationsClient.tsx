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
  Megaphone,
  Image as ImageIcon,
  Link as LinkIcon,
  Code,
  Smartphone
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
import { useTranslations } from 'next-intl';

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
  image_url?: string;
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
  const [formData, setFormData] = useState<NotificationFormData & { dataString: string }>({
    title: '',
    message: '',
    segment: 'all',
    blood_group: undefined,
    imageUrl: '',
    url: '',
    dataString: '',
  });
  const t = useTranslations('notifications');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.message.trim()) {
      toast.error(t('fillRequired'));
      return;
    }

    if (formData.segment === 'blood_group' && !formData.blood_group) {
      toast.error(t('selectBloodGroupError'));
      return;
    }

    // Validate JSON if present
    if (formData.dataString) {
      try {
        JSON.parse(formData.dataString);
      } catch (e) {
        toast.error('Invalid JSON in Custom Data field');
        return;
      }
    }

    setIsLoading(true);
    try {
      const result = await sendAdminNotification({
        ...formData,
        data: formData.dataString // Send as string to be parsed by server
      });
      toast.success(t('sentSuccess', { count: result.recipients || 0 }));
      
      // Add to local history (Optimistic)
      setHistory(prev => [{
        id: result.id || `temp-${Date.now()}`,
        title: formData.title,
        message: formData.message,
        segment: formData.segment === 'all' ? t('allUsers') : `${t('bloodGroup')}: ${formData.blood_group}`,
        blood_group: formData.blood_group || null,
        recipients: result.recipients || 0,
        success: true,
        error: null,
        created_at: new Date().toISOString(),
        admin_users: { full_name: 'You' }, // Placeholder
        image_url: formData.imageUrl,
      }, ...prev]);

      // Reset form (keep segment logic if needed, but safe to clear)
      setFormData(prev => ({ 
        ...prev, 
        title: '', 
        message: '',
        imageUrl: '',
        url: '',
        dataString: ''
      }));
    } catch (error: any) {
      toast.error(error.message || t('sendError'));
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
            {t('title')} <span className="text-xs font-normal px-2 py-1 bg-purple-500/10 text-purple-600 rounded-full border border-purple-200 dark:border-purple-800">Rich Push Supported</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Create engaging notifications with images and actions.
          </p>
        </div>
      </motion.div>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Left Col: Composer (7 cols) */}
        <motion.div variants={itemVariants} className="lg:col-span-7 space-y-8">
          <div className="rounded-2xl border border-border bg-card p-6 space-y-6">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Megaphone className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold">Composer</h2>
                <p className="text-sm text-muted-foreground">Craft your message</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Target Segment */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t('targetAudience')}</Label>
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
                          {t('allUsers')}
                        </div>
                      </SelectItem>
                      <SelectItem value="blood_group">
                        <div className="flex items-center gap-2">
                          <Droplet className="w-4 h-4" />
                          {t('bloodGroup')}
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.segment === 'blood_group' && (
                  <div className="space-y-2">
                    <Label>{t('bloodGroup')}</Label>
                    <Select 
                      value={formData.blood_group} 
                      onValueChange={(v) => setFormData(prev => ({ ...prev, blood_group: v }))}
                    >
                      <SelectTrigger className="h-11 rounded-xl">
                        <SelectValue placeholder={t('selectBloodGroup')} />
                      </SelectTrigger>
                      <SelectContent>
                        <div className="grid grid-cols-4 gap-1 p-1">
                          {BLOOD_GROUPS.map(bg => (
                            <SelectItem key={bg} value={bg} className="justify-center text-center rounded-lg">
                              {bg}
                            </SelectItem>
                          ))}
                        </div>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {/* Title & Message */}
              <div className="space-y-4">
                 <div className="space-y-2">
                  <Label>{t('notificationTitle')}</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Urgent Blood Request"
                    className="h-11 rounded-xl"
                    maxLength={100}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('message')}</Label>
                  <Textarea
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Enter your notification text..."
                    className="min-h-[100px] rounded-xl resize-none"
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground text-right">{formData.message.length}/500</p>
                </div>
              </div>

              {/* Rich Media Section */}
              <div className="space-y-4 pt-4 border-t border-border">
                <h3 className="text-sm font-medium flex items-center gap-2 text-foreground">
                  <ImageIcon className="w-4 h-4" /> Rich Media
                </h3>
                 <div className="space-y-2">
                  <Label>Image URL (Optional)</Label>
                  <div className="relative">
                    <ImageIcon className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      value={formData.imageUrl || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                      placeholder="https://example.com/banner.jpg"
                      className="pl-10 h-11 rounded-xl font-mono text-sm"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Appears as a large banner on Android & iOS.</p>
                </div>
              </div>

               {/* Advanced Options */}
               <div className="space-y-4 pt-4 border-t border-border">
                <h3 className="text-sm font-medium flex items-center gap-2 text-foreground">
                  <Code className="w-4 h-4" /> Advanced
                </h3>
                
                 <div className="space-y-2">
                  <Label>Launch URL</Label>
                   <div className="relative">
                    <LinkIcon className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      value={formData.url || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                      placeholder="https://..."
                      className="pl-10 h-11 rounded-xl font-mono text-sm"
                    />
                   </div>
                </div>

                <div className="space-y-2">
                  <Label>Custom Data (JSON)</Label>
                  <Textarea
                    value={formData.dataString}
                    onChange={(e) => setFormData(prev => ({ ...prev, dataString: e.target.value }))}
                    placeholder={'{"type": "promo", "id": "123"}'}
                    className="min-h-[80px] rounded-xl font-mono text-sm"
                  />
                </div>
              </div>

              {/* Submit */}
              <Button type="submit" className="w-full h-12 rounded-xl" disabled={isLoading}>
                {isLoading ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {t('sending')}</>
                ) : (
                  <><Send className="w-4 h-4 mr-2" /> Send Notification</>
                )}
              </Button>
            </form>
          </div>
        </motion.div>

        {/* Right Col: Preview & History (5 cols) */}
        <motion.div variants={itemVariants} className="lg:col-span-5 space-y-8">
           {/* Mobile Preview */}
           <div className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center gap-3 mb-6">
                 <div className="p-2 rounded-lg bg-primary/10">
                    <Smartphone className="w-5 h-5 text-primary" />
                 </div>
                 <h2 className="font-semibold">Preview</h2>
              </div>
              
              {/* Android Mockup */}
              <div className="mx-auto max-w-[320px] bg-white text-gray-900 rounded-3xl overflow-hidden shadow-2xl border-4 border-gray-800">
                  {/* Status Bar */}
                  <div className="h-6 bg-gray-900 flex items-center justify-between px-4 text-[10px] text-white font-medium">
                      <span>12:00</span>
                      <div className="flex gap-1">
                          <span>5G</span>
                          <span>100%</span>
                      </div>
                  </div>
                  {/* Lock Screen Wallpaper placeholder */}
                  <div className="bg-gradient-to-br from-rose-400 to-orange-300 min-h-[400px] p-4 relative">
                      {/* Notification Card */}
                      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden">
                          <div className="p-3">
                              <div className="flex items-center gap-2 mb-2">
                                  <div className="w-5 h-5 rounded bg-rose-600 flex items-center justify-center text-[10px] text-white font-bold">BR</div>
                                  <span className="text-xs font-semibold text-gray-600">BloodReq • Now</span>
                              </div>
                              <h4 className="font-bold text-sm leading-tight text-gray-900">
                                  {formData.title || "Notification Title"}
                              </h4>
                              <p className="text-xs text-gray-700 mt-1 leading-snug">
                                  {formData.message || "Your notification message will appear here."}
                              </p>
                          </div>
                          {/* Big Picture */}
                          {formData.imageUrl && (
                              <div className="w-full h-32 bg-gray-100 relative">
                                  {/* Use simple img for preview */}
                                  <img 
                                    src={formData.imageUrl} 
                                    alt="Preview" 
                                    className="w-full h-full object-cover"
                                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=Invalid+Image'; }}
                                  />
                              </div>
                          )}
                      </div>
                      
                      {/* Hint */}
                      <div className="absolute bottom-4 left-0 right-0 text-center text-white/80 text-xs">
                          Android Lock Screen Preview
                      </div>
                  </div>
              </div>
           </div>

           {/* History (Mini) */}
           <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Recent History
              </h2>
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                 {history.slice(0, 5).map((item) => (
                    <div key={item.id} className="p-3 rounded-lg bg-secondary/50 text-sm border border-border/50">
                        <div className="font-medium truncate">{item.title}</div>
                        <div className="text-xs text-muted-foreground flex justify-between mt-1">
                             <span>{new Date(item.created_at).toLocaleDateString()}</span>
                             <span className={item.success ? "text-emerald-500" : "text-rose-500"}>
                                 {item.success ? "Sent" : "Failed"}
                             </span>
                        </div>
                    </div>
                 ))}
                 {history.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No history yet.</p>}
              </div>
           </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

