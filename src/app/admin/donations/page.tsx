'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  MoreHorizontal,
  Heart,
  Wallet,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  ImageIcon,
  RefreshCw,
  DollarSign,
  Activity,
  Droplet,
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

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

// Mock donation data
const donations = [
  {
    id: "DON-001",
    type: "blood",
    donorName: "Mohammad Rahim",
    donorPhone: "+880 1712-345678",
    requestId: "BR-001",
    patientName: "Abdul Karim",
    bloodGroup: "A+",
    units: 1,
    status: "verified",
    date: "2026-01-11T14:30:00",
    avatar: null,
  },
  {
    id: "DON-002",
    type: "financial",
    donorName: "Sarah Khan",
    donorPhone: "+880 1811-223344",
    requestId: "FR-003",
    amount: 5000,
    currency: "BDT",
    paymentMethod: "bKash",
    transactionId: "TXN123456",
    status: "pending",
    date: "2026-01-11T10:15:00",
    hasScreenshot: true,
  },
  {
    id: "DON-003",
    type: "blood",
    donorName: "Fatima Begum",
    donorPhone: "+880 1911-556677",
    requestId: "BR-005",
    patientName: "Nasreen Akhtar",
    bloodGroup: "O+",
    units: 2,
    status: "pending",
    date: "2026-01-10T16:45:00",
  },
  {
    id: "DON-004",
    type: "financial",
    donorName: "Ahmed Hossain",
    donorPhone: "+91 98765-43210",
    requestId: "FR-001",
    amount: 10000,
    currency: "INR",
    paymentMethod: "GPay",
    transactionId: "GPY789012",
    status: "verified",
    date: "2026-01-09T09:30:00",
    hasScreenshot: false,
  },
  {
    id: "DON-005",
    type: "financial",
    donorName: "Priya Sharma",
    donorPhone: "+91 99887-76655",
    requestId: "FR-002",
    amount: 2500,
    currency: "INR",
    paymentMethod: "Stripe",
    transactionId: "STR456789",
    status: "failed",
    date: "2026-01-08T12:00:00",
    hasScreenshot: false,
  },
];

const stats = [
  { label: 'Pending Verification', value: 23, gradient: 'from-amber-500 to-orange-400' },
  { label: 'Verified Today', value: 47, gradient: 'from-emerald-500 to-teal-400' },
  { label: 'Blood Donations', value: 156, gradient: 'from-rose-500 to-pink-400' },
  { label: 'Financial Donations', value: 89, gradient: 'from-blue-500 to-cyan-400' },
];

const getStatusStyles = (status: string) => {
  switch (status) {
    case "pending": return "bg-amber-500/10 text-amber-500 border-amber-500/30";
    case "verified": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/30";
    case "failed": return "bg-rose-500/10 text-rose-500 border-rose-500/30";
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

export default function DonationsPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'blood' | 'financial'>('all');

  const bloodDonations = donations.filter(d => d.type === 'blood');
  const financialDonations = donations.filter(d => d.type === 'financial');
  const filteredDonations = activeTab === 'all' ? donations : 
    activeTab === 'blood' ? bloodDonations : financialDonations;

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
          <h1 className="font-display text-5xl font-bold tracking-tight bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 bg-clip-text text-transparent">
            Donations
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Manage and verify blood & financial donations
          </p>
        </div>
        <Button variant="outline" className="rounded-xl h-11">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
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

      {/* Tabs */}
      <motion.div variants={itemVariants} className="flex gap-2">
        {[
          { key: 'all', label: 'All Donations', icon: Activity },
          { key: 'blood', label: 'Blood', icon: Droplet },
          { key: 'financial', label: 'Financial', icon: Wallet },
        ].map((tab) => (
          <motion.button
            key={tab.key}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 transition-all ${
              activeTab === tab.key 
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25' 
                : 'bg-secondary/50 hover:bg-secondary'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </motion.button>
        ))}
      </motion.div>

      {/* Search & Filters */}
      <motion.div variants={itemVariants} className="flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by donor, transaction ID..."
            className="pl-11 h-12 rounded-xl bg-card/50 border-border/50"
          />
        </div>
        <Select defaultValue="all">
          <SelectTrigger className="w-[130px] h-12 rounded-xl bg-card/50 border-border/50">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* Donations List */}
      <motion.div variants={itemVariants} className="space-y-3">
        <AnimatePresence>
          {filteredDonations.map((donation, i) => (
            <motion.div
              key={donation.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -2 }}
              className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-5 flex items-center gap-5"
            >
              {/* Type Icon */}
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                donation.type === 'blood' 
                  ? 'bg-gradient-to-br from-rose-500 to-red-600' 
                  : 'bg-gradient-to-br from-emerald-500 to-teal-500'
              }`}>
                {donation.type === 'blood' ? (
                  <Heart className="w-6 h-6 text-white" />
                ) : (
                  <DollarSign className="w-6 h-6 text-white" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-semibold">{donation.donorName}</h3>
                  <Badge variant="outline" className="text-xs capitalize">
                    {donation.type}
                  </Badge>
                  {donation.type === 'blood' && (
                    <span className={`px-2 py-0.5 rounded text-xs font-bold text-white bg-gradient-to-r ${bloodGroupColors[(donation as any).bloodGroup]}`}>
                      {(donation as any).bloodGroup}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {donation.type === 'blood' 
                    ? `${(donation as any).units} unit(s) for ${(donation as any).patientName}`
                    : `${(donation as any).currency} ${(donation as any).amount?.toLocaleString()} via ${(donation as any).paymentMethod}`
                  }
                </p>
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(donation.date).toLocaleDateString()}
                  </span>
                  {donation.type === 'financial' && (donation as any).transactionId && (
                    <span className="font-mono">{(donation as any).transactionId}</span>
                  )}
                </div>
              </div>

              {/* Status Badge */}
              <Badge variant="outline" className={getStatusStyles(donation.status) + ' capitalize'}>
                {donation.status === 'verified' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                {donation.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                {donation.status === 'failed' && <XCircle className="w-3 h-3 mr-1" />}
                {donation.status}
              </Badge>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {donation.status === 'pending' && (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center hover:bg-emerald-500/20"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-9 h-9 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center hover:bg-rose-500/20"
                    >
                      <XCircle className="w-4 h-4" />
                    </motion.button>
                  </>
                )}
                {donation.type === 'financial' && (donation as any).hasScreenshot && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-9 h-9 rounded-lg bg-secondary/50 flex items-center justify-center hover:bg-secondary"
                  >
                    <ImageIcon className="w-4 h-4" />
                  </motion.button>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem><Eye className="mr-2 h-4 w-4" />View Details</DropdownMenuItem>
                    <DropdownMenuItem>View Request</DropdownMenuItem>
                    <DropdownMenuItem>Contact Donor</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-rose-500">Mark as Fraudulent</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Pagination */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing 1-{filteredDonations.length} of {filteredDonations.length} donations
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
    </motion.div>
  );
}
