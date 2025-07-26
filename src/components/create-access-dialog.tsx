
'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { DataItem } from '@/types/document';
import { QrCode, ClipboardCopy, Check, UserCheck, ShieldCheck } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Checkbox } from './ui/checkbox';
import { cn } from '@/lib/utils';

interface CreateAccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableData: DataItem[];
  onAccessCreated: (entity: string, requestedData: string[]) => void;
}

type Step = 'configure' | 'generate';

export function CreateAccessDialog({ open, onOpenChange, availableData, onAccessCreated }: CreateAccessDialogProps) {
  const [step, setStep] = useState<Step>('configure');
  const [selectedData, setSelectedData] = useState<Set<string>>(new Set());
  const [entityName, setEntityName] = useState('');
  const [sku, setSku] = useState('');
  const [shareableLink, setShareableLink] = useState('');
  const { toast } = useToast();

  const handleCheckboxChange = (id: string) => {
    setSelectedData(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleGenerateCode = () => {
    if (selectedData.size === 0 || !entityName) {
      toast({
        title: "Faltan datos",
        description: "Por favor, especifica para quién es el código y selecciona al menos un dato para compartir.",
        variant: "destructive",
      });
      return;
    }

    const newSku = Math.random().toString(36).substring(2, 10).toUpperCase();
    const dataToShare = Array.from(selectedData);
    const link = `${window.location.origin}/shared/${newSku}?data=${btoa(JSON.stringify(dataToShare))}`;
    
    setSku(newSku);
    setShareableLink(link);
    setStep('generate');
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copiado al portapapeles',
    });
  };

  const handleCloseAndReset = () => {
    if (step === 'generate') {
      onAccessCreated(entityName, Array.from(selectedData).map(id => availableData.find(d => d.id === id)?.type || ''));
    }
    onOpenChange(false);
    // Reset state after a short delay to allow dialog to close smoothly
    setTimeout(() => {
        setStep('configure');
        setSelectedData(new Set());
        setEntityName('');
        setSku('');
        setShareableLink('');
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleCloseAndReset}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck /> Crear Acceso Temporal Seguro
          </DialogTitle>
          <DialogDescription>
            Selecciona qué datos compartir y genera un código de un solo uso.
          </DialogDescription>
        </DialogHeader>

        {step === 'configure' && (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="entityName">¿Para quién es este código?</Label>
              <Input 
                id="entityName" 
                placeholder="Ej. Banco Nacional, Tienda XYZ" 
                value={entityName}
                onChange={(e) => setEntityName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
                <Label>¿Qué datos deseas compartir?</Label>
                <div className="space-y-2 rounded-md border p-4 max-h-60 overflow-y-auto">
                    {availableData.map(item => (
                        <div key={item.id} className="flex items-center space-x-2">
                            <Checkbox 
                                id={`data-${item.id}`}
                                onCheckedChange={() => handleCheckboxChange(item.id)}
                                checked={selectedData.has(item.id)}
                            />
                            <label
                                htmlFor={`data-${item.id}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                {item.type}
                            </label>
                        </div>
                    ))}
                </div>
            </div>
          </div>
        )}
        
        {step === 'generate' && (
            <div className="flex flex-col items-center justify-center gap-6 py-4">
                <div className="p-4 bg-white rounded-lg border">
                    <QRCode value={shareableLink} size={180} />
                </div>
                <div className="w-full space-y-2">
                    <Label htmlFor="sku">SKU de Uso Único</Label>
                    <div className="flex items-center gap-2">
                    <Input id="sku" value={sku} readOnly className="font-mono text-lg" />
                    <Button variant="outline" size="icon" onClick={() => handleCopyToClipboard(sku)}>
                        <ClipboardCopy className="h-4 w-4" />
                    </Button>
                    </div>
                </div>
                <Alert variant="destructive">
                    <AlertTitle>¡Advertencia de Seguridad!</AlertTitle>
                    <AlertDescription>
                        Este código es de un solo uso y expirará en 24 horas. Compártelo únicamente con <strong>{entityName || 'la entidad especificada'}</strong>.
                    </AlertDescription>
                </Alert>
            </div>
        )}

        <DialogFooter>
            {step === 'configure' ? (
                <>
                    <Button variant="ghost" onClick={handleCloseAndReset}>Cancelar</Button>
                    <Button onClick={handleGenerateCode}>Generar Código</Button>
                </>
            ) : (
                <Button onClick={handleCloseAndReset}>
                    <Check className="mr-2 h-4 w-4" />
                    Hecho
                </Button>
            )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
