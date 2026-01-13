'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export default function AuthErrorPage() {
  const router = useRouter();
  const [isRecovering, setIsRecovering] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const handleRecovery = async () => {
      // Check for hash fragment with access_token
      // The browser might have preserved the hash during the 302 redirect
      if (typeof window !== 'undefined' && window.location.hash) {
        const hash = window.location.hash.substring(1); // remove #
        const params = new URLSearchParams(hash);
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');

        if (accessToken && refreshToken) {
          try {
            const { error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (!error) {
              toast.success("Session recovered! Redirecting...");
              
              // Check if it's an invite flow
              const type = params.get('type') || new URLSearchParams(window.location.search).get('type');
              
              if (type === 'invite' || window.location.href.includes('type=invite')) {
                 router.replace('/update-password');
              } else {
                 router.replace('/admin/dashboard');
              }
              return;
            }
          } catch (e) {
            console.error("Recovery failed", e);
          }
        }
      }
      
      // If no hash or recovery failed
      setIsRecovering(false);
    };

    handleRecovery();
  }, [router, supabase.auth]);

  if (isRecovering) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4">
            <Loader2 className="w-10 h-10 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen items-center justify-center bg-background p-4">
      <div className="max-w-md w-full space-y-6 text-center border border-border/50 rounded-2xl p-8 bg-card/50 backdrop-blur-sm">
        <div className="mx-auto w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
            <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        
        <h1 className="text-2xl font-bold">Authentication Issue</h1>
        <p className="text-muted-foreground">
          We couldn't log you in automatically. This usually happens if the link has expired or was already used.
        </p>

        <div className="pt-4 flex flex-col gap-3">
            <Button onClick={() => router.push('/login')} className="w-full">
                Back to Login
            </Button>
            <Button variant="ghost" onClick={() => router.push('/')} className="w-full">
                Go Home
            </Button>
        </div>
      </div>
    </div>
  );
}
