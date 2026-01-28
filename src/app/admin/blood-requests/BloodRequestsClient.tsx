'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Plus,
  Filter,
  MoreHorizontal,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  Droplet,
  Zap,
  ArrowUpDown,
  Trash2,
  Heart,
  Activity,
  User,
  Phone
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import CountUp from "@/components/reactbits/CountUp";
import { approveRequest, rejectRequest, deleteRequest, updateRequest, createRequest } from './actions';
import { toast } from 'sonner';
import RequestDetailSheet from './RequestDetailSheet';
import CreateRequestSheet from './CreateRequestSheet';
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

const getUrgencyStyles = (urgency: string) => {
  switch (urgency) {
    case "critical": return { bg: "bg-rose-500", text: "text-white", border: "border-rose-500" };
    case "urgent": return { bg: "bg-amber-500", text: "text-white", border: "border-amber-500" };
    case "planned": return { bg: "bg-emerald-500", text: "text-white", border: "border-emerald-500" };
    default: return { bg: "bg-secondary", text: "text-foreground", border: "border-border" };
  }
};

const getStatusStyles = (status: string) => {
  switch (status) {
    case "pending": return "bg-amber-500/10 text-amber-500 border-amber-500/30";
    case "approved": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/30";
    case "in_progress": return "bg-blue-500/10 text-blue-500 border-blue-500/30";
    case "fulfilled": return "bg-violet-500/10 text-violet-500 border-violet-500/30";
    case "cancelled": 
    case "rejected": return "bg-rose-500/10 text-rose-500 border-rose-500/30";
    default: return "bg-secondary text-foreground";
  }
};

const bloodGroupColors: Record<string, string> = {
  'A+': 'from-rose-500 to-red-600',
  'A-': 'from-rose-400 to-red-500',
  'B+': 'from-blue-500 to-indigo-600',
  'B-': 'from-blue-400 to-indigo-500',
  'AB+': 'from-purple-500 to-violet-600',
  'AB-': 'from-purple-400 to-violet-500',
  'O+': 'from-emerald-500 to-teal-600',
  'O-': 'from-emerald-400 to-teal-500',
};

