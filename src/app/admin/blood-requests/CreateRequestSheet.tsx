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
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { Loader2, User, Droplet, Building2, MapPin, Phone, FileText, Zap } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { PlacesAutocompleteWrapper } from "@/components/ui/places-autocomplete";

// Field container with improved styling - Moved outside to prevent re-render focus loss
const Field = ({ label, icon: Icon, required, children }: any) => (
  <div className="space-y-2 group">
    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2 group-focus-within:text-primary transition-colors">
      {Icon && <Icon className="w-3 h-3" />}
      {label} {required && <span className="text-rose-500">*</span>}
    </Label>
    {children}
  </div>
);

interface CreateRequestSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (data: any) => Promise<void>;
}

export default function CreateRequestSheet({
  isOpen,
  onOpenChange,
  onCreate,
}: CreateRequestSheetProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    patient_name: "",
    blood_group: "",
    units: 1,
    hospital: "",
    city: "",
    contact_number: "",
    urgency: "urgent",
    notes: "",
  });

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.patient_name || !formData.blood_group || !formData.hospital || !formData.contact_number) {
        toast.error("Please fill in all required fields.");
        return;
    }

    setIsLoading(true);
    try {
      await onCreate(formData);
      onOpenChange(false);
      setFormData({
        patient_name: "",
        blood_group: "",
        units: 1,
        hospital: "",
        city: "",
        contact_number: "",
        urgency: "urgent",
        notes: "",
      });
    } catch (error) {
       console.error(error);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      {/* Increased max-width and improved layout structure to prevent cropping */}
      <SheetContent className="sm:max-w-2xl p-0 flex flex-col bg-background/95 backdrop-blur-xl border-l border-border/40">
        
        {/* Header with Gradient Background */}
        <div className="relative overflow-hidden p-6 pb-8 border-b border-border/40">
            <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-rose-500/20 to-orange-500/0 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none`} />
            <SheetHeader className="relative z-10">
                <SheetTitle className="text-3xl font-display font-bold bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                    New Blood Request
                </SheetTitle>
                <SheetDescription className="text-base">
                    Create a new request to notify available donors immediately.
                </SheetDescription>
            </SheetHeader>
        </div>

        {/* Scrollable Form Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
            <form id="create-request-form" onSubmit={handleSubmit} className="p-6 space-y-8">
                
                {/* Patient Section */}
                <div className="space-y-4">
                    <h4 className="text-sm font-semibold flex items-center gap-2 text-foreground/80">
                        <User className="w-4 h-4 text-primary" /> Patient Details
                    </h4>
                    <div className="grid gap-5 md:grid-cols-2">
                        <Field label="Patient Name" icon={User} required>
                            <Input 
                                value={formData.patient_name} 
                                onChange={(e) => handleChange('patient_name', e.target.value)} 
                                placeholder="Full Name"
                                className="h-11 rounded-xl bg-secondary/30 border-transparent focus:border-primary/20 focus:bg-background transition-all"
                            />
                        </Field>

                        <Field label="Blood Group" icon={Droplet} required>
                            <Select value={formData.blood_group} onValueChange={(v) => handleChange('blood_group', v)}>
                                <SelectTrigger className="h-11 rounded-xl bg-secondary/30 border-transparent focus:border-primary/20 focus:bg-background transition-all">
                                    <SelectValue placeholder="Select Group" />
                                </SelectTrigger>
                                <SelectContent>
                                    <div className="grid grid-cols-4 gap-1 p-1">
                                        {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
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

                        <Field label="Units Required" icon={Droplet} required>
                            <div className="relative">
                                <Input 
                                    type="number"
                                    min={1}
                                    max={20}
                                    value={formData.units} 
                                    onChange={(e) => handleChange('units', parseInt(e.target.value))} 
                                    className="h-11 rounded-xl bg-secondary/30 border-transparent focus:border-primary/20 focus:bg-background transition-all pl-4"
                                />
                                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-muted-foreground text-sm">
                                    Units
                                </div>
                            </div>
                        </Field>

                        <Field label="Urgency Level" icon={Zap}>
                            <Select value={formData.urgency} onValueChange={(v) => handleChange('urgency', v)}>
                                <SelectTrigger className="h-11 rounded-xl bg-secondary/30 border-transparent focus:border-primary/20 focus:bg-background transition-all">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="planned" className="text-emerald-500 font-medium">Planned (Standard)</SelectItem>
                                    <SelectItem value="urgent" className="text-amber-500 font-medium">Urgent</SelectItem>
                                    <SelectItem value="critical" className="text-rose-600 font-bold">Critical</SelectItem>
                                </SelectContent>
                            </Select>
                        </Field>
                    </div>
                </div>

                {/* Location Section */}
                <div className="space-y-4">
                    <h4 className="text-sm font-semibold flex items-center gap-2 text-foreground/80">
                        <Building2 className="w-4 h-4 text-primary" /> Location & Contact
                    </h4>
                    <div className="grid gap-5 md:grid-cols-2">
                        <div className="md:col-span-2">
                            <Field label="Hospital / Location" icon={Building2} required>
                                <PlacesAutocompleteWrapper 
                                    value={formData.hospital} 
                                    onChange={(val) => handleChange('hospital', val)}
                                    placeholder="Search hospital or clinic..."
                                    searchTypes={['hospital', 'doctor', 'health']}
                                    onSelect={(data) => {
                                        setFormData(prev => ({
                                            ...prev,
                                            hospital: data.address, // or just the name if prefer
                                            city: data.city || prev.city, 
                                            // coordinates could be stored if we added fields for them
                                        }));
                                    }}
                                />
                            </Field>
                        </div>

                        <Field label="City" icon={MapPin}>
                            <Input 
                                value={formData.city} 
                                onChange={(e) => handleChange('city', e.target.value)} 
                                placeholder="e.g. Dhaka"
                                className="h-11 rounded-xl bg-secondary/30 border-transparent focus:border-primary/20 focus:bg-background transition-all"
                            />
                        </Field>

                        <Field label="Contact Number" icon={Phone} required>
                            <Input 
                                value={formData.contact_number} 
                                onChange={(e) => handleChange('contact_number', e.target.value)} 
                                placeholder="+880..."
                                className="h-11 rounded-xl bg-secondary/30 border-transparent focus:border-primary/20 focus:bg-background transition-all font-mono text-sm"
                            />
                        </Field>
                    </div>
                </div>

                {/* Notes Section */}
                <div>
                     <Field label="Additional Notes" icon={FileText}>
                        <Textarea 
                             value={formData.notes}
                             onChange={(e) => handleChange('notes', e.target.value)}
                             placeholder="Any specific medical requirements or instructions for donors..."
                             rows={4}
                             className="resize-none rounded-xl bg-secondary/30 border-transparent focus:border-primary/20 focus:bg-background transition-all"
                        />
                     </Field>
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
                    form="create-request-form"
                    disabled={isLoading} 
                    className={cn(
                        "h-12 px-8 rounded-xl text-base font-medium transition-all shadow-lg hover:shadow-xl",
                        "bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-rose-500/25",
                        isLoading && "opacity-80 cursor-not-allowed"
                    )}
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" /> 
                            Creating Request...
                        </>
                    ) : (
                        "Publish Request"
                    )}
                </Button>
            </SheetFooter>
        </div>

      </SheetContent>
    </Sheet>
  );
}
