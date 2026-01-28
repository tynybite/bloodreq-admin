"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from "@/lib/utils";

interface BloodVialGaugeProps {
  value: number; // 0 to 100
  label: string;
  type?: string;
  className?: string;
  color?: string;
}

const BloodVialGauge = ({ 
  value, 
  label, 
  type, 
  className,
  color = "bg-rose-600"
}: BloodVialGaugeProps) => {
  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <div className="relative w-12 h-32 rounded-full bg-slate-900/50 overflow-hidden p-1 border border-white/10 shadow-inner backdrop-blur-sm">
        {/* Vial Cap */}
        <div className="absolute top-0 left-0 right-0 h-4 bg-slate-800/80 rounded-t-full border-b border-white/5 z-10" />
        
        {/* Liquid (Blood) */}
        <motion.div 
          initial={{ height: 0 }}
          animate={{ height: `${value}%` }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className={cn(
            "absolute bottom-0 left-0 right-0 rounded-b-full shadow-[inset_0_-2px_10px_rgba(0,0,0,0.5)]",
            color
          )}
        >
            {/* Bubbles/Shine */}
            <div className="absolute top-2 left-2 w-1.5 h-6 bg-gradient-to-b from-white/30 to-transparent rounded-full" />
        </motion.div>

        {/* Measuring lines */}
        <div className="absolute inset-0 flex flex-col justify-between py-6 px-1 pointer-events-none opacity-30">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="w-full h-[1px] bg-white/20" />
            ))}
        </div>
      </div>
      
      <div className="text-center pt-2">
        <span className="text-sm font-display font-bold block bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">{type}</span>
        <span className="text-[0.65rem] text-muted-foreground uppercase tracking-wider">{value}%</span>
      </div>
    </div>
  );
};

export default BloodVialGauge;
