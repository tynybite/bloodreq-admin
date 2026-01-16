'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users,
  Droplet,
  Heart,
  TrendingUp,
  TrendingDown,
  Download,
  Calendar,
  MapPin,
  DollarSign,
  Activity,
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
import { useTranslations } from 'next-intl';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const ICON_MAP: Record<string, any> = {
  Users,
  Droplet,
  DollarSign,
  Heart
};

interface ReportsClientProps {
  data: {
    mainStats: any[];
    userGrowthData: any[];
    bloodTypeData: any[];
    topRegions: any[];
  }
}

export default function ReportsClient({ data }: ReportsClientProps) {
  const [dateRange, setDateRange] = useState('30d');
  const { mainStats, userGrowthData, bloodTypeData, topRegions } = data;
  const t = useTranslations('reports');
  const tCommon = useTranslations('common');

  // Find max value for normalization
  const maxUserCount = Math.max(...userGrowthData.map(d => d.value));

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
            {t('title')}
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            {t('subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[150px] rounded-xl bg-card/50 border-border/50 h-11">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">{t('last7Days')}</SelectItem>
              <SelectItem value="30d">{t('last30Days')}</SelectItem>
              <SelectItem value="90d">{t('last90Days')}</SelectItem>
              <SelectItem value="1y">{t('lastYear')}</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="rounded-xl h-11">
            <Download className="w-4 h-4 mr-2" />
            {tCommon('export')}
          </Button>
        </div>
      </motion.div>

      {/* Main Stats */}
      <motion.div variants={itemVariants} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {mainStats.map((stat) => {
            const Icon = ICON_MAP[stat.iconName] || Activity;
            return (
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
                  <span>{stat.change >= 0 ? '+' : ''}{Math.abs(stat.change)}%</span>
                </div>
              </div>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>
        )})}
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
              <h3 className="font-semibold text-lg">{t('userGrowth')}</h3>
            </div>
            <span className="text-sm text-muted-foreground">{t('last6Months')}</span>
          </div>
          
          <div className="h-48 flex items-end justify-between gap-3">
            {userGrowthData.map((item, i) => (
              <div key={item.month} className="flex-1 flex flex-col items-center gap-2">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${maxUserCount > 0 ? (item.value / maxUserCount) * 80 : 0}%` }}
                  transition={{ duration: 0.8, delay: i * 0.1 }}
                  className="w-full bg-gradient-to-t from-blue-500 to-cyan-400 rounded-d-sm rounded-t-lg min-h-[4px]"
                />
                <span className="text-xs text-muted-foreground">{item.month}</span>
              </div>
            ))}
          </div>
          
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/50">
            <div>
              <p className="text-2xl font-bold">{userGrowthData[userGrowthData.length - 1]?.value || 0}</p>
              <p className="text-sm text-muted-foreground">{t('totalUsers')}</p>
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
              <h3 className="font-semibold text-lg">{t('bloodTypeDistribution')}</h3>
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
            {bloodTypeData.length === 0 && (
                <div className="col-span-4 text-center py-10 text-muted-foreground">
                    {tCommon('noData')}
                </div>
            )}
          </div>
          
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/50">
            <div>
              <p className="text-2xl font-bold">{bloodTypeData.reduce((acc, curr) => acc + curr.count, 0)}</p>
              <p className="text-sm text-muted-foreground">{t('totalDonors')}</p>
            </div>
            <div className="text-right">
              <p className="text-emerald-500 font-medium">{bloodTypeData[0]?.type || 'N/A'} {t('mostCommon')}</p>
              <p className="text-sm text-muted-foreground">{bloodTypeData[0]?.percentage || 0}% {t('ofDonors')}</p>
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
            <h3 className="font-semibold text-lg">{t('topActiveRegions')}</h3>
          </div>
          <Button variant="outline" size="sm" className="rounded-lg">
            {tCommon('viewAll')}
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
                  <p className="text-muted-foreground">{t('requests')}</p>
                </div>
              </div>
            </motion.div>
          ))}
          {topRegions.length === 0 && (
            <div className="text-center py-6 text-muted-foreground">{t('noRegionalData')}</div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
