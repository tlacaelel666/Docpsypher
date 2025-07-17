'use client';

import { useState } from 'react';
import { Combine, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { StatusPanel } from '@/components/status-panel';
import { PacketVisualization } from '@/components/packet-visualization';
import { AiAssessment } from '@/components/ai-assessment';
import { getCommunicationQuality } from '@/app/actions';
import type { AssessCommunicationQualityOutput } from '@/ai/flows/assess-communication-quality';
import { useToast } from '@/hooks/use-toast';

export type Status = 'IDLE' | 'IONIZING' | 'TRANSDUCING' | 'AWAITING_AI' | 'COMPLETE';
export interface Metrics {
  fidelity: number;
  qber: number;
}

export function QuantumCipherApp() {
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<Status>('IDLE');
  const [metrics, setMetrics] = useState<Metrics>({ fidelity: 0, qber: 0 });
  const [aiResult, setAiResult] = useState<AssessCommunicationQualityOutput | null>(null);
  const [encodedMessage, setEncodedMessage] = useState('');
  const { toast } = useToast();

  const isLoading = status !== 'IDLE' && status !== 'COMPLETE';

  const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

  const handleReset = () => {
    setMessage('');
    setStatus('IDLE');
    setMetrics({ fidelity: 0, qber: 0 });
    setAiResult(null);
    setEncodedMessage('');
  };

  const handleSendMessage = async () => {
    if (!message.trim() || isLoading) {
      if (!message.trim()) {
        toast({
          title: 'Input Required',
          description: 'Please enter a message to encode.',
          variant: 'destructive',
        });
      }
      return;
    }

    setEncodedMessage('');
    setAiResult(null);
    setStatus('IONIZING');
    await delay(1500);

    setStatus('TRANSDUCING');
    setEncodedMessage(message);
    await delay(2000);

    const newFidelity = 0.9 + Math.random() * 0.099; // 0.9 - 0.999
    const newQber = Math.random() * 0.05; // 0.0 - 0.05
    setMetrics({ fidelity: newFidelity, qber: newQber });

    setStatus('AWAITING_AI');
    try {
      const result = await getCommunicationQuality({
        fidelity: newFidelity,
        qber: newQber,
      });
      setAiResult(result);
      await delay(500);
      setStatus('COMPLETE');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to get AI assessment.',
        variant: 'destructive',
      });
      setStatus('IDLE');
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="container mx-auto p-4 md:p-8">
        <header className="mb-8 flex items-center gap-3">
          <Combine className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold font-headline tracking-tighter">
            Quantum Cipher
          </h1>
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 space-y-8">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="font-headline text-2xl">Message Encoder</CardTitle>
                <CardDescription>Enter the text you want to encode into BiMOtype quantum-radioactive packets.</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Type your secret message here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="min-h-[150px] text-base resize-none"
                  disabled={isLoading}
                />
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleReset} disabled={isLoading && status !== 'COMPLETE'}>
                  Reset
                </Button>
                <Button onClick={handleSendMessage} disabled={isLoading}>
                  <Send className="mr-2 h-4 w-4" />
                  {isLoading ? 'Processing...' : 'Encode & Transmit'}
                </Button>
              </CardFooter>
            </Card>

            <PacketVisualization message={encodedMessage} status={status} />
          </div>

          <div className="lg:col-span-2 space-y-8">
            <StatusPanel status={status} metrics={metrics} />
            <AiAssessment result={aiResult} status={status} />
          </div>
        </div>
      </main>
    </div>
  );
}
