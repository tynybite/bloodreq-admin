"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/lib/auth/firebase-client";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Facebook, 
  Chrome, 
  ArrowRight,
  ShieldCheck
} from "lucide-react";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const router = useRouter();

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Get values from form
    const email = (document.getElementById('email') as HTMLInputElement)?.value;
    const password = (document.getElementById('password') as HTMLInputElement)?.value;

    if (!email || !password) {
        toast.error("Please enter email and password");
        setIsLoading(false);
        return;
    }

    try {
      // 1. Sign in with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const idToken = await user.getIdToken();

      // 2. Create Session on Server
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken, rememberMe }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to create session');
      }

      // 3. Check admin privileges
      if (!result.data.is_admin) {
         await auth.signOut();
         await fetch('/api/auth/signout', { method: 'POST' });
         throw new Error("Access denied. Admin privileges required.");
      }

      toast.success("Logged in successfully");
      router.push("/admin/dashboard");
      router.refresh();

    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.message || "An error occurred during login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;
      const idToken = await user.getIdToken();

      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken, rememberMe }),
      });
      
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to create session');
      }

      if (!result.data.is_admin) {
         await auth.signOut();
         await fetch('/api/auth/signout', { method: 'POST' });
         throw new Error("Access denied. Admin privileges required.");
      }

      toast.success("Logged in successfully");
      router.push("/admin/dashboard");
    } catch (error: any) {
        toast.error(error.message || "Google sign in failed");
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 relative"
    >
      <div className="space-y-3 text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/10 border border-red-600/20 mb-2">
          <ShieldCheck className="h-3.5 w-3.5 text-red-600" />
          <span className="mono-label text-[10px]">Secure Access</span>
        </div>
        <h1 className="text-4xl font-display italic text-white drop-shadow-sm">
          Welcome Back
        </h1>
        <p className="text-zinc-400 font-sans text-sm">
          Please sign in to access the admin panel.
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email" className="mono-label">Email Address</Label>
          <Input
            id="email"
            type="email"
            placeholder="admin@bloodreq.com"
            required
            className="bg-transparent border-white/10 focus:border-red-600 focus:ring-0 h-12 text-white font-sans transition-all placeholder:text-zinc-700"
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="mono-label">Password</Label>
            <Link
              href="/forgot-password"
              className="mono-label text-[10px] text-zinc-500 hover:text-red-500 transition-colors"
            >
              Forgot Password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            required
            className="bg-transparent border-white/10 focus:border-red-600 focus:ring-0 h-12 text-white font-sans transition-all placeholder:text-zinc-700"
          />
        </div>

        <div className="flex items-center space-x-3 pt-1">
          <Checkbox 
            id="remember" 
            checked={rememberMe}
            onCheckedChange={(checked) => setRememberMe(checked as boolean)}
            className="border-white/20 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600 rounded-sm" 
          />
          <Label htmlFor="remember" className="text-[11px] font-normal text-zinc-500 uppercase tracking-widest leading-none cursor-pointer">
            Remember me
          </Label>
        </div>

        <Button
          type="submit"
          className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-bold tracking-tight shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:shadow-[0_0_30px_rgba(220,38,38,0.5)] transition-all rounded-none border border-red-500/50 uppercase text-xs"
          disabled={isLoading}
        >
          {isLoading ? "Signing in..." : "Sign In"}
          {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-white/5" />
        </div>
        <div className="relative flex justify-center text-[10px] uppercase tracking-[0.3em]">
          <span className="bg-[#020205] px-4 text-zinc-600 font-medium">
            Or sign in with
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Button onClick={handleGoogleLogin} variant="outline" className="h-12 bg-transparent border-white/10 hover:bg-white/5 hover:border-red-600/50 text-zinc-300 rounded-none transition-all font-sans text-xs uppercase tracking-wider">
          <Chrome className="mr-2 h-4 w-4 text-red-500" />
          Google
        </Button>
        <Button variant="outline" className="h-12 bg-transparent border-white/10 hover:bg-white/5 hover:border-blue-600/50 text-zinc-300 rounded-none transition-all font-sans text-xs uppercase tracking-wider">
          <Facebook className="mr-2 h-4 w-4 text-blue-500" />
          Facebook
        </Button>
      </div>

      <p className="text-center text-[11px] text-zinc-500 uppercase tracking-widest">
        New here?{" "}
        <Link href="/register" className="font-bold text-red-500 hover:text-red-400 underline decoration-red-500/30 underline-offset-4">
          Create an account
        </Link>
      </p>
    </motion.div>
  );
}
