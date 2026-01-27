"use client";

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from "@/lib/utils";

interface BentoCardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  colSpan?: 1 | 2 | 3 | 4;
  rowSpan?: 1 | 2;
  title?: string;
  subtitle?: string;
  className?: string;
  noPadding?: boolean;
}

const BentoCard = ({ 
  children, 
  colSpan = 1, 
  rowSpan = 1,
  title,
  subtitle,
  className,
  noPadding = false,
  ...props 
}: BentoCardProps) => {
  
  // Tailwind grid span classes
  const colSpanClasses = {
      1: 'col-span-1',
      2: 'col-span-1 md:col-span-2',
      3: 'col-span-1 md:col-span-3',
      4: 'col-span-1 md:col-span-2 lg:col-span-4'
  };

  const rowSpanClasses = {
      1: 'row-span-1',
      2: 'row-span-1 lg:row-span-2'
  };

  return (
    <motion.div
      className={cn(
        "bento-card flex flex-col relative",
        colSpanClasses[colSpan],
        rowSpanClasses[rowSpan],
        !noPadding && "p-6",
        className
      )}
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      viewport={{ once: true }}
      {...props}
    >
      {(title || subtitle) && (
        <div className={cn("mb-4", noPadding && "px-6 pt-6")}>
            {title && <h3 className="bento-title text-lg">{title}</h3>}
            {subtitle && <p className="bento-subtitle text-sm mt-1">{subtitle}</p>}
        </div>
      )}
      <div className={cn("flex-1 h-full", noPadding ? "" : "")}>
        {children}
      </div>
    </motion.div>
  );
};

export default BentoCard;
