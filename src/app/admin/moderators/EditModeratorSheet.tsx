'use client';

import { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Loader2, Shield, Globe, User, Phone, MapPin, Droplets, Building2, Mail, Plus } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { updateModerator, Moderator } from './actions';

// Field component matching the CreateRequestSheet style
const Field = ({ label, icon: Icon, required, children }: any) => (
  <div className="space-y-2 group">
    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2 group-focus-within:text-primary transition-colors">
      {Icon && <Icon className="w-3 h-3" />}
      {label} {required && <span className="text-rose-500">*</span>}
    </Label>
    {children}
  </div>
);

interface EditModeratorSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  moderator: Moderator | null;
  currentUserId: string;
  currentUserRole: string;
}

const ROLES = [
  { value: 'super_admin', label: 'Super Admin', description: 'Full system access' },
  { value: 'admin', label: 'Admin', description: 'Manage team & settings' },
  { value: 'moderator', label: 'Moderator', description: 'Approve requests & donations' },
  { value: 'finance', label: 'Finance', description: 'Manage payments & fundraisers' },
  { value: 'support', label: 'Support', description: 'View-only access' },
];

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const ROLE_HIERARCHY: Record<string, number> = {
  'super_admin': 4,
  'admin': 3,
  'moderator': 2,
  'finance': 1,
  'support': 0,
};

