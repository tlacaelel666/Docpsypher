'use client';

import { cn } from "@/lib/utils";
import { useEffect, useState, useRef, useCallback, useMemo } from "react";

// Enhanced particle state interface with additional properties
interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  baseOpacity: number;
  vx: number;
  vy: number;
  phase: number;
  frequency: number;
  color: string;
  trail: { x: number; y: number; opacity: number }[];
  energy: number;
  connections: number[];
}

// Configuration interface for customization
interface QuantumConfig {
  particleCount: number;
  minSize: number;
  maxSize: number;
  minSpeed: number;
  maxSpeed: number;
  connectionDistance: number;
  trailLength: number;
  pulseIntensity: number;
  energyDecay: number;
}

// Helper functions
const random = (min: number, max: number): number => Math.random() * (max - min) + min;
const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(max, value));
const distance = (p1: Particle, p2: Particle): number => 
  Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);

// Enhanced particle creation with quantum-like properties
const createParticle = (id: number, config: QuantumConfig): Particle => {
  const baseOpacity = random(0.2, 0.9);
  const colors = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'];
  
  return {
    id,
    x: random(5, 95),
    y: random(5, 95),
    size: random(config.minSize, config.maxSize),
    opacity: baseOpacity,
    baseOpacity,
    vx: random(config.minSpeed, config.maxSpeed) * (Math.random() > 0.5 ? 1 : -1),
    vy: random(config.minSpeed, config.maxSpeed) * (Math.random() > 0.5 ? 1 : -1),
    phase: random(0, Math.PI * 2),
    frequency: random(0.01, 0.03),
    color: colors[Math.floor(Math.random() * colors.length)],
    trail: [],
    energy: random(0.5, 1),
    connections: []
  };
};

// Calculate particle connections for quantum entanglement effect
const calculateConnections = (particles: Particle[], config: QuantumConfig): Particle[] => {
  return particles.map(particle => {
    const connections: number[] = [];
    particles.forEach(other => {
      if (other.id !== particle.id && distance(particle, other) < config.connectionDistance) {
        connections.push(other.id);
      }
    });
    return { ...particle, connections };
  });
};

// Update particle trails
const updateTrail = (particle: Particle, config: QuantumConfig): { x: number; y: number; opacity: number }[] => {
  const newTrail = [
    { x: particle.x, y: particle.y, opacity: particle.opacity * 0.8 },
    ...particle.trail.slice(0, config.trailLength - 1)
  ];
  
  return newTrail.map((point, index) => ({
    ...point,
    opacity: point.opacity * (1 - index / config.trailLength)
  }));
};

export interface QuantumFingerprintProps {
  active?: boolean;
  className?: string;
  config?: Partial<QuantumConfig>;
  showConnections?: boolean;
  showTrails?: boolean;
  pulseEffect?: boolean;
  quantumNoise?: boolean;
}

