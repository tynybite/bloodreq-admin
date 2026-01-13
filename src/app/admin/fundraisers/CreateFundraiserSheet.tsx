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
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { Loader2, User, Building2, MapPin, FileText, Calendar, DollarSign, Upload } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const Field = ({ label, icon: Icon, required, children }: any) => (
  <div className="space-y-2 group">
    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2 group-focus-within:text-primary transition-colors">
      {Icon && <Icon className="w-3 h-3" />}
      {label} {required && <span className="text-rose-500">*</span>}
    </Label>
    {children}
  </div>
);

interface CreateFundraiserSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (data: any) => Promise<void>;
}

export default function CreateFundraiserSheet({
  isOpen,
  onOpenChange,
  onCreate,
}: CreateFundraiserSheetProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    patient_name: "",
    condition: "",
    hospital: "",
    location: "",
    amount_needed: "",
    deadline: "",
    description: "",
    cover_image_url: "",
  });

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.patient_name || !formData.amount_needed) {
        toast.error("Please fill in all required fields.");
        return;
    }

    setIsLoading(true);
    try {
      await onCreate({
          ...formData,
          amount_needed: parseFloat(formData.amount_needed),
          deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null
      });
      onOpenChange(false);
      setFormData({
        title: "",
        patient_name: "",
        condition: "",
        hospital: "",
        location: "",
        amount_needed: "",
        deadline: "",
        description: "",
        cover_image_url: ""
      });
      toast.success("Fundraiser created successfully!");
    } catch (error) {
       console.error(error);
       toast.error("Failed to create fundraiser.");
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-2xl p-0 flex flex-col bg-background/95 backdrop-blur-xl border-l border-border/40">
        
        {/* Header */}
        <div className="relative overflow-hidden p-6 pb-8 border-b border-border/40">
            <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-emerald-500/20 to-teal-500/0 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none`} />
            <SheetHeader className="relative z-10">
                <SheetTitle className="text-3xl font-display font-bold bg-gradient-to-br from-emerald-500 to-teal-600 bg-clip-text text-transparent">
                    New Fundraiser
                </SheetTitle>
                <SheetDescription className="text-base">
                    Create a new fundraising campaign for a patient.
                </SheetDescription>
            </SheetHeader>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
            <form id="create-fundraiser-form" onSubmit={handleSubmit} className="p-6 space-y-8">
                
                <div className="space-y-4">
                    <h4 className="text-sm font-semibold flex items-center gap-2 text-foreground/80">
                        <User className="w-4 h-4 text-primary" /> Campaign Details
                    </h4>
                    
                    <Field label="Campaign Title" icon={FileText} required>
                        <Input 
                            value={formData.title} 
                            onChange={(e) => handleChange('title', e.target.value)} 
                            placeholder="Help [Patient Name] fight [Condition]"
                            className="h-11 rounded-xl bg-secondary/30"
                        />
                    </Field>

                    <div className="grid gap-5 md:grid-cols-2">
                        <Field label="Patient Name" icon={User} required>
                            <Input 
                                value={formData.patient_name} 
                                onChange={(e) => handleChange('patient_name', e.target.value)} 
                                placeholder="Full Name"
                                className="h-11 rounded-xl bg-secondary/30"
                            />
                        </Field>

                        <Field label="Medical Condition" icon={FileText} required>
                            <Input 
                                value={formData.condition} 
                                onChange={(e) => handleChange('condition', e.target.value)} 
                                placeholder="e.g. Kidney Failure"
                                className="h-11 rounded-xl bg-secondary/30"
                            />
                        </Field>

                        <Field label="Target Amount (BDT)" icon={DollarSign} required>
                             <Input 
                                type="number"
                                min={0}
                                value={formData.amount_needed} 
                                onChange={(e) => handleChange('amount_needed', e.target.value)} 
                                placeholder="500000"
                                className="h-11 rounded-xl bg-secondary/30"
                            />
                        </Field>

                        <Field label="Deadline" icon={Calendar}>
                             <Input 
                                type="date"
                                value={formData.deadline} 
                                onChange={(e) => handleChange('deadline', e.target.value)} 
                                className="h-11 rounded-xl bg-secondary/30"
                            />
                        </Field>
                    </div>
                </div>

                <div className="space-y-4">
                    <h4 className="text-sm font-semibold flex items-center gap-2 text-foreground/80">
                        <Building2 className="w-4 h-4 text-primary" /> Location
                    </h4>
                    <div className="grid gap-5 md:grid-cols-2">
                         <div className="md:col-span-2">
                            <Field label="Hospital" icon={Building2} required>
                                <Input 
                                    value={formData.hospital} 
                                    onChange={(e) => handleChange('hospital', e.target.value)} 
                                    placeholder="Hospital Name"
                                    className="h-11 rounded-xl bg-secondary/30"
                                />
                            </Field>
                        </div>
                        <Field label="City / Location" icon={MapPin}>
                            <Input 
                                value={formData.location} 
                                onChange={(e) => handleChange('location', e.target.value)} 
                                placeholder="e.g. Dhaka"
                                className="h-11 rounded-xl bg-secondary/30"
                            />
                        </Field>
                         <Field label="Cover Image URL" icon={Upload}>
                            <Input 
                                value={formData.cover_image_url} 
                                onChange={(e) => handleChange('cover_image_url', e.target.value)} 
                                placeholder="https://..."
                                className="h-11 rounded-xl bg-secondary/30"
                            />
                        </Field>
                    </div>
                </div>

                <Field label="Description / Story" icon={FileText}>
                    <Textarea 
                            value={formData.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                            placeholder="Tell the patient's story..."
                            rows={6}
                            className="resize-none rounded-xl bg-secondary/30 p-4"
                    />
                </Field>

            </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border/40 bg-background/50 backdrop-blur-md">
            <SheetFooter className="flex-col sm:flex-row gap-3">
                <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={() => onOpenChange(false)}
                    className="h-12 px-6 rounded-xl"
                >
                    Cancel
                </Button>
                <Button 
                    type="submit" 
                    form="create-fundraiser-form"
                    disabled={isLoading} 
                    className={cn(
                        "h-12 px-8 rounded-xl text-base font-medium transition-all shadow-lg hover:shadow-xl",
                        "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-emerald-500/25",
                        isLoading && "opacity-80 cursor-not-allowed"
                    )}
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" /> 
                            Creating...
                        </>
                    ) : (
                        "Create Campaign"
                    )}
                </Button>
            </SheetFooter>
        </div>

      </SheetContent>
    </Sheet>
  );
}
