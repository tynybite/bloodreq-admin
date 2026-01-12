'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Plus,
  MoreHorizontal,
  Shield,
  Clock,
  Edit,
  Key,
  UserPlus,
  CheckCircle2,
  Ban,
  Activity,
  Eye,
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
const moderators = [
  {
    id: 1,
    name: "Rashid Ahmed",
    email: "rashid@bloodreq.com",
    role: "Manager",
    countries: ["Bangladesh", "India"],
    permissions: ["Blood Requests", "Financial", "Users", "Reports"],
    status: "active",
    lastActive: "2 mins ago",
    actionsToday: 23,
    avatar: null,
  },
  {
    id: 2,
    name: "Priya Patel",
    email: "priya@bloodreq.com",
    role: "Moderator",
    countries: ["India"],
    permissions: ["Blood Requests", "Reports"],
    status: "active",
    lastActive: "15 mins ago",
    actionsToday: 12,
    avatar: null,
  },
  {
    id: 3,
    name: "Ali Khan",
    email: "ali@bloodreq.com",
    role: "Moderator",
    countries: ["Pakistan"],
    permissions: ["Blood Requests", "Financial"],
    status: "suspended",
    lastActive: "2 days ago",
    actionsToday: 0,
    avatar: null,
  },
];

const auditLogs = [
  { id: 1, moderator: "Rashid Ahmed", action: "Approved blood request", entity: "BR-001", time: "2 mins ago" },
  { id: 2, moderator: "Priya Patel", action: "Banned user", entity: "USR-234", time: "15 mins ago" },
  { id: 3, moderator: "Rashid Ahmed", action: "Approved financial request", entity: "FR-012", time: "1 hour ago" },
  { id: 4, moderator: "Ali Khan", action: "Rejected blood request", entity: "BR-045", time: "2 days ago" },
  { id: 5, moderator: "Rashid Ahmed", action: "Verified donation", entity: "DON-089", time: "3 hours ago" },
];

const stats = [
  { label: 'Active Moderators', value: 2, gradient: 'from-emerald-500 to-teal-400' },
  { label: 'Total Team', value: moderators.length, gradient: 'from-blue-500 to-cyan-400' },
  { label: 'Actions Today', value: 47, gradient: 'from-violet-500 to-purple-500' },
];

export default function ModeratorsPage() {
  const [activeTab, setActiveTab] = useState<'team' | 'audit'>('team');

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
          <h1 className="font-display text-5xl font-bold tracking-tight bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Moderators
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Manage team access and monitor activity
          </p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-medium shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-shadow flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          Invite Moderator
        </motion.button>
      </motion.div>

      {/* Stats */}
      <motion.div variants={itemVariants} className="grid gap-4 sm:grid-cols-3">
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
          { key: 'team', label: 'Team Members', icon: Shield },
          { key: 'audit', label: 'Audit Log', icon: Clock },
        ].map((tab) => (
          <motion.button
            key={tab.key}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 transition-all ${
              activeTab === tab.key 
                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/25' 
                : 'bg-secondary/50 hover:bg-secondary'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </motion.button>
        ))}
      </motion.div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'team' ? (
          <motion.div 
            key="team"
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="space-y-4"
          >
            {/* Search */}
            <div className="relative max-w-md">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search team members..."
                className="pl-11 h-12 rounded-xl bg-card/50 border-border/50"
              />
            </div>

            {/* Team Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {moderators.map((mod, i) => (
                <motion.div
                  key={mod.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -4 }}
                  className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 relative overflow-hidden"
                >
                  {mod.status === 'suspended' && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500" />
                  )}

                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-xl font-bold text-white">
                        {mod.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{mod.name}</h3>
                        <p className="text-sm text-muted-foreground">{mod.email}</p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem><Edit className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                        <DropdownMenuItem><Key className="mr-2 h-4 w-4" />Reset Password</DropdownMenuItem>
                        <DropdownMenuItem><Eye className="mr-2 h-4 w-4" />View Activity</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-rose-500"><Ban className="mr-2 h-4 w-4" />Suspend</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <Badge variant="outline" className={mod.role === 'Manager' ? 'border-amber-500/50 text-amber-500' : ''}>
                      {mod.role}
                    </Badge>
                    <Badge className={mod.status === 'active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' : 'bg-amber-500/10 text-amber-500 border-amber-500/30'}>
                      {mod.status}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Countries</span>
                      <div className="flex gap-1">
                        {mod.countries.map((c) => (
                          <Badge key={c} variant="secondary" className="text-xs">{c}</Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Actions Today</span>
                      <span className="font-medium">{mod.actionsToday}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Last Active</span>
                      <span className="font-medium">{mod.lastActive}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-border/50">
                    <p className="text-xs text-muted-foreground mb-2">Permissions</p>
                    <div className="flex flex-wrap gap-1">
                      {mod.permissions.map((p) => (
                        <Badge key={p} variant="outline" className="text-xs">{p}</Badge>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="audit"
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden"
          >
            <div className="p-4 border-b border-border/50 flex items-center justify-between">
              <h3 className="font-semibold">Recent Activity</h3>
              <Button variant="outline" size="sm" className="rounded-lg">
                Export Log
              </Button>
            </div>
            <div className="divide-y divide-border/50">
              {auditLogs.map((log, i) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between p-4 hover:bg-secondary/20 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
                      <Activity className="w-5 h-5 text-indigo-500" />
                    </div>
                    <div>
                      <p className="font-medium">
                        <span className="text-primary">{log.moderator}</span>
                        {' '}{log.action}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Entity: <span className="font-mono">{log.entity}</span>
                      </p>
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">{log.time}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
