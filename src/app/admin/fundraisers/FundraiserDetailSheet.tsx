import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Building2, 
  User as UserIcon, 
  Pencil,
  Save,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  Target,
  Calendar,
  X,
  DollarSign
} from "lucide-react";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface FundraiserDetailSheetProps {
  fundraiser: any;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAction: (action: string, data?: any) => void;
}

import { getDonations } from './actions';

export default function FundraiserDetailSheet({
  fundraiser,
  isOpen,
  onOpenChange,
  onAction,
}: FundraiserDetailSheetProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<any>(fundraiser || {});
  const [donations, setDonations] = useState<any[]>([]);
  const [isLoadingDonations, setIsLoadingDonations] = useState(false);

  useEffect(() => {
    if (fundraiser) {
        setEditedData(fundraiser);
        // Fetch donations
        const fetchDonations = async () => {
             setIsLoadingDonations(true);
             try {
                const data = await getDonations(fundraiser.id);
                setDonations(data || []);
             } finally {
                 setIsLoadingDonations(false);
             }
        };
        fetchDonations();
    }
  }, [fundraiser]);

  if (!fundraiser) return null;

  const handleSave = () => {
    onAction('update', editedData);
    setIsEditing(false);
  };

  const handleChange = (field: string, value: any) => {
    setEditedData((prev: any) => ({ ...prev, [field]: value }));
  };

  const getStatusColor = (status: string) => {
      switch(status) {
          case 'approved': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
          case 'rejected': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
          case 'completed': return 'bg-violet-500/10 text-violet-500 border-violet-500/20';
          default: return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-xl p-0 overflow-hidden bg-background">
        <div className="h-full overflow-y-auto custom-scrollbar">
          <div className="p-6 space-y-8">
            <SheetHeader className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                   <Badge 
                    variant="outline"
                    className={`mb-2 capitalize ${getStatusColor(fundraiser.status)}`}
                  >
                    {fundraiser.status}
                  </Badge>
                  {isEditing ? (
                      <Input 
                          value={editedData.title} 
                          onChange={(e) => handleChange('title', e.target.value)}
                          className="font-display font-bold text-xl h-10"
                      />
                  ) : (
                    <SheetTitle className="text-2xl font-display font-bold leading-tight">
                        {fundraiser.title}
                    </SheetTitle>
                  )}
                </div>
                <div className="flex gap-2">
                    <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => setIsEditing(!isEditing)}
                    >
                        {isEditing ? <X className="w-5 h-5" /> : <Pencil className="w-5 h-5" />}
                    </Button>
                </div>
              </div>
              <SheetDescription className="text-base text-muted-foreground flex items-center gap-2">
                <Clock className="w-4 h-4" /> Created on {new Date(fundraiser.created_at).toLocaleDateString()}
              </SheetDescription>
            </SheetHeader>

            <Separator />

            {/* Progress Section */}
             <div className="space-y-4 bg-secondary/20 p-4 rounded-xl border border-border/50">
                 <div className="flex justify-between items-center">
                     <span className="text-sm font-medium text-muted-foreground">Progress</span>
                     <span className="font-mono font-semibold text-emerald-500">
                         {Math.round((fundraiser.amount_raised / fundraiser.amount_needed) * 100)}%
                     </span>
                 </div>
                 <div className="h-2 bg-secondary rounded-full overflow-hidden">
                     <div 
                        className="h-full bg-emerald-500 rounded-full" 
                        style={{ width: `${Math.min(100, (fundraiser.amount_raised / fundraiser.amount_needed) * 100)}%` }}
                    />
                 </div>
                 <div className="flex justify-between text-sm">
                     <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" /> Raised: ৳{fundraiser.amount_raised.toLocaleString()}</span>
                     <span className="flex items-center gap-1">Goal: ৳{isEditing ? (
                         <input 
                            type="number" 
                            className="bg-transparent w-20 border-b border-primary/50 text-right focus:outline-none"
                            value={editedData.amount_needed}
                            onChange={(e) => handleChange('amount_needed', parseFloat(e.target.value))}
                        />
                     ) : fundraiser.amount_needed.toLocaleString()}</span>
                 </div>
             </div>

            {/* Patient & Medical Details */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-primary" />
                Patient Information
              </h3>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <span className="text-sm font-medium text-muted-foreground">Patient Name</span>
                  {isEditing ? (
                    <Input 
                        value={editedData.patient_name} 
                        onChange={(e) => handleChange('patient_name', e.target.value)} 
                    />
                  ) : (
                    <p className="text-base font-medium">{fundraiser.patient_name}</p>
                  )}
                </div>
                
                <div className="space-y-1">
                  <span className="text-sm font-medium text-muted-foreground">Condition</span>
                   {isEditing ? (
                    <Input 
                        value={editedData.condition} 
                        onChange={(e) => handleChange('condition', e.target.value)} 
                    />
                  ) : (
                    <p className="text-base font-medium">{fundraiser.condition}</p>
                  )}
                </div>

                <div className="col-span-2 space-y-1">
                  <span className="text-sm font-medium text-muted-foreground">Hospital / Location</span>
                   {isEditing ? (
                    <Input 
                        value={editedData.hospital} 
                        onChange={(e) => handleChange('hospital', e.target.value)} 
                    />
                  ) : (
                    <p className="text-base font-medium">{fundraiser.hospital}, {fundraiser.location}</p>
                  )}
                </div>
              </div>
            </div>

            <Separator />
            
            {/* Description */}
             <div className="space-y-2">
                 <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                     <Target className="w-4 h-4" /> Campaign Description
                 </h3>
                  {isEditing ? (
                    <Textarea 
                        value={editedData.description} 
                        onChange={(e) => handleChange('description', e.target.value)} 
                        rows={5}
                    />
                  ) : (
                    <p className="text-sm leading-relaxed text-foreground/80 whitespace-pre-wrap">
                        {fundraiser.description || "No description provided."}
                    </p>
                  )}
             </div>

             {/* Documents (Placeholder for now) */}
             <div className="space-y-2">
                 <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                     <ExternalLink className="w-4 h-4" /> Documents
                 </h3>
                 {fundraiser.fundraiser_documents && fundraiser.fundraiser_documents.length > 0 ? (
                     <div className="grid gap-2">
                         {fundraiser.fundraiser_documents.map((doc: any, index: number) => (
                             <a 
                                key={doc.id || doc.url || index} 
                                href={doc.document_url || doc.url} 
                                target="_blank" 
                                className="flex items-center gap-2 p-2 rounded-lg border border-border/50 hover:bg-secondary/50 text-sm text-blue-500 hover:underline"
                             >
                                 <ExternalLink className="w-3 h-3" /> View Document
                             </a>
                         ))}
                     </div>
                 ) : (
                     <p className="text-sm text-muted-foreground italic">No documents attached.</p>
                 )}
             </div>


            <Separator />

            {/* Donations History */}
            <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <DollarSign className="w-4 h-4" /> Donation History
                </h3>
                
                <div className="rounded-xl border border-border/50 overflow-hidden bg-card/40">
                    <div className="grid grid-cols-4 gap-4 p-3 bg-secondary/30 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border/50">
                        <div>Donor</div>
                        <div>Amount</div>
                        <div>Method</div>
                        <div className="text-right">Date</div>
                    </div>
                    <div className="divide-y divide-border/50">
                    {isLoadingDonations ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">Loading...</div>
                    ) : donations.length > 0 ? (
                        donations.map((donation) => (
                            <div key={donation.id} className="grid grid-cols-4 gap-4 p-3 text-sm hover:bg-secondary/20 transition-colors">
                                <div className="font-medium truncate" title={donation.donor_name || 'Anonymous'}>
                                    {donation.donor_name || 'Anonymous'}
                                    {donation.donor_phone && <span className="block text-xs text-muted-foreground">{donation.donor_phone}</span>}
                                </div>
                                <div className="font-mono text-emerald-500 font-medium">
                                    ৳{donation.amount.toLocaleString()}
                                </div>
                                <div className="capitalize text-muted-foreground">
                                    {donation.payment_method || 'N/A'}
                                    {donation.status !== 'completed' && (
                                        <Badge variant="outline" className="ml-2 text-[10px] h-4 px-1 py-0 border-amber-500/50 text-amber-500">
                                            {donation.status}
                                        </Badge>
                                    )}
                                </div>
                                <div className="text-right text-muted-foreground text-xs flex items-center justify-end">
                                    {new Date(donation.created_at).toLocaleDateString()}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-8 text-center text-muted-foreground text-sm">
                            No donations received yet.
                        </div>
                    )}
                    </div>
                </div>
                
                {/* Summary Stats */}
                {donations.length > 0 && (
                    <div className="flex justify-end gap-6 text-sm">
                        <div className="text-muted-foreground">
                            Total Donors: <span className="font-medium text-foreground">{new Set(donations.map(d => d.donor_phone || d.transaction_id)).size}</span>
                        </div>
                        <div className="text-muted-foreground">
                            Average Amount: <span className="font-medium text-foreground">৳{Math.round(donations.reduce((a, b) => a + Number(b.amount), 0) / donations.length).toLocaleString()}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Actions for Status - Only show if not editing */}
            {!isEditing && (
              <SheetFooter className="flex flex-col gap-3 pt-4">
                  
                 {fundraiser.status === 'pending' && (
                     <div className="grid grid-cols-2 gap-3 w-full">
                        <Button 
                            variant="destructive" 
                            className="w-full"
                            onClick={() => onAction('reject', { ...fundraiser })}
                        >
                            <XCircle className="w-4 h-4 mr-2" /> Reject
                        </Button>
                        <Button 
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                            onClick={() => onAction('approve', { ...fundraiser })}
                        >
                            <CheckCircle2 className="w-4 h-4 mr-2" /> Approve
                        </Button>
                     </div>
                 )}
                 
                 <Button onClick={handleSave} variant="secondary" className="w-full hidden">
                    Save Changes (Triggered via state)
                 </Button>

                 {isEditing && (
                      <Button onClick={handleSave} className="w-full">
                        <Save className="w-4 h-4 mr-2" /> Save Changes
                      </Button>
                 )}

                 <Button 
                    variant="outline"
                    className="w-full text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                    onClick={() => onAction('delete')}
                >
                    <Trash2 className="w-4 h-4 mr-2" /> Delete Campaign
                </Button>
              </SheetFooter>
            )}
            
            {/* Editing Save Button */}
            {isEditing && (
                <SheetFooter className="pt-4">
                     <Button onClick={handleSave} className="w-full">
                        <Save className="w-4 h-4 mr-2" /> Save Changes
                      </Button>
                </SheetFooter>
            )}

          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
