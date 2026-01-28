'use client';

import { motion } from 'framer-motion';
import { 
  Users, 
  Droplet, 
  Heart, 
  DollarSign, 
  TrendingUp,
  TrendingDown,
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
import BloodVialGauge from '@/components/ui/BloodVialGauge';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pending': return <Clock className="w-4 h-4 text-amber-500" />;
    case 'verified': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
    case 'completed': return <CheckCircle2 className="w-4 h-4 text-blue-500" />;
    case 'approved': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
    case 'new': return <AlertCircle className="w-4 h-4 text-rose-500" />;
    default: return <Activity className="w-4 h-4 text-muted-foreground" />;
  }
};

export default function DashboardClient({ data }: { data: any }) {
  const router = useRouter();
  const t = useTranslations('dashboard');
  const tCommon = useTranslations('common');

  const metrics = [
    { label: t('totalUsers'), value: data.totalUsers || 0, change: 12, icon: Users, prefix: "", gradient: "from-blue-500 to-cyan-500" },
    { label: t('bloodRequests'), value: data.totalRequests || 0, change: -5, icon: Droplet, prefix: "", gradient: "from-rose-500 to-red-500" },
    { label: t('donations'), value: data.totalDonations || 0, change: 8, icon: Heart, prefix: "", gradient: "from-emerald-500 to-teal-500" },
    { label: t('activeDonors'), value: data.activeDonors || 0, change: 15, icon: CheckCircle2, prefix: "", gradient: "from-amber-500 to-orange-500" },
  ];

  const pendingActions = [
    { label: t('pendingVerifications'), count: 12, bg: "bg-amber-500", onClick: () => router.push('/admin/users?status=pending') },
    { label: t('urgentRequests'), count: 5, bg: "bg-rose-500", onClick: () => router.push('/admin/blood-requests?urgency=critical') },
    { label: t('newFundraisers'), count: 3, bg: "bg-emerald-500", onClick: () => router.push('/admin/fundraisers?status=pending') },
  ];

  return (
    <motion.div 
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-5xl font-bold tracking-tight bg-gradient-to-r from-rose-500 via-red-500 to-orange-500 bg-clip-text text-transparent">
            {t('title')}
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            {t('overview')}, {t('analytics')}, {t('reports')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
                const link = document.createElement('a');
                link.href = `data:text/csv;charset=utf-8,${encodeURIComponent('Report Data...')}`;
                link.download = `bloodreq_report_${new Date().toISOString().split('T')[0]}.csv`;
                link.click();
            }}
            className="px-5 py-2.5 rounded-xl border border-border/50 bg-background/50 hover:bg-background/80 text-sm font-medium transition-colors backdrop-blur-sm"
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
      <motion.div variants={itemVariants} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, i) => (
          <motion.div
            key={metric.label}
            whileHover={{ y: -5 }}
            className="group relative overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-br from-card/50 via-card/30 to-card/10 backdrop-blur-xl shadow-sm hover:shadow-xl transition-all duration-300"
          >
            <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br ${metric.gradient} opacity-10 blur-3xl group-hover:opacity-20 transition-opacity`} />
            
            <div className="p-6 relative">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-2xl bg-gradient-to-br from-background/80 to-background/40 border border-white/10 shadow-inner ${
                    metric.label === t('bloodRequests') ? "text-rose-500" : 
                    metric.label === t('donations') ? "text-emerald-500" :
                    metric.label === t('activeDonors') ? "text-amber-500" : "text-blue-500"
                }`}>
                  <metric.icon className="w-5 h-5" />
                </div>
                <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full bg-background/40 border border-white/5 ${metric.change >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {metric.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {metric.change >= 0 ? '+' : ''}{metric.change}%
                </div>
              </div>
              
              <p className="text-sm font-medium text-muted-foreground mb-1">{metric.label}</p>
              <p className="text-4xl font-bold font-display tracking-tight text-foreground">
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
            className="lg:col-span-2 relative overflow-hidden rounded-3xl border border-border/50 bg-card/30 backdrop-blur-xl shadow-sm p-6"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-rose-500/20 to-rose-500/5 text-rose-500">
                <Activity className="w-5 h-5" />
              </div>
              <h2 className="font-display text-xl font-bold">{t('recentActivity')}</h2>
            </div>
            <button 
              onClick={() => router.push('/admin/blood-requests')}
              className="text-xs font-bold uppercase tracking-wider text-rose-500 hover:text-rose-600 flex items-center gap-1 transition-colors"
            >
              {tCommon('viewAll')} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-4">
            {data.recentActivity.map((activity: any, i: number) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-background/50 to-background/30 border border-white/5 hover:border-white/10 hover:from-background/60 transition-all cursor-default group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-secondary/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                    {getStatusIcon(activity.status)}
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm group-hover:text-primary transition-colors">{activity.title}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                  activity.status === 'pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                  activity.status === 'verified' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                  activity.status === 'completed' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                  activity.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                  'bg-violet-500/10 text-violet-500 border-violet-500/20'
                }`}>
                  {activity.status}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Pending Actions & Stats */}
        <div className="flex flex-col gap-6">
            <motion.div 
                variants={itemVariants}
                className="relative overflow-hidden rounded-3xl border border-border/50 bg-card/30 backdrop-blur-xl shadow-sm p-6"
            >
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 text-amber-500">
                     <AlertCircle className="w-5 h-5" />
                    </div>
                     <h2 className="font-display text-xl font-bold">{t('pendingActions')}</h2>
                </div>
                <div className="space-y-3">
                    {pendingActions.map((action, i) => (
                    <motion.button
                        key={action.label}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={action.onClick}
                        className="w-full flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-background/50 to-background/30 border border-white/5 hover:border-white/10 transition-all group"
                    >
                        <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${action.bg}`} />
                        <span className="font-medium text-sm text-foreground/80">{action.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${action.bg.replace('bg-', 'text-')} bg-background/50`}>
                            {action.count}
                        </span>
                        <ArrowRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    </motion.button>
                    ))}
                </div>
            </motion.div>
            
            {/* Quick Stats / Blood Gauge */}
            <motion.div 
                variants={itemVariants}
                className="flex-1 relative overflow-hidden rounded-3xl border border-border/50 bg-card/30 backdrop-blur-xl shadow-sm p-6"
            >
                <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-rose-500/20 to-rose-500/5 text-rose-500">
                        <Droplet className="w-5 h-5" />
                    </div>
                    <h2 className="font-display text-xl font-bold">{t('bloodTypeDistribution')}</h2>
                </div>
                </div>
                
                <div className="flex flex-wrap justify-between gap-y-6 px-2">
                {data.bloodTypeDistribution.slice(0, 4).map((blood: any) => (
                    <BloodVialGauge
                    key={blood.type}
                    type={blood.type}
                    value={blood.percentage}
                    label={blood.count.toString()}
                    />
                ))}
                </div>
                <div className="mt-6 pt-4 border-t border-white/5 text-center">
                    <button 
                        onClick={() => router.push('/admin/blood-requests')}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                        {tCommon('viewAll')} Types
                    </button>
                </div>
            </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
