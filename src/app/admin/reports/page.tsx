'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  Droplets,
  HandCoins,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  LineChart,
  Download,
  Calendar,
  Activity,
} from "lucide-react";
import SpotlightCard from "@/components/reactbits/SpotlightCard";
import CountUp from "@/components/reactbits/CountUp";

// Mock chart data (in real app, use recharts)
const userGrowthData = [
  { month: "Jan", users: 1200 },
  { month: "Feb", users: 1450 },
  { month: "Mar", users: 1800 },
  { month: "Apr", users: 2100 },
  { month: "May", users: 2400 },
  { month: "Jun", users: 2850 },
];

const bloodTypeData = [
  { type: "A+", count: 3420, color: "#dc2626" },
  { type: "B+", count: 2890, color: "#ea580c" },
  { type: "O+", count: 4560, color: "#16a34a" },
  { type: "AB+", count: 890, color: "#2563eb" },
  { type: "A-", count: 560, color: "#7c3aed" },
  { type: "B-", count: 340, color: "#db2777" },
  { type: "O-", count: 780, color: "#0891b2" },
  { type: "AB-", count: 210, color: "#65a30d" },
];

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<'users' | 'requests' | 'donations' | 'revenue'>('users');
  const [dateRange, setDateRange] = useState('30d');

  const mainStats = [
    { label: "Total Users", value: 24823, change: 12.5, color: "text-blue-500", bg: "bg-blue-500/10", icon: Users },
    { label: "Blood Requests", value: 1284, change: 8.2, color: "text-red-500", bg: "bg-red-500/10", icon: Droplets },
    { label: "Financial Raised", value: 1200000, change: -3.1, color: "text-emerald-500", bg: "bg-emerald-500/10", icon: HandCoins, prefix: "৳" },
    { label: "Ad Revenue", value: 45320, change: 23.4, color: "text-purple-500", bg: "bg-purple-500/10", icon: TrendingUp, prefix: "৳" },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-foreground">Reports & Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Platform performance and insights
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[150px] bg-secondary/50">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {mainStats.map((stat) => (
          <SpotlightCard key={stat.label} className="p-6 border-border/50 bg-card/50 backdrop-blur-md" spotlightColor="rgba(220, 38, 38, 0.1)">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                <p className={`text-3xl font-bold font-display mt-2 ${stat.color}`}>
                  {stat.prefix}<CountUp to={stat.value} duration={2} />
                </p>
                <div className={`flex items-center gap-1 mt-2 text-sm ${stat.change >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                  {stat.change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  <span>{stat.change >= 0 ? '+' : ''}{stat.change}%</span>
                  <span className="text-muted-foreground">vs last period</span>
                </div>
              </div>
              <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
          </SpotlightCard>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border/50 pb-4 overflow-x-auto">
        {[
          { key: 'users', label: 'User Analytics', icon: Users },
          { key: 'requests', label: 'Request Analytics', icon: Droplets },
          { key: 'donations', label: 'Donation Analytics', icon: HandCoins },
          { key: 'revenue', label: 'Revenue Analytics', icon: TrendingUp },
        ].map((tab) => (
          <Button
            key={tab.key}
            variant={activeTab === tab.key ? 'default' : 'ghost'}
            onClick={() => setActiveTab(tab.key as any)}
            className={activeTab === tab.key ? 'bg-primary hover:bg-red-600' : ''}
          >
            <tab.icon className="w-4 h-4 mr-2" />
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* User Growth Chart */}
        <Card className="glass-card border-border/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="font-display flex items-center gap-2">
                <LineChart className="w-5 h-5 text-blue-500" />
                User Growth
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-between gap-2 pt-4">
              {userGrowthData.map((item, i) => (
                <div key={item.month} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className="w-full bg-primary/80 rounded-t transition-all hover:bg-primary"
                    style={{ height: `${(item.users / 3000) * 100}%` }}
                  />
                  <span className="text-xs text-muted-foreground">{item.month}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-border/50">
              <div>
                <p className="text-2xl font-bold font-display">2,850</p>
                <p className="text-sm text-muted-foreground">Total users this month</p>
              </div>
              <div className="text-right">
                <p className="text-emerald-500 font-medium">+18.7%</p>
                <p className="text-sm text-muted-foreground">vs last month</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Blood Type Distribution */}
        <Card className="glass-card border-border/50">
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <PieChart className="w-5 h-5 text-red-500" />
              Blood Type Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-3">
              {bloodTypeData.map((item) => (
                <div key={item.type} className="text-center p-3 rounded-lg bg-secondary/30">
                  <div
                    className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold text-sm"
                    style={{ backgroundColor: item.color }}
                  >
                    {item.type}
                  </div>
                  <p className="font-semibold">{item.count.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">donors</p>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-border/50">
              <div>
                <p className="text-2xl font-bold font-display">13,650</p>
                <p className="text-sm text-muted-foreground">Total registered donors</p>
              </div>
              <div className="text-right">
                <p className="text-emerald-500 font-medium">O+ most common</p>
                <p className="text-sm text-muted-foreground">33.4% of donors</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Request Trends */}
        <Card className="glass-card border-border/50">
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-amber-500" />
              Request Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { label: "Blood Requests", value: 1284, max: 2000, color: "bg-red-500" },
                { label: "Financial Requests", value: 342, max: 500, color: "bg-blue-500" },
                { label: "Completed", value: 1089, max: 1500, color: "bg-emerald-500" },
                { label: "Pending", value: 247, max: 500, color: "bg-amber-500" },
              ].map((item) => (
                <div key={item.label} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="font-medium">{item.value.toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color} transition-all`}
                      style={{ width: `${(item.value / item.max) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Regions */}
        <Card className="glass-card border-border/50">
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-500" />
              Top Active Regions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: "Dhaka, Bangladesh", requests: 456, donors: 1234 },
                { name: "Kolkata, India", requests: 312, donors: 892 },
                { name: "Karachi, Pakistan", requests: 198, donors: 567 },
                { name: "Chattogram, Bangladesh", requests: 145, donors: 423 },
                { name: "Delhi, India", requests: 134, donors: 389 },
              ].map((region, i) => (
                <div key={region.name} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                      {i + 1}
                    </span>
                    <span className="font-medium">{region.name}</span>
                  </div>
                  <div className="text-right text-sm">
                    <p className="font-medium">{region.requests} requests</p>
                    <p className="text-muted-foreground">{region.donors} donors</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
