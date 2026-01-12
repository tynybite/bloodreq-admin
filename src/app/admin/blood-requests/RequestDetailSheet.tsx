import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Droplet, Phone, MapPin, Clock, Calendar, CheckCircle2, XCircle, Trash2 } from "lucide-react";
import { format } from "date-fns";

interface RequestDetailSheetProps {
  request: any | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAction: (action: 'approve' | 'reject' | 'delete', id: string) => void;
}

export function RequestDetailSheet({ request, open, onOpenChange, onAction }: RequestDetailSheetProps) {
  if (!request) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Badge variant="outline" className="uppercase tracking-wider">
              {request.id.slice(0, 8)}
            </Badge>
            <Badge className={
              request.status === 'pending' ? 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20' :
              request.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20' :
              request.status === 'rejected' ? 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20' :
              'bg-secondary text-secondary-foreground'
            }>
              {request.status}
            </Badge>
          </div>
          <SheetTitle className="text-3xl font-display font-bold">
            {request.patient_name}
          </SheetTitle>
          <SheetDescription className="flex items-center gap-2 text-base">
            <Droplet className="w-4 h-4 text-rose-500" />
            <span className="font-semibold text-foreground">{request.blood_group}</span>
            <span>•</span>
            <span>{request.units} Unit{request.units > 1 ? 's' : ''} Required</span>
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-8">
          {/* Main Info Card */}
          <div className="rounded-xl border border-border/50 bg-secondary/20 p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Hospital</span>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-primary mt-0.5" />
                  <span className="font-medium">{request.hospital}</span>
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">City</span>
                <span className="font-medium block">{request.city || 'Not specified'}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Contact</span>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-primary" />
                  <span className="font-medium">{request.contact_number}</span>
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Required Date</span>
                <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span className="font-medium">{request.required_date ? format(new Date(request.required_date), 'PPP') : 'ASAP'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Additional Information</h3>
            <div className="grid gap-4 text-sm">
                <div className="flex justify-between py-2 border-b border-border/50">
                    <span className="text-muted-foreground">Urgency Level</span>
                    <span className="font-medium capitalize">{request.urgency}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border/50">
                    <span className="text-muted-foreground">Reason</span>
                    <span className="font-medium">{request.reason || 'Not specified'}</span>
                </div>
                 <div className="flex justify-between py-2 border-b border-border/50">
                    <span className="text-muted-foreground">Posted By</span>
                    <div className="text-right">
                        <span className="font-medium block">{request.profiles?.full_name || 'Anonymous'}</span>
                        <span className="text-xs text-muted-foreground">{format(new Date(request.created_at), 'PP p')}</span>
                    </div>
                </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 pt-4">
             {request.status === 'pending' && (
                <div className="grid grid-cols-2 gap-3">
                    <Button 
                        className="bg-emerald-500 hover:bg-emerald-600 text-white"
                        onClick={() => {
                            onAction('approve', request.id);
                            onOpenChange(false);
                        }}
                    >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Approve Request
                    </Button>
                    <Button 
                        variant="destructive"
                        className="bg-rose-500 hover:bg-rose-600 text-white"
                         onClick={() => {
                            onAction('reject', request.id);
                            onOpenChange(false);
                        }}
                    >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject Request
                    </Button>
                </div>
             )}
            
            <Button 
                variant="outline" 
                className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 border-rose-200"
                onClick={() => {
                     onAction('delete', request.id);
                     onOpenChange(false);
                }}
            >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Permanently
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
