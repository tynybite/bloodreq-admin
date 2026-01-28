import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, Phone, Shield, Ban, UserX, Unlock, Droplet, Heart, Activity } from "lucide-react";
import { format } from "date-fns";

interface UserDetailSheetProps {
  user: any | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAction: (action: 'suspend' | 'ban' | 'activate', id: string) => void;
}

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

export function UserDetailSheet({ user, open, onOpenChange, onAction }: UserDetailSheetProps) {
  if (!user) return null;

  const bgGradient = user.blood_group ? bloodGroupColors[user.blood_group] : 'from-gray-500 to-gray-600';

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] p-0 border-l border-border/50 bg-background/95 backdrop-blur-xl">
        <SheetHeader className="sr-only">
          <SheetTitle>User Details: {user.full_name}</SheetTitle>
        </SheetHeader>
        <div className="h-full w-full overflow-y-auto">
            {/* Header / Banner */}
            <div className={`relative h-48 w-full bg-gradient-to-br ${bgGradient}`}>
                <div className="absolute inset-0 bg-black/10" />
                <div className="absolute -bottom-12 left-8">
                     <div className="w-24 h-24 rounded-3xl border-4 border-background bg-card shadow-2xl flex items-center justify-center text-3xl font-bold bg-gradient-to-br from-secondary to-secondary/50">
                        {user.full_name?.split(' ').map((n: string) => n[0]).join('') || '?'}
                     </div>
                </div>
                {/* Status Badge Top Right */}
                 <div className="absolute top-6 right-6">
                    <Badge variant="secondary" className="backdrop-blur-md bg-white/20 hover:bg-white/30 text-white border-0 shadow-lg capitalize px-3 py-1">
                        {user.status}
                    </Badge>
                 </div>
            </div>

            <div className="pt-16 px-8 pb-8 space-y-8">
                {/* User Identity */}
                <div>
                     <h2 className="text-3xl font-display font-bold tracking-tight">
                        {user.full_name || 'Anonymous User'}
                     </h2>
                     <div className="flex items-center gap-3 mt-2 text-muted-foreground">
                        <Badge variant="outline" className="text-xs uppercase tracking-wider font-semibold border-border/60">
                            {user.role}
                        </Badge>
                        <span className="text-sm">•</span>
                        <span className="text-sm">Joined {user.created_at ? format(new Date(user.created_at), 'MMMM yyyy') : 'Unknown'}</span>
                     </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-5 rounded-2xl bg-secondary/30 border border-border/50 flex flex-col items-center justify-center gap-2 group hover:bg-secondary/50 transition-colors">
                        <div className="p-3 rounded-full bg-rose-500/10 text-rose-500 group-hover:scale-110 transition-transform">
                             <Heart className="w-6 h-6" />
                        </div>
                        <span className="text-3xl font-bold font-display">{user.stats?.donations || 0}</span>
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Donations</span>
                    </div>
                    <div className="p-5 rounded-2xl bg-secondary/30 border border-border/50 flex flex-col items-center justify-center gap-2 group hover:bg-secondary/50 transition-colors">
                         <div className="p-3 rounded-full bg-blue-500/10 text-blue-500 group-hover:scale-110 transition-transform">
                             <Droplet className="w-6 h-6" />
                        </div>
                        <span className="text-3xl font-bold font-display">{user.stats?.requests || 0}</span>
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Requests</span>
                    </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                        <Shield className="w-4 h-4" /> Account Details
                    </h3>
                    <div className="grid gap-3 p-1">
                        <div className="flex items-center gap-4 p-3 rounded-xl bg-card border border-border/50 shadow-sm">
                            <div className="p-2 rounded-lg bg-secondary text-foreground">
                                <Phone className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-muted-foreground">Phone Number</p>
                                <p className="font-medium truncate">{user.phone_number || 'Not provided'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-3 rounded-xl bg-card border border-border/50 shadow-sm">
                            <div className="p-2 rounded-lg bg-secondary text-foreground">
                                <Mail className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-muted-foreground">Email Address</p>
                                <p className="font-medium truncate">{user.email || 'No email linked'}</p>
                            </div>
                        </div>
                         {user.blood_group && (
                            <div className="flex items-center gap-4 p-3 rounded-xl bg-card border border-border/50 shadow-sm">
                                <div className="p-2 rounded-lg bg-secondary text-foreground">
                                    <Activity className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-muted-foreground">Blood Type</p>
                                    <p className="font-medium truncate">{user.blood_group}</p>
                                </div>
                            </div>
                         )}
                    </div>
                </div>

                {/* Actions */}
                <div className="space-y-4 pt-4 border-t border-border/50">
                     <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                        Management
                    </h3>
                    <div className="grid gap-3">
                        {user.status !== 'active' && (
                            <Button 
                                className="w-full justify-start h-12 text-emerald-600 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20"
                                onClick={() => {
                                    onAction('activate', user.id);
                                    onOpenChange(false);
                                }}
                            >
                                <Unlock className="w-4 h-4 mr-2" />
                                Activate Account
                            </Button>
                        )}
                        
                        {user.status === 'active' && (
                            <Button 
                                variant="outline"
                                className="w-full justify-start h-12 text-amber-600 hover:text-amber-700 hover:bg-amber-500/10 border-amber-500/20"
                                onClick={() => {
                                    onAction('suspend', user.id);
                                    onOpenChange(false);
                                }}
                            >
                                <Ban className="w-4 h-4 mr-2" />
                                Suspend Activity
                            </Button>
                        )}

                        {user.status !== 'banned' && (
                             <Button 
                                variant="ghost"
                                className="w-full justify-start h-12 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                                 onClick={() => {
                                    onAction('ban', user.id);
                                    onOpenChange(false);
                                }}
                            >
                                <UserX className="w-4 h-4 mr-2" />
                                Ban Permanently
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
