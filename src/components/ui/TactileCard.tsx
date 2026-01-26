"use client";

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from "@/lib/utils";

interface TactileCardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  active?: boolean;
  indicatorColor?: string;
  intensity?: 'low' | 'medium' | 'high';
}

const TactileCard = ({ 
  children, 
  className, 
  active = true, 
  indicatorColor = "text-emerald-500",
  intensity = 'medium',
  ...props 
}: TactileCardProps) => {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={cn(
        "relative rounded-3xl p-8 tactile-panel overflow-hidden",
        intensity === 'low' && "p-4 rounded-xl",
        intensity === 'high' && "p-10 rounded-[2.5rem]",
        className
      )}
      {...props}
    >
      {/* Screw heads for skeuomorphic feel */}
      <div className="absolute top-4 left-4 w-2 h-2 rounded-full bg-border shadow-inner opacity-40" />
      <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-border shadow-inner opacity-40" />
      <div className="absolute bottom-4 left-4 w-2 h-2 rounded-full bg-border shadow-inner opacity-40" />
      <div className="absolute bottom-4 right-4 w-2 h-2 rounded-full bg-border shadow-inner opacity-40" />

      {/* LED Indicator */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
        <div className={cn(
          "led-indicator",
          active ? indicatorColor : "text-muted opacity-20"
        )} />
        <span className="text-[0.6rem] font-mono uppercase tracking-widest opacity-40">System Active</span>
      </div>

      <div className="relative mt-2">
        {children}
      </div>

      {/* Subtle texture overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] medical-grid" />
    </motion.div>
  );
};

export default TactileCard;
