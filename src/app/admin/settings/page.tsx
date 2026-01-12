'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings,
  Bell,
  Shield,
  Palette,
  Key,
  Save,
  Globe,
  Mail,
  Smartphone,
  Clock,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

interface SettingsSectionProps {
  title: string;
  description: string;
  icon: React.ElementType;
  gradient: string;
  children: React.ReactNode;
}

function SettingsSection({ title, description, icon: Icon, gradient, children }: SettingsSectionProps) {
  return (
    <motion.div 
      variants={itemVariants}
      className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden"
    >
      <div className="p-6 border-b border-border/50 flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="p-6 space-y-6">{children}</div>
    </motion.div>
  );
}

export default function SettingsPage() {
  const [showKey, setShowKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [notifications, setNotifications] = useState({
    push: true,
    sms: true,
    email: true,
  });
  const [security, setSecurity] = useState({
    twoFactor: false,
    ipRestriction: false,
  });

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call - in a real app, updates would go to 'settings' table or 'profiles' metadata
    await new Promise(resolve => setTimeout(resolve, 1000));
    // toast.success("Settings saved successfully"); // Needs toast import
    setIsSaving(false);
    console.log("Settings saved:", { notifications, security });
  };

  return (
    <motion.div 
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-display text-5xl font-bold tracking-tight bg-gradient-to-r from-slate-600 via-zinc-600 to-neutral-600 dark:from-slate-300 dark:via-zinc-300 dark:to-neutral-300 bg-clip-text text-transparent">
            Settings
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Configure platform settings and preferences
          </p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          disabled={isSaving}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-rose-600 text-white text-sm font-medium shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow flex items-center gap-2 disabled:opacity-70"
        >
          <Save className="w-4 h-4" />
          {isSaving ? "Saving..." : "Save Changes"}
        </motion.button>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* General Settings */}
        <SettingsSection 
          title="General" 
          description="Platform name and localization" 
          icon={Globe}
          gradient="from-blue-500 to-cyan-400"
        >
          <div className="space-y-2">
            <Label>Platform Name</Label>
            <Input defaultValue="BloodReq" className="rounded-xl bg-secondary/50" />
          </div>
          <div className="space-y-2">
            <Label>Support Email</Label>
            <Input defaultValue="support@bloodreq.com" type="email" className="rounded-xl bg-secondary/50" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Default Language</Label>
              <Select defaultValue="en">
                <SelectTrigger className="rounded-xl bg-secondary/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="bn">Bengali</SelectItem>
                  <SelectItem value="hi">Hindi</SelectItem>
                  <SelectItem value="ur">Urdu</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Timezone</Label>
              <Select defaultValue="asia_dhaka">
                <SelectTrigger className="rounded-xl bg-secondary/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asia_dhaka">Asia/Dhaka</SelectItem>
                  <SelectItem value="asia_kolkata">Asia/Kolkata</SelectItem>
                  <SelectItem value="asia_karachi">Asia/Karachi</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </SettingsSection>

        {/* Notifications */}
        <SettingsSection 
          title="Notifications" 
          description="Alert channels and preferences" 
          icon={Bell}
          gradient="from-amber-500 to-orange-400"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Push Notifications</p>
                <p className="text-sm text-muted-foreground">Mobile app alerts</p>
              </div>
            </div>
            <Switch checked={notifications.push} onCheckedChange={(v) => setNotifications({...notifications, push: v})} />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium">SMS Notifications</p>
                <p className="text-sm text-muted-foreground">Text message alerts</p>
              </div>
            </div>
            <Switch checked={notifications.sms} onCheckedChange={(v) => setNotifications({...notifications, sms: v})} />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-muted-foreground">Email alerts for admins</p>
              </div>
            </div>
            <Switch checked={notifications.email} onCheckedChange={(v) => setNotifications({...notifications, email: v})} />
          </div>
          <div className="space-y-2 pt-4 border-t border-border/50">
            <Label>Default Notification Radius</Label>
            <div className="flex items-center gap-3">
              <Input type="number" defaultValue="10" className="rounded-xl bg-secondary/50 w-24" />
              <span className="text-muted-foreground">km</span>
            </div>
          </div>
        </SettingsSection>

        {/* Security */}
        <SettingsSection 
          title="Security" 
          description="Access control and authentication" 
          icon={Shield}
          gradient="from-emerald-500 to-teal-400"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Two-Factor Authentication</p>
                <p className="text-sm text-muted-foreground">Require 2FA for admin login</p>
              </div>
            </div>
            <Switch checked={security.twoFactor} onCheckedChange={(v) => setSecurity({...security, twoFactor: v})} />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium">IP Restriction</p>
                <p className="text-sm text-muted-foreground">Whitelist admin IPs only</p>
              </div>
            </div>
            <Switch checked={security.ipRestriction} onCheckedChange={(v) => setSecurity({...security, ipRestriction: v})} />
          </div>
          <div className="space-y-2 pt-4 border-t border-border/50">
            <Label>Session Timeout</Label>
            <div className="flex items-center gap-3">
              <Input type="number" defaultValue="30" className="rounded-xl bg-secondary/50 w-24" />
              <span className="text-muted-foreground">minutes</span>
            </div>
          </div>
        </SettingsSection>

        {/* Appearance */}
        <SettingsSection 
          title="Appearance" 
          description="Theme and visual preferences" 
          icon={Palette}
          gradient="from-violet-500 to-purple-500"
        >
          <div className="space-y-2">
            <Label>Default Theme</Label>
            <Select defaultValue="light">
              <SelectTrigger className="rounded-xl bg-secondary/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Primary Color</Label>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary border cursor-pointer" />
              <Input type="text" defaultValue="#dc2626" className="rounded-xl bg-secondary/50 flex-1 font-mono" />
            </div>
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-border/50">
            <div>
              <p className="font-medium">Enable Animations</p>
              <p className="text-sm text-muted-foreground">Motion effects and transitions</p>
            </div>
            <Switch defaultChecked />
          </div>
        </SettingsSection>
      </div>

      {/* API Keys */}
      <SettingsSection 
        title="API Keys" 
        description="External service credentials" 
        icon={Key}
        gradient="from-rose-500 to-pink-500"
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-2">
            <Label>Supabase URL</Label>
            <Input placeholder="https://xxx.supabase.co" className="rounded-xl bg-secondary/50" />
          </div>
          <div className="space-y-2">
            <Label>Supabase Anon Key</Label>
            <div className="relative">
              <Input 
                type={showKey ? "text" : "password"} 
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." 
                className="rounded-xl bg-secondary/50 pr-10" 
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7"
                onClick={() => setShowKey(!showKey)}
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Google AdMob App ID</Label>
            <Input placeholder="ca-app-pub-XXXXXXXXXXXXXXXX" className="rounded-xl bg-secondary/50" />
          </div>
          <div className="space-y-2">
            <Label>Facebook App ID</Label>
            <Input placeholder="Enter Facebook App ID" className="rounded-xl bg-secondary/50" />
          </div>
        </div>
      </SettingsSection>
    </motion.div>
  );
}
