'use client';

import { useState } from 'react';
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
  AlertTriangle,
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

// Mock data
const financialRequests = [
  {
    id: "FR-001",
    title: "Kidney Transplant Surgery for Abdul",
    patientName: "Abdul Rahman",
    condition: "Kidney Failure",
    amountNeeded: 500000,
    amountRaised: 324500,
    currency: "BDT",
    status: "fundraising",
    daysLeft: 23,
    donors: 156,
    location: "Dhaka, Bangladesh",
    createdAt: "2026-01-05T10:00:00",
    documents: 4,
    image: true,
  },
  {
    id: "FR-002",
    title: "Heart Surgery for Baby Fatima",
    patientName: "Fatima Begum",
    condition: "Congenital Heart Defect",
    amountNeeded: 800000,
    amountRaised: 650000,
    currency: "BDT",
    status: "fundraising",
    daysLeft: 15,
    donors: 289,
    location: "Chattogram, Bangladesh",
    createdAt: "2026-01-02T14:30:00",
    documents: 6,
    image: true,
  },
  {
    id: "FR-003",
    title: "Cancer Treatment Fund",
    patientName: "Mohammad Hasan",
    condition: "Leukemia",
    amountNeeded: 1200000,
    amountRaised: 450000,
    currency: "BDT",
    status: "pending",
    daysLeft: 0,
    donors: 0,
    location: "Sylhet, Bangladesh",
    createdAt: "2026-01-11T09:15:00",
    documents: 3,
    image: false,
  },
  {
    id: "FR-004",
    title: "Accident Recovery Support",
    patientName: "Priya Sharma",
    condition: "Multiple Fractures",
    amountNeeded: 250000,
    amountRaised: 250000,
    currency: "INR",
    status: "completed",
    daysLeft: 0,
    donors: 87,
    location: "Kolkata, India",
    createdAt: "2025-12-20T16:45:00",
    documents: 5,
    image: true,
  },
];

const stats = [
  { label: 'Total Requests', value: 342, gradient: 'from-blue-500 to-cyan-400' },
  { label: 'Under Review', value: 28, gradient: 'from-amber-500 to-orange-400' },
  { label: 'Fundraising', value: 156, gradient: 'from-emerald-500 to-teal-400' },
  { label: 'Total Raised', value: 12500000, prefix: '৳', gradient: 'from-violet-500 to-purple-500' },
];

const getStatusStyles = (status: string) => {
  switch (status) {
    case "pending": return "bg-amber-500/10 text-amber-500 border-amber-500/30";
    case "under_review": return "bg-blue-500/10 text-blue-500 border-blue-500/30";
    case "fundraising": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/30";
    case "completed": return "bg-violet-500/10 text-violet-500 border-violet-500/30";
    case "rejected": return "bg-rose-500/10 text-rose-500 border-rose-500/30";
    default: return "bg-secondary text-foreground";
  }
};

export default function FinancialRequestsPage() {
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
            Financial Requests
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Review and manage patient financial assistance requests
          </p>
        </div>
        <div className="flex items-center gap-3">
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-medium shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-shadow flex items-center gap-2"
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
              placeholder="Search by title, patient, condition..."
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
              <SelectItem value="under_review">Under Review</SelectItem>
              <SelectItem value="fundraising">Fundraising</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all">
            <SelectTrigger className="w-[130px] h-12 rounded-xl bg-card/50 border-border/50">
              <SelectValue placeholder="Amount" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Amounts</SelectItem>
              <SelectItem value="0-100000">Under ৳1 Lakh</SelectItem>
              <SelectItem value="100000-500000">৳1-5 Lakh</SelectItem>
              <SelectItem value="500000+">Above ৳5 Lakh</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl">
          <Filter className="h-4 w-4" />
        </Button>
      </motion.div>

      {/* Request Cards */}
      <motion.div variants={itemVariants} className="space-y-4">
        <AnimatePresence>
          {financialRequests.map((request, i) => {
            const progress = (request.amountRaised / request.amountNeeded) * 100;
            
            return (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -2 }}
                className="relative overflow-hidden rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6"
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                  {/* Progress Circle */}
                  <div className="relative w-24 h-24 flex-shrink-0">
                    <svg className="w-24 h-24 transform -rotate-90">
                      <circle
                        cx="48" cy="48" r="42"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className="text-secondary"
                      />
                      <circle
                        cx="48" cy="48" r="42"
                        stroke="url(#progressGradient)"
                        strokeWidth="8"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={`${progress * 2.64} 264`}
                      />
                      <defs>
                        <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#10b981" />
                          <stop offset="100%" stopColor="#14b8a6" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-lg font-bold">{Math.round(progress)}%</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg truncate">{request.title}</h3>
                          <Badge variant="outline" className={getStatusStyles(request.status) + ' capitalize'}>
                            {request.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {request.patientName} • {request.condition}
                        </p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg flex-shrink-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem><Eye className="mr-2 h-4 w-4" />View Details</DropdownMenuItem>
                          <DropdownMenuItem><FileText className="mr-2 h-4 w-4" />View Documents ({request.documents})</DropdownMenuItem>
                          <DropdownMenuItem><ExternalLink className="mr-2 h-4 w-4" />Open Public Page</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-emerald-500"><CheckCircle2 className="mr-2 h-4 w-4" />Approve</DropdownMenuItem>
                          <DropdownMenuItem className="text-rose-500"><XCircle className="mr-2 h-4 w-4" />Reject</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Amount Progress */}
                    <div className="mt-4">
                      <div className="flex items-baseline justify-between mb-2">
                        <span className="text-2xl font-bold text-emerald-500">
                          {request.currency} {request.amountRaised.toLocaleString()}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          of {request.currency} {request.amountNeeded.toLocaleString()}
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-secondary overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 1, delay: 0.5 }}
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
                        />
                      </div>
                    </div>

                    {/* Meta */}
                    <div className="flex items-center gap-6 mt-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{request.donors} donors</span>
                      </div>
                      {request.daysLeft > 0 && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{request.daysLeft} days left</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        <span>{request.documents} documents</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
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
          Showing 1-4 of 342 requests
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
