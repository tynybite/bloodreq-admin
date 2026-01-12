'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users,
  Droplet,
  Heart,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Download,
  Calendar,
  Activity,
  MapPin,
  DollarSign,
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
const mainStats = [
  { label: "Total Users", value: 24823, change: 12.5, gradient: "from-blue-500 to-cyan-400", icon: Users },
  { label: "Blood Requests", value: 1284, change: 8.2, gradient: "from-rose-500 to-pink-500", icon: Droplet },
  { label: "Financial Raised", value: 1200000, change: -3.1, prefix: "৳", gradient: "from-emerald-500 to-teal-400", icon: DollarSign },
  { label: "Donations", value: 456, change: 23.4, gradient: "from-violet-500 to-purple-500", icon: Heart },
];

const userGrowthData = [
  { month: "Jul", value: 1200 },
  { month: "Aug", value: 1450 },
  { month: "Sep", value: 1800 },
  { month: "Oct", value: 2100 },
  { month: "Nov", value: 2400 },
  { month: "Dec", value: 2850 },
];

const bloodTypeData = [
  { type: "A+", count: 3420, percentage: 25 },
  { type: "B+", count: 2890, percentage: 21 },
  { type: "O+", count: 4560, percentage: 33 },
  { type: "AB+", count: 890, percentage: 7 },
  { type: "A-", count: 560, percentage: 4 },
  { type: "B-", count: 340, percentage: 3 },
  { type: "O-", count: 780, percentage: 6 },
  { type: "AB-", count: 210, percentage: 1 },
];

const topRegions = [
  { name: "Dhaka, Bangladesh", requests: 456, donors: 1234 },
  { name: "Kolkata, India", requests: 312, donors: 892 },
  { name: "Karachi, Pakistan", requests: 198, donors: 567 },
  { name: "Chattogram, Bangladesh", requests: 145, donors: 423 },
  { name: "Delhi, India", requests: 134, donors: 389 },
];

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState('30d');

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
          <h1 className="font-display text-5xl font-bold tracking-tight bg-gradient-to-r from-fuchsia-500 via-pink-500 to-rose-500 bg-clip-text text-transparent">
            Reports & Analytics
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Platform performance insights and metrics
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[150px] rounded-xl bg-card/50 border-border/50 h-11">
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
          <Button variant="outline" className="rounded-xl h-11">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </motion.div>

      {/* Main Stats */}
      <motion.div variants={itemVariants} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {mainStats.map((stat) => (
          <motion.div
            key={stat.label}
            whileHover={{ y: -2 }}
            className="relative overflow-hidden rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm p-5"
          >
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl ${stat.gradient} opacity-10 blur-2xl`} />
            <div className="flex items-start justify-between relative">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                <p className="text-3xl font-bold font-display mt-1">
                  {stat.prefix}<CountUp to={stat.value} duration={2} />
                </p>
                <div className={`flex items-center gap-1 mt-2 text-sm ${stat.change >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {stat.change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  <span>{stat.change >= 0 ? '+' : ''}{stat.change}%</span>
                </div>
              </div>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* User Growth */}
        <motion.div 
          variants={itemVariants}
          className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-lg">User Growth</h3>
            </div>
            <span className="text-sm text-muted-foreground">Last 6 months</span>
          </div>
          
          <div className="h-48 flex items-end justify-between gap-3">
            {userGrowthData.map((item, i) => (
              <div key={item.month} className="flex-1 flex flex-col items-center gap-2">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(item.value / 3000) * 100}%` }}
                  transition={{ duration: 0.8, delay: i * 0.1 }}
                  className="w-full bg-gradient-to-t from-blue-500 to-cyan-400 rounded-t-lg"
                />
                <span className="text-xs text-muted-foreground">{item.month}</span>
              </div>
            ))}
          </div>
          
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/50">
            <div>
              <p className="text-2xl font-bold">2,850</p>
              <p className="text-sm text-muted-foreground">This month</p>
            </div>
            <div className="text-right">
              <p className="text-emerald-500 font-medium">+18.7%</p>
              <p className="text-sm text-muted-foreground">vs last month</p>
            </div>
          </div>
        </motion.div>

        {/* Blood Type Distribution */}
        <motion.div 
          variants={itemVariants}
          className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center">
                <Droplet className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-lg">Blood Type Distribution</h3>
            </div>
          </div>
          
          <div className="grid grid-cols-4 gap-3">
            {bloodTypeData.map((blood, i) => (
              <motion.div
                key={blood.type}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="text-center"
              >
                <div className="aspect-square rounded-xl bg-gradient-to-br from-rose-500/10 to-red-500/10 border border-rose-500/20 flex flex-col items-center justify-center mb-1">
                  <span className="text-lg font-bold bg-gradient-to-r from-rose-500 to-red-500 bg-clip-text text-transparent">
                    {blood.type}
                  </span>
                  <span className="text-xs text-muted-foreground">{blood.percentage}%</span>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/50">
            <div>
              <p className="text-2xl font-bold">13,650</p>
              <p className="text-sm text-muted-foreground">Total donors</p>
            </div>
            <div className="text-right">
              <p className="text-emerald-500 font-medium">O+ most common</p>
              <p className="text-sm text-muted-foreground">33% of donors</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Top Regions */}
      <motion.div 
        variants={itemVariants}
        className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-semibold text-lg">Top Active Regions</h3>
          </div>
          <Button variant="outline" size="sm" className="rounded-lg">
            View All
          </Button>
        </div>
        
        <div className="space-y-3">
          {topRegions.map((region, i) => (
            <motion.div
              key={region.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <span className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                  {i + 1}
                </span>
                <span className="font-medium">{region.name}</span>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <div className="text-right">
                  <p className="font-medium">{region.requests}</p>
                  <p className="text-muted-foreground">requests</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{region.donors}</p>
                  <p className="text-muted-foreground">donors</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
