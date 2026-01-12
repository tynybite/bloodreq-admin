'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Mail, 
  Server, 
  Lock, 
  User, 
  Send, 
  Loader2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { saveSMTPSettings, sendTestEmail, SMTPSettings } from './actions';

interface EmailSettingsClientProps {
  initialSettings: SMTPSettings | null;
}

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

export default function EmailSettingsClient({ initialSettings }: EmailSettingsClientProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  
  const [settings, setSettings] = useState<SMTPSettings>(initialSettings || {
    host: '',
    port: 587,
    secure: false,
    auth_user: '',
    auth_pass: '',
    from_email: '',
    from_name: 'BloodReq',
  });

  const handleChange = (field: keyof SMTPSettings, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!settings.host || !settings.port) {
      toast.error('Please fill in SMTP host and port');
      return;
    }

    setIsSaving(true);
    try {
      await saveSMTPSettings(settings);
      toast.success('SMTP settings saved successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = async () => {
    if (!testEmail) {
      toast.error('Please enter a test email address');
      return;
    }

    setIsTesting(true);
    try {
      const result = await sendTestEmail(testEmail);
      toast.success(result.message || 'Test email sent successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send test email');
    } finally {
      setIsTesting(false);
    }
  };

  const isConfigured = settings.host && settings.port && settings.auth_user && settings.from_email;

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
              <Mail className="w-6 h-6 text-primary" />
            </div>
            Email Settings
          </h1>
          <p className="text-muted-foreground mt-1">
            Configure SMTP for sending emails
          </p>
        </div>
        <Badge variant={isConfigured ? "default" : "secondary"} className="text-xs">
          {isConfigured ? (
            <><CheckCircle2 className="w-3 h-3 mr-1" />Configured</>
          ) : (
            <><AlertCircle className="w-3 h-3 mr-1" />Not Configured</>
          )}
        </Badge>
      </motion.div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* SMTP Configuration */}
        <motion.div variants={itemVariants}>
          <div className="rounded-2xl border border-border bg-card p-6 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-semibold">SMTP Server</h2>
                <p className="text-sm text-muted-foreground">Server connection details</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Host */}
              <div className="space-y-2">
                <Label>SMTP Host</Label>
                <Input
                  value={settings.host}
                  onChange={(e) => handleChange('host', e.target.value)}
                  placeholder="smtp.gmail.com"
                  className="h-11 rounded-xl"
                />
              </div>

              {/* Port */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Port</Label>
                  <Input
                    type="number"
                    value={settings.port}
                    onChange={(e) => handleChange('port', parseInt(e.target.value))}
                    placeholder="587"
                    className="h-11 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>SSL/TLS</Label>
                  <div className="flex items-center h-11 px-4 rounded-xl bg-secondary/30">
                    <Switch
                      checked={settings.secure}
                      onCheckedChange={(v) => handleChange('secure', v)}
                    />
                    <span className="ml-3 text-sm">
                      {settings.secure ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Authentication */}
        <motion.div variants={itemVariants}>
          <div className="rounded-2xl border border-border bg-card p-6 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-semibold">Authentication</h2>
                <p className="text-sm text-muted-foreground">Login credentials</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Username */}
              <div className="space-y-2">
                <Label>Username / Email</Label>
                <Input
                  value={settings.auth_user}
                  onChange={(e) => handleChange('auth_user', e.target.value)}
                  placeholder="your-email@gmail.com"
                  className="h-11 rounded-xl"
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label>Password / App Password</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={settings.auth_pass}
                    onChange={(e) => handleChange('auth_pass', e.target.value)}
                    placeholder="••••••••••••"
                    className="h-11 rounded-xl pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  For Gmail, use an App Password instead of your account password
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Sender Info */}
        <motion.div variants={itemVariants}>
          <div className="rounded-2xl border border-border bg-card p-6 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-semibold">Sender Information</h2>
                <p className="text-sm text-muted-foreground">From address details</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* From Email */}
              <div className="space-y-2">
                <Label>From Email</Label>
                <Input
                  type="email"
                  value={settings.from_email}
                  onChange={(e) => handleChange('from_email', e.target.value)}
                  placeholder="noreply@bloodreq.com"
                  className="h-11 rounded-xl"
                />
              </div>

              {/* From Name */}
              <div className="space-y-2">
                <Label>From Name</Label>
                <Input
                  value={settings.from_name}
                  onChange={(e) => handleChange('from_name', e.target.value)}
                  placeholder="BloodReq"
                  className="h-11 rounded-xl"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Test & Save */}
        <motion.div variants={itemVariants}>
          <div className="rounded-2xl border border-border bg-card p-6 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-semibold">Test Configuration</h2>
                <p className="text-sm text-muted-foreground">Send a test email</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Test Email Address</Label>
                <div className="flex gap-2">
                  <Input
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="test@example.com"
                    className="h-11 rounded-xl"
                  />
                  <Button
                    onClick={handleTest}
                    disabled={isTesting || !isConfigured}
                    variant="secondary"
                    className="h-11 px-6 rounded-xl shrink-0"
                  >
                    {isTesting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Test
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full h-12 rounded-xl"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Settings'
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
