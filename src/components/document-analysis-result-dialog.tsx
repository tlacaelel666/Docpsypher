
'use client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Document } from '@/types/document';
import { AlertCircle, CheckCircle2, ScanSearch, Sparkles, ThumbsDown, ThumbsUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from './ui/scroll-area';

interface DocumentAnalysisResultDialogProps {
  document: Document | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DocumentAnalysisResultDialog({ document, open, onOpenChange }: DocumentAnalysisResultDialogProps) {
  if (!document || !document.analysis) {
    return null;
  }

  const { isAuthentic, confidenceScore, reasoning, extractedData, topologicalAnomalies } = document.analysis;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ScanSearch /> Resultado del Análisis Forense
          </DialogTitle>
          <DialogDescription>
            Detalles del análisis de IA para el documento: <strong>{document.name}</strong>
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-4">
                <Alert variant={isAuthentic ? 'default' : 'destructive'} className={cn(isAuthentic && 'border-green-500/50 bg-green-500/10 text-green-200')}>
                    {isAuthentic ? <CheckCircle2 className="h-4 w-4 text-green-400" /> : <AlertCircle className="h-4 w-4" />}
                    <AlertTitle className={cn("font-bold", isAuthentic ? 'text-green-400' : 'text-destructive')}>
                        {isAuthentic ? 'Documento Considerado Auténtico' : 'Anomalías Detectadas: Posible Falsificación'}
                    </AlertTitle>
                    <AlertDescription className={cn(isAuthentic ? 'text-green-200/80' : 'text-destructive/80')}>
                       {reasoning}
                    </AlertDescription>
                </Alert>
              
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2 rounded-lg bg-card p-3">
                        {isAuthentic ? <ThumbsUp className="h-5 w-5 text-green-400" /> : <ThumbsDown className="h-5 w-5 text-destructive" />}
                        <div>
                            <p className="text-muted-foreground">Veredicto</p>
                            <p className="font-bold">{isAuthentic ? 'Auténtico' : 'No Auténtico'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg bg-card p-3">
                        <Sparkles className="h-5 w-5 text-primary" />
                        <div>
                            <p className="text-muted-foreground">Confianza IA</p>
                            <p className="font-bold">{(confidenceScore * 100).toFixed(1)}%</p>
                        </div>
                    </div>
                </div>

                {extractedData && Object.keys(extractedData).length > 0 && (
                    <div className="space-y-2">
                        <h4 className="font-semibold">Datos Extraídos</h4>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 rounded-lg bg-card p-3 text-sm">
                            {Object.entries(extractedData).map(([key, value]) => (
                                <div key={key}>
                                    <p className="text-muted-foreground capitalize">{key.replace(/_/g, ' ')}</p>
                                    <p>{String(value)}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {topologicalAnomalies && topologicalAnomalies.length > 0 && (
                     <div className="space-y-2">
                        <h4 className="font-semibold">Anomalías Estructurales Detectadas</h4>
                         <ul className="list-disc list-inside space-y-1 rounded-lg bg-card p-3 text-sm">
                            {topologicalAnomalies.map((anomaly, index) => (
                                <li key={index}>{anomaly}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </ScrollArea>
        <DialogFooter>
          <Button type="button" onClick={() => onOpenChange(false)}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
