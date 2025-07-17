'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { Status } from './quantum-cipher-app';

interface PacketVisualizationProps {
  message: string;
  status: Status;
}

export function PacketVisualization({ message, status }: PacketVisualizationProps) {
  const packets = message.split('');
  const showPackets = status === 'TRANSDUCING' || status === 'AWAITING_AI' || status === 'COMPLETE';
  const isAnimating = status === 'TRANSDUCING';

  return (
    <Card className="shadow-lg min-h-[280px] animate-fadeIn">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Quantum Packet Stream</CardTitle>
        <CardDescription>Visual representation of encoded characters and their isotope properties.</CardDescription>
      </CardHeader>
      <CardContent>
        {packets.length > 0 && showPackets ? (
          <div className="flex flex-wrap gap-2 p-4 bg-background/50 rounded-lg border border-border">
            {packets.map((char, index) => (
              <div
                key={`${char}-${index}`}
                className={cn(
                  'flex items-center justify-center w-8 h-8 rounded-md font-mono text-sm font-bold text-primary-foreground bg-primary/80 border border-primary animate-fadeIn',
                  isAnimating && 'animate-[pulse-glow_2s_infinite_ease-in-out]',
                  char === ' ' && 'bg-transparent border-dashed'
                )}
                style={{ animationDelay: `${index * 50}ms` }}
                title={`Packet ${index + 1}: '${char}'`}
              >
                {char === ' ' ? '' : char}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-40 text-center text-muted-foreground">
            <p>Awaiting transmission...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
