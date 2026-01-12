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
import { toast } from 'sonner';
import { updateSettings } from './actions';

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

export default function SettingsClient({ initialSettings }: { initialSettings: any }) {
  const [showKey, setShowKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Initialize state from props or defaults
  const [general, setGeneral] = useState(initialSettings?.general || {
    platformName: "BloodReq",
    supportEmail: "support@bloodreq.com",
    language: "en",
    timezone: "asia_dhaka"
  });

  const [notifications, setNotifications] = useState(initialSettings?.notifications || {
    push: true,
    sms: true,
    email: true,
    radius: "10"
  });

  const [security, setSecurity] = useState(initialSettings?.security || {
    twoFactor: false,
    ipRestriction: false,
    sessionTimeout: "30"
  });
  
  const [appearance, setAppearance] = useState(initialSettings?.appearance || {
      theme: "light",
      primaryColor: "#dc2626",
      enableAnimations: true
  });
  
  const [apiKeys, setApiKeys] = useState(initialSettings?.apiKeys || {
      supabaseUrl: "",
      supabaseAnonKey: "",
      admobAppId: "",
      facebookAppId: ""
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
        const settingsToSave = {
            general,
            notifications,
            security,
            appearance,
            apiKeys
        };
        await updateSettings(settingsToSave);
        toast.success("Settings saved successfully");
    } catch (error) {
        console.error(error);
        toast.error("Failed to save settings");
    } finally {
        setIsSaving(false);
    }
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
            <Input 
                value={general.platformName} 
                onChange={(e) => setGeneral({...general, platformName: e.target.value})}
                className="rounded-xl bg-secondary/50" 
            />
          </div>
          <div className="space-y-2">
            <Label>Support Email</Label>
            <Input 
                value={general.supportEmail}
                onChange={(e) => setGeneral({...general, supportEmail: e.target.value})}
                type="email" 
                className="rounded-xl bg-secondary/50" 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Default Language</Label>
              <Select value={general.language} onValueChange={(v) => setGeneral({...general, language: v})}>
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
              <Select value={general.timezone} onValueChange={(v) => setGeneral({...general, timezone: v})}>
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
              <Input 
                type="number" 
                value={notifications.radius} 
                onChange={(e) => setNotifications({...notifications, radius: e.target.value})}
                className="rounded-xl bg-secondary/50 w-24" 
              />
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
              <Input 
                type="number" 
                value={security.sessionTimeout} 
                onChange={(e) => setSecurity({...security, sessionTimeout: e.target.value})}
                className="rounded-xl bg-secondary/50 w-24" 
              />
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
            <Select value={appearance.theme} onValueChange={(v) => setAppearance({...appearance, theme: v})}>
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
              <div 
                className="w-10 h-10 rounded-xl border cursor-pointer" 
                style={{ backgroundColor: appearance.primaryColor }}
              />
              <Input 
                type="text" 
                value={appearance.primaryColor} 
                onChange={(e) => setAppearance({...appearance, primaryColor: e.target.value})}
                className="rounded-xl bg-secondary/50 flex-1 font-mono" 
              />
            </div>
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-border/50">
            <div>
              <p className="font-medium">Enable Animations</p>
              <p className="text-sm text-muted-foreground">Motion effects and transitions</p>
            </div>
            <Switch 
                checked={appearance.enableAnimations} 
                onCheckedChange={(v) => setAppearance({...appearance, enableAnimations: v})}
            />
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
            <Input 
                value={apiKeys.supabaseUrl} 
                onChange={(e) => setApiKeys({...apiKeys, supabaseUrl: e.target.value})}
                placeholder="https://xxx.supabase.co" 
                className="rounded-xl bg-secondary/50" 
            />
          </div>
          <div className="space-y-2">
            <Label>Supabase Anon Key</Label>
            <div className="relative">
              <Input 
                type={showKey ? "text" : "password"} 
                value={apiKeys.supabaseAnonKey} 
                onChange={(e) => setApiKeys({...apiKeys, supabaseAnonKey: e.target.value})}
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
            <Input 
                value={apiKeys.admobAppId} 
                onChange={(e) => setApiKeys({...apiKeys, admobAppId: e.target.value})}
                placeholder="ca-app-pub-XXXXXXXXXXXXXXXX" 
                className="rounded-xl bg-secondary/50" 
            />
          </div>
          <div className="space-y-2">
            <Label>Facebook App ID</Label>
            <Input 
                value={apiKeys.facebookAppId} 
                onChange={(e) => setApiKeys({...apiKeys, facebookAppId: e.target.value})}
                placeholder="Enter Facebook App ID" 
                className="rounded-xl bg-secondary/50" 
            />
          </div>
        </div>
      </SettingsSection>
    </motion.div>
  );
}
