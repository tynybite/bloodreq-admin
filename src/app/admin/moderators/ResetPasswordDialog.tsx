'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { updateModeratorPassword } from './actions';
import { Loader2, Key } from "lucide-react";

interface ResetPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userName: string;
}

export function ResetPasswordDialog({ open, onOpenChange, userId, userName }: ResetPasswordDialogProps) {
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
        toast.error("Password must be at least 6 characters");
        return;
    }

    setIsSubmitting(true);
    try {
      const result = await updateModeratorPassword(userId, password);
      if (result.success) {
        toast.success(`Password updated for ${userName}`);
        onOpenChange(false);
        setPassword("");
      } else {
        toast.error(result.message || "Failed to update password");
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="w-5 h-5 text-primary" />
            Set Password Manually
          </DialogTitle>
          <DialogDescription>
            Enter a new password for <span className="font-medium text-foreground">{userName}</span>. 
            This will immediately override their existing password.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input 
                    id="new-password"
                    type="text" 
                    placeholder="Enter explicit password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="font-mono bg-secondary/50"
                />
            </div>
            
            <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                    Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting || !password}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Set Password
                </Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
