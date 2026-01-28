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
  Phone, 
  Pencil,
  Save,
  X,
  ExternalLink
} from "lucide-react";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UserDetailSheet } from "../users/UserDetailSheet";
import { getUser } from "../users/actions";
import { toast } from "sonner";
import { suspendUser, banUser, activateUser } from "../users/actions";

interface RequestDetailSheetProps {
  request: any;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAction: (action: string, data?: any) => void;
}

export default function RequestDetailSheet({
  request,
  isOpen,
  onOpenChange,
  onAction,
}: RequestDetailSheetProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [adminNotes, setAdminNotes] = useState(request?.admin_notes || "");
  const [editedRequest, setEditedRequest] = useState<any>(request || {});
  
  // User Profile State
  const [isUserSheetOpen, setIsUserSheetOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(false);

  useEffect(() => {
    if (request) {
        setEditedRequest(request);
        setAdminNotes(request.admin_notes || "");
    }
  }, [request]);

  if (!request) return null;

  const handleSave = () => {
    onAction('update', { ...editedRequest, admin_notes: adminNotes });
    setIsEditing(false);
  };

  const handleChange = (field: string, value: any) => {
    setEditedRequest((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleViewProfile = async () => {
      if (!request.requester?.id) {
          toast.error("No requester ID available");
          return;
      }
      
      setIsLoadingUser(true);
      try {
          const user = await getUser(request.requester.id);
          if (user) {
              setSelectedUser(user);
              setIsUserSheetOpen(true);
          } else {
              toast.error("User not found");
          }
      } catch (error) {
          toast.error("Failed to fetch user details");
      } finally {
          setIsLoadingUser(false);
      }
  };

  const handleUserAction = async (action: 'suspend' | 'ban' | 'activate', id: string) => {
    try {
        if (action === 'suspend') await suspendUser(id);
        if (action === 'ban') await banUser(id);
        if (action === 'activate') await activateUser(id);
        
        toast.success(`User ${action}ed successfully`);
        // Refresh local user state if needed or just let it close
        setIsUserSheetOpen(false);
    } catch (error: any) {
        toast.error(error.message);
    }
  };

  return (
    <>
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-xl p-0 overflow-hidden bg-background">
        <div className="h-full overflow-y-auto">
          <div className="p-6 space-y-8">
            <SheetHeader className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                   <Badge 
                    variant={request.urgency === 'critical' ? 'destructive' : 'secondary'}
                    className="mb-2 uppercase tracking-wider font-semibold"
                  >
                    {request.urgency}
                  </Badge>
                  <SheetTitle className="text-2xl font-display font-bold">
                    {request.blood_group} Blood Request
                  </SheetTitle>
                </div>
                {request.status === 'pending' && (
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    {isEditing ? <X className="w-5 h-5" /> : <Pencil className="w-5 h-5" />}
                  </Button>
                )}
              </div>
              <SheetDescription className="text-base text-muted-foreground">
                Request ID: <span className="font-mono text-xs">{request.id}</span>
              </SheetDescription>
            </SheetHeader>

            <Separator />

            {/* Patient & Hospital Details */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                Medical Details
              </h3>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <span className="text-sm font-medium text-muted-foreground">Patient Name</span>
                  {isEditing ? (
                    <Input 
                        value={editedRequest.patient_name} 
                        onChange={(e) => handleChange('patient_name', e.target.value)} 
                    />
                  ) : (
                    <p className="text-base font-medium">{request.patient_name}</p>
                  )}
                </div>
                
                <div className="space-y-1">
                  <span className="text-sm font-medium text-muted-foreground">Units Required</span>
                   {isEditing ? (
                    <Input 
                        type="number"
                        value={editedRequest.units} 
                        onChange={(e) => handleChange('units', parseInt(e.target.value))} 
                    />
                  ) : (
                    <p className="text-base font-medium">{request.units} Unit(s)</p>
                  )}
                </div>

                <div className="col-span-2 space-y-1">
                  <span className="text-sm font-medium text-muted-foreground">Hospital / Location</span>
                   {isEditing ? (
                    <Input 
                        value={editedRequest.hospital} 
                        onChange={(e) => handleChange('hospital', e.target.value)} 
                    />
                  ) : (
                    <p className="text-base font-medium">{request.hospital}</p>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* Contact Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Phone className="w-5 h-5 text-primary" />
                Contact Information
              </h3>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <span className="text-sm font-medium text-muted-foreground">Primary Contact</span>
                   {isEditing ? (
                    <Input 
                        value={editedRequest.contact_number} 
                        onChange={(e) => handleChange('contact_number', e.target.value)} 
                    />
                  ) : (
                    <p className="text-base font-medium">{request.contact_number}</p>
                  )}
                </div>

                <div className="space-y-1">
                    <span className="text-sm font-medium text-muted-foreground">Requester</span>
                    <Button 
                        variant="link" 
                        className="p-0 h-auto text-base font-medium text-primary hover:underline flex items-center gap-2"
                        onClick={handleViewProfile}
                        disabled={isLoadingUser}
                    >
                        {isLoadingUser ? 'Loading...' : (request.requester?.full_name || 'N/A')}
                        <ExternalLink className="w-3 h-3 text-muted-foreground" />
                    </Button>
                </div>
              </div>
            </div>

            <Separator />
            
             {/* Admin Section */}
            <div className="space-y-4">
               <h3 className="text-lg font-semibold flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-primary" />
                Admin Review
              </h3>
              <div className="space-y-2">
                 <span className="text-sm font-medium text-muted-foreground">Verification Notes</span>
                 <Textarea 
                    placeholder="Add internal notes about this request..."
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={4}
                 />
                 <p className="text-xs text-muted-foreground">These notes are visible to admins only.</p>
              </div>
            </div>

            {/* Actions for Status */}
            {request.status === 'pending' && (
              <SheetFooter className="flex-col sm:flex-row gap-3 pt-4">
                 {isEditing ? (
                    <Button onClick={handleSave} className="w-full sm:w-auto">
                        <Save className="w-4 h-4 mr-2" /> Save Changes
                    </Button>
                 ) : (
                    <>
                        <Button 
                        variant="destructive" 
                        className="w-full sm:w-1/2"
                        onClick={() => onAction('reject', { admin_notes: adminNotes })}
                        disabled={!adminNotes}
                        >
                        Reject
                        </Button>
                        <Button 
                        className="w-full sm:w-1/2"
                        onClick={() => onAction('approve', { ...editedRequest, admin_notes: adminNotes })}
                        >
                        Approve Request
                        </Button>
                    </>
                 )}
              </SheetFooter>
            )}
             {/* Delete Action for non-pending or just general management */}
             {request.status !== 'pending' && (
                 <SheetFooter className="flex flex-col gap-3 pt-4">
                     <Button onClick={handleSave} variant="outline" className="w-full">
                        Update Notes
                     </Button>
                     <Button 
                        variant="destructive"
                        className="w-full"
                        onClick={() => onAction('delete')}
                    >
                        Delete Request
                    </Button>
                 </SheetFooter>
             )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
    
    <UserDetailSheet 
        user={selectedUser}
        open={isUserSheetOpen}
        onOpenChange={setIsUserSheetOpen}
        onAction={handleUserAction}
    />
    </>
  );
}
