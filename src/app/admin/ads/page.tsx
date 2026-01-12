'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus,
  MoreHorizontal,
  Megaphone,
  TrendingUp,
  Eye,
  MousePointerClick,
  DollarSign,
  Pause,
  Play,
  Edit,
  BarChart3,
  Settings,
  Trash2,
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import CountUp from "@/components/reactbits/CountUp";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

// Mock data
const campaigns = [
  {
    id: 1,
    name: "Lifeline Hospital Blood Bank",
    sponsor: "Lifeline Hospital",
    status: "active",
    startDate: "Jan 1, 2026",
    endDate: "Mar 31, 2026",
    views: 45230,
    clicks: 1234,
    ctr: 2.73,
    revenue: 15000,
    image: "/placeholder.jpg",
  },
  {
    id: 2,
    name: "Apollo Labs Health Checkup",
    sponsor: "Apollo Labs",
    status: "active",
    startDate: "Jan 5, 2026",
    endDate: "Feb 28, 2026",
    views: 32100,
    clicks: 890,
    ctr: 2.77,
    revenue: 8900,
  },
  {
    id: 3,
    name: "Red Crescent Emergency Support",
    sponsor: "Red Crescent",
    status: "paused",
    startDate: "Dec 15, 2025",
    endDate: "Jan 15, 2026",
    views: 28500,
    clicks: 654,
    ctr: 2.29,
    revenue: 6540,
  },
];

const stats = [
  { label: 'Total Revenue', value: 30440, prefix: '৳', gradient: 'from-emerald-500 to-teal-400', icon: DollarSign },
  { label: 'Total Views', value: 105830, gradient: 'from-blue-500 to-cyan-400', icon: Eye },
  { label: 'Total Clicks', value: 2778, gradient: 'from-violet-500 to-purple-500', icon: MousePointerClick },
  { label: 'Avg. CTR', value: 2.6, suffix: '%', gradient: 'from-amber-500 to-orange-400', icon: TrendingUp },
];

export default function AdsPage() {
  const [admobEnabled, setAdmobEnabled] = useState(true);
  const [facebookEnabled, setFacebookEnabled] = useState(false);

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
          <h1 className="font-display text-5xl font-bold tracking-tight bg-gradient-to-r from-pink-500 via-rose-500 to-orange-500 bg-clip-text text-transparent">
            Advertisements
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Manage ad platforms and sponsored campaigns
          </p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white text-sm font-medium shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 transition-shadow flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Campaign
        </motion.button>
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
                  {stat.prefix}<CountUp to={stat.value} duration={2} />{stat.suffix}
                </p>
              </div>
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
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
                <p className="text-sm text-muted-foreground">Banner, Interstitial, Rewarded</p>
              </div>
            </div>
            <Switch checked={admobEnabled} onCheckedChange={setAdmobEnabled} />
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">App ID</Label>
              <Input placeholder="ca-app-pub-XXXXXXXX" className="rounded-xl bg-secondary/50" disabled={!admobEnabled} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-secondary/30 text-center">
                <p className="text-2xl font-bold">45.2K</p>
                <p className="text-xs text-muted-foreground">Impressions</p>
              </div>
              <div className="p-4 rounded-xl bg-secondary/30 text-center">
                <p className="text-2xl font-bold text-emerald-500">৳12,340</p>
                <p className="text-xs text-muted-foreground">Revenue</p>
              </div>
            </div>
          </div>
        </div>

        {/* Facebook */}
        <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
                <Megaphone className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Meta Audience Network</h3>
                <p className="text-sm text-muted-foreground">Facebook Banner & Interstitial</p>
              </div>
            </div>
            <Switch checked={facebookEnabled} onCheckedChange={setFacebookEnabled} />
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">App ID</Label>
              <Input placeholder="Enter Facebook App ID" className="rounded-xl bg-secondary/50" disabled={!facebookEnabled} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-secondary/30 text-center">
                <p className="text-2xl font-bold text-muted-foreground">0</p>
                <p className="text-xs text-muted-foreground">Impressions</p>
              </div>
              <div className="p-4 rounded-xl bg-secondary/30 text-center">
                <p className="text-2xl font-bold text-muted-foreground">৳0</p>
                <p className="text-xs text-muted-foreground">Revenue</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Campaigns */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl font-semibold">Sponsored Campaigns</h2>
          <Button variant="outline" className="rounded-xl">
            <BarChart3 className="w-4 h-4 mr-2" />
            View Analytics
          </Button>
        </div>

        <div className="space-y-4">
          {campaigns.map((campaign, i) => (
            <motion.div
              key={campaign.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -2 }}
              className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 flex flex-col lg:flex-row lg:items-center gap-6"
            >
              {/* Campaign Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-lg truncate">{campaign.name}</h3>
                  <Badge className={campaign.status === 'active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' : 'bg-amber-500/10 text-amber-500 border-amber-500/30'}>
                    {campaign.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {campaign.sponsor} • {campaign.startDate} - {campaign.endDate}
                </p>
              </div>

              {/* Metrics */}
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
                  <p className="text-lg font-bold">{campaign.ctr}%</p>
                  <p className="text-xs text-muted-foreground">CTR</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-emerald-500">৳{(campaign.revenue / 1000).toFixed(1)}K</p>
                  <p className="text-xs text-muted-foreground">Revenue</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
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
                    <DropdownMenuItem><Edit className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                    <DropdownMenuItem><BarChart3 className="mr-2 h-4 w-4" />Analytics</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-rose-500"><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
