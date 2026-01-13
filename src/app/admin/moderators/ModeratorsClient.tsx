'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  MoreHorizontal,
  Shield,
  Clock,
  Edit,
  Key,
  UserPlus,
  Ban,
  Activity,
  Eye,
  CheckCircle2,
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
import { Moderator, toggleModeratorStatus } from './actions';
import { toast } from "sonner";
import { useRouter } from 'next/navigation';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

interface ModeratorsClientProps {
  moderators: Moderator[];
  currentUserId: string;
  currentUserRole: string;
}

import { InviteModeratorSheet } from './InviteModeratorSheet';
import { ResetPasswordDialog } from './ResetPasswordDialog';
import { EditModeratorSheet } from './EditModeratorSheet';

export default function ModeratorsClient({ moderators, currentUserId, currentUserRole }: ModeratorsClientProps) {
  const [activeTab, setActiveTab] = useState<'team' | 'audit'>('team');
  const [searchQuery, setSearchQuery] = useState('');
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);
  const [editModeratorOpen, setEditModeratorOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{id: string, name: string} | null>(null);
  const [selectedModerator, setSelectedModerator] = useState<Moderator | null>(null);
  const router = useRouter();

  const handleStatusToggle = async (id: string, currentStatus: boolean) => {
    try {
      await toggleModeratorStatus(id, !currentStatus);
      toast.success(`Moderator ${!currentStatus ? 'activated' : 'suspended'} successfully`);
    } catch (error) {
      toast.error("Failed to update status");
      console.error(error);
    }
  };

  const filteredModerators = moderators.filter(mod => 
    mod.profile?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mod.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = [
    { label: 'Active Moderators', value: moderators.filter(m => m.is_active).length, gradient: 'from-emerald-500 to-teal-400' },
    { label: 'Total Team', value: moderators.length, gradient: 'from-blue-500 to-cyan-400' },
    // Placeholder for actions today as we don't have an audit log table yet
    { label: 'Actions Today', value: 0, gradient: 'from-violet-500 to-purple-500' },
  ];

  return (
    <motion.div 
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <InviteModeratorSheet open={isInviteOpen} onOpenChange={setIsInviteOpen} />
      {selectedUser && (
        <ResetPasswordDialog 
            open={resetPasswordOpen} 
            onOpenChange={setResetPasswordOpen}
            userId={selectedUser.id}
            userName={selectedUser.name}
        />
      )}
      
      <EditModeratorSheet
        open={editModeratorOpen}
        onOpenChange={setEditModeratorOpen}
        moderator={selectedModerator}
        currentUserId={currentUserId}
        currentUserRole={currentUserRole}
      />

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
          onClick={() => setIsInviteOpen(true)}
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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Team Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredModerators.length === 0 ? (
                 <div className="col-span-full text-center py-10 text-muted-foreground">
                    No moderators found.
                 </div>
              ) : (
              filteredModerators.map((mod, i) => (
                <motion.div
                  key={mod.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -4 }}
                  className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 relative overflow-hidden"
                >
                  {!mod.is_active && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500" />
                  )}

                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-xl font-bold text-white">
                        {mod.profile?.full_name?.split(' ').map((n: string) => n[0]).join('') || '?'}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{mod.profile?.full_name || 'Unknown'}</h3>
                        <p className="text-sm text-muted-foreground">{mod.profile?.phone_number || 'No phone'}</p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          onClick={() => {
                            setSelectedModerator(mod);
                            setEditModeratorOpen(true);
                          }}
                        >
                          <Edit className="mr-2 h-4 w-4" />Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                            onClick={() => {
                                setSelectedUser({ id: mod.id, name: mod.profile?.full_name || 'User' });
                                setResetPasswordOpen(true);
                            }}
                        >
                            <Key className="mr-2 h-4 w-4" /> Set Password
                        </DropdownMenuItem>
                        <DropdownMenuItem><Eye className="mr-2 h-4 w-4" />View Activity</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                            className={mod.is_active ? "text-amber-500" : "text-emerald-500"}
                            onClick={() => handleStatusToggle(mod.id, mod.is_active)}
                        >
                            {mod.is_active ? <Ban className="mr-2 h-4 w-4" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                            {mod.is_active ? 'Suspend' : 'Activate'}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <Badge variant="outline" className={mod.role === 'admin' ? 'border-amber-500/50 text-amber-500' : ''}>
                      {mod.role}
                    </Badge>
                    <Badge className={mod.is_active ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' : 'bg-amber-500/10 text-amber-500 border-amber-500/30'}>
                      {mod.is_active ? 'active' : 'suspended'}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Countries</span>
                      <div className="flex gap-1 flex-wrap justify-end">
                        {mod.assigned_countries && mod.assigned_countries.length > 0 ? (
                           mod.assigned_countries.map((c: string) => (
                            <Badge key={c} variant="secondary" className="text-xs">{c}</Badge>
                          ))
                        ) : (
                            <span className="text-xs text-muted-foreground">None</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Joined</span>
                      <span className="font-medium">{new Date(mod.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </motion.div>
              )))}
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
             <div className="p-10 text-center text-muted-foreground">
                Audit logs verification pending implementation.
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
