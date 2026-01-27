"use client";

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from "@/lib/utils";

interface CleanCardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  noPadding?: boolean;
  hover?: boolean;
}

const CleanCard = ({ 
  children, 
  className,
  noPadding = false,
  hover = true,
  ...props 
}: CleanCardProps) => {
  return (
    <motion.div
      whileHover={hover ? { y: -2 } : undefined}
      className={cn(
        "clean-card",
        !noPadding && "p-6",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default CleanCard;
