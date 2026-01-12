import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin, Calendar, Shield, Ban, CheckCircle2, XCircle, UserX, Unlock, Droplet, Heart, Clock } from "lucide-react";
import { format } from "date-fns";

interface UserDetailSheetProps {
  user: any | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAction: (action: 'suspend' | 'ban' | 'activate', id: string) => void;
}

export function UserDetailSheet({ user, open, onOpenChange, onAction }: UserDetailSheetProps) {
  if (!user) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Badge variant="outline" className="uppercase tracking-wider">
               {user.role}
            </Badge>
            <Badge className={
              user.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' :
              user.status === 'suspended' ? 'bg-amber-500/10 text-amber-500' :
              user.status === 'banned' ? 'bg-rose-500/10 text-rose-500' :
              'bg-secondary text-secondary-foreground'
            }>
              {user.status}
            </Badge>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center text-xl font-bold">
                {user.full_name?.split(' ').map((n: string) => n[0]).join('') || '?'}
            </div>
            <div>
                 <SheetTitle className="text-2xl font-display font-bold">
                    {user.full_name || 'Anonymous User'}
                </SheetTitle>
                 <SheetDescription className="text-base flex items-center gap-2 mt-1">
                    {user.blood_group ? (
                        <span className="font-semibold text-foreground bg-secondary px-2 py-0.5 rounded text-xs">
                            {user.blood_group}
                        </span>
                    ) : null}
                    <span>Joined {format(new Date(user.created_at), 'PPP')}</span>
                 </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-8">
          {/* Contact Info */}
          <div className="rounded-xl border border-border/50 p-4 space-y-3">
             <h3 className="font-semibold flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                Contact Information
             </h3>
             <div className="grid gap-3 text-sm">
                <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{user.phone_number || 'No phone number'}</span>
                </div>
                 {/* Email would normally be here if we joined with auth.users or had it in profiles */}
                 <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="italic text-muted-foreground">Email hidden (in auth.users)</span>
                </div>
             </div>
          </div>

          {/* Activity Placeholder */}
          <div className="space-y-4">
             <h3 className="font-semibold text-lg">Platform Activity</h3>
             <div className="grid grid-cols-2 gap-4">
                 <div className="p-4 rounded-xl bg-secondary/30 flex flex-col items-center justify-center gap-2">
                     <Heart className="w-6 h-6 text-rose-500" />
                     <span className="text-2xl font-bold">0</span>
                     <span className="text-xs text-muted-foreground">Donations</span>
                 </div>
                 <div className="p-4 rounded-xl bg-secondary/30 flex flex-col items-center justify-center gap-2">
                     <Droplet className="w-6 h-6 text-blue-500" />
                     <span className="text-2xl font-bold">0</span>
                     <span className="text-xs text-muted-foreground">Requests</span>
                 </div>
             </div>
          </div>

           {/* Actions */}
          <div className="space-y-3 pt-4 border-t border-border/50">
             <h3 className="font-semibold">Account Actions</h3>
             <div className="grid grid-cols-1 gap-3">
                {user.status !== 'active' && (
                     <Button 
                        variant="outline"
                        className="w-full justify-start text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/10"
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
                        className="w-full justify-start text-amber-500 border-amber-500/20 hover:bg-amber-500/10"
                        onClick={() => {
                            onAction('suspend', user.id);
                            onOpenChange(false);
                        }}
                    >
                        <Ban className="w-4 h-4 mr-2" />
                        Suspend Account
                    </Button>
                )}

                {user.status !== 'banned' && (
                     <Button 
                        variant="ghost"
                        className="w-full justify-start text-rose-500 hover:text-rose-600 hover:bg-rose-50"
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
      </SheetContent>
    </Sheet>
  );
}
