import React from 'react';

export function DocSaferLogo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
    >
      <defs>
        <radialGradient id="grad1" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
          <stop offset="0%" style={{ stopColor: 'hsl(var(--primary))', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: 'hsl(var(--primary))', stopOpacity: 0.8 }} />
        </radialGradient>
      </defs>
      {/* Glow */}
      <circle cx="50" cy="50" r="35" fill="url(#grad1)" opacity="0.5" />
      {/* Main sphere */}
      <circle cx="50" cy="50" r="30" />

      {/* Radiation symbol parts */}
      <g transform="translate(50, 50)">
        {/* Center circle */}
        <circle cx="0" cy="0" r="6" fill="hsl(var(--background))" />
        
        {/* Blades */}
        {[0, 120, 240].map(angle => (
          <g key={angle} transform={`rotate(${angle})`}>
            <path 
              d="M 0,-8 A 20,20 0 0,1 17.32,-20 L 10.39,-12 A 12,12 0 0,0 0,-7 Z" 
              transform="translate(0, -1)"
              fill="hsl(var(--background))"
            />
             <path 
              d="M 0,-8 A 20,20 0 0,0 -17.32,-20 L -10.39,-12 A 12,12 0 0,1 0,-7 Z"
              transform="translate(0, -1) scale(-1, 1)"
              fill="hsl(var(--background))"
            />
          </g>
        ))}
      </g>
      
      {/* Electron orbits */}
      <ellipse cx="50" cy="50" rx="40" ry="15" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.7" />
      <ellipse cx="50" cy="50" rx="15" ry="40" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.7" />

      {/* Electrons */}
      <circle cx="10" cy="50" r="3" fill="currentColor" />
      <circle cx="90" cy="50" r="3" fill="currentColor" />
      <circle cx="50" cy="10" r="3" fill="currentColor" />
      <circle cx="50" cy="90" r="3" fill="currentColor" />
    </svg>
  );
}
