'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertCircle, CheckCircle2, FileUp, Loader2, ScanSearch, Sparkles, ThumbsDown, ThumbsUp } from 'lucide-react';

import { analyzeDocument } from '@/ai/flows/analyze-document-flow';
import type { AnalyzeDocumentOutput } from '@/types/document-analysis';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { useToast } from '@/hooks/use-toast';
import type { Document } from '@/types/document';
import { cn } from '@/lib/utils';

const FormSchema = z.object({
  file: z.any().refine(files => files?.length === 1, 'Debes seleccionar un archivo.'),
  documentType: z.string({ required_error: 'Debes seleccionar un tipo de documento.' }),
});

type FormValues = z.infer<typeof FormSchema>;

interface DocumentAnalysisDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDocumentVerified: (document: Document) => void;
}

export function DocumentAnalysisDialog({ open, onOpenChange, onDocumentVerified }: DocumentAnalysisDialogProps) {
  const { toast } = useToast();
  const [analysisResult, setAnalysisResult] = useState<AnalyzeDocumentOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState('');
  
  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
  });

  const fileRef = form.register('file');

  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleClose = () => {
    form.reset();
    setAnalysisResult(null);
    setIsLoading(false);
    setProgress(0);
    setFileName('');
    onOpenChange(false);
  };

  const handleAddToLocker = () => {
    if (analysisResult?.analysis) {
        const isAuthentic = analysisResult.analysis.isAuthentic;
        const newDoc: Document = {
            id: `doc-${Date.now()}`,
            name: fileName,
            type: form.getValues('documentType'),
            date: new Date().toISOString().split('T')[0],
            status: isAuthentic ? 'Verificado' : 'Rechazado',
            analysis: analysisResult.analysis,
        };
        onDocumentVerified(newDoc);
        toast({
            title: isAuthentic ? "Documento Añadido" : "Registro Guardado",
            description: `"${fileName}" se ha guardado en tu portafolio como ${isAuthentic ? 'Verificado' : 'Rechazado'}.`,
            variant: isAuthentic ? 'default' : 'destructive',
        });
        handleClose();
    }
  };


  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    setAnalysisResult(null);
    setProgress(10);
    const file = data.file[0];
    setFileName(file.name);

    try {
      setProgress(30);
      const photoDataUri = await readFileAsDataURL(file);
      setProgress(50);
      
      const result = await analyzeDocument({
        photoDataUri,
        documentType: data.documentType,
      });
      
      setProgress(100);
      setAnalysisResult(result);
    } catch (error) {
      console.error('Error durante el análisis del documento:', error);
       toast({
        title: "Error de Análisis",
        description: "No se pudo completar el análisis del documento. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
      handleClose();
    } finally {
      setIsLoading(false);
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center space-y-4 py-8">
            <div className="flex items-center space-x-2 text-primary">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p className="text-lg font-semibold">Analizando documento...</p>
            </div>
          <p className="text-sm text-muted-foreground">La IA está aplicando su análisis forense. Esto puede tardar unos segundos.</p>
          <Progress value={progress} className="w-full" />
        </div>
      );
    }

    if (analysisResult?.analysis) {
      const { isAuthentic, confidenceScore, reasoning, extractedData, topologicalAnomalies } = analysisResult.analysis;
      return (
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
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

            {Object.keys(extractedData).length > 0 && (
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
            {topologicalAnomalies.length > 0 && (
                 <div className="space-y-2">
                    <h4 className="font-semibold">Anomalías Estructurales</h4>
                     <ul className="list-disc list-inside space-y-1 rounded-lg bg-card p-3 text-sm">
                        {topologicalAnomalies.map((anomaly, index) => (
                            <li key={index}>{anomaly}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
      );
    }

    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="file"
            render={() => (
              <FormItem>
                <FormLabel>Archivo del Documento</FormLabel>
                <FormControl>
                  <Input type="file" accept="image/png, image/jpeg, image/webp" {...fileRef} className="file:text-primary"/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="documentType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Documento</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona el tipo de documento..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Pasaporte">Pasaporte</SelectItem>
                    <SelectItem value="Acta de Nacimiento">Acta de Nacimiento</SelectItem>
                    <SelectItem value="Licencia de Conducir">Licencia de Conducir</SelectItem>
                    <SelectItem value="Identificación Nacional">Identificación Nacional (DNI/INE)</SelectItem>
                    <SelectItem value="Diploma Académico">Diploma Académico</SelectItem>
                    <SelectItem value="Factura de Servicios">Factura de Servicios</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={handleClose}>Cancelar</Button>
            <Button type="submit">
                <ScanSearch className="mr-2 h-4 w-4" />
                Iniciar Análisis
            </Button>
          </DialogFooter>
        </form>
      </Form>
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileUp /> Analizador Forense de Documentos
          </DialogTitle>
          <DialogDescription>
            Carga un documento para que nuestra IA realice un análisis de autenticidad basado en su estructura y contenido.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">{renderContent()}</div>
        {analysisResult && (
             <DialogFooter>
                 <Button variant="ghost" onClick={handleClose}>Cerrar</Button>
                 <Button onClick={handleAddToLocker}>
                    {analysisResult.analysis.isAuthentic ? 'Añadir al Portafolio' : 'Guardar Registro Rechazado'}
                 </Button>
             </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
