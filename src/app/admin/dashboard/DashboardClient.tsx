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
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import TactileCard from '@/components/ui/TactileCard';
import BloodVialGauge from '@/components/ui/BloodVialGauge';

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
    activeDonors: number;
    recentActivity: any[];
    bloodTypeDistribution: { type: string; count: number; percentage: number }[];
}

export default function DashboardClient({ data }: { data: DashboardData }) {
  const router = useRouter();
  const t = useTranslations('dashboard');
  const tCommon = useTranslations('common');

  // Construct metrics from props
  const metrics = [
    { 
      label: t('totalUsers'), 
      value: data.totalUsers, 
      change: 0, 
      icon: Users,
      gradient: 'from-blue-500 to-cyan-400',
      shadowColor: 'shadow-blue-500/25'
    },
    { 
      label: t('bloodRequests'), 
      value: data.totalRequests, 
      change: 0, 
      icon: Droplet,
      gradient: 'from-rose-500 to-pink-400',
      shadowColor: 'shadow-rose-500/25'
    },
    { 
      label: t('donations'), 
      value: data.totalDonations, 
      change: 0, 
      icon: Heart,
      gradient: 'from-amber-500 to-orange-400',
      shadowColor: 'shadow-amber-500/25'
    },
    { 
      label: t('activeDonors'), 
      value: data.activeDonors, 
      change: 0, 
      prefix: '',
      icon: CheckCircle2,
      gradient: 'from-emerald-500 to-teal-400',
      shadowColor: 'shadow-emerald-500/25'
    },
  ];

  const pendingActions = [
    { 
        label: t('pendingRequests'), 
        count: data.pendingRequests, 
        color: 'text-rose-500', 
        bg: 'bg-rose-500', 
        onClick: () => router.push('/admin/blood-requests?status=pending') 
    },
    { 
        label: t('donations') + ' ' + tCommon('pending'), 
        count: data.pendingDonations || 0, 
        color: 'text-blue-500', 
        bg: 'bg-blue-500',
        onClick: () => router.push('/admin/donations')
    },
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
      <motion.div variants={itemVariants} className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-12">
        <div className="relative">
          <h1 className="font-display text-6xl font-bold tracking-tighter text-foreground drop-shadow-sm">
            {t('title')}
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <div className="w-8 h-[2px] bg-rose-600" />
            <p className="text-muted-foreground text-lg uppercase font-mono tracking-widest">
              {t('subtitle')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-5 py-2.5 rounded-xl bg-secondary/50 border border-border text-sm font-medium hover:bg-secondary transition-colors"
            onClick={() => {
                const reportDate = new Date().toLocaleDateString();
                const csvContent = [
                    ['Report Date', reportDate],
                    [],
                    ['Metric', 'Value'],
                    ['Total Users', data.totalUsers],
                    ['Total Requests', data.totalRequests],
                    ['Total Donations', data.totalDonations],
                    ['Active Donors', data.activeDonors],
                    ['Pending Requests', data.pendingRequests],
                    [],
                    ['Recent Activity'],
                    ['Date', 'Type', 'Title', 'Status'],
                    ...data.recentActivity.map(a => [
                        a.time,
                        a.type,
                        `"${a.title}"`,
                        a.status
                    ])
                ].map(e => e.join(',')).join('\n');

                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = `bloodreq_report_${new Date().toISOString().split('T')[0]}.csv`;
                link.click();
            }}
          >
            {t('downloadReport')}
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/admin/blood-requests')}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white text-sm font-medium shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40 transition-shadow"
          >
            <Zap className="w-4 h-4 inline mr-2" />
            {t('manageRequests')}
          </motion.button>
        </div>
      </motion.div>

      {/* Metric Cards */}
      <motion.div variants={itemVariants} className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, i) => (
          <TactileCard
            key={metric.label}
            indicatorColor={metric.label === t('bloodRequests') ? "text-rose-500" : "text-emerald-500"}
            className="group"
          >
            <div className="relative">
              <div className="flex items-center justify-between mb-6">
                <div className="p-3 rounded-2xl tactile-panel-inset text-rose-500">
                  <metric.icon className="w-6 h-6" />
                </div>
                <div className={`flex items-center gap-1 text-xs font-mono font-bold px-2 py-1 rounded border border-border/50 ${metric.change >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {metric.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {metric.change >= 0 ? '+' : ''}{metric.change}%
                </div>
              </div>
              
              <p className="text-[0.65rem] font-mono uppercase tracking-widest text-muted-foreground mb-1">{metric.label}</p>
              <p className="text-5xl font-bold font-mono tracking-tighter tabular-nums drop-shadow-sm">
                {metric.prefix}<CountUp to={metric.value} duration={2} />
              </p>
            </div>
          </TactileCard>
        ))}
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Recent Activity */}
        <TactileCard 
          className="lg:col-span-2"
          intensity="medium"
        >
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-border/50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg tactile-panel-inset text-rose-500">
                <Activity className="w-5 h-5" />
              </div>
              <h2 className="font-mono text-lg font-bold uppercase tracking-tight">{t('recentActivity')}</h2>
            </div>
            <button 
              onClick={() => router.push('/admin/blood-requests')}
              className="text-xs font-mono uppercase tracking-widest text-primary hover:underline flex items-center gap-1"
            >
              {tCommon('viewAll')} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-4">
            {data.recentActivity.map((activity, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between p-4 rounded-xl tactile-panel-inset bg-background/20"
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full tactile-panel flex items-center justify-center">
                    {getStatusIcon(activity.status)}
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">{activity.title}</p>
                    <p className="text-[0.65rem] font-mono uppercase text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded border text-[0.65rem] font-mono font-bold uppercase tracking-tighter
                  ${activity.status === 'pending' ? 'border-amber-500/50 text-amber-500' : ''}
                  ${activity.status === 'verified' ? 'border-emerald-500/50 text-emerald-500' : ''}
                  ${activity.status === 'completed' ? 'border-blue-500/50 text-blue-500' : ''}
                  ${activity.status === 'approved' ? 'border-emerald-500/50 text-emerald-500' : ''}
                  ${activity.status === 'new' ? 'border-violet-500/50 text-violet-500' : ''}
                `}>
                  {activity.status}
                </span>
              </motion.div>
            ))}
          </div>
        </TactileCard>

        {/* Pending Actions */}
        <TactileCard className="flex flex-col">
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-border/50">
            <div className="p-2 rounded-lg tactile-panel-inset text-amber-500">
              <AlertCircle className="w-5 h-5" />
            </div>
            <h2 className="font-mono text-lg font-bold uppercase tracking-tight">{t('pendingActions')}</h2>
          </div>
          <div className="space-y-4 mb-8">
            {pendingActions.map((action, i) => (
              <motion.div
                key={action.label}
                whileHover={{ scale: 1.02 }}
                onClick={action.onClick}
                className="flex items-center justify-between p-4 rounded-xl tactile-button bg-secondary/20 cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full led-indicator ${action.bg.replace('bg-', 'text-')}`} />
                  <span className="font-mono text-xs font-bold uppercase tracking-tight">{action.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded border border-border/50 font-mono text-sm font-black ${action.bg.replace('bg-', 'text-')}`}>
                    {action.count}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
          
          {/* Quick Stats */}
          <div className="mt-auto">
            <div className="rounded-2xl tactile-panel-inset p-4 border border-rose-500/10">
              <p className="text-[0.65rem] font-mono uppercase tracking-widest text-muted-foreground mb-1">{t('pendingRequests')}</p>
              <p className="text-xl font-bold font-display uppercase tracking-tighter text-rose-500">{t('viewCritical')}</p>
              <button 
                onClick={() => router.push('/admin/blood-requests?urgency=critical')}
                className="mt-6 w-full py-3 rounded-xl tactile-button bg-rose-600 text-white text-xs font-mono font-bold uppercase tracking-widest hover:bg-rose-700 transition-colors"
              >
                {t('viewCritical')}
              </button>
            </div>
          </div>
        </TactileCard>
      </div>

      {/* Blood Type Distribution */}
      <TactileCard>
        <div className="flex items-center justify-between mb-10 pb-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg tactile-panel-inset text-rose-500">
              <Droplet className="w-5 h-5" />
            </div>
            <h2 className="font-mono text-lg font-bold uppercase tracking-tight">{t('bloodTypeDistribution')}</h2>
          </div>
        </div>
        
        <div className="flex flex-wrap justify-center gap-10 md:justify-between px-4">
          {data.bloodTypeDistribution.map((blood, i) => (
            <BloodVialGauge
              key={blood.type}
              type={blood.type}
              value={blood.percentage}
              label={blood.count.toString()}
            />
          ))}
        </div>
      </TactileCard>
    </motion.div>
  );
}
