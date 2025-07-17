'use client';

import { ArrowRightLeft, BrainCircuit, CheckCircle, CircleDot, Cpu, Gauge, AlertTriangle, Zap, Server } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import type { Status, Metrics } from './quantum-cipher-app';

interface StatusPanelProps {
  status: Status;
  metrics: Metrics;
}

const statusSteps = [
  { name: 'IDLE', icon: CircleDot, description: 'Ready for transmission.' },
  { name: 'IONIZING', icon: Zap, description: 'Preparing quantum state...' },
  { name: 'TRANSDUCING', icon: ArrowRightLeft, description: 'Encoding & transmitting packets...' },
  { name: 'AWAITING_AI', icon: BrainCircuit, description: 'Assessing communication quality...' },
  { name: 'COMPLETE', icon: CheckCircle, description: 'Process finished successfully.' },
];

export function StatusPanel({ status, metrics }: StatusPanelProps) {
  const currentStepIndex = statusSteps.findIndex(step => step.name === status);

  return (
    <Card className="shadow-lg animate-fadeIn">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">System Status</CardTitle>
        <CardDescription>Real-time process and communication quality metrics.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="mb-4 font-semibold text-muted-foreground">Process State</h3>
          <ul className="space-y-3">
            {statusSteps.map((step, index) => (
              <li key={step.name} className="flex items-center gap-3">
                <div
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full border-2',
                    index < currentStepIndex ? 'bg-primary border-primary text-primary-foreground' : '',
                    index === currentStepIndex ? 'bg-primary border-primary ring-4 ring-primary/30 text-primary-foreground' : '',
                    index > currentStepIndex ? 'bg-card-foreground/10 border-border' : ''
                  )}
                >
                  <step.icon className="h-4 w-4" />
                </div>
                <div>
                  <p
                    className={cn(
                      'font-medium',
                      index === currentStepIndex ? 'text-foreground' : 'text-muted-foreground'
                    )}
                  >
                    {step.name}
                  </p>
                  {index === currentStepIndex && <p className="text-sm text-muted-foreground">{step.description}</p>}
                </div>
              </li>
            ))}
          </ul>
        </div>
        
        <Separator />
        
        <div>
          <h3 className="mb-4 font-semibold text-muted-foreground">Performance Metrics</h3>
          <div className="space-y-4">
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <Gauge className="h-5 w-5 text-accent" />
                    <p>Fidelity</p>
                </div>
                <p className="font-mono font-bold text-lg text-foreground">
                    {metrics.fidelity > 0 ? metrics.fidelity.toFixed(4) : '...'}
                </p>
            </div>
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-accent" />
                    <p>QBER</p>
                </div>
                <p className="font-mono font-bold text-lg text-foreground">
                    {metrics.qber > 0 ? `${(metrics.qber * 100).toFixed(3)}%` : '...'}
                </p>
            </div>
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <Server className="h-5 w-5 text-accent" />
                    <p>System</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                    <p className="font-semibold text-green-400">Operational</p>
                </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
