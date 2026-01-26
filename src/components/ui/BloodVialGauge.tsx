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
      <div className="relative w-12 h-32 rounded-full tactile-panel-inset overflow-hidden p-1 border-4 border-slate-800">
        {/* Vial Cap */}
        <div className="absolute top-0 left-0 right-0 h-4 bg-slate-700/50 rounded-t-full border-b border-slate-600 z-10" />
        
        {/* Liquid (Blood) */}
        <motion.div 
          initial={{ height: 0 }}
          animate={{ height: `${value}%` }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className={cn(
            "absolute bottom-0 left-0 right-0 rounded-b-full shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]",
            color
          )}
        >
            {/* Bubbles/Shine */}
            <div className="absolute top-2 left-2 w-1 h-3 bg-white/20 rounded-full" />
        </motion.div>

        {/* Measuring lines */}
        <div className="absolute inset-0 flex flex-col justify-between py-6 px-1 pointer-events-none opacity-20">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="w-full h-[1px] bg-foreground" />
            ))}
        </div>
      </div>
      
      <div className="text-center">
        <span className="text-sm font-mono font-bold block">{type}</span>
        <span className="text-[0.65rem] text-muted-foreground uppercase tracking-tighter">{value}%</span>
      </div>
    </div>
  );
};

export default BloodVialGauge;