export default function BloodRequestsClient({ initialRequests, stats }: { initialRequests: any[], stats: any[] }) {
  const [requests, setRequests] = useState(initialRequests);
  const [filterType, setFilterType] = useState('all');
  const [filterUrgency, setFilterUrgency] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const t = useTranslations('bloodRequests');
  const tCommon = useTranslations('common');

  // Client-side filtering
  const filteredRequests = requests.filter(req => {
    const matchesType = filterType === 'all' || req.blood_group === filterType;
    const matchesUrgency = filterUrgency === 'all' || req.urgency === filterUrgency;
    const matchesStatus = filterStatus === 'all' || req.status === filterStatus;
    const matchesSearch = searchQuery === '' ||
        (req.patient_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) || 
        (req.hospital?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (req.profiles?.full_name?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    
    return matchesType && matchesUrgency && matchesStatus && matchesSearch;
  });

  const handleCreate = async (data: any) => {
      try {
          await createRequest(data);
          toast.success(tCommon('success'));
      } catch (error: any) {
          toast.error(tCommon('error') + ': ' + error.message);
      }
  };

  const handleAction = async (action: string, id: string, data?: any) => {
    try {
      if (action === 'approve') {
        await approveRequest(id, data);
        toast.success(tCommon('success'));
      } else if (action === 'reject') {
        await rejectRequest(id, data);
        toast.success(tCommon('success'));
      } else if (action === 'delete') {
        await deleteRequest(id);
        toast.success(tCommon('success'));
      } else if (action === 'update') {
          await updateRequest(id, data);
          toast.success(tCommon('success'));
      }
      setIsDetailOpen(false);
      
      // Optimistic update
      setRequests(prev => prev.map(r => {
        if (r.id !== id) return r;
        if (action === 'delete') return null;
        if (action === 'update' && data) return { ...r, ...data };
        return { ...r, status: action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : r.status };
      }).filter(Boolean) as any[]);

    } catch (error: any) {
      toast.error(tCommon('error') + ': ' + error.message);
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return t('pending');
      case 'approved': return t('approved');
      case 'in_progress': return 'In Progress';
      case 'fulfilled': return t('fulfilled');
      case 'rejected': return t('rejected');
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  const getUrgencyLabel = (urgency: string) => {
    switch (urgency) {
      case 'critical': return t('critical');
      case 'urgent': return t('urgent');
      case 'planned': return t('planned');
      default: return urgency;
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
      <motion.div variants={itemVariants} className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-display text-5xl font-bold tracking-tight bg-gradient-to-r from-rose-500 via-red-500 to-orange-500 bg-clip-text text-transparent">
            {t('title')}
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            {t('bloodGroup')}, {t('hospital')}, {t('urgency')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsCreateOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 text-white text-sm font-medium shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40 transition-shadow flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {t('newRequest')}
          </motion.button>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={itemVariants} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <motion.div
            key={stat.label}
            whileHover={{ y: -5 }}
            className="group relative overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-br from-card/50 via-card/30 to-card/10 backdrop-blur-xl shadow-sm hover:shadow-xl transition-all duration-300"
          >
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${stat.gradient} opacity-10 blur-3xl group-hover:opacity-20 transition-opacity`} />
            
            <div className="p-6 relative">
              <p className="text-sm font-medium text-muted-foreground mb-1">{stat.label}</p>
              <p className="text-4xl font-bold font-display tracking-tight text-foreground">
                <CountUp to={stat.value} duration={2} />
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants}>
        <div className="rounded-3xl border border-border/50 bg-card/30 backdrop-blur-xl shadow-sm p-2">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-1 items-center gap-3">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                    placeholder={tCommon('search') + '...'}
                    className="pl-11 h-12 rounded-2xl bg-background/50 border-transparent focus:bg-background transition-colors"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-[140px] h-12 rounded-2xl bg-background/50 border-transparent focus:bg-background transition-colors">
                    <Droplet className="w-4 h-4 mr-2 text-rose-500" />
                    <SelectValue placeholder={t('bloodGroup')} />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value="all">{tCommon('all')}</SelectItem>
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                    </SelectContent>
                </Select>
                <Select value={filterUrgency} onValueChange={setFilterUrgency}>
                    <SelectTrigger className="w-[130px] h-12 rounded-2xl bg-background/50 border-transparent focus:bg-background transition-colors">
                    <SelectValue placeholder={t('urgency')} />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value="all">{tCommon('all')}</SelectItem>
                    <SelectItem value="critical">{t('critical')}</SelectItem>
                    <SelectItem value="urgent">{t('urgent')}</SelectItem>
                    <SelectItem value="planned">{t('planned')}</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-[130px] h-12 rounded-2xl bg-background/50 border-transparent focus:bg-background transition-colors">
                    <SelectValue placeholder={t('status')} />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value="all">{tCommon('all')}</SelectItem>
                    <SelectItem value="pending">{t('pending')}</SelectItem>
                    <SelectItem value="approved">{t('approved')}</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="fulfilled">Fulfilled</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                </Select>
                </div>
                <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl hover:bg-secondary/50">
                    <ArrowUpDown className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl hover:bg-secondary/50">
                    <Filter className="h-5 w-5" />
                </Button>
                </div>
            </div>
        </div>
      </motion.div>

      {/* Request Cards */}
      <motion.div variants={itemVariants} className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <AnimatePresence>
          {filteredRequests.map((request, i) => {
            const urgencyStyles = getUrgencyStyles(request.urgency);
            const mapsQuery = encodeURIComponent(`${request.hospital || ''} ${request.city || ''}`);
            const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;
            
            return (
              <motion.div
                key={request.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ y: -5 }}
                className="group relative overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-br from-card/50 via-card/30 to-card/10 backdrop-blur-xl shadow-sm hover:shadow-xl transition-all duration-300"
              >
                {/* Urgency Indicator Strip */}
                <div className={`absolute top-0 left-0 w-full h-1.5 ${
                  request.urgency === 'critical' ? 'bg-gradient-to-r from-rose-500 to-red-600' : 
                  request.urgency === 'urgent' ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 
                  'bg-gradient-to-r from-emerald-500 to-teal-500'
                }`} />

                <div className="p-6">
                  {/* Header Row */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4 flex-1 min-w-0 mr-2">
                      {/* Blood Group Badge */}
                      <div className={`relative w-14 h-14 rounded-2xl bg-gradient-to-br from-background/80 to-background/40 border border-white/10 shadow-inner flex items-center justify-center shrink-0`}>
                        <span className={`text-xl font-display font-bold ${
                             request.blood_group.includes('+') ? 'text-rose-500' : 'text-blue-500'
                        }`}>{request.blood_group}</span>
                        <div className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-card border-[3px] border-background/50 flex items-center justify-center shadow-sm">
                          <span className="text-[10px] font-bold text-foreground">{request.units}</span>
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="font-semibold text-lg truncate text-foreground">{request.patient_name || 'Anonymous'}</h3>
                          <Badge variant="outline" className={`${
                              request.urgency === 'critical' ? 'border-rose-500/30 text-rose-500 bg-rose-500/10' : 
                              request.urgency === 'urgent' ? 'border-amber-500/30 text-amber-500 bg-amber-500/10' : 
                              'border-emerald-500/30 text-emerald-500 bg-emerald-500/10'
                          } capitalize text-[10px] px-2 py-0.5 font-bold rounded-lg shadow-none shrink-0`}>
                            {request.urgency === 'critical' && <Zap className="w-3 h-3 mr-1" />}
                            {getUrgencyLabel(request.urgency)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground truncate flex items-center gap-1">
                          <Activity className="w-3 h-3" /> {request.hospital}
                        </p>
                      </div>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-secondary/50">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 rounded-xl">
                        <DropdownMenuItem onClick={() => {
                          setSelectedRequest(request);
                          setIsDetailOpen(true);
                        }} className="rounded-lg">
                          <Eye className="mr-2 h-4 w-4" />{tCommon('view')}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-emerald-500 focus:text-emerald-500 cursor-pointer rounded-lg"
                          onClick={() => handleAction('approve', request.id)}
                        >
                          <CheckCircle2 className="mr-2 h-4 w-4" />{t('approve')}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-amber-500 focus:text-amber-500 cursor-pointer rounded-lg"
                          onClick={() => handleAction('reject', request.id)}
                        >
                          <XCircle className="mr-2 h-4 w-4" />{t('reject')}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-rose-500 focus:text-rose-500 cursor-pointer rounded-lg"
                          onClick={() => handleAction('delete', request.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />{tCommon('delete')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Info Row */}
                  <div className="flex items-center gap-2 mb-6 text-xs">
                    <a 
                      href={mapsUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-secondary/30 hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-all group/map border border-transparent hover:border-border/50"
                    >
                      <MapPin className="w-3.5 h-3.5 group-hover/map:text-primary transition-colors" />
                      <span className="max-w-[120px] truncate">{request.city || t('city')}</span>
                    </a>
                    <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-secondary/30 text-muted-foreground border border-transparent">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{new Date(request.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    </div>
                  </div>

                  {/* Footer Row */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-xs font-bold text-primary">
                        {request.requester?.full_name?.split(' ').map((n: string) => n[0]).join('') || '?'}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-foreground">{request.requester?.full_name || 'Anonymous'}</p>
                        <p className="text-[10px] text-muted-foreground">{request.contact_number}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className={`${getStatusStyles(request.status)} capitalize rounded-lg px-2.5 py-0.5`}>
                      {getStatusLabel(request.status)}
                    </Badge>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {/* Pagination */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filteredRequests.length} / {requests.length} {t('title').toLowerCase()}
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled className="rounded-xl">
            {tCommon('previous')}
          </Button>
          <Button variant="outline" size="sm" className="rounded-xl">
            {tCommon('next')}
          </Button>
        </div>
      </motion.div>

      <RequestDetailSheet 
        request={selectedRequest}
        isOpen={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        onAction={(action, data) => selectedRequest && handleAction(action, selectedRequest.id, data)}
      />

      <CreateRequestSheet 
        isOpen={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onCreate={handleCreate}
      />
    </motion.div>
  );
}
