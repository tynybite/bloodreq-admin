'use client';

import { useState, useEffect } from 'react';
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
  DollarSign,
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
import { useTheme } from 'next-themes';
import { useTranslations } from 'next-intl';
import { useLanguage } from '@/contexts/LanguageContext';

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
  const { theme: currentTheme, setTheme } = useTheme();
  const t = useTranslations('settings');
  const tCommon = useTranslations('common');
  const { 
    locale, 
    setLocale, 
    locales, 
    localeNames, 
    localeFlags,
    currency, 
    setCurrency, 
    currencies, 
    currencySymbols, 
    currencyNames 
  } = useLanguage();
  
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
      theme: currentTheme || "dark",
      primaryColor: "#dc2626",
      enableAnimations: true
  });
  
  const [apiKeys, setApiKeys] = useState(initialSettings?.apiKeys || {
      mongodbUri: "",
      firebaseProjectId: "",
      admobAppId: "",
      facebookAppId: ""
  });

  // Apply theme changes immediately
  useEffect(() => {
    if (appearance.theme && appearance.theme !== currentTheme) {
      setTheme(appearance.theme);
    }
  }, [appearance.theme, currentTheme, setTheme]);

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
        toast.success(tCommon('success'));
    } catch (error) {
        console.error(error);
        toast.error(tCommon('error'));
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
            {t('title')}
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            {t('subtitle')}
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
          {isSaving ? t('saving') : t('saveChanges')}
        </motion.button>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* General Settings */}
        <SettingsSection 
          title={t('general.title')} 
          description={t('general.description')} 
          icon={Globe}
          gradient="from-blue-500 to-cyan-400"
        >
          <div className="space-y-2">
            <Label>{t('general.platformName')}</Label>
            <Input 
                value={general.platformName} 
                onChange={(e) => setGeneral({...general, platformName: e.target.value})}
                className="rounded-xl bg-secondary/50" 
            />
          </div>
          <div className="space-y-2">
            <Label>{t('general.supportEmail')}</Label>
            <Input 
                value={general.supportEmail}
                onChange={(e) => setGeneral({...general, supportEmail: e.target.value})}
                type="email" 
                className="rounded-xl bg-secondary/50" 
            />
          </div>
          <div className="space-y-2">
              <Label>{t('general.timezone')}</Label>
              <Select value={general.timezone} onValueChange={(v) => setGeneral({...general, timezone: v})}>
                <SelectTrigger className="rounded-xl bg-secondary/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asia_dhaka">Asia/Dhaka (UTC+6)</SelectItem>
                  <SelectItem value="asia_kolkata">Asia/Kolkata (UTC+5:30)</SelectItem>
                  <SelectItem value="asia_karachi">Asia/Karachi (UTC+5)</SelectItem>
                  <SelectItem value="europe_berlin">Europe/Berlin (UTC+1)</SelectItem>
                  <SelectItem value="europe_paris">Europe/Paris (UTC+1)</SelectItem>
                  <SelectItem value="america_new_york">America/New York (UTC-5)</SelectItem>
                </SelectContent>
              </Select>
            </div>
        </SettingsSection>

        {/* Language & Currency */}
        <SettingsSection 
          title={t('currency.title')} 
          description={t('currency.description')} 
          icon={DollarSign}
          gradient="from-green-500 to-emerald-400"
        >
          <div className="space-y-2">
            <Label>{t('currency.language')}</Label>
            <Select value={locale} onValueChange={(v: any) => setLocale(v)}>
              <SelectTrigger className="rounded-xl bg-secondary/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {locales.map((loc) => (
                  <SelectItem key={loc} value={loc}>
                    <span className="mr-2">{localeFlags[loc]}</span>
                    {localeNames[loc]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">{t('currency.languageHint')}</p>
          </div>
          <div className="space-y-2">
            <Label>{t('currency.currency')}</Label>
            <Select value={currency} onValueChange={(v: any) => setCurrency(v)}>
              <SelectTrigger className="rounded-xl bg-secondary/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((cur) => (
                  <SelectItem key={cur} value={cur}>
                    <span className="font-mono mr-2">{currencySymbols[cur]}</span>
                    {currencyNames[cur]} ({cur})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">{t('currency.currencyHint')}</p>
          </div>
          <div className="p-4 rounded-xl bg-secondary/30 border border-border/30">
            <p className="text-sm text-muted-foreground">{t('currency.preview')}</p>
            <p className="text-2xl font-bold mt-1">
              {currencySymbols[currency]}1,234.56
            </p>
          </div>
        </SettingsSection>

        {/* Notifications */}
        <SettingsSection 
          title={t('notifications.title')} 
          description={t('notifications.description')} 
          icon={Bell}
          gradient="from-amber-500 to-orange-400"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium">{t('notifications.push')}</p>
                <p className="text-sm text-muted-foreground">{t('notifications.pushDesc')}</p>
              </div>
            </div>
            <Switch checked={notifications.push} onCheckedChange={(v) => setNotifications({...notifications, push: v})} />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium">{t('notifications.sms')}</p>
                <p className="text-sm text-muted-foreground">{t('notifications.smsDesc')}</p>
              </div>
            </div>
            <Switch checked={notifications.sms} onCheckedChange={(v) => setNotifications({...notifications, sms: v})} />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium">{t('notifications.email')}</p>
                <p className="text-sm text-muted-foreground">{t('notifications.emailDesc')}</p>
              </div>
            </div>
            <Switch checked={notifications.email} onCheckedChange={(v) => setNotifications({...notifications, email: v})} />
          </div>
          <div className="space-y-2 pt-4 border-t border-border/50">
            <Label>{t('notifications.radius')}</Label>
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
          title={t('security.title')} 
          description={t('security.description')} 
          icon={Shield}
          gradient="from-emerald-500 to-teal-400"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium">{t('security.twoFactor')}</p>
                <p className="text-sm text-muted-foreground">{t('security.twoFactorDesc')}</p>
              </div>
            </div>
            <Switch checked={security.twoFactor} onCheckedChange={(v) => setSecurity({...security, twoFactor: v})} />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium">{t('security.ipRestriction')}</p>
                <p className="text-sm text-muted-foreground">{t('security.ipRestrictionDesc')}</p>
              </div>
            </div>
            <Switch checked={security.ipRestriction} onCheckedChange={(v) => setSecurity({...security, ipRestriction: v})} />
          </div>
          <div className="space-y-2 pt-4 border-t border-border/50">
            <Label>{t('security.sessionTimeout')}</Label>
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
          title={t('appearance.title')} 
          description={t('appearance.description')} 
          icon={Palette}
          gradient="from-violet-500 to-purple-500"
        >
          <div className="space-y-2">
            <Label>{t('appearance.theme')}</Label>
            <Select value={appearance.theme} onValueChange={(v) => setAppearance({...appearance, theme: v})}>
              <SelectTrigger className="rounded-xl bg-secondary/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">{t('appearance.light')}</SelectItem>
                <SelectItem value="dark">{t('appearance.dark')}</SelectItem>
                <SelectItem value="system">{t('appearance.system')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{t('appearance.primaryColor')}</Label>
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
              <p className="font-medium">{t('appearance.animations')}</p>
              <p className="text-sm text-muted-foreground">{t('appearance.animationsDesc')}</p>
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
        title={t('apiKeys.title')} 
        description={t('apiKeys.description')} 
        icon={Key}
        gradient="from-rose-500 to-pink-500"
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-2">
            <Label>{t('apiKeys.mongodbUri')}</Label>
            <Input 
                value={apiKeys.mongodbUri} 
                onChange={(e) => setApiKeys({...apiKeys, mongodbUri: e.target.value})}
                placeholder="mongodb+srv://..." 
                className="rounded-xl bg-secondary/50" 
            />
          </div>
          <div className="space-y-2">
            <Label>{t('apiKeys.firebaseProjectId')}</Label>
            <div className="relative">
              <Input 
                type={showKey ? "text" : "password"} 
                value={apiKeys.firebaseProjectId} 
                onChange={(e) => setApiKeys({...apiKeys, firebaseProjectId: e.target.value})}
                placeholder="my-project-id" 
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
            <Label>{t('apiKeys.admobAppId')}</Label>
            <Input 
                value={apiKeys.admobAppId} 
                onChange={(e) => setApiKeys({...apiKeys, admobAppId: e.target.value})}
                placeholder="ca-app-pub-XXXXXXXXXXXXXXXX" 
                className="rounded-xl bg-secondary/50" 
            />
          </div>
          <div className="space-y-2">
            <Label>{t('apiKeys.facebookAppId')}</Label>
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
