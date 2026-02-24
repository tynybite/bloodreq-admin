'use client';

import { useState, useEffect } from 'react';
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
  Trash2,
  ChevronDown,
  Droplet,
  Heart,
  CheckCircle2,
  XCircle,
  Unlock,
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import CountUp from "@/components/reactbits/CountUp";
import { suspendUser, banUser, activateUser, bulkSuspendUsers, bulkBanUsers, getUser, deleteUser } from './actions';
import { toast } from 'sonner';
import { UserDetailSheet } from './UserDetailSheet';
import { useTranslations } from 'next-intl';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.03 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
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

const getStatusStyles = (status: string) => {
  switch (status) {
    case "active": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/30";
    case "suspended": return "bg-amber-500/10 text-amber-500 border-amber-500/30";
    case "banned": return "bg-rose-500/10 text-rose-500 border-rose-500/30";
    default: return "bg-secondary text-foreground";
  }
};

export default function UsersClient({ initialUsers, stats }: { initialUsers: any[], stats: any[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Pagination & Sorting (placeholder logic for now as simplified in original)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const t = useTranslations('users');
  const tCommon = useTranslations('common');

  useEffect(() => {
    // Sync initial users if they change (e.g. revalidation)
    setUsers(initialUsers);
  }, [initialUsers]);

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

  const handleAction = async (action: 'suspend' | 'ban' | 'activate', id: string) => {
    try {
        if (action === 'suspend') await suspendUser(id);
        if (action === 'ban') await banUser(id);
        if (action === 'activate') await activateUser(id);

        toast.success(tCommon('success'));
        
        setUsers(prev => prev.map(u => {
            if (u.id !== id) return u;
            return { ...u, status: action === 'activate' ? 'active' : (action === 'suspend' ? 'suspended' : 'banned') };
        }));
    } catch (err: any) {
        toast.error(err.message);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteUser(deleteTarget.id);
      toast.success('User deleted successfully');
      setUsers(prev => prev.filter(u => u.id !== deleteTarget.id));
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete user');
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  const handleBulkAction = async (action: 'suspend' | 'ban') => {
      try {
          if (action === 'suspend') await bulkSuspendUsers(selectedUsers);
          if (action === 'ban') await bulkBanUsers(selectedUsers);

          toast.success(tCommon('success'));
          
          setUsers(prev => prev.map(u => {
              if (selectedUsers.includes(u.id)) {
                  return { ...u, status: action === 'suspend' ? 'suspended' : 'banned' };
              }
              return u;
          }));
          setSelectedUsers([]);
      } catch (err: any) {
          toast.error(err.message);
      }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
        searchQuery === '' ||
        user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.phone_number?.includes(searchQuery);
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

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
            {t('title')}
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            {t('totalUsers')}: {users.length}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl h-11">
            <Download className="w-4 h-4 mr-2" />
            {tCommon('export')}
          </Button>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-medium shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-shadow flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {tCommon('create')}
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
              placeholder={tCommon('search') + '...'}
              className="pl-11 h-12 rounded-xl bg-card/50 border-border/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={filterRole} onValueChange={setFilterRole}>
            <SelectTrigger className="w-[120px] h-12 rounded-xl bg-card/50 border-border/50">
              <SelectValue placeholder={t('role')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{tCommon('all')}</SelectItem>
              <SelectItem value="donor">{t('donors')}</SelectItem>
              <SelectItem value="requester">Requester</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[120px] h-12 rounded-xl bg-card/50 border-border/50">
              <SelectValue placeholder={t('status')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{tCommon('all')}</SelectItem>
              <SelectItem value="active">{t('active')}</SelectItem>
              <SelectItem value="suspended">{t('suspended')}</SelectItem>
              <SelectItem value="banned">Banned</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {selectedUsers.length > 0 && (
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{selectedUsers.length} selected</Badge>
            <Button 
                variant="outline" 
                size="sm" 
                className="text-amber-500 border-amber-500/30"
                onClick={() => handleBulkAction('suspend')}
            >
              <Ban className="w-4 h-4 mr-1" /> {t('suspended')}
            </Button>
            <Button 
                variant="outline" 
                size="sm" 
                className="text-rose-500 border-rose-500/30"
                onClick={() => handleBulkAction('ban')}
            >
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
          <div>{t('role')}</div>
          <div>Activity</div>
          <div>{t('status')}</div>
          <div></div>
        </div>

        {/* Table Body */}
        <AnimatePresence>
          {filteredUsers.map((user, i) => (
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
                  {user.full_name?.split(' ').map((n: string) => n[0]).join('') || '?'}
                </div>
                <div className="min-w-0">
                  <p className="font-medium truncate">{user.full_name || 'Anonymous'}</p>
                  <p className="text-sm text-muted-foreground truncate">{user.phone_number || 'No phone'}</p>
                </div>
              </div>

              <div>
                {user.blood_group ? (
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-sm font-bold text-white bg-gradient-to-r ${bloodGroupColors[user.blood_group] || 'bg-gray-500'}`}>
                    {user.blood_group}
                    </span>
                ) : (
                    <span className="text-sm text-muted-foreground">-</span>
                )}
              </div>

              <div>
                <Badge variant="outline" className="capitalize">
                  {user.role === 'donor' ? <Heart className="w-3 h-3 mr-1" /> : <Droplet className="w-3 h-3 mr-1" />}
                  {user.role}
                </Badge>
              </div>

              <div className="text-sm space-y-1">
                <div className="flex items-center gap-2">
                  <Heart className="w-3.5 h-3.5 text-rose-500" />
                  <span>{user.donation_count || 0} donations</span>
                </div>
                <div className="flex items-center gap-2">
                  <Droplet className="w-3.5 h-3.5 text-blue-500" />
                  <span>{user.request_count || 0} requests</span>
                </div>
              </div>

              <div>
                <Badge variant="outline" className={getStatusStyles(user.status) + ' capitalize'}>
                  {user.status === 'active' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                  {user.status === 'suspended' && <Ban className="w-3 h-3 mr-1" />}
                  {user.status === 'banned' && <XCircle className="w-3 h-3 mr-1" />}
                  {user.status === 'active' ? t('active') : user.status === 'suspended' ? t('suspended') : user.status}
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
                    <DropdownMenuItem><Mail className="mr-2 h-4 w-4" />{t('email')}</DropdownMenuItem>
                    <DropdownMenuItem><Phone className="mr-2 h-4 w-4" />{t('phone')}</DropdownMenuItem>
                    <DropdownMenuItem onClick={async (e) => {
                        e.preventDefault();
                        setIsLoadingUser(true);
                        try {
                            const fullUser = await getUser(user.id);
                            setSelectedUser(fullUser || user);
                            setIsDetailOpen(true);
                        } catch (error) {
                             toast.error("Failed to load details");
                             setSelectedUser(user);
                             setIsDetailOpen(true);
                        } finally {
                            setIsLoadingUser(false);
                        }
                    }}>
                        <Shield className="mr-2 h-4 w-4" />{isLoadingUser && selectedUser?.id === user.id ? 'Loading...' : tCommon('view')}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {user.status !== 'active' && (
                        <DropdownMenuItem className="text-emerald-500" onClick={() => handleAction('activate', user.id)}>
                            <Unlock className="mr-2 h-4 w-4" />{t('active')}
                        </DropdownMenuItem>
                    )}
                    {user.status !== 'suspended' && (
                        <DropdownMenuItem className="text-amber-500" onClick={() => handleAction('suspend', user.id)}>
                            <Ban className="mr-2 h-4 w-4" />{t('suspended')}
                        </DropdownMenuItem>
                    )}
                    {user.status !== 'banned' && (
                        <DropdownMenuItem className="text-rose-500" onClick={() => handleAction('ban', user.id)}>
                            <UserX className="mr-2 h-4 w-4" />Ban
                        </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="text-rose-600 focus:text-rose-600 focus:bg-rose-500/10" 
                      onClick={() => setDeleteTarget({ id: user.id, name: user.full_name || 'this user' })}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />Delete User
                    </DropdownMenuItem>
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
          {filteredUsers.length} / {users.length} {t('title').toLowerCase()}
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled className="rounded-lg">
            {tCommon('previous')}
          </Button>
          <Button variant="outline" size="sm" className="rounded-lg">
            {tCommon('next')}
          </Button>
        </div>
      </motion.div>

       <UserDetailSheet 
        user={selectedUser}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        onAction={handleAction}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="text-sm text-muted-foreground">
                Are you sure you want to permanently delete <strong>{deleteTarget?.name}</strong>? This will:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Remove their account from the database</li>
                  <li>Delete their Firebase authentication</li>
                  <li>Cancel all their pending requests and donations</li>
                </ul>
                <span className="block mt-2 text-rose-500 font-medium">This action cannot be undone.</span>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              disabled={isDeleting}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              {isDeleting ? 'Deleting...' : 'Delete User'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
