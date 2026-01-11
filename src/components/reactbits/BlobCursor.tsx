'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import { gsap } from 'gsap';

export interface BlobCursorProps {
  blobType?: 'circle' | 'square';
  fillColor?: string;
  trailCount?: number;
  sizes?: number[];
  innerSizes?: number[];
  innerColor?: string;
  opacities?: number[];
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  useFilter?: boolean;
  zIndex?: number;
}

export default function BlobCursor({
  blobType = 'circle',
  fillColor = '#ef4444', // Blood red
  trailCount = 3,
  sizes = [40, 60, 30],
  innerSizes = [10, 15, 10],
  innerColor = 'rgba(255,255,255,0.3)',
  opacities = [0.4, 0.3, 0.2],
  shadowColor = 'rgba(220, 38, 38, 0.5)',
  shadowBlur = 10,
  shadowOffsetX = 0,
  shadowOffsetY = 0,
  useFilter = true,
  zIndex = 9999
}: BlobCursorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const blobsRef = useRef<(HTMLDivElement | null)[]>([]);

  // We need to track mouse position globally
  const mousePos = useRef({ x: 0, y: 0 });

  const updateOffset = useCallback(() => {
    if (!containerRef.current) return { left: 0, top: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    return { left: rect.left, top: rect.top };
  }, []);

  useEffect(() => {
      const handleGlobalMove = (e: MouseEvent) => {
          mousePos.current = { x: e.clientX, y: e.clientY };
      };
      window.addEventListener('mousemove', handleGlobalMove);
      return () => window.removeEventListener('mousemove', handleGlobalMove);
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
        blobsRef.current.forEach((el, i) => {
            if (!el) return;
            const lag = (i + 1) * 0.1; // Staggered lag
            
            gsap.ticker.add(() => {
                const currentFn = gsap.getProperty(el, "x") as number;
                const currentYn = gsap.getProperty(el, "y") as number;
                
                // Simple lerp for custom trail effect without complex specialized logic
                const dx = mousePos.current.x - currentFn;
                const dy = mousePos.current.y - currentYn;
                
                // Move towards mouse
                gsap.set(el, {
                    x: currentFn + dx * (0.15 - i * 0.03), 
                    y: currentYn + dy * (0.15 - i * 0.03)
                });
            });
        });
    }, containerRef);
    
    return () => ctx.revert();
  }, [trailCount]);


  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none w-full h-full overflow-hidden"
      style={{ zIndex }}
    >
      {useFilter && (
        <svg className="absolute w-0 h-0">
          <filter id="blob-filter">
            <feGaussianBlur in="SourceGraphic" result="blur" stdDeviation="15" />
            <feColorMatrix in="blur" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 20 -10" />
          </filter>
        </svg>
      )}

      <div
        className="absolute inset-0"
        style={{ filter: useFilter ? `url(#blob-filter)` : undefined }}
      >
        {Array.from({ length: trailCount }).map((_, i) => (
          <div
            key={i}
            ref={el => {
                // @ts-ignore
                blobsRef.current[i] = el;
            }}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{
              width: sizes[i] || 50,
              height: sizes[i] || 50,
              left: 0,
              top: 0,
              borderRadius: blobType === 'circle' ? '50%' : '0',
              backgroundColor: fillColor,
              opacity: opacities[i] || 0.5,
              boxShadow: `${shadowOffsetX}px ${shadowOffsetY}px ${shadowBlur}px 0 ${shadowColor}`
            }}
          />
        ))}
      </div>
    </div>
  );
}
