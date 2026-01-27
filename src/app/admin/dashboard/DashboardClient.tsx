'use client';

import { motion } from 'framer-motion';
import { 
  Users, 
  Droplet, 
  Heart, 
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Clock,
  CheckCircle2,
  Activity,
  Zap,
  MoreHorizontal,
  FileText
} from 'lucide-react';
import CountUp from "@/components/reactbits/CountUp";
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import BentoCard from '@/components/ui/BentoCard';
import { Button } from "@/components/ui/button";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.25, 1, 0.5, 1] as const } }
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

  const metrics = [
    { 
      label: t('totalUsers'), 
      value: data.totalUsers, 
      change: 12, // Dummy change for demo
      icon: Users,
      bg: "bg-blue-50 text-blue-600",
      iconBg: "bg-blue-100" 
    },
    { 
      label: t('bloodRequests'), 
      value: data.totalRequests, 
      change: 5, 
      icon: Droplet,
      bg: "bg-rose-50 text-rose-600",
      iconBg: "bg-rose-100"
    },
    { 
      label: t('donations'), 
      value: data.totalDonations, 
      change: -2, 
      icon: Heart,
      bg: "bg-amber-50 text-amber-600",
      iconBg: "bg-amber-100"
    },
    { 
      label: t('activeDonors'), 
      value: data.activeDonors, 
      change: 8, 
      icon: CheckCircle2,
      bg: "bg-emerald-50 text-emerald-600",
      iconBg: "bg-emerald-100"
    },
  ];

  return (
    <motion.div 
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-[#1D1D1F]">
            {t('title')}
          </h1>
          <p className="text-[#86868b] mt-1 text-lg">
            {t('subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-3 mt-4 md:mt-0">
            <Button variant="outline" className="rounded-full h-10 px-6 border border-gray-200 text-[#1D1D1F]">
                {t('downloadReport')}
            </Button>
            <Button 
                className="rounded-full h-10 px-6 bg-[#007AFF] hover:bg-[#0071E3] text-white shadow-[0_4px_12px_rgba(0,122,255,0.3)]"
                onClick={() => router.push('/admin/blood-requests')}
            >
                {t('manageRequests')}
            </Button>
        </div>
      </motion.div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Metric Cards (Row 1) */}
        {metrics.map((metric, i) => (
          <BentoCard key={metric.label} colSpan={1} className="justify-between">
             <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-full ${metric.iconBg} text-current`}>
                    <metric.icon className="w-5 h-5" />
                </div>
                {metric.change !== 0 && (
                    <div className={`flex items-center text-xs font-semibold px-2 py-1 rounded-full ${metric.change > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {metric.change > 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                        {Math.abs(metric.change)}%
                    </div>
                )}
             </div>
             <div>
                 <p className="text-sm font-medium text-[#86868b]">{metric.label}</p>
                 <h3 className="text-3xl font-semibold text-[#1D1D1F] mt-1">
                    <CountUp to={metric.value} duration={1.5} />
                 </h3>
             </div>
          </BentoCard>
        ))}

        {/* Recent Activity (Row 2, Col Span 2) */}
        <BentoCard 
            colSpan={2} 
            rowSpan={2} 
            title={t('recentActivity')} 
            subtitle="Latest updates across the platform"
            className="overflow-hidden"
        >
            <div className="mt-4 space-y-2">
                {data.recentActivity.map((activity, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors group cursor-default">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 group-hover:bg-white group-hover:shadow-sm transition-all">
                                {activity.status === 'completed' ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : 
                                 activity.status === 'pending' ? <Clock className="w-5 h-5 text-amber-500" /> :
                                 <Activity className="w-5 h-5" />}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-[#1D1D1F]">{activity.title}</p>
                                <p className="text-xs text-[#86868b]">{activity.time}</p>
                            </div>
                        </div>
                        <div className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize
                            ${activity.status === 'completed' ? 'bg-green-100 text-green-700' : 
                              activity.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-700'}
                        `}>
                            {activity.status}
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-6 pt-4 border-t border-gray-100">
                <Button variant="ghost" className="w-full text-[#007AFF] hover:bg-blue-50 hover:text-[#0071E3] font-medium" onClick={() => router.push('/admin/notifications')}>
                    View All Activity <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
            </div>
        </BentoCard>

        {/* Pending Actions (Row 2, Col Span 1) */}
        <BentoCard colSpan={1} className="bg-gradient-to-br from-[#1D1D1F] to-[#2c2c2e] text-white">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-white/10 rounded-full backdrop-blur-md">
                    <Zap className="w-5 h-5 text-yellow-400" />
                </div>
                <h3 className="font-semibold">{t('pendingActions')}</h3>
            </div>
            
            <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-colors cursor-pointer" onClick={() => router.push('/admin/blood-requests?status=pending')}>
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-gray-300">{t('pendingRequests')}</span>
                        <span className="text-xl font-bold">{data.pendingRequests}</span>
                    </div>
                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-rose-500 w-[60%]" />
                    </div>
                </div>
                
                 <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-colors cursor-pointer" onClick={() => router.push('/admin/donations')}>
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-gray-300">{t('donations')}</span>
                        <span className="text-xl font-bold">{data.pendingDonations || 0}</span>
                    </div>
                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 w-[30%]" />
                    </div>
                </div>
            </div>
        </BentoCard>

        {/* Quick Access / More Stats (Row 2, Col Span 1) */}
        <BentoCard colSpan={1} title="Reports" subtitle="Monthly overview">
             <div className="flex flex-col justify-center h-full gap-3">
                 <div className="flex items-center gap-3 p-3 rounded-xl bg-[#F5F5F7] hover:bg-gray-200 transition-colors cursor-pointer">
                     <FileText className="w-5 h-5 text-[#86868b]" />
                     <div className="flex-1">
                         <p className="text-sm font-medium text-[#1D1D1F]">Monthly Report</p>
                         <p className="text-xs text-[#86868b]">PDF • 2.4 MB</p>
                     </div>
                 </div>
                 <div className="flex items-center gap-3 p-3 rounded-xl bg-[#F5F5F7] hover:bg-gray-200 transition-colors cursor-pointer">
                     <FileText className="w-5 h-5 text-[#86868b]" />
                     <div className="flex-1">
                         <p className="text-sm font-medium text-[#1D1D1F]">Donor Analytics</p>
                         <p className="text-xs text-[#86868b]">CSV • 1.2 MB</p>
                     </div>
                 </div>
             </div>
        </BentoCard>

        {/* Blood Distribution (Row 3, Col Span 4) */}
        <BentoCard colSpan={4} title={t('bloodTypeDistribution')}>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mt-4">
                {data.bloodTypeDistribution.map((blood) => (
                    <div key={blood.type} className="flex flex-col items-center p-4 rounded-2xl bg-[#F5F5F7] hover:bg-gray-200 transition-colors group">
                        <div className="text-lg font-bold text-[#1D1D1F] mb-2">{blood.type}</div>
                        <div className="w-2 h-16 bg-gray-200 rounded-full overflow-hidden relative mb-2">
                            <div 
                                className="absolute bottom-0 left-0 w-full bg-rose-500 transition-all duration-1000 ease-out group-hover:bg-rose-600"
                                style={{ height: `${blood.percentage}%` }}
                            />
                        </div>
                        <div className="text-xs font-medium text-[#86868b]">{blood.count} units</div>
                    </div>
                ))}
            </div>
        </BentoCard>

      </div>
    </motion.div>
  );
}
