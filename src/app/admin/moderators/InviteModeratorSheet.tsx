'use client';

import { useState } from 'react';
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
import { Loader2, Mail, Shield, Globe, Send } from "lucide-react";
import { Separator } from "@/components/ui/separator";

// Simplified country list for now
const countries = ["Bangladesh", "India", "Pakistan"];

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  role: z.enum(['super_admin', 'admin', 'manager', 'moderator', 'finance', 'analyst']),
  country: z.string().min(1, "Please select an assigned country."), 
});

interface InviteModeratorSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InviteModeratorSheet({ open, onOpenChange }: InviteModeratorSheetProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      role: "moderator",
      country: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const result = await inviteModerator(values.email, values.role, [values.country]);
      if (result.success) {
        toast.success("Invitation sent successfully");
        onOpenChange(false);
        form.reset();
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

                    {/* Region Section */}
                    <div className="space-y-4">
                         <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                             <Globe className="w-4 h-4" /> Assignment
                         </h3>
                        <FormField
                          control={form.control}
                          name="country"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Assigned Country</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="h-11">
                                    <SelectValue placeholder="Select country" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {countries.map(c => (
                                    <SelectItem key={c} value={c}>{c}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                  Limit the user's scope to a specific region.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
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
