// A component to visualize the quantum fingerprint concept.
// This is a placeholder for the actual quantum computation logic.
'use client';

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

// Helper function to generate a random value within a range
const random = (min: number, max: number) => Math.random() * (max - min) + min;

// Particle state
interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  vx: number;
  vy: number;
}

const createParticle = (id: number): Particle => ({
  id,
  x: random(0, 100),
  y: random(0, 100),
  size: random(1, 3),
  opacity: random(0.1, 0.8),
  vx: random(-0.1, 0.1),
  vy: random(-0.1, 0.1),
});

export function QuantumFingerprint({ active = true }: { active?: boolean }) {
  const [particles, setParticles] = useState<Particle[]>([]);

  // Initialize particles
  useEffect(() => {
    setParticles(Array.from({ length: 50 }, (_, i) => createParticle(i)));
  }, []);

  // Animate particles
  useEffect(() => {
    let animationFrameId: number;
    
    const update = () => {
      setParticles(prevParticles => 
        prevParticles.map(p => {
          let { x, y, vx, vy } = p;
          x += vx;
          y += vy;
          if (x < 0 || x > 100) vx = -vx;
          if (y < 0 || y > 100) vy = -vy;
          return { ...p, x, y, vx, vy };
        })
      );
      animationFrameId = requestAnimationFrame(update);
    };

    if (active) {
      animationFrameId = requestAnimationFrame(update);
    }
    
    return () => cancelAnimationFrame(animationFrameId);
  }, [active]);


  return (
    <div className={cn(
      "relative h-24 w-full rounded-lg overflow-hidden border transition-all duration-500",
      active ? "border-primary/50 bg-primary/10" : "border-destructive/50 bg-destructive/10"
    )}>
      <div className="absolute inset-0 w-full h-full">
         {particles.map((p) => (
          <div
            key={p.id}
            className={cn(
                "absolute rounded-full transition-colors duration-500",
                active ? "bg-primary" : "bg-destructive"
            )}
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              opacity: p.opacity,
              transition: 'transform 0.1s linear',
              transform: `translate(-50%, -50%)`,
            }}
          />
        ))}
      </div>
      <div className={cn("absolute inset-0 w-full h-full transition-opacity duration-500", active ? 'opacity-10' : 'opacity-0', 'bg-grid-white/[0.2]')}/>
    </div>
  );
}

// Add a simple grid background for visual effect
const GridBackground = () => (
  <div className="absolute inset-0 h-full w-full bg-transparent [background:radial-gradient(125%_125%_at_50%_10%,hsl(var(--primary))_40%,#63e_100%)]"></div>
);
