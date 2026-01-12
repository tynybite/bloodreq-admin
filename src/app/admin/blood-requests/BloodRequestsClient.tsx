'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Plus,
  Filter,
  MoreHorizontal,
  Phone,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  Droplet,
  AlertTriangle,
  Zap,
  ArrowUpDown,
  Trash2,
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
import { approveRequest, rejectRequest, deleteRequest } from './actions';
import { toast } from 'sonner';
import { RequestDetailSheet } from './RequestDetailSheet';

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
    case "in-progress": return "bg-blue-500/10 text-blue-500 border-blue-500/30";
    case "completed": return "bg-violet-500/10 text-violet-500 border-violet-500/30";
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

  // Client-side filtering
  const filteredRequests = requests.filter(req => {
    const matchesType = filterType === 'all' || req.blood_group === filterType;
    const matchesUrgency = filterUrgency === 'all' || req.urgency === filterUrgency;
    const matchesStatus = filterStatus === 'all' || req.status === filterStatus;
    const matchesSearch = 
        req.patient_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        req.hospital?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesType && matchesUrgency && matchesStatus && matchesSearch;
  });

  const handleAction = async (action: 'approve' | 'reject' | 'delete', id: string) => {
    try {
        if (action === 'approve') await approveRequest(id);
        if (action === 'reject') await rejectRequest(id);
        if (action === 'delete') await deleteRequest(id);
        
        toast.success(`Request ${action}d successfully`);
        // Optimistic update or waiting for revalidate (router.refresh() handled by parent or auto)
        // Since we revalidatePath in server action, next render should have new data.
        // However, we are controlling state 'requests' initialized with props. 
        // We should really depend on router refresh updating the props, OR manually update local state.
        // For simplicity, let's assume router.refresh() works or we update local state.
        // The correct way in Client Component with Server Action + revalidation is:
        // Use router.refresh() OR just update local state if we want instant feedback.
        // Let's update local state to reflect change immediately (Optimistic UI).
        
        setRequests(prev => prev.map(r => {
            if (r.id !== id) return r;
            if (action === 'delete') return null; // Filter out later
            return { ...r, status: action === 'approve' ? 'approved' : 'rejected' };
        }).filter(Boolean) as any[]);

    } catch (err: any) {
        toast.error(err.message);
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
            Blood Requests
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Manage and verify incoming blood donation requests
          </p>
        </div>
        <div className="flex items-center gap-3">
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 text-white text-sm font-medium shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40 transition-shadow flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Request
          </motion.button>
        </div>
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
            <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
            <p className="text-3xl font-bold font-display mt-1">
              <CountUp to={stat.value} duration={2} />
            </p>
          </motion.div>
        ))}
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants} className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by patient, hospital, requester..."
              className="pl-11 h-12 rounded-xl bg-card/50 border-border/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[140px] h-12 rounded-xl bg-card/50 border-border/50">
              <Droplet className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Blood Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((type) => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterUrgency} onValueChange={setFilterUrgency}>
            <SelectTrigger className="w-[130px] h-12 rounded-xl bg-card/50 border-border/50">
              <SelectValue placeholder="Urgency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Urgency</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="planned">Planned</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[130px] h-12 rounded-xl bg-card/50 border-border/50">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl">
            <ArrowUpDown className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>

      {/* Request Cards */}
      <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-2">
        <AnimatePresence>
          {filteredRequests.map((request, i) => {
            const urgencyStyles = getUrgencyStyles(request.urgency);
            console.log(request.profiles); // debug
            
            return (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4 }}
                className="relative overflow-hidden rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6"
              >
                {/* Urgency indicator */}
                {request.urgency === 'critical' && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 to-red-500" />
                )}
                {request.urgency === 'urgent' && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
                )}

                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    {/* Blood Group Badge */}
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${bloodGroupColors[request.blood_group]} flex items-center justify-center shadow-lg`}>
                      <span className="text-xl font-bold text-white">{request.blood_group}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{request.patient_name}</h3>
                        <Badge className={urgencyStyles.bg + ' ' + urgencyStyles.text + ' capitalize text-xs'}>
                          {request.urgency === 'critical' && <Zap className="w-3 h-3 mr-1" />}
                          {request.urgency}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {request.units} unit{request.units > 1 ? 's' : ''} needed • {request.hospital}
                      </p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => {
                        setSelectedRequest(request);
                        setIsDetailOpen(true);
                      }}>
                        <Eye className="mr-2 h-4 w-4" />View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem><Phone className="mr-2 h-4 w-4" />Contact</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-emerald-500 focus:text-emerald-500 cursor-pointer"
                        onClick={() => handleAction('approve', request.id)}
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" />Approve
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-amber-500 focus:text-amber-500 cursor-pointer"
                         onClick={() => handleAction('reject', request.id)}
                      >
                        <XCircle className="mr-2 h-4 w-4" />Reject
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-rose-500 focus:text-rose-500 cursor-pointer"
                        onClick={() => handleAction('delete', request.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{request.city || request.hospital}</span> {/* Use city if available */}
                    <Badge variant="outline" className="text-xs">2.4 km</Badge> {/* Mock distance for now */}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{new Date(request.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-medium">
                      {request.profiles?.full_name?.split(' ').map((n: string) => n[0]).join('') || '?'}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{request.profiles?.full_name || 'Anonymous'}</p>
                      <p className="text-xs text-muted-foreground">{request.contact_number}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className={getStatusStyles(request.status) + ' capitalize'}>
                    {request.status}
                  </Badge>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {/* Pagination - Placeholder */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredRequests.length} of {requests.length} requests
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled className="rounded-lg">
            Previous
          </Button>
          <Button variant="outline" size="sm" className="rounded-lg">
            Next
          </Button>
        </div>
      </motion.div>

      <RequestDetailSheet 
        request={selectedRequest}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        onAction={handleAction}
      />
    </motion.div>
  );
}
