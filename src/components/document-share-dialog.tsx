
'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Document } from '@/types/document';
import { QrCode, ClipboardCopy } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

interface DocumentShareDialogProps {
  document: Document | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DocumentShareDialog({ document, open, onOpenChange }: DocumentShareDialogProps) {
  const [sku, setSku] = useState('');
  const [shareableLink, setShareableLink] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (document) {
      // Generate a simple, non-secure SKU and link for demonstration purposes.
      // In a real app, this would be generated server-side and have a secure, short-lived token.
      const newSku = Math.random().toString(36).substring(2, 10).toUpperCase();
      setSku(newSku);
      setShareableLink(`${window.location.origin}/shared/${document.id}?token=${newSku}`);
    }
  }, [document]);

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copiado al portapapeles',
      description: 'El código se ha copiado correctamente.',
    });
  };

  if (!document) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode /> Compartir Documento
          </DialogTitle>
          <DialogDescription>
            Usa el código QR o el SKU para dar acceso temporal y seguro a tu documento: <strong>{document.name}</strong>.
          </DialogDescription>
        </DialogHeader>
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
        </div>
        <Alert variant="destructive">
            <AlertTitle>¡Advertencia de Seguridad!</AlertTitle>
            <AlertDescription>
                Este código es de un solo uso y expirará en 24 horas. Compártelo únicamente con entidades de confianza.
            </AlertDescription>
        </Alert>
        <DialogFooter>
          <Button type="button" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
