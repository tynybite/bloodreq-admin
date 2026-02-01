'use client';

import { useState, useRef } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from 'sonner';
import { cn } from "@/lib/utils";
import {
  Loader2,
  Image as ImageIcon,
  Plus,
  Trash2,
  Calendar,
  MapPin,
  DollarSign,
  Link as LinkIcon,
  Phone,
  Mail,
  Smartphone,
  FileText,
  Building2,
  Megaphone,
} from 'lucide-react';
import { createCampaign, updateCampaign, addCampaignType } from './campaign-actions';
import CountryList from 'country-list-with-dial-code-and-flag';

const Field = ({ label, icon: Icon, required, children }: any) => (
  <div className="space-y-2 group">
    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2 group-focus-within:text-primary transition-colors">
      {Icon && <Icon className="w-3 h-3" />}
      {label} {required && <span className="text-rose-500">*</span>}
    </Label>
    {children}
  </div>
);

interface CampaignSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  campaign?: any;
  campaignTypes: string[];
  onSuccess: () => void;
}

const actionTypes = [
  { value: 'link', label: 'Open Link' },
  { value: 'phone', label: 'Call Phone' },
  { value: 'email', label: 'Send Email' },
  { value: 'in_app', label: 'In-App Screen' },
];

const paymentStatuses = [
  { value: 'pending', label: 'Pending' },
  { value: 'paid', label: 'Paid' },
  { value: 'overdue', label: 'Overdue' },
];

// All countries with dial codes from package (254 countries)
const countryCodes = (CountryList.getAll() as any[]).map((c) => ({
  code: c.dialCode as string,
  name: c.name as string,
  flag: c.flag as string,
}));

