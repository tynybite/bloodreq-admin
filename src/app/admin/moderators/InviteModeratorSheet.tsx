'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { inviteModerator } from './actions';
import { Loader2, Mail, Shield, Globe, Send, MapPin, X } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  role: z.enum(['super_admin', 'admin', 'manager', 'moderator', 'finance', 'analyst']),
  country: z.string().min(1, "Please select a country."),
  cities: z.array(z.string()).optional(),
});

interface InviteModeratorSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InviteModeratorSheet({ open, onOpenChange }: InviteModeratorSheetProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countries, setCountries] = useState<{ name: string; code: string }[]>([]);
  const [cities, setCities] = useState<{ name: string }[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      role: "moderator",
      country: "",
      cities: [],
    },
  });

  const watchedCountry = form.watch('country');

  // Fetch countries on mount
  useEffect(() => {
    if (!open) return;
    setLoadingCountries(true);
    fetch('/api/locations/countries')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data?.countries) {
          setCountries(data.data.countries);
        }
      })
      .catch(err => console.error('Failed to load countries:', err))
      .finally(() => setLoadingCountries(false));
  }, [open]);

  // Fetch cities when country changes
  useEffect(() => {
    if (!watchedCountry) {
      setCities([]);
      setSelectedCities([]);
      return;
    }
    setLoadingCities(true);
    setSelectedCities([]);
    fetch(`/api/locations/cities?country=${encodeURIComponent(watchedCountry)}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data?.cities) {
          setCities(data.data.cities);
        } else {
          setCities([]);
        }
      })
      .catch(err => {
        console.error('Failed to load cities:', err);
        setCities([]);
      })
      .finally(() => setLoadingCities(false));
  }, [watchedCountry]);

  const toggleCity = (cityName: string) => {
    setSelectedCities(prev => {
      const next = prev.includes(cityName)
        ? prev.filter(c => c !== cityName)
        : [...prev, cityName];
      form.setValue('cities', next);
      return next;
    });
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const result = await inviteModerator(
        values.email,
        values.role,
        [values.country],
        selectedCities,
      );
      if (result.success) {
        toast.success("Invitation sent successfully");
        onOpenChange(false);
        form.reset();
        setSelectedCities([]);
      } else {
        toast.error(result.message || "Failed to send invitation");
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-xl p-0 overflow-hidden bg-background">
        <div className="h-full overflow-y-auto custom-scrollbar">
            <div className="p-6 space-y-8">
                <SheetHeader className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                        <SheetTitle className="text-2xl font-display font-bold leading-tight flex items-center gap-2">
                             <Send className="w-6 h-6 text-primary" />
                             Invite Moderator
                        </SheetTitle>
                        <SheetDescription className="text-base text-muted-foreground mt-2">
                            Add a new team member to the admin panel. They will receive an email to set up their account.
                        </SheetDescription>
                    </div>
                  </div>
                </SheetHeader>

                <Separator />

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    
                    {/* Email Section */}
                    <div className="space-y-4">
                         <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                             <Mail className="w-4 h-4" /> User Details
                         </h3>
                         <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email Address</FormLabel>
                              <FormControl>
                                <Input placeholder="colleague@example.com" {...field} className="h-11" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                    </div>

                    <Separator />

                    {/* Role Section */}
                     <div className="space-y-4">
                         <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                             <Shield className="w-4 h-4" /> Permissions
                         </h3>
                        <FormField
                          control={form.control}
                          name="role"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Select Role</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="h-11">
                                    <SelectValue placeholder="Select a role" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="super_admin">
                                      <span className="font-medium">Super Admin</span>
                                      <p className="text-xs text-muted-foreground">Full access + system config</p>
                                  </SelectItem>
                                  <SelectItem value="admin">
                                      <span className="font-medium">Admin</span>
                                      <p className="text-xs text-muted-foreground">Full access to all resources</p>
                                  </SelectItem>
                                  <SelectItem value="manager">
                                      <span className="font-medium">Manager</span>
                                      <p className="text-xs text-muted-foreground">Manage users and content</p>
                                  </SelectItem>
                                  <SelectItem value="moderator">
                                      <span className="font-medium">Moderator</span>
                                      <p className="text-xs text-muted-foreground">Review donations and requests</p>
                                  </SelectItem>
                                  <SelectItem value="finance">
                                      <span className="font-medium">Finance</span>
                                      <p className="text-xs text-muted-foreground">Manage payments and fundraisers</p>
                                  </SelectItem>
                                  <SelectItem value="analyst">
                                      <span className="font-medium">Analyst</span>
                                      <p className="text-xs text-muted-foreground">View reports and analytics</p>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                This controls what the user can see and do in the admin panel.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                    </div>

                    <Separator />

                    {/* Country & City Section */}
                    <div className="space-y-4">
                         <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                             <Globe className="w-4 h-4" /> Assignment
                         </h3>

                        {/* Country */}
                        <FormField
                          control={form.control}
                          name="country"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Assigned Country</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger className="h-11">
                                    <SelectValue placeholder={loadingCountries ? "Loading..." : "Select country"} />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {countries.map(c => (
                                    <SelectItem key={c.code || c.name} value={c.name}>{c.name}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                  The moderator will see requests from this country.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Cities (optional) */}
                        {watchedCountry && (
                          <div className="space-y-3">
                            <FormLabel className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" /> Assigned Cities
                              <span className="text-xs text-muted-foreground font-normal">(optional)</span>
                            </FormLabel>

                            {loadingCities ? (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                                <Loader2 className="w-4 h-4 animate-spin" /> Loading cities...
                              </div>
                            ) : cities.length === 0 ? (
                              <p className="text-sm text-muted-foreground">No cities found for this country.</p>
                            ) : (
                              <>
                                {/* Selected cities pills */}
                                {selectedCities.length > 0 && (
                                  <div className="flex flex-wrap gap-2">
                                    {selectedCities.map(city => (
                                      <Badge key={city} variant="secondary" className="pl-2 pr-1 py-1 gap-1">
                                        {city}
                                        <button
                                          type="button"
                                          onClick={() => toggleCity(city)}
                                          className="hover:bg-destructive/20 rounded-full p-0.5"
                                        >
                                          <X className="w-3 h-3" />
                                        </button>
                                      </Badge>
                                    ))}
                                  </div>
                                )}

                                {/* City grid */}
                                <div className="max-h-40 overflow-y-auto rounded-lg border border-border/50 p-2 space-y-0.5">
                                  {cities.map(city => {
                                    const isSelected = selectedCities.includes(city.name);
                                    return (
                                      <button
                                        key={city.name}
                                        type="button"
                                        onClick={() => toggleCity(city.name)}
                                        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                                          isSelected
                                            ? 'bg-primary/10 text-primary font-medium'
                                            : 'hover:bg-secondary/50'
                                        }`}
                                      >
                                        {city.name}
                                      </button>
                                    );
                                  })}
                                </div>

                                <FormDescription>
                                  Leave empty to allow access to <strong>all cities</strong> in the selected country.
                                </FormDescription>
                              </>
                            )}
                          </div>
                        )}
                    </div>

                    <SheetFooter className="pt-6">
                         <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
                            Cancel
                         </Button>
                        <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto bg-primary hover:bg-primary/90">
                          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Send Invitation
                        </Button>
                    </SheetFooter>

                  </form>
                </Form>
            </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
