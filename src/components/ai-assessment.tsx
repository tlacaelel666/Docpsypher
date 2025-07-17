'use client';

import { Bot } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { AssessCommunicationQualityOutput } from '@/ai/flows/assess-communication-quality';
import type { Status } from './quantum-cipher-app';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';

interface AiAssessmentProps {
  result: AssessCommunicationQualityOutput | null;
  status: Status;
}

export function AiAssessment({ result, status }: AiAssessmentProps) {
  const isLoading = status === 'AWAITING_AI';
  const isComplete = status === 'COMPLETE';

  const getBadgeVariant = (rating: string) => {
    switch (rating.toLowerCase()) {
      case 'excellent':
        return 'bg-green-500/80';
      case 'good':
        return 'bg-blue-500/80';
      case 'fair':
        return 'bg-yellow-500/80';
      case 'poor':
        return 'bg-red-500/80';
      default:
        return 'secondary';
    }
  };
  
  return (
    <Card className="shadow-lg min-h-[220px] animate-fadeIn">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Bot className="h-6 w-6 text-primary" />
          <CardTitle className="font-headline text-2xl">AI Quality Assessment</CardTitle>
        </div>
        <CardDescription>Analysis of communication channel integrity by GenAI.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-32" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        )}
        {isComplete && result && (
            <div className="space-y-4 animate-fadeIn">
                <div className="flex justify-between items-center">
                    <p className="font-semibold text-muted-foreground">Rating</p>
                    <Badge variant="outline" className={cn("text-base font-bold text-primary-foreground border-none", getBadgeVariant(result.rating))}>
                        {result.rating}
                    </Badge>
                </div>
                <div>
                    <p className="font-semibold text-muted-foreground mb-2">Justification</p>
                    <p className="text-sm text-foreground bg-background/50 p-3 rounded-md border border-border">
                        {result.justification}
                    </p>
                </div>
            </div>
        )}
        {!isLoading && !isComplete && (
            <div className="flex items-center justify-center h-24 text-center text-muted-foreground">
                <p>Awaiting metrics for assessment...</p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