export default function CampaignSheet({
  isOpen,
  onOpenChange,
  campaign,
  campaignTypes,
  onSuccess,
}: CampaignSheetProps) {
  const isEditing = !!campaign;
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [newTypeInput, setNewTypeInput] = useState('');
  const [showNewType, setShowNewType] = useState(false);
  
  // Form state
  const [form, setForm] = useState({
    title: campaign?.title || '',
    description: campaign?.description || '',
    type: campaign?.type || 'partner_promo',
    banners: campaign?.banners || [],
    sponsor: campaign?.sponsor || { name: '', logo_url: '', contact_email: '', country_code: '+91', contact_phone: '' },
    billing: campaign?.billing || { amount_paid: 0, payment_status: 'pending', invoice_id: '' },
    target_cities: campaign?.target_cities || [],
    start_date: campaign?.start_date ? new Date(campaign.start_date).toISOString().split('T')[0] : '',
    end_date: campaign?.end_date ? new Date(campaign.end_date).toISOString().split('T')[0] : '',
    priority: campaign?.priority || 50,
    is_active: campaign?.is_active || false,
    status: campaign?.status || 'draft',
    action: campaign?.action || { type: 'link', value: '', button_text: 'Learn More' },
  });

  const handleChange = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    
    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'campaigns');
      
      try {
        const res = await fetch('/api/upload/image', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        
        if (data.success && data.data?.url) {
          setForm(prev => ({
            ...prev,
            banners: [...prev.banners, { url: data.data.url, alt_text: '', order: prev.banners.length }]
          }));
        }
      } catch (err) {
        toast.error('Failed to upload image');
      }
    }
  };

  const removeBanner = (index: number) => {
    setForm(prev => ({
      ...prev,
      banners: prev.banners.filter((_: any, i: number) => i !== index)
    }));
  };

  const handleAddType = async () => {
    if (!newTypeInput.trim()) return;
    const slug = newTypeInput.toLowerCase().replace(/\s+/g, '_');
    await addCampaignType(slug);
    setForm(prev => ({ ...prev, type: slug }));
    setNewTypeInput('');
    setShowNewType(false);
    toast.success(`Added type: ${slug}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.title || !form.sponsor.name) {
      toast.error('Title and sponsor name are required');
      return;
    }
    
    // Convert string dates to Date objects for the server
    const payload = {
      ...form,
      start_date: form.start_date ? new Date(form.start_date) : undefined,
      end_date: form.end_date ? new Date(form.end_date) : undefined,
    };
    
    setIsLoading(true);
    try {
      if (isEditing) {
        await updateCampaign(campaign._id, payload);
        toast.success('Campaign updated');
      } else {
        await createCampaign(payload);
        toast.success('Campaign created');
      }
      onSuccess();
      onOpenChange(false);
    } catch (err) {
      toast.error('Failed to save campaign');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-2xl p-0 flex flex-col bg-background/95 backdrop-blur-xl border-l border-border/40">
        
        {/* Header */}
        <div className="relative overflow-hidden p-6 pb-8 border-b border-border/40">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-pink-500/20 to-rose-500/0 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <SheetHeader className="relative z-10">
            <SheetTitle className="text-3xl font-display font-bold bg-gradient-to-br from-pink-500 to-rose-600 bg-clip-text text-transparent">
              {isEditing ? 'Edit Campaign' : 'New Campaign'}
            </SheetTitle>
            <SheetDescription className="text-base">
              {isEditing ? 'Update this sponsored campaign.' : 'Create a new sponsored promotion for users.'}
            </SheetDescription>
          </SheetHeader>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <form id="campaign-form" onSubmit={handleSubmit} className="p-6 space-y-8">
            
            {/* Campaign Details */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold flex items-center gap-2 text-foreground/80">
                <Megaphone className="w-4 h-4 text-primary" /> Campaign Details
              </h4>
              
              <Field label="Campaign Title" icon={FileText} required>
                <Input 
                  value={form.title} 
                  onChange={(e) => handleChange('title', e.target.value)} 
                  placeholder="e.g., Apollo Labs - 50% off Health Packages"
                  className="h-11 rounded-xl bg-secondary/30"
                />
              </Field>

              <Field label="Description">
                <Textarea
                  value={form.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Campaign details..."
                  rows={3}
                  className="resize-none rounded-xl bg-secondary/30 p-4"
                />
              </Field>

              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Campaign Type">
                  <div className="flex gap-2">
                    <Select value={form.type} onValueChange={(v) => handleChange('type', v)}>
                      <SelectTrigger className="h-11 rounded-xl bg-secondary/30 flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {campaignTypes.map(t => (
                          <SelectItem key={t} value={t}>{t.replace(/_/g, ' ')}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button type="button" variant="outline" size="icon" className="h-11 w-11 rounded-xl" onClick={() => setShowNewType(!showNewType)}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  {showNewType && (
                    <div className="flex gap-2 mt-2">
                      <Input
                        value={newTypeInput}
                        onChange={(e) => setNewTypeInput(e.target.value)}
                        placeholder="New type name..."
                        className="h-10 rounded-xl bg-secondary/30"
                      />
                      <Button type="button" onClick={handleAddType} size="sm" className="h-10 rounded-xl">Add</Button>
                    </div>
                  )}
                </Field>

                <Field label="Priority (1-100)">
                  <Input
                    type="number"
                    min={1}
                    max={100}
                    value={form.priority}
                    onChange={(e) => handleChange('priority', parseInt(e.target.value) || 50)}
                    className="h-11 rounded-xl bg-secondary/30"
                  />
                </Field>
              </div>
            </div>

            {/* Banners */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold flex items-center gap-2 text-foreground/80">
                <ImageIcon className="w-4 h-4 text-primary" /> Banners (Carousel)
              </h4>
              <div className="flex flex-wrap gap-3">
                {form.banners.map((banner: any, i: number) => (
                  <div key={i} className="relative group">
                    <img
                      src={banner.url}
                      alt={banner.alt_text || 'Banner'}
                      className="w-28 h-18 object-cover rounded-lg border border-border"
                    />
                    <button
                      type="button"
                      onClick={() => removeBanner(i)}
                      className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-28 h-18 border-2 border-dashed border-border rounded-lg flex items-center justify-center hover:bg-secondary/50 transition-colors"
                >
                  <Plus className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImageUpload}
              />
            </div>

            {/* Sponsor Info */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold flex items-center gap-2 text-foreground/80">
                <Building2 className="w-4 h-4 text-primary" /> Sponsor Information
              </h4>
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Sponsor Name" required>
                  <Input
                    value={form.sponsor.name}
                    onChange={(e) => setForm({ ...form, sponsor: { ...form.sponsor, name: e.target.value } })}
                    placeholder="Company Name"
                    className="h-11 rounded-xl bg-secondary/30"
                  />
                </Field>
                <Field label="Logo URL">
                  <Input
                    value={form.sponsor.logo_url}
                    onChange={(e) => setForm({ ...form, sponsor: { ...form.sponsor, logo_url: e.target.value } })}
                    placeholder="https://..."
                    className="h-11 rounded-xl bg-secondary/30"
                  />
                </Field>
                <Field label="Contact Email">
                  <Input
                    value={form.sponsor.contact_email}
                    onChange={(e) => setForm({ ...form, sponsor: { ...form.sponsor, contact_email: e.target.value } })}
                    placeholder="sponsor@company.com"
                    className="h-11 rounded-xl bg-secondary/30"
                  />
                </Field>
                <Field label="Contact Phone">
                  <div className="flex gap-2">
                    <Select
                      value={form.sponsor.country_code || '+91'}
                      onValueChange={(v) => setForm({ ...form, sponsor: { ...form.sponsor, country_code: v } })}
                    >
                      <SelectTrigger className="h-11 w-28 rounded-xl bg-secondary/30">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {countryCodes.map(c => (
                          <SelectItem key={c.code} value={c.code}>
                            {c.flag} {c.code}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      value={form.sponsor.contact_phone}
                      onChange={(e) => setForm({ ...form, sponsor: { ...form.sponsor, contact_phone: e.target.value } })}
                      placeholder="9876543210"
                      className="h-11 rounded-xl bg-secondary/30 flex-1"
                    />
                  </div>
                </Field>
              </div>
            </div>

            {/* Billing */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold flex items-center gap-2 text-foreground/80">
                <DollarSign className="w-4 h-4 text-primary" /> Billing
              </h4>
              <div className="grid gap-5 md:grid-cols-3">
                <Field label="Amount Paid">
                  <Input
                    type="number"
                    value={form.billing.amount_paid}
                    onChange={(e) => setForm({ ...form, billing: { ...form.billing, amount_paid: parseFloat(e.target.value) || 0 } })}
                    placeholder="0"
                    className="h-11 rounded-xl bg-secondary/30"
                  />
                </Field>
                <Field label="Payment Status">
                  <Select
                    value={form.billing.payment_status}
                    onValueChange={(v) => setForm({ ...form, billing: { ...form.billing, payment_status: v } })}
                  >
                    <SelectTrigger className="h-11 rounded-xl bg-secondary/30">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentStatuses.map(s => (
                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Invoice ID">
                  <Input
                    value={form.billing.invoice_id}
                    onChange={(e) => setForm({ ...form, billing: { ...form.billing, invoice_id: e.target.value } })}
                    placeholder="INV-001"
                    className="h-11 rounded-xl bg-secondary/30"
                  />
                </Field>
              </div>
            </div>

            {/* Targeting & Schedule */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold flex items-center gap-2 text-foreground/80">
                <Calendar className="w-4 h-4 text-primary" /> Schedule & Targeting
              </h4>
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Target Cities" icon={MapPin}>
                  <Input
                    value={form.target_cities.join(', ')}
                    onChange={(e) => handleChange('target_cities', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                    placeholder="Kolkata, Mumbai, Delhi"
                    className="h-11 rounded-xl bg-secondary/30"
                  />
                </Field>
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Schedule</Label>
                  <div className="flex gap-2 items-center">
                    <Input
                      type="date"
                      value={form.start_date}
                      onChange={(e) => handleChange('start_date', e.target.value)}
                      className="h-11 rounded-xl bg-secondary/30"
                    />
                    <span className="text-muted-foreground">to</span>
                    <Input
                      type="date"
                      value={form.end_date}
                      onChange={(e) => handleChange('end_date', e.target.value)}
                      className="h-11 rounded-xl bg-secondary/30"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Action */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold flex items-center gap-2 text-foreground/80">
                <LinkIcon className="w-4 h-4 text-primary" /> Call-to-Action
              </h4>
              <div className="grid gap-5 md:grid-cols-3">
                <Field label="Action Type">
                  <Select
                    value={form.action.type}
                    onValueChange={(v) => setForm({ ...form, action: { ...form.action, type: v } })}
                  >
                    <SelectTrigger className="h-11 rounded-xl bg-secondary/30">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {actionTypes.map(a => (
                        <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Action Value">
                  <Input
                    value={form.action.value}
                    onChange={(e) => setForm({ ...form, action: { ...form.action, value: e.target.value } })}
                    placeholder={form.action.type === 'link' ? 'https://...' : form.action.type === 'phone' ? '+91...' : 'value'}
                    className="h-11 rounded-xl bg-secondary/30"
                  />
                </Field>
                <Field label="Button Text">
                  <Input
                    value={form.action.button_text}
                    onChange={(e) => setForm({ ...form, action: { ...form.action, button_text: e.target.value } })}
                    placeholder="Learn More"
                    className="h-11 rounded-xl bg-secondary/30"
                  />
                </Field>
              </div>
            </div>

            {/* Active Toggle */}
            <div className="flex items-center justify-between p-4 bg-secondary/20 rounded-xl border border-border/40">
              <div>
                <p className="font-medium">Activate Campaign</p>
                <p className="text-sm text-muted-foreground">Make this campaign visible to users</p>
              </div>
              <Switch
                checked={form.is_active}
                onCheckedChange={(checked) => setForm({ ...form, is_active: checked, status: checked ? 'active' : 'draft' })}
              />
            </div>

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
              form="campaign-form"
              disabled={isLoading} 
              className={cn(
                "h-12 px-8 rounded-xl text-base font-medium transition-all shadow-lg hover:shadow-xl",
                "bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-pink-500/25",
                isLoading && "opacity-80 cursor-not-allowed"
              )}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" /> 
                  Saving...
                </>
              ) : (
                isEditing ? "Update Campaign" : "Create Campaign"
              )}
            </Button>
          </SheetFooter>
        </div>

      </SheetContent>
    </Sheet>
  );
}
