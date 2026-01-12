'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Shield, 
  Save, 
  Camera,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";

interface ProfileData {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  phone_number: string | null;
  role: string | null;
  city: string | null;
  country: string | null;
  created_at: string;
  admin_role: string | null;
  permissions: any;
}

export default function ProfileClient({ initialProfile }: { initialProfile: ProfileData }) {
  const [profile, setProfile] = useState(initialProfile);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const supabase = createClient();

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          phone_number: profile.phone_number,
          city: profile.city,
          country: profile.country,
        })
        .eq('id', profile.id);

      if (error) throw error;
      
      // Show success state briefly (optional toast here)
      setTimeout(() => setIsSaving(false), 500);
    } catch (error) {
      console.error('Error updating profile:', error);
      setIsSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // Placeholder for actual storage upload implementation
    // This requires a storage bucket set up in Supabase
    alert("Avatar upload requires Storage bucket configuration.");
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <motion.div 
      className="max-w-4xl mx-auto space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Page Header */}
      <motion.div variants={itemVariants} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-4xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            My Profile
          </h1>
          <p className="text-muted-foreground mt-1 text-lg">
            Manage your personal information and account settings
          </p>
        </div>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="rounded-xl px-6 h-11 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {isSaving ? 'Saving Changes...' : 'Save Changes'}
          </Button>
        </motion.div>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-12">
        {/* Left Column: Avatar & Quick Info */}
        <motion.div variants={itemVariants} className="md:col-span-4 space-y-6">
          <div className="rounded-3xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 flex flex-col items-center text-center shadow-sm">
            <div className="relative group mb-4">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-background shadow-xl ring-4 ring-border/20">
                <img 
                  src={profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name || 'Admin')}&background=random`} 
                  alt="Profile" 
                  className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500"
                />
              </div>
              <label className="absolute bottom-0 right-0 p-2.5 rounded-full bg-primary text-white cursor-pointer shadow-lg hover:bg-primary/90 transition-all hover:scale-110 active:scale-95">
                <Camera className="w-4 h-4" />
                <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
              </label>
            </div>
            
            <h2 className="text-xl font-bold">{profile.full_name || 'Admin User'}</h2>
            <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              {profile.admin_role || 'Administrator'}
            </p>

            <div className="mt-6 w-full space-y-3">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-secondary/30 text-sm">
                <span className="text-muted-foreground">Status</span>
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-none px-2.5 py-0.5 rounded-lg">Active</Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-2xl bg-secondary/30 text-sm">
                <span className="text-muted-foreground">Detailed Role</span>
                <span className="font-medium">{profile.role || 'N/A'}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Column: Edit Forms */}
        <motion.div variants={itemVariants} className="md:col-span-8 space-y-6">
          {/* Identity Section */}
          <div className="rounded-3xl border border-border/50 bg-card/50 backdrop-blur-sm p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Personal Information</h3>
                <p className="text-sm text-muted-foreground">Update your personal details</p>
              </div>
            </div>

            <div className="grid gap-6">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <div className="relative">
                  <Input 
                    value={profile.full_name || ''} 
                    onChange={(e) => setProfile({...profile, full_name: e.target.value})}
                    className="pl-10 h-11 rounded-xl bg-background/50 border-input/60 focus:bg-background transition-colors"
                  />
                  <User className="w-4 h-4 absolute left-3.5 top-3.5 text-muted-foreground" />
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <div className="relative">
                    <Input 
                      value={profile.email || ''} 
                      disabled 
                      className="pl-10 h-11 rounded-xl bg-secondary/20 border-border/40 text-muted-foreground" 
                    />
                    <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-muted-foreground" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <div className="relative">
                    <Input 
                      value={profile.phone_number || ''} 
                      onChange={(e) => setProfile({...profile, phone_number: e.target.value})}
                      placeholder="+1 (555) 000-0000"
                      className="pl-10 h-11 rounded-xl bg-background/50 border-input/60 focus:bg-background"
                    />
                    <Phone className="w-4 h-4 absolute left-3.5 top-3.5 text-muted-foreground" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Location Section */}
          <div className="rounded-3xl border border-border/50 bg-card/50 backdrop-blur-sm p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-600">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Location Details</h3>
                <p className="text-sm text-muted-foreground">Where you are currently based</p>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>City</Label>
                <Input 
                  value={profile.city || ''} 
                  onChange={(e) => setProfile({...profile, city: e.target.value})}
                  className="h-11 rounded-xl bg-background/50 border-input/60"
                />
              </div>
              <div className="space-y-2">
                <Label>Country</Label>
                <Input 
                  value={profile.country || ''} 
                  onChange={(e) => setProfile({...profile, country: e.target.value})}
                  className="h-11 rounded-xl bg-background/50 border-input/60"
                />
              </div>
            </div>
          </div>

           {/* System Info */}
           <div className="rounded-3xl border border-border/50 bg-card/50 backdrop-blur-sm p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">System Information</h3>
                <p className="text-sm text-muted-foreground">Account security and metadata</p>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Member Since</Label>
                <div className="relative">
                  <Input 
                    value={new Date(profile.created_at).toLocaleDateString()} 
                    disabled 
                    className="pl-10 h-11 rounded-xl bg-secondary/20 border-border/40 text-muted-foreground" 
                  />
                  <Calendar className="w-4 h-4 absolute left-3.5 top-3.5 text-muted-foreground" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Admin Permissions</Label>
                 <Input 
                    value={Object.keys(profile.permissions || {}).length > 0 ? 'Custom' : 'Standard'} 
                    disabled 
                    className="h-11 rounded-xl bg-secondary/20 border-border/40 text-muted-foreground" 
                  />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
