'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  MoreHorizontal,
  Plus,
  Megaphone,
  TrendingUp,
  Eye,
  MousePointerClick,
  DollarSign,
  Pause,
  Play,
  Edit,
  Activity,
} from "lucide-react";
import SpotlightCard from "@/components/reactbits/SpotlightCard";
import CountUp from "@/components/reactbits/CountUp";

// Mock campaign data
const campaigns = [
  {
    id: 1,
    name: "Lifeline Hospital Blood Bank",
    sponsor: "Lifeline Hospital",
    status: "active",
    startDate: "2026-01-01",
    endDate: "2026-03-31",
    views: 45230,
    clicks: 1234,
    ctr: 2.73,
    revenue: 15000,
  },
  {
    id: 2,
    name: "Apollo Labs Health Checkup",
    sponsor: "Apollo Labs",
    status: "active",
    startDate: "2026-01-05",
    endDate: "2026-02-28",
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
    startDate: "2025-12-15",
    endDate: "2026-01-15",
    views: 28500,
    clicks: 654,
    ctr: 2.29,
    revenue: 6540,
  },
];

export default function AdsPage() {
  const [admobEnabled, setAdmobEnabled] = useState(true);
  const [facebookEnabled, setFacebookEnabled] = useState(false);

  const stats = [
    { label: "Total Revenue", value: 30440, color: "text-emerald-500", bg: "bg-emerald-500/10", icon: DollarSign, prefix: "৳" },
    { label: "Total Views", value: 105830, color: "text-blue-500", bg: "bg-blue-500/10", icon: Eye },
    { label: "Total Clicks", value: 2778, color: "text-purple-500", bg: "bg-purple-500/10", icon: MousePointerClick },
    { label: "Avg. CTR", value: 2.6, color: "text-amber-500", bg: "bg-amber-500/10", icon: TrendingUp, suffix: "%" },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-foreground">Advertisements</h1>
          <p className="text-muted-foreground mt-1">
            Manage ad platforms and sponsored campaigns
          </p>
        </div>
        <Button className="bg-primary hover:bg-red-600">
          <Plus className="w-4 h-4 mr-2" />
          Create Campaign
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <SpotlightCard key={stat.label} className="p-6 border-border/50 bg-card/50 backdrop-blur-md" spotlightColor="rgba(220, 38, 38, 0.1)">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                <p className={`text-3xl font-bold font-display mt-2 ${stat.color}`}>
                  {stat.prefix}<CountUp to={stat.value} duration={2} />{stat.suffix}
                </p>
              </div>
              <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
          </SpotlightCard>
        ))}
      </div>

      {/* Ad Platforms */}
      <div className="grid gap-6 lg:grid-cols-2">
        <SpotlightCard className="p-0 border-border/50 bg-card/50 backdrop-blur-md" spotlightColor="rgba(220, 38, 38, 0.1)">
          <CardHeader className="p-6 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Megaphone className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <CardTitle className="text-foreground">Google AdMob</CardTitle>
                  <CardDescription>Banner, Interstitial, Rewarded ads</CardDescription>
                </div>
              </div>
              <Switch checked={admobEnabled} onCheckedChange={setAdmobEnabled} />
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-0 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admob-app-id">App ID</Label>
              <Input id="admob-app-id" placeholder="ca-app-pub-XXXXXXXX" className="bg-secondary/50" disabled={!admobEnabled} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admob-banner">Banner Unit ID</Label>
              <Input id="admob-banner" placeholder="ca-app-pub-XXXX/XXXX" className="bg-secondary/50" disabled={!admobEnabled} />
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="text-center p-3 bg-secondary/30 rounded-lg">
                <p className="text-2xl font-bold text-foreground">45.2K</p>
                <p className="text-xs text-muted-foreground">Impressions</p>
              </div>
              <div className="text-center p-3 bg-secondary/30 rounded-lg">
                <p className="text-2xl font-bold text-emerald-500">৳12,340</p>
                <p className="text-xs text-muted-foreground">Revenue</p>
              </div>
            </div>
          </CardContent>
        </SpotlightCard>

        <SpotlightCard className="p-0 border-border/50 bg-card/50 backdrop-blur-md" spotlightColor="rgba(220, 38, 38, 0.1)">
          <CardHeader className="p-6 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/10 rounded-lg">
                  <Megaphone className="w-5 h-5 text-indigo-500" />
                </div>
                <div>
                  <CardTitle className="text-foreground">Meta Audience Network</CardTitle>
                  <CardDescription>Facebook Banner & Interstitial ads</CardDescription>
                </div>
              </div>
              <Switch checked={facebookEnabled} onCheckedChange={setFacebookEnabled} />
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-0 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fb-app-id">Facebook App ID</Label>
              <Input id="fb-app-id" placeholder="Enter App ID" className="bg-secondary/50" disabled={!facebookEnabled} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fb-placement">Placement ID</Label>
              <Input id="fb-placement" placeholder="Enter Placement ID" className="bg-secondary/50" disabled={!facebookEnabled} />
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="text-center p-3 bg-secondary/30 rounded-lg">
                <p className="text-2xl font-bold text-foreground">0</p>
                <p className="text-xs text-muted-foreground">Impressions</p>
              </div>
              <div className="text-center p-3 bg-secondary/30 rounded-lg">
                <p className="text-2xl font-bold text-muted-foreground">৳0</p>
                <p className="text-xs text-muted-foreground">Revenue</p>
              </div>
            </div>
          </CardContent>
        </SpotlightCard>
      </div>

      {/* Sponsored Campaigns */}
      <Card className="glass-card border-border/50">
        <CardHeader>
          <CardTitle className="font-display">Sponsored Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign</TableHead>
                <TableHead>Sponsor</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Views</TableHead>
                <TableHead>Clicks</TableHead>
                <TableHead>CTR</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell className="font-medium">{campaign.name}</TableCell>
                  <TableCell className="text-muted-foreground">{campaign.sponsor}</TableCell>
                  <TableCell className="text-sm">
                    {new Date(campaign.startDate).toLocaleDateString()} - {new Date(campaign.endDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{campaign.views.toLocaleString()}</TableCell>
                  <TableCell>{campaign.clicks.toLocaleString()}</TableCell>
                  <TableCell>{campaign.ctr}%</TableCell>
                  <TableCell className="font-semibold text-emerald-500">৳{campaign.revenue.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge className={campaign.status === 'active' ? 'bg-success/10 text-success border-success/30' : 'bg-warning/10 text-warning border-warning/30'}>
                      {campaign.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem><Edit className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                        <DropdownMenuItem>
                          {campaign.status === 'active' ? (
                            <><Pause className="mr-2 h-4 w-4" />Pause</>
                          ) : (
                            <><Play className="mr-2 h-4 w-4" />Resume</>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem>View Analytics</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
