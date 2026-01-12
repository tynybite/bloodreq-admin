'use client';

import { motion } from 'framer-motion';
import { 
  Users, 
  Droplet, 
  Heart, 
  DollarSign, 
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowRight,
  Clock,
  AlertCircle,
  CheckCircle2,
  Activity,
  Zap,
} from 'lucide-react';
import CountUp from "@/components/reactbits/CountUp";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

interface DashboardData {
    totalUsers: number;
    totalRequests: number;
    totalDonations: number;
    pendingRequests: number;
    pendingDonations: number;
    recentActivity: any[]; // refine type later
    bloodTypeDistribution: { type: string; count: number; percentage: number }[];
}

export default function DashboardClient({ data }: { data: DashboardData }) {
  // Construct metrics from props
  const metrics = [
    { 
      label: 'Total Users', 
      value: data.totalUsers, 
      change: 12.5, // TODO: Calculate change
      icon: Users,
      gradient: 'from-blue-500 to-cyan-400',
      shadowColor: 'shadow-blue-500/25'
    },
    { 
      label: 'Blood Requests', 
      value: data.totalRequests, 
      change: 8.2, 
      icon: Droplet,
      gradient: 'from-rose-500 to-pink-400',
      shadowColor: 'shadow-rose-500/25'
    },
    { 
      label: 'Donations', 
      value: data.totalDonations, 
      change: -3.1, 
      icon: Heart,
      gradient: 'from-amber-500 to-orange-400',
      shadowColor: 'shadow-amber-500/25'
    },
    { 
      label: 'Revenue', 
      value: 1200000, // Mock for now
      change: 23.4, 
      prefix: '৳',
      icon: DollarSign,
      gradient: 'from-emerald-500 to-teal-400',
      shadowColor: 'shadow-emerald-500/25'
    },
  ];

  const pendingActions = [
    { label: 'Blood Requests Pending', count: data.pendingRequests, color: 'text-rose-500', bg: 'bg-rose-500' },
    { label: 'Financial Requests Pending', count: 0, color: 'text-amber-500', bg: 'bg-amber-500' }, // mock
    { label: 'Donations to Verify', count: data.pendingDonations || 0, color: 'text-blue-500', bg: 'bg-blue-500' },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-amber-500" />;
      case 'verified': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'completed': return <CheckCircle2 className="w-4 h-4 text-blue-500" />;
      case 'approved': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      default: return <Activity className="w-4 h-4 text-muted-foreground" />;
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
      <motion.div variants={itemVariants} className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-display text-5xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground/80 to-foreground/60 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Platform overview and quick actions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-5 py-2.5 rounded-xl bg-secondary/50 border border-border text-sm font-medium hover:bg-secondary transition-colors"
          >
            Download Report
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white text-sm font-medium shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40 transition-shadow"
          >
            <Zap className="w-4 h-4 inline mr-2" />
            Quick Action
          </motion.button>
        </div>
      </motion.div>

      {/* Metric Cards */}
      <motion.div variants={itemVariants} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, i) => (
          <motion.div
            key={metric.label}
            variants={itemVariants}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className={`relative overflow-hidden rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 shadow-xl ${metric.shadowColor}`}
          >
            {/* Gradient accent */}
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${metric.gradient} opacity-10 blur-2xl`} />
            
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${metric.gradient} shadow-lg`}>
                  <metric.icon className="w-5 h-5 text-white" />
                </div>
                <div className={`flex items-center gap-1 text-sm font-medium ${metric.change >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {metric.change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {metric.change >= 0 ? '+' : ''}{metric.change}%
                </div>
              </div>
              
              <p className="text-sm font-medium text-muted-foreground mb-1">{metric.label}</p>
              <p className="text-4xl font-bold font-display tracking-tight">
                {metric.prefix}<CountUp to={metric.value} duration={2} />
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Activity */}
        <motion.div 
          variants={itemVariants}
          className="lg:col-span-2 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden"
        >
          <div className="p-6 border-b border-border/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <h2 className="font-display text-xl font-semibold">Recent Activity</h2>
              </div>
              <button className="text-sm text-primary hover:underline flex items-center gap-1">
                View All <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="divide-y divide-border/50">
            {data.recentActivity.map((activity, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center justify-between p-4 hover:bg-secondary/30 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-secondary/80 flex items-center justify-center">
                    {getStatusIcon(activity.status)}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{activity.title}</p>
                    <p className="text-sm text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize
                  ${activity.status === 'pending' ? 'bg-amber-500/10 text-amber-500' : ''}
                  ${activity.status === 'verified' ? 'bg-emerald-500/10 text-emerald-500' : ''}
                  ${activity.status === 'completed' ? 'bg-blue-500/10 text-blue-500' : ''}
                  ${activity.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500' : ''}
                  ${activity.status === 'new' ? 'bg-violet-500/10 text-violet-500' : ''}
                `}>
                  {activity.status}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Pending Actions */}
        <motion.div 
          variants={itemVariants}
          className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden"
        >
          <div className="p-6 border-b border-border/50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500">
                <AlertCircle className="w-5 h-5 text-white" />
              </div>
              <h2 className="font-display text-xl font-semibold">Pending Actions</h2>
            </div>
          </div>
          <div className="p-4 space-y-3">
            {pendingActions.map((action, i) => (
              <motion.div
                key={action.label}
                whileHover={{ x: 4 }}
                className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${action.bg}`} />
                  <span className="font-medium">{action.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${action.bg} text-white`}>
                    {action.count}
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </motion.div>
            ))}
          </div>
          
          {/* Quick Stats */}
          <div className="p-4 pt-2">
            <div className="rounded-xl bg-gradient-to-br from-rose-500/10 via-pink-500/10 to-orange-500/10 border border-rose-500/20 p-4">
              <p className="text-sm font-medium text-muted-foreground mb-2">Urgent Need</p>
              <p className="text-lg font-bold">3 Critical Blood Requests</p>
              <p className="text-sm text-muted-foreground mt-1">Require immediate attention</p>
              <button className="mt-3 w-full py-2 rounded-lg bg-rose-500 text-white text-sm font-medium hover:bg-rose-600 transition-colors">
                View Critical Requests
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Blood Type Distribution */}
      <motion.div 
        variants={itemVariants}
        className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-rose-500 to-red-600">
              <Droplet className="w-5 h-5 text-white" />
            </div>
            <h2 className="font-display text-xl font-semibold">Blood Type Distribution</h2>
          </div>
          <span className="text-sm text-muted-foreground">This Month</span>
        </div>
        
        <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
          {data.bloodTypeDistribution.map((blood, i) => (
            <motion.div
              key={blood.type}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ scale: 1.05 }}
              className="relative group"
            >
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-rose-500/10 to-red-500/10 border border-rose-500/20 flex flex-col items-center justify-center p-4 hover:border-rose-500/50 transition-colors">
                <span className="text-2xl font-bold bg-gradient-to-r from-rose-500 to-red-500 bg-clip-text text-transparent">
                  {blood.type}
                </span>
                <span className="text-xs text-muted-foreground mt-1">{blood.count}</span>
              </div>
              {/* Percentage bar */}
              <div className="mt-2 h-1 rounded-full bg-secondary overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${blood.percentage}%` }}
                  transition={{ delay: 0.5 + i * 0.1, duration: 0.5 }}
                  className="h-full bg-gradient-to-r from-rose-500 to-red-500"
                />
              </div>
              <p className="text-xs text-center text-muted-foreground mt-1">{blood.percentage}%</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
