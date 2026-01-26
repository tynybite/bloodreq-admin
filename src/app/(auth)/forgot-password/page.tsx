"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mail, ArrowRight, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
    setIsSent(true);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="space-y-3 text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/10 border border-red-600/20 mb-2">
          <ShieldAlert className="h-3.5 w-3.5 text-red-600" />
          <span className="mono-label text-[10px]">Account Recovery</span>
        </div>
        <h1 className="text-4xl font-display italic text-white">
          Forgot Password?
        </h1>
        <p className="text-zinc-400 font-sans text-sm">
          Enter your email address to receive reset instructions.
        </p>
      </div>

      {!isSent ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="mono-label">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@bloodreq.com"
              required
              className="bg-transparent border-white/10 focus:border-red-600 focus:ring-0 h-12 text-white font-sans transition-all placeholder:text-zinc-700 rounded-none"
            />
          </div>

          <Button
            type="submit"
            className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-bold tracking-tight shadow-[0_0_20px_rgba(220,38,38,0.3)] transition-all rounded-none border border-red-500/50 uppercase text-xs"
            disabled={isLoading}
          >
            {isLoading ? "Sending..." : "Reset Password"}
            {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
        </form>
      ) : (
        <div className="space-y-6 text-center animate-fade-in py-8 glass-hybrid p-8 rounded-2xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-none bg-red-600/10 text-red-600 border border-red-600/20 shadow-[0_0_20px_rgba(220,38,38,0.2)]">
            <Mail className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h3 className="mono-label text-white">Instructions Sent</h3>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest">
              Please check your inbox for the reset link.
            </p>
          </div>
          <Button
            variant="outline"
            className="w-full border-white/10 text-zinc-400 hover:text-white hover:bg-white/5 h-12 rounded-none uppercase text-[10px] tracking-widest"
            onClick={() => setIsSent(false)}
          >
            Resend Email
          </Button>
        </div>
      )}

      <div className="text-center pt-4">
        <Link
          href="/login"
          className="inline-flex items-center justify-center text-[10px] text-zinc-500 hover:text-red-500 transition-colors font-bold uppercase tracking-[0.2em]"
        >
          <ArrowLeft className="mr-2 h-3 w-3" />
          Back to Login
        </Link>
      </div>
    </motion.div>
  );
}
