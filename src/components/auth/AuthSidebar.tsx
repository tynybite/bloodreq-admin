"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Quote, Activity } from "lucide-react";

const quotes = [
  {
    text: "The blood you donate gives someone another chance at life.",
    author: "BloodReq Foundation",
  },
  {
    text: "A single drop of blood can make a huge difference.",
    author: "Community Donor",
  },
  {
    text: "Join the network that saves lives every single day.",
    author: "Global Health",
  },
];

interface BlobConfig {
  width: number;
  height: number;
  left: string;
  top: string;
  x: number[];
  y: number[];
  duration: number;
}

export default function AuthSidebar() {
  const [currentQuote, setCurrentQuote] = useState(0);
  const [blobs, setBlobs] = useState<BlobConfig[]>([]);

  useEffect(() => {
    // Generate random blobs on client side only to prevent hydration mismatch
    const newBlobs = [...Array(5)].map(() => ({
      width: Math.random() * 300 + 100,
      height: Math.random() * 300 + 100,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      x: [0, Math.random() * 100 - 50, 0],
      y: [0, Math.random() * 100 - 50, 0],
      duration: Math.random() * 20 + 20,
    }));
    setBlobs(newBlobs);

    const timer = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % quotes.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative hidden w-full flex-col justify-between overflow-hidden bg-[#050508] p-10 text-white lg:flex h-full min-h-screen border-r border-white/5">
      {/* 1. NOIR BASE: Dark Gradients & Textures */}
      <div className="absolute inset-0 z-0 bg-gradient-to-tr from-[#0a0a0f] via-[#050508] to-[#120505]" />
      <div className="auth-noise absolute inset-0 z-0 opacity-[0.03] mix-blend-overlay" />
      
      {/* 2. ORGANIC DRIFT: Floating Blood Cells (SVGs) */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {blobs.map((blob, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-gradient-to-br from-red-600/20 to-transparent blur-2xl"
            style={{
              width: blob.width,
              height: blob.height,
              left: blob.left,
              top: blob.top,
            }}
            animate={{
              x: blob.x,
              y: blob.y,
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: blob.duration,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>

      {/* 3. REFINED GRID: Sharp accents */}
      <div className="absolute inset-0 z-0 opacity-[0.05]" 
           style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      {/* Top Header */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10">
            <div className="absolute inset-0 rounded-full bg-red-600 blur-[8px] opacity-50 animate-pulse" />
            <div className="relative flex h-full w-full items-center justify-center rounded-full bg-red-600 shadow-inner">
              <Activity className="h-5 w-5 text-white" />
            </div>
          </div>
          <span className="text-2xl font-bold tracking-tighter font-sans uppercase">BloodReq</span>
        </div>
        <div className="mono-label px-3 py-1 border border-red-600/30 rounded-full text-[10px] bg-red-600/5">
          Admin Portal
        </div>
      </div>

      {/* Central Content: Glassmorphic Quote */}
      <div className="relative z-10 w-full max-w-lg mx-auto">
        <div className="glass-hybrid p-8 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Quote size={80} />
          </div>
          
          <div className="min-h-[160px] flex flex-col justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuote}
                initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              >
                <h2 className="font-display text-4xl leading-tight text-white/90 italic">
                  "{quotes[currentQuote].text}"
                </h2>
                <div className="mt-8 flex items-center gap-4">
                  <div className="h-[1px] w-8 bg-red-600" />
                  <p className="mono-label text-xs">
                    {quotes[currentQuote].author}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Footer Meta */}
      <div className="relative z-10 flex justify-between items-end">
        <div className="space-y-1">
          <p className="mono-label text-[9px] opacity-40">Status</p>
          <p className="text-[10px] text-red-200/50 uppercase tracking-widest font-sans">Secure Connection</p>
        </div>
        <div className="text-right">
          <p className="mono-label text-[10px] text-red-600">© 2026</p>
          <p className="text-[10px] text-white/30 font-sans">Saving Lives Together</p>
        </div>
      </div>
    </div>
  );
}
