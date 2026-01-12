'use client';
import { useEffect, useRef } from 'react';

interface BloodCellsBackgroundProps {
  className?: string;
}

export default function BloodCellsBackground({ className = '' }: BloodCellsBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    class Particle {
      x: number;
      y: number;
      radius: number;
      vx: number;
      vy: number;
      opacity: number;

      constructor() {
        this.x = Math.random() * canvas!.width;
        this.y = Math.random() * canvas!.height;
        this.radius = Math.random() * 20 + 20; // 20-40px radius (large blurred cells)
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.opacity = Math.random() * 0.15 + 0.05; // 0.05 - 0.2 opacity
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        // Bounce off edges
        if (this.x < -100) this.x = canvas!.width + 100;
        if (this.x > canvas!.width + 100) this.x = -100;
        if (this.y < -100) this.y = canvas!.height + 100;
        if (this.y > canvas!.height + 100) this.y = -100;
      }

      draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        // Create radial gradient for 3D cell look
        const gradient = ctx.createRadialGradient(
          this.x - this.radius * 0.3,
          this.y - this.radius * 0.3,
          0,
          this.x,
          this.y,
          this.radius
        );
        gradient.addColorStop(0, `rgba(239, 68, 68, ${this.opacity})`); // core
        gradient.addColorStop(1, `rgba(220, 38, 38, 0)`); // edge

        ctx.fillStyle = gradient;
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const initParticles = () => {
      particles = [];
      const particleCount = 25; 
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Optional: Add a very subtle dark red overlay
      // ctx.fillStyle = 'rgba(20, 0, 0, 0.3)';
      // ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach(p => {
        p.update();
        p.draw(ctx);
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resize);
    resize();
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className={`absolute inset-0 z-0 overflow-hidden pointer-events-none ${className}`}>
      <canvas ref={canvasRef} className="w-full h-full opacity-60" />
      <div className="absolute inset-0 backdrop-blur-[80px]" /> {/* Heavy blur for moody effect */}
    </div>
  );
}
