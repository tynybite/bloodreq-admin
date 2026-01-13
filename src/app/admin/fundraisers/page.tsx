'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Plus,
  Filter,
  MoreHorizontal,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  FileText,
  DollarSign,
  Users,
  Calendar,
  ExternalLink,
  Target,
  RefreshCw
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
import CreateFundraiserSheet from './CreateFundraiserSheet';
import FundraiserDetailSheet from './FundraiserDetailSheet';
import { getFundraisers, createFundraiser, updateFundraiser, updateFundraiserStatus, deleteFundraiser } from './actions';
import { toast } from 'sonner';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const getStatusStyles = (status: string) => {
  switch (status) {
    case "pending": return "bg-amber-500/10 text-amber-500 border-amber-500/30";
    case "approved": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/30";
    case "completed": return "bg-violet-500/10 text-violet-500 border-violet-500/30";
    case "rejected": return "bg-rose-500/10 text-rose-500 border-rose-500/30";
    default: return "bg-secondary text-foreground";
  }
};

export default function FundraisersPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedFundraiser, setSelectedFundraiser] = useState<any>(null);
  const [fundraisers, setFundraisers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchFundraisers = async () => {
      setIsLoading(true);
      try {
          const data = await getFundraisers(filterStatus === 'all' ? undefined : filterStatus);
          setFundraisers(data);
      } catch (error) {
          toast.error("Failed to fetch fundraisers");
      } finally {
          setIsLoading(false);
      }
  };

  useEffect(() => {
    fetchFundraisers();
  }, [filterStatus]);

  const handleCreate = async (data: any) => {
      await createFundraiser(data);
      fetchFundraisers();
  };

  const handleAction = async (action: string, data?: any) => {
      try {
          // Use provided data or fallback to selectedFundraiser
          const targetRequest = data || selectedFundraiser;
          
          if (!targetRequest) {
              toast.error("No fundraiser selected");
              return;
          }

          if (action === 'update') {
              await updateFundraiser(targetRequest.id, data);
              toast.success("Fundraiser updated");
          } else if (action === 'approve') {
              // Validate documents
              if (!targetRequest.fundraiser_documents || targetRequest.fundraiser_documents.length === 0) {
                  toast.error("Cannot approve: Documents are required.");
                  return;
              }
              await updateFundraiserStatus(targetRequest.id, 'approved');
              toast.success("Fundraiser approved");
          } else if (action === 'reject') {
              await updateFundraiserStatus(targetRequest.id, 'rejected');
              toast.success("Fundraiser rejected");
          } else if (action === 'delete') {
              await deleteFundraiser(targetRequest.id);
              toast.success("Fundraiser deleted");
              setSelectedFundraiser(null);
          }
           fetchFundraisers();
           if(action !== 'delete' && action !== 'update') setSelectedFundraiser(null);
      } catch (error) {
          toast.error("Action failed");
          console.error(error);
      }
  };

  // Filter logic
  const filteredFundraisers = fundraisers.filter(f => 
       f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
       f.patient_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = [
    { label: 'Total active', value: fundraisers.length, gradient: 'from-blue-500 to-cyan-400' },
    { label: 'Pending Review', value: fundraisers.filter(f => f.status === 'pending').length, gradient: 'from-amber-500 to-orange-400' },
    { label: 'Total Raised', value: fundraisers.reduce((acc, curr) => acc + (curr.amount_raised || 0), 0), prefix: '৳', gradient: 'from-emerald-500 to-teal-400' },
  ];

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
          <h1 className="font-display text-5xl font-bold tracking-tight bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 bg-clip-text text-transparent">
            Fundraisers
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Manage patient fundraising activities
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={fetchFundraisers} className="h-11 w-11 p-0 rounded-xl">
               <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsCreateOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-medium shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-shadow flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Fundraiser
          </motion.button>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={itemVariants} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <motion.div
            key={stat.label}
            whileHover={{ y: -2 }}
            className="relative overflow-hidden rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm p-5"
          >
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl ${stat.gradient} opacity-10 blur-2xl`} />
            <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
            <p className="text-3xl font-bold font-display mt-1">
              {stat.prefix}<CountUp to={stat.value} duration={2} />
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
              placeholder="Search by title, patient..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 h-12 rounded-xl bg-card/50 border-border/50"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[150px] h-12 rounded-xl bg-card/50 border-border/50">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* List */}
      <motion.div variants={itemVariants} className="space-y-4">
        <AnimatePresence mode='popLayout'>
          {filteredFundraisers.length === 0 ? (
               <div className="text-center py-20 text-muted-foreground">
                   No fundraisers found.
               </div>
          ) : (
              filteredFundraisers.map((request, i) => {
                const progress = request.amount_needed > 0 ? (request.amount_raised / request.amount_needed) * 100 : 0;
                
                return (
                  <motion.div
                    key={request.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.05 }}
                    className="relative overflow-hidden rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 hover:bg-card/80 transition-colors"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                      {/* Progress Circle */}
                      <div className="relative w-20 h-20 flex-shrink-0">
                        <svg className="w-20 h-20 transform -rotate-90">
                          <circle
                            cx="40" cy="40" r="36"
                            stroke="currentColor"
                            strokeWidth="6"
                            fill="none"
                            className="text-secondary"
                          />
                          <circle
                            cx="40" cy="40" r="36"
                            stroke="url(#progressGradient)"
                            strokeWidth="6"
                            fill="none"
                            strokeLinecap="round"
                            strokeDasharray={`${progress * 2.26} 226`}
                          />
                          <defs>
                            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#10b981" />
                              <stop offset="100%" stopColor="#14b8a6" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-sm font-bold">{Math.round(progress)}%</span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-lg truncate">{request.title}</h3>
                              <Badge variant="outline" className={getStatusStyles(request.status) + ' capitalize'}>
                                {request.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {request.patient_name} • {request.condition}
                            </p>
                          </div>
                          
                          <div className="flex gap-2">
                             <Button 
                                variant="ghost" 
                                size="sm" 
                                className="hidden sm:flex"
                                onClick={() => setSelectedFundraiser(request)}
                            >
                                <Eye className="w-4 h-4 mr-2" /> View Details
                            </Button>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg flex-shrink-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => setSelectedFundraiser(request)}>
                                        <Eye className="mr-2 h-4 w-4" />View Details
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setSelectedFundraiser(request)}>
                                        <FileText className="mr-2 h-4 w-4" />View Documents ({request.fundraiser_documents?.length || 0})
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                     {request.status === 'pending' && (
                                        <>
                                            <DropdownMenuItem className="text-emerald-500" onClick={() => {
                                                handleAction('approve', request);
                                            }}>
                                                <CheckCircle2 className="mr-2 h-4 w-4" />Approve
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="text-rose-500" onClick={() => {
                                                handleAction('reject', request);
                                            }}>
                                                <XCircle className="mr-2 h-4 w-4" />Reject
                                            </DropdownMenuItem>
                                        </>
                                     )}
                                     <DropdownMenuItem className="text-rose-500" onClick={() => {
                                         handleAction('delete', request);
                                     }}>
                                        <XCircle className="mr-2 h-4 w-4" />Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                          </div>

                        </div>

                        {/* Amount Progress */}
                        <div className="mt-4">
                          <div className="flex items-baseline justify-between mb-2">
                            <span className="text-xl font-bold text-foreground">
                              ৳{request.amount_raised?.toLocaleString()}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              of ৳{request.amount_needed?.toLocaleString()}
                            </span>
                          </div>
                          <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${progress}%` }}
                              transition={{ duration: 1, delay: 0.5 }}
                              className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
                            />
                          </div>
                        </div>

                        {/* Meta */}
                        <div className="flex items-center gap-6 mt-4 text-xs text-muted-foreground">
                          {request.deadline && (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>Ends {new Date(request.deadline).toLocaleDateString()}</span>
                            </div>
                          )}
                           <div className="flex items-center gap-1">
                              <Target className="w-3 h-3" />
                              <span>{request.condition}</span>
                            </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })
          )}
        </AnimatePresence>
      </motion.div>

      <CreateFundraiserSheet 
        isOpen={isCreateOpen} 
        onOpenChange={setIsCreateOpen} 
        onCreate={handleCreate} 
      />

      <FundraiserDetailSheet 
        isOpen={!!selectedFundraiser}
        onOpenChange={(open) => !open && setSelectedFundraiser(null)}
        fundraiser={selectedFundraiser}
        onAction={handleAction}
      />

    </motion.div>
  );
}
