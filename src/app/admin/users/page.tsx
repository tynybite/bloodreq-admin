'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Plus,
  Filter,
  MoreHorizontal,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Ban,
  UserX,
  Download,
  ChevronDown,
  Droplet,
  Heart,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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
  visible: { opacity: 1, transition: { staggerChildren: 0.03 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

// Mock data
const users = [
  {
    id: "USR-001",
    name: "Mohammad Rahim",
    email: "rahim@example.com",
    phone: "+880 1712-345678",
    bloodGroup: "A+",
    role: "donor",
    location: "Dhaka, Bangladesh",
    donations: 12,
    requests: 0,
    status: "active",
    joinedAt: "2025-03-15T10:00:00",
    avatar: null,
  },
  {
    id: "USR-002",
    name: "Sarah Khan",
    email: "sarah@example.com",
    phone: "+880 1811-223344",
    bloodGroup: "O-",
    role: "requester",
    location: "Chattogram, Bangladesh",
    donations: 2,
    requests: 5,
    status: "active",
    joinedAt: "2025-06-20T14:30:00",
    avatar: null,
  },
  {
    id: "USR-003",
    name: "Priya Sharma",
    email: "priya@example.com",
    phone: "+91 98765-43210",
    bloodGroup: "B+",
    role: "donor",
    location: "Kolkata, India",
    donations: 8,
    requests: 1,
    status: "active",
    joinedAt: "2025-01-10T09:15:00",
    avatar: null,
  },
  {
    id: "USR-004",
    name: "Ali Khan",
    email: "ali@example.com",
    phone: "+92 300-1234567",
    bloodGroup: "AB+",
    role: "donor",
    location: "Karachi, Pakistan",
    donations: 5,
    requests: 2,
    status: "suspended",
    joinedAt: "2024-11-05T16:45:00",
    avatar: null,
  },
  {
    id: "USR-005",
    name: "Fatima Begum",
    email: "fatima@example.com",
    phone: "+880 1911-556677",
    bloodGroup: "O+",
    role: "requester",
    location: "Sylhet, Bangladesh",
    donations: 0,
    requests: 3,
    status: "banned",
    joinedAt: "2025-08-12T12:00:00",
    avatar: null,
  },
];

const stats = [
  { label: 'Total Users', value: 24823, gradient: 'from-blue-500 to-cyan-400' },
  { label: 'Active Today', value: 1284, gradient: 'from-emerald-500 to-teal-400' },
  { label: 'Donors', value: 18456, gradient: 'from-rose-500 to-pink-400' },
  { label: 'New This Month', value: 842, gradient: 'from-violet-500 to-purple-500' },
];

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

const getStatusStyles = (status: string) => {
  switch (status) {
    case "active": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/30";
    case "suspended": return "bg-amber-500/10 text-amber-500 border-amber-500/30";
    case "banned": return "bg-rose-500/10 text-rose-500 border-rose-500/30";
    default: return "bg-secondary text-foreground";
  }
};

export default function UsersPage() {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const toggleUser = (id: string) => {
    setSelectedUsers(prev => 
      prev.includes(id) ? prev.filter(u => u !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    setSelectedUsers(prev => 
      prev.length === users.length ? [] : users.map(u => u.id)
    );
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
          <h1 className="font-display text-5xl font-bold tracking-tight bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 bg-clip-text text-transparent">
            Users
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Manage platform users, donors, and requesters
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl h-11">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-medium shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-shadow flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add User
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

      {/* Filters & Actions */}
      <motion.div variants={itemVariants} className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, phone..."
              className="pl-11 h-12 rounded-xl bg-card/50 border-border/50"
            />
          </div>
          <Select defaultValue="all">
            <SelectTrigger className="w-[120px] h-12 rounded-xl bg-card/50 border-border/50">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="donor">Donor</SelectItem>
              <SelectItem value="requester">Requester</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all">
            <SelectTrigger className="w-[120px] h-12 rounded-xl bg-card/50 border-border/50">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
              <SelectItem value="banned">Banned</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {selectedUsers.length > 0 && (
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{selectedUsers.length} selected</Badge>
            <Button variant="outline" size="sm" className="text-amber-500 border-amber-500/30">
              <Ban className="w-4 h-4 mr-1" /> Suspend
            </Button>
            <Button variant="outline" size="sm" className="text-rose-500 border-rose-500/30">
              <UserX className="w-4 h-4 mr-1" /> Ban
            </Button>
          </div>
        )}
      </motion.div>

      {/* Users Table */}
      <motion.div variants={itemVariants} className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-[auto_2fr_1fr_1fr_1fr_1fr_auto] gap-4 p-4 border-b border-border/50 bg-secondary/30 text-sm font-medium text-muted-foreground">
          <div className="flex items-center">
            <Checkbox checked={selectedUsers.length === users.length} onCheckedChange={toggleAll} />
          </div>
          <div>User</div>
          <div>Blood Group</div>
          <div>Role</div>
          <div>Activity</div>
          <div>Status</div>
          <div></div>
        </div>

        {/* Table Body */}
        <AnimatePresence>
          {users.map((user, i) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`grid grid-cols-[auto_2fr_1fr_1fr_1fr_1fr_auto] gap-4 p-4 items-center border-b border-border/30 hover:bg-secondary/20 transition-colors ${selectedUsers.includes(user.id) ? 'bg-primary/5' : ''}`}
            >
              <div>
                <Checkbox 
                  checked={selectedUsers.includes(user.id)} 
                  onCheckedChange={() => toggleUser(user.id)} 
                />
              </div>
              
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center font-medium">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="min-w-0">
                  <p className="font-medium truncate">{user.name}</p>
                  <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                </div>
              </div>

              <div>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-sm font-bold text-white bg-gradient-to-r ${bloodGroupColors[user.bloodGroup]}`}>
                  {user.bloodGroup}
                </span>
              </div>

              <div>
                <Badge variant="outline" className="capitalize">
                  {user.role === 'donor' ? <Heart className="w-3 h-3 mr-1" /> : <Droplet className="w-3 h-3 mr-1" />}
                  {user.role}
                </Badge>
              </div>

              <div className="text-sm">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-rose-500" />
                  <span>{user.donations} donations</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Droplet className="w-4 h-4" />
                  <span>{user.requests} requests</span>
                </div>
              </div>

              <div>
                <Badge variant="outline" className={getStatusStyles(user.status) + ' capitalize'}>
                  {user.status === 'active' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                  {user.status === 'suspended' && <Ban className="w-3 h-3 mr-1" />}
                  {user.status === 'banned' && <XCircle className="w-3 h-3 mr-1" />}
                  {user.status}
                </Badge>
              </div>

              <div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem><Mail className="mr-2 h-4 w-4" />Email User</DropdownMenuItem>
                    <DropdownMenuItem><Phone className="mr-2 h-4 w-4" />Call</DropdownMenuItem>
                    <DropdownMenuItem><Shield className="mr-2 h-4 w-4" />View Profile</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-amber-500"><Ban className="mr-2 h-4 w-4" />Suspend</DropdownMenuItem>
                    <DropdownMenuItem className="text-rose-500"><UserX className="mr-2 h-4 w-4" />Ban</DropdownMenuItem>
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
          Showing 1-5 of 24,823 users
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