export function EditModeratorSheet({ 
  open, 
  onOpenChange, 
  moderator,
  currentUserId,
  currentUserRole 
}: EditModeratorSheetProps) {
  // Profile fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  
  // Permission fields
  const [selectedRole, setSelectedRole] = useState('');
  const [assignedCountries, setAssignedCountries] = useState<string[]>([]);
  const [newCountry, setNewCountry] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);

  // Initialize state when moderator changes
  useEffect(() => {
    if (moderator) {
      setFullName(moderator.profile?.full_name || '');
      setEmail(moderator.profile?.email || '');
      setPhone(moderator.profile?.phone_number || '');
      setBloodGroup((moderator.profile as any)?.blood_group || '');
      setCountry((moderator.profile as any)?.country || '');
      setCity((moderator.profile as any)?.city || '');
      setAddress((moderator.profile as any)?.address || '');
      setSelectedRole(moderator.role);
      setAssignedCountries(moderator.assigned_countries || []);
    }
  }, [moderator]);

  // Get available roles - super_admin can assign ALL roles
  const currentUserLevel = ROLE_HIERARCHY[currentUserRole] ?? 0;
  const availableRoles = currentUserRole === 'super_admin' 
    ? ROLES 
    : ROLES.filter(r => ROLE_HIERARCHY[r.value] < currentUserLevel);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!moderator) return;
    
    if (!fullName || !selectedRole) {
      toast.error("Please fill in all required fields.");
      return;
    }
    
    setIsLoading(true);
    try {
      const result = await updateModerator(currentUserId, moderator.id, {
        role: selectedRole,
        assigned_countries: assignedCountries,
        profile: {
          full_name: fullName,
          phone_number: phone,
          blood_group: bloodGroup,
          country: country,
          city: city,
          address: address,
        }
      });

      if (result.success) {
        toast.success('Moderator updated successfully');
        onOpenChange(false);
      } else {
        toast.error(result.message || 'Failed to update moderator');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const removeCountry = (ctry: string) => {
    setAssignedCountries(prev => prev.filter(c => c !== ctry));
  };

  const addCountry = () => {
    if (newCountry.trim() && !assignedCountries.includes(newCountry.trim())) {
      setAssignedCountries(prev => [...prev, newCountry.trim()]);
      setNewCountry('');
    }
  };

  const handleCountryKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCountry();
    }
  };

  if (!moderator) return null;

  const targetLevel = ROLE_HIERARCHY[moderator.role] ?? 0;
  // Super admin can edit EVERYONE, others can only edit users with lower role
  const canEdit = currentUserRole === 'super_admin' || currentUserLevel > targetLevel;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-2xl p-0 flex flex-col bg-background/95 backdrop-blur-xl border-l border-border/40">
        
        {/* Header with Gradient Background */}
        <div className="relative overflow-hidden p-6 pb-8 border-b border-border/40">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-indigo-500/20 to-purple-500/0 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <SheetHeader className="relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-xl font-bold text-white shadow-lg shadow-indigo-500/25">
                {moderator.profile?.full_name?.split(' ').map((n: string) => n[0]).join('') || '?'}
              </div>
              <div>
                <SheetTitle className="text-2xl font-display font-bold bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                  Edit Moderator
                </SheetTitle>
                <SheetDescription className="text-base">
                  Update profile and permissions for {moderator.profile?.full_name || 'this user'}
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>
        </div>

        {!canEdit ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500 text-center max-w-sm">
              <Shield className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">Permission Denied</p>
              <p className="text-sm mt-1 opacity-80">You cannot edit this user as they have an equal or higher role than you.</p>
            </div>
          </div>
        ) : (
          <>
            {/* Scrollable Form Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <form id="edit-moderator-form" onSubmit={handleSubmit} className="p-6 space-y-8">
                
                {/* Profile Section */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold flex items-center gap-2 text-foreground/80">
                    <User className="w-4 h-4 text-primary" /> Personal Details
                  </h4>
                  <div className="grid gap-5 md:grid-cols-2">
                    <Field label="Full Name" icon={User} required>
                      <Input 
                        value={fullName} 
                        onChange={(e) => setFullName(e.target.value)} 
                        placeholder="Enter full name"
                        className="h-11 rounded-xl bg-secondary/30 border-transparent focus:border-primary/20 focus:bg-background transition-all"
                      />
                    </Field>

                    <Field label="Email" icon={Mail}>
                      <Input 
                        value={email} 
                        disabled
                        placeholder="Email (read-only)"
                        className="h-11 rounded-xl bg-muted/50 border-transparent text-muted-foreground cursor-not-allowed"
                      />
                    </Field>

                    <Field label="Phone Number" icon={Phone}>
                      <Input 
                        value={phone} 
                        onChange={(e) => setPhone(e.target.value)} 
                        placeholder="+8801712345678"
                        className="h-11 rounded-xl bg-secondary/30 border-transparent focus:border-primary/20 focus:bg-background transition-all font-mono text-sm"
                      />
                    </Field>

                    <Field label="Blood Group" icon={Droplets}>
                      <Select value={bloodGroup} onValueChange={setBloodGroup}>
                        <SelectTrigger className="h-11 rounded-xl bg-secondary/30 border-transparent focus:border-primary/20 focus:bg-background transition-all">
                          <SelectValue placeholder="Select Group" />
                        </SelectTrigger>
                        <SelectContent>
                          <div className="grid grid-cols-4 gap-1 p-1">
                            {BLOOD_GROUPS.map(bg => (
                              <SelectItem 
                                key={bg} 
                                value={bg}
                                className="justify-center text-center rounded-lg cursor-pointer focus:bg-primary focus:text-primary-foreground"
                              >
                                {bg}
                              </SelectItem>
                            ))}
                          </div>
                        </SelectContent>
                      </Select>
                    </Field>

                    <Field label="Country" icon={Globe}>
                      <Input 
                        value={country} 
                        onChange={(e) => setCountry(e.target.value)} 
                        placeholder="e.g. Bangladesh"
                        className="h-11 rounded-xl bg-secondary/30 border-transparent focus:border-primary/20 focus:bg-background transition-all"
                      />
                    </Field>

                    <Field label="City" icon={MapPin}>
                      <Input 
                        value={city} 
                        onChange={(e) => setCity(e.target.value)} 
                        placeholder="e.g. Dhaka"
                        className="h-11 rounded-xl bg-secondary/30 border-transparent focus:border-primary/20 focus:bg-background transition-all"
                      />
                    </Field>

                    <div className="md:col-span-2">
                      <Field label="Address" icon={Building2}>
                        <Input 
                          value={address} 
                          onChange={(e) => setAddress(e.target.value)} 
                          placeholder="Full address"
                          className="h-11 rounded-xl bg-secondary/30 border-transparent focus:border-primary/20 focus:bg-background transition-all"
                        />
                      </Field>
                    </div>
                  </div>
                </div>

                {/* Permissions Section */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold flex items-center gap-2 text-foreground/80">
                    <Shield className="w-4 h-4 text-primary" /> Role & Permissions
                  </h4>
                  
                  <div className="grid gap-5 md:grid-cols-2">
                    <Field label="Role" icon={Shield} required>
                      <Select value={selectedRole} onValueChange={setSelectedRole}>
                        <SelectTrigger className="h-11 rounded-xl bg-secondary/30 border-transparent focus:border-primary/20 focus:bg-background transition-all">
                          <SelectValue placeholder="Select Role" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableRoles.map((role) => (
                            <SelectItem key={role.value} value={role.value}>
                              <div className="flex flex-col items-start">
                                <span className="font-medium">{role.label}</span>
                                <span className="text-xs text-muted-foreground">{role.description}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>

                    <div className="flex items-end">
                      <div className="p-3 rounded-xl bg-muted/30 border border-border/50 w-full">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground uppercase tracking-wider">Current Role</span>
                          <Badge variant="outline" className="bg-indigo-500/10 text-indigo-500 border-indigo-500/30">
                            {moderator.role}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Assigned Countries - Dynamic Input */}
                  <div className="space-y-3">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                      <Globe className="w-3 h-3" />
                      Assigned Countries
                    </Label>
                    <p className="text-xs text-muted-foreground -mt-1">
                      Countries this moderator can manage
                    </p>
                    
                    {/* Add new country input */}
                    <div className="flex gap-2">
                      <Input 
                        value={newCountry}
                        onChange={(e) => setNewCountry(e.target.value)}
                        onKeyDown={handleCountryKeyDown}
                        placeholder="Type country name and press Enter"
                        className="h-10 rounded-xl bg-secondary/30 border-transparent focus:border-primary/20 focus:bg-background transition-all flex-1"
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="icon"
                        onClick={addCountry}
                        className="h-10 w-10 rounded-xl"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Display assigned countries */}
                    {assignedCountries.length > 0 && (
                      <div className="flex flex-wrap gap-2 p-4 rounded-xl border border-border/50 bg-secondary/20">
                        {assignedCountries.map((ctry) => (
                          <Badge
                            key={ctry}
                            className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-0 text-sm py-1.5 px-3 cursor-pointer hover:from-indigo-600 hover:to-purple-600"
                            onClick={() => removeCountry(ctry)}
                          >
                            {ctry}
                            <X className="ml-1.5 h-3 w-3" />
                          </Badge>
                        ))}
                      </div>
                    )}
                    {assignedCountries.length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">{assignedCountries.length}</span> countries assigned
                      </p>
                    )}
                  </div>
                </div>

              </form>
            </div>

            {/* Footer with Blur Effect */}
            <div className="p-6 border-t border-border/40 bg-background/50 backdrop-blur-md">
              <SheetFooter className="flex-col sm:flex-row gap-3">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => onOpenChange(false)}
                  className="h-12 px-6 rounded-xl hover:bg-secondary/80"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  form="edit-moderator-form"
                  disabled={isLoading} 
                  className={cn(
                    "h-12 px-8 rounded-xl text-base font-medium transition-all shadow-lg hover:shadow-xl",
                    "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-indigo-500/25",
                    isLoading && "opacity-80 cursor-not-allowed"
                  )}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" /> 
                      Saving Changes...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </SheetFooter>
            </div>
          </>
        )}

      </SheetContent>
    </Sheet>
  );
}
