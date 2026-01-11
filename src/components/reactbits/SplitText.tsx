import React, { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText as GSAPSplitText } from 'gsap/SplitText';
import { useGSAP } from '@gsap/react';

// Ideally we'd register plugins here, but SplitText is a premium plugin.
// If the user doesn't have it, we might need a fallback or use a simpler split implementation.
// For this environment, since we don't have the premium GSAP plugins, 
// I will implement a CSS-based split text or a basic manual span split
// to avoid "GSAP SplitText not found" errors.

// REPLACING WITH MANUAL SPLIT IMPLEMENTATION FOR ROBUSTNESS WITHOUT PREMIUM PLUGINS
// --------------------------------------------------------------------------------

interface SplitTextProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span';
}

const SplitText: React.FC<SplitTextProps> = ({
  text,
  className = '',
  delay = 0,
  duration = 1,
  tag = 'h1',
}) => {
    // Determine tag
    const Tag = tag as React.ElementType;
    
    // Split text into words/chars
    // Simple word splitting for now
    const words = text.split(' ');

    return (
        <Tag className={`inline-block ${className}`}>
             {words.map((word, i) => (
                 <span key={i} className="inline-block overflow-hidden whitespace-nowrap mr-[0.25em] align-top">
                     <span 
                        className="inline-block animate-revealu" 
                        style={{ 
                            animationDelay: `${delay + (i * 0.1)}s`, 
                            animationDuration: `${duration}s`,
                            animationFillMode: 'both',
                            transform: 'translateY(100%)',
                            opacity: 0 
                        }}
                    >
                         {word}
                     </span>
                 </span>
             ))}
             <style jsx>{`
                @keyframes revealu {
                    0% { transform: translateY(100%); opacity: 0; }
                    100% { transform: translateY(0); opacity: 1; }
                }
                .animate-revealu {
                    animation-name: revealu;
                    animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
                }
             `}</style>
        </Tag>
    );
};

export default SplitText;
