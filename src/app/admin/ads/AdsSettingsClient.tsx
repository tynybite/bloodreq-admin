'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Plus,
  Megaphone,
  Save,
  Loader2,
  DollarSign,
  Eye,
  MousePointerClick,
  TrendingUp,
  Pause,
  Play,
  MoreHorizontal,
  Edit,
  BarChart3,
  Trash2,
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from 'sonner';
import { updateAdSettings } from './actions';
import { toggleCampaignStatus, deleteCampaign } from './campaign-actions';
import CountUp from "@/components/reactbits/CountUp";
import CampaignSheet from './CampaignSheet';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

interface Campaign {
  _id: string;
  title: string;
  sponsor: { name: string; logo_url?: string };
  status: string;
  start_date: Date;
  end_date: Date;
  views: number;
  clicks: number;
  billing: { amount_paid: number; payment_status: string };
  [key: string]: any;
}

interface AdsSettingsClientProps {
  initialGlobalEnabled: boolean;
  initialAdmob: any;
  initialMeta: any;
  initialCampaigns: Campaign[];
  campaignTypes: string[];
}

export default function AdsSettingsClient({ 
  initialGlobalEnabled,
  initialAdmob, 
  initialMeta, 
  initialCampaigns,
  campaignTypes 
}: AdsSettingsClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [campaignToDelete, setCampaignToDelete] = useState<string | null>(null);
  
  const [globalEnabled, setGlobalEnabled] = useState(initialGlobalEnabled);

  const [admob, setAdmob] = useState(initialAdmob || {
    enabled: false,
    appId: "",
    bannerId: "",
    interstitialId: "",
    rewardedId: ""
  });

  const [meta, setMeta] = useState(initialMeta || {
    enabled: false,
    appId: "",
    placementId: "",
    bannerId: "",
    interstitialId: ""
  });

  // Calculate stats from campaigns
  const stats = [
    { 
      label: 'Total Revenue', 
      value: initialCampaigns.reduce((sum, c) => sum + (c.billing?.amount_paid || 0), 0), 
      prefix: '₹', 
      gradient: 'from-emerald-500 to-teal-400', 
      icon: DollarSign 
    },
    { 
      label: 'Total Views', 
      value: initialCampaigns.reduce((sum, c) => sum + (c.views || 0), 0), 
      gradient: 'from-blue-500 to-cyan-400', 
      icon: Eye 
    },
    { 
      label: 'Total Clicks', 
      value: initialCampaigns.reduce((sum, c) => sum + (c.clicks || 0), 0), 
      gradient: 'from-violet-500 to-purple-500', 
      icon: MousePointerClick 
    },
    { 
      label: 'Active Campaigns', 
      value: initialCampaigns.filter(c => c.status === 'active').length, 
      gradient: 'from-amber-500 to-orange-400', 
      icon: TrendingUp 
    },
  ];

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await Promise.all([
        updateAdSettings('ads_global', { enabled: globalEnabled }),
        updateAdSettings('ads_admob', admob),
        updateAdSettings('ads_meta', meta)
      ]);
      toast.success("Ad settings saved successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save ad settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleCampaign = async (id: string) => {
    startTransition(async () => {
      try {
        await toggleCampaignStatus(id);
        router.refresh();
      } catch {
        toast.error('Failed to toggle campaign');
      }
    });
  };

  const handleDeleteCampaign = async () => {
    if (!campaignToDelete) return;
    startTransition(async () => {
      try {
        await deleteCampaign(campaignToDelete);
        toast.success('Campaign deleted');
        setDeleteDialogOpen(false);
        setCampaignToDelete(null);
        router.refresh();
      } catch {
        toast.error('Failed to delete campaign');
      }
    });
  };

  const openEditModal = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setEditingCampaign(null);
    setIsModalOpen(true);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-IN', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <>
      <motion.div 
        className="space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="font-display text-5xl font-bold tracking-tight bg-gradient-to-r from-pink-500 via-rose-500 to-orange-500 bg-clip-text text-transparent">
              Advertisements
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Manage ad platforms, IDs, and sponsored campaigns
            </p>
          </div>
          <div className="flex items-center gap-3">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-medium shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-shadow flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Settings
            </motion.button>

            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={openCreateModal}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white text-sm font-medium shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 transition-shadow flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Campaign
            </motion.button>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div variants={itemVariants} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <motion.div
              key={stat.label}
              whileHover={{ y: -2 }}
              className="relative overflow-hidden rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm p-5"
            >
              <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl ${stat.gradient} opacity-10 blur-2xl`} />
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold font-display mt-1">
                    {stat.prefix}<CountUp to={stat.value} duration={2} />
                  </p>
                </div>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Global Ad Switch */}
        <motion.div variants={itemVariants} className="p-6 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-primary" />
              Global Ad Control
            </h3>
            <p className="text-sm text-muted-foreground">
              Master switch to enable/disable all ads across the app instantly.
            </p>
          </div>
          <div className="flex items-center gap-3">
             <span className={globalEnabled ? "text-primary font-medium" : "text-muted-foreground"}>
                {globalEnabled ? "Ads Enabled" : "Ads Disabled"}
             </span>
             <Switch 
                checked={globalEnabled}
                onCheckedChange={setGlobalEnabled}
                className="data-[state=checked]:bg-primary"
             />
          </div>
        </motion.div>

        {/* Ad Platforms */}
        <motion.div variants={itemVariants} className="grid gap-6 lg:grid-cols-2">
          {/* AdMob */}
          <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                  <Megaphone className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Google AdMob</h3>
                  <p className="text-sm text-muted-foreground">Configure App & Unit IDs</p>
                </div>
              </div>
              <Switch 
                checked={admob.enabled} 
                onCheckedChange={(checked) => setAdmob({...admob, enabled: checked})} 
              />
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">App ID</Label>
                <Input 
                  placeholder="ca-app-pub-XXXXXXXX~XXXXXXXX" 
                  value={admob.appId} 
                  onChange={(e) => setAdmob({...admob, appId: e.target.value})}
                  className="rounded-xl bg-secondary/50 font-mono text-sm" 
                  disabled={!admob.enabled} 
                />
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Banner Unit ID</Label>
                  <Input 
                    placeholder="ca-app-pub-XXXXXXXX/XXXXXXXX" 
                    value={admob.bannerId} 
                    onChange={(e) => setAdmob({...admob, bannerId: e.target.value})}
                    className="rounded-xl bg-secondary/50 font-mono text-sm" 
                    disabled={!admob.enabled} 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Interstitial Unit ID</Label>
                  <Input 
                    placeholder="ca-app-pub-XXXXXXXX/XXXXXXXX" 
                    value={admob.interstitialId} 
                    onChange={(e) => setAdmob({...admob, interstitialId: e.target.value})}
                    className="rounded-xl bg-secondary/50 font-mono text-sm" 
                    disabled={!admob.enabled} 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Rewarded Unit ID</Label>
                  <Input 
                    placeholder="ca-app-pub-XXXXXXXX/XXXXXXXX" 
                    value={admob.rewardedId} 
                    onChange={(e) => setAdmob({...admob, rewardedId: e.target.value})}
                    className="rounded-xl bg-secondary/50 font-mono text-sm" 
                    disabled={!admob.enabled} 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Facebook / Meta */}
          <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
                  <Megaphone className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Meta Audience Network</h3>
                  <p className="text-sm text-muted-foreground">Configure Placement IDs</p>
                </div>
              </div>
              <Switch 
                checked={meta.enabled} 
                onCheckedChange={(checked) => setMeta({...meta, enabled: checked})} 
              />
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">App ID</Label>
                <Input 
                  placeholder="Facebook App ID" 
                  value={meta.appId}
                  onChange={(e) => setMeta({...meta, appId: e.target.value})}
                  className="rounded-xl bg-secondary/50 font-mono text-sm" 
                  disabled={!meta.enabled} 
                />
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Banner Placement ID</Label>
                  <Input 
                    placeholder="Placement ID" 
                    value={meta.bannerId} 
                    onChange={(e) => setMeta({...meta, bannerId: e.target.value})}
                    className="rounded-xl bg-secondary/50 font-mono text-sm" 
                    disabled={!meta.enabled} 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Interstitial Placement ID</Label>
                  <Input 
                    placeholder="Placement ID" 
                    value={meta.interstitialId} 
                    onChange={(e) => setMeta({...meta, interstitialId: e.target.value})}
                    className="rounded-xl bg-secondary/50 font-mono text-sm" 
                    disabled={!meta.enabled} 
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Campaigns Table */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl font-semibold">Sponsored Campaigns</h2>
            <Badge variant="outline" className="text-muted-foreground">
              {initialCampaigns.length} campaigns
            </Badge>
          </div>

          {initialCampaigns.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/50 bg-card/30 p-12 text-center">
              <Megaphone className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Campaigns Yet</h3>
              <p className="text-muted-foreground mb-4">Create your first sponsored campaign</p>
              <Button onClick={openCreateModal}>
                <Plus className="w-4 h-4 mr-2" />
                Create Campaign
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {initialCampaigns.map((campaign, i) => (
                <motion.div
                  key={campaign._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -2 }}
                  className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 flex flex-col lg:flex-row lg:items-center gap-6"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg truncate">{campaign.title}</h3>
                      <Badge className={
                        campaign.status === 'active' 
                          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' 
                          : campaign.status === 'paused'
                          ? 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                          : 'bg-zinc-500/10 text-zinc-500 border-zinc-500/30'
                      }>
                        {campaign.status}
                      </Badge>
                      {campaign.billing?.payment_status === 'pending' && (
                        <Badge variant="outline" className="text-amber-500 border-amber-500/30">
                          Payment Pending
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {campaign.sponsor?.name} • {formatDate(campaign.start_date)} - {formatDate(campaign.end_date)}
                    </p>
                  </div>

                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div>
                      <p className="text-lg font-bold">{(campaign.views / 1000).toFixed(1)}K</p>
                      <p className="text-xs text-muted-foreground">Views</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold">{campaign.clicks.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Clicks</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold">
                        {campaign.views > 0 ? ((campaign.clicks / campaign.views) * 100).toFixed(2) : 0}%
                      </p>
                      <p className="text-xs text-muted-foreground">CTR</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-emerald-500">
                        ₹{((campaign.billing?.amount_paid || 0) / 1000).toFixed(1)}K
                      </p>
                      <p className="text-xs text-muted-foreground">Revenue</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleToggleCampaign(campaign._id)}
                      disabled={isPending}
                      className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                        campaign.status === 'active' 
                          ? 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20' 
                          : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20'
                      }`}
                    >
                      {campaign.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </motion.button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditModal(campaign)}>
                          <Edit className="mr-2 h-4 w-4" />Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <BarChart3 className="mr-2 h-4 w-4" />Analytics
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-rose-500"
                          onClick={() => {
                            setCampaignToDelete(campaign._id);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* Campaign Sheet */}
      <CampaignSheet
        isOpen={isModalOpen}
        onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) setEditingCampaign(null);
        }}
        campaign={editingCampaign}
        campaignTypes={campaignTypes}
        onSuccess={() => router.refresh()}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Campaign?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The campaign and its analytics will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteCampaign}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