export function QuantumFingerprint({ 
  active = true,
  className,
  config: userConfig,
  showConnections = true,
  showTrails = false,
  pulseEffect = true,
  quantumNoise = true
}: QuantumFingerprintProps) {
  // Default configuration
  const defaultConfig: QuantumConfig = {
    particleCount: 60,
    minSize: 1,
    maxSize: 4,
    minSpeed: 0.05,
    maxSpeed: 0.15,
    connectionDistance: 15,
    trailLength: 8,
    pulseIntensity: 0.3,
    energyDecay: 0.995
  };

  const config = useMemo(() => ({ ...defaultConfig, ...userConfig }), [userConfig]);
  
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isVisible, setIsVisible] = useState(true);
  const animationFrameRef = useRef<number>();
  const containerRef = useRef<HTMLDivElement>(null);
  const timeRef = useRef(0);

  // Initialize particles with error handling
  const initializeParticles = useCallback(() => {
    try {
      const newParticles = Array.from({ length: config.particleCount }, (_, i) => 
        createParticle(i, config)
      );
      setParticles(newParticles);
    } catch (error) {
      console.warn('Error initializing quantum particles:', error);
      setParticles([]);
    }
  }, [config]);

  // Enhanced particle physics update
  const updateParticles = useCallback((deltaTime: number) => {
    setParticles(prevParticles => {
      try {
        let updatedParticles = prevParticles.map(particle => {
          let { x, y, vx, vy, phase, energy, opacity } = particle;
          
          // Update position with quantum uncertainty
          if (quantumNoise) {
            vx += random(-0.001, 0.001);
            vy += random(-0.001, 0.001);
          }
          
          x += vx * deltaTime;
          y += vy * deltaTime;
          
          // Boundary collision with energy conservation
          if (x <= 0 || x >= 100) {
            vx = -vx * 0.95; // Energy loss on collision
            x = clamp(x, 0, 100);
            energy *= config.energyDecay;
          }
          if (y <= 0 || y >= 100) {
            vy = -vy * 0.95;
            y = clamp(y, 0, 100);
            energy *= config.energyDecay;
          }
          
          // Quantum phase evolution
          phase += particle.frequency * deltaTime;
          
          // Pulse effect based on quantum state
          if (pulseEffect) {
            const pulse = Math.sin(phase) * config.pulseIntensity;
            opacity = clamp(particle.baseOpacity + pulse, 0.1, 1);
          }
          
          // Energy regeneration near center (quantum field effect)
          const centerDistance = Math.sqrt((x - 50) ** 2 + (y - 50) ** 2);
          if (centerDistance < 20) {
            energy = Math.min(1, energy + 0.001);
          }
          
          // Update trail
          const trail = showTrails ? updateTrail({ ...particle, x, y }, config) : [];
          
          return {
            ...particle,
            x, y, vx, vy, phase, energy, opacity, trail
          };
        });

        // Calculate quantum connections
        if (showConnections) {
          updatedParticles = calculateConnections(updatedParticles, config);
        }

        return updatedParticles;
      } catch (error) {
        console.warn('Error updating particles:', error);
        return prevParticles;
      }
    });
  }, [config, quantumNoise, pulseEffect, showConnections, showTrails]);

  // Main animation loop with performance optimization
  useEffect(() => {
    let lastTime = 0;
    
    const animate = (currentTime: number) => {
      const deltaTime = Math.min(currentTime - lastTime, 16.67); // Cap at 60fps
      lastTime = currentTime;
      timeRef.current = currentTime;
      
      if (active && isVisible) {
        updateParticles(deltaTime);
      }
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    if (active) {
      animationFrameRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [active, isVisible, updateParticles]);

  // Initialize particles on mount
  useEffect(() => {
    initializeParticles();
  }, [initializeParticles]);

  // Intersection Observer for performance optimization
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Render quantum connections
  const renderConnections = useCallback(() => {
    if (!showConnections || particles.length === 0) return null;
    
    const connections: JSX.Element[] = [];
    const particleMap = new Map(particles.map(p => [p.id, p]));
    
    particles.forEach(particle => {
      particle.connections.forEach(connectedId => {
        const connected = particleMap.get(connectedId);
        if (connected && particle.id < connectedId) { // Avoid duplicate lines
          const dist = distance(particle, connected);
          const opacity = Math.max(0, 1 - dist / config.connectionDistance) * 0.3;
          
          connections.push(
            <line
              key={`${particle.id}-${connectedId}`}
              x1={`${particle.x}%`}
              y1={`${particle.y}%`}
              x2={`${connected.x}%`}
              y2={`${connected.y}%`}
              stroke={active ? "#3b82f6" : "#ef4444"}
              strokeWidth="0.5"
              opacity={opacity}
              className="transition-all duration-300"
            />
          );
        }
      });
    });
    
    return connections;
  }, [particles, showConnections, active, config.connectionDistance]);

  // Render particle trails
  const renderTrails = useCallback(() => {
    if (!showTrails) return null;
    
    return particles.map(particle => 
      particle.trail.map((point, index) => (
        <div
          key={`${particle.id}-trail-${index}`}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: `${point.x}%`,
            top: `${point.y}%`,
            width: `${particle.size * (1 - index / particle.trail.length)}px`,
            height: `${particle.size * (1 - index / particle.trail.length)}px`,
            backgroundColor: particle.color,
            opacity: point.opacity,
            transform: 'translate(-50%, -50%)',
            transition: 'opacity 0.1s linear'
          }}
        />
      ))
    );
  }, [particles, showTrails]);

  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative h-32 w-full rounded-lg overflow-hidden border transition-all duration-500",
        active 
          ? "border-primary/50 bg-gradient-to-br from-primary/5 to-primary/20" 
          : "border-destructive/50 bg-gradient-to-br from-destructive/5 to-destructive/20",
        className
      )}
      role="img"
      aria-label={`Quantum fingerprint visualization - ${active ? 'active' : 'inactive'}`}
    >
      {/* Quantum field background */}
      <div className={cn(
        "absolute inset-0 transition-opacity duration-500",
        active ? "opacity-20" : "opacity-10"
      )}>
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-primary/10 to-transparent" />
      </div>

      {/* SVG for quantum connections */}
      {showConnections && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {renderConnections()}
        </svg>
      )}

      {/* Particle trails */}
      {renderTrails()}

      {/* Main particles */}
      <div className="absolute inset-0 w-full h-full">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute rounded-full transition-colors duration-300 pointer-events-none"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size * particle.energy}px`,
              height: `${particle.size * particle.energy}px`,
              backgroundColor: active ? particle.color : '#ef4444',
              opacity: particle.opacity,
              transform: 'translate(-50%, -50%)',
              boxShadow: active 
                ? `0 0 ${particle.size * 2}px ${particle.color}40`
                : `0 0 ${particle.size * 2}px #ef444440`,
              filter: `blur(${0.2 / particle.energy}px)`
            }}
          />
        ))}
      </div>

      {/* Quantum interference pattern overlay */}
      <div className={cn(
        "absolute inset-0 transition-opacity duration-500 pointer-events-none",
        active ? "opacity-5" : "opacity-0",
        "bg-[radial-gradient(circle_at_center,transparent_0%,rgba(59,130,246,0.1)_50%,transparent_100%)]"
      )} />
      
      {/* Performance indicator */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-1 right-1 text-xs opacity-50 font-mono">
          {particles.length}p
        </div>
      )}
    </div>
  );
}

// Enhanced grid background component
export const QuantumGridBackground = ({ 
  active = true, 
  intensity = 0.1 
}: { 
  active?: boolean; 
  intensity?: number; 
}) => (
  <div className={cn(
    "absolute inset-0 h-full w-full transition-opacity duration-500",
    active ? `opacity-${Math.round(intensity * 100)}` : "opacity-0"
  )}>
    <div className="h-full w-full bg-grid-white/[0.05] [mask-image:radial-gradient(ellipse_at_center,white,transparent)]" />
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent" />
  </div>
);

// Usage example and configuration presets
export const QuantumPresets = {
  minimal: {
    particleCount: 20,
    minSize: 1,
    maxSize: 2,
    minSpeed: 0.02,
    maxSpeed: 0.08,
    connectionDistance: 10
  },
  intense: {
    particleCount: 100,
    minSize: 2,
    maxSize: 6,
    minSpeed: 0.1,
    maxSpeed: 0.3,
    connectionDistance: 20
  },
  ethereal: {
    particleCount: 40,
    minSize: 0.5,
    maxSize: 3,
    minSpeed: 0.01,
    maxSpeed: 0.05,
    connectionDistance: 25,
    pulseIntensity: 0.5
  }
};