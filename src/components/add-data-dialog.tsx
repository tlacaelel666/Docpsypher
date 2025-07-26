
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { DataItem } from '@/types/document';
import { PlusCircle } from 'lucide-react';

interface AddDataDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDataAdded: (data: Omit<DataItem, 'id'>) => void;
}

export function AddDataDialog({ open, onOpenChange, onDataAdded }: AddDataDialogProps) {
  const [type, setType] = useState('');
  const [value, setValue] = useState('');
  const [details, setDetails] = useState('');
  const { toast } = useToast();

  const handleSave = () => {
    if (!type || !value || !details) {
      toast({
        title: "Campos incompletos",
        description: "Por favor, completa todos los campos para añadir el nuevo dato.",
        variant: "destructive",
      });
      return;
    }

    onDataAdded({ type, value, details });
    toast({
      title: "Dato añadido",
      description: `El dato "${type}" se ha añadido a tu bóveda.`,
    });
    handleClose();
  };
  
  const handleClose = () => {
    onOpenChange(false);
    // Reset state after a short delay
    setTimeout(() => {
        setType('');
        setValue('');
        setDetails('');
    }, 300);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PlusCircle /> Añadir Nuevo Dato a la Bóveda
          </DialogTitle>
          <DialogDescription>
            Introduce la información para el nuevo dato que quieres almacenar de forma segura.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
            <div className="space-y-2">
                <Label htmlFor="type">Tipo de Dato</Label>
                <Input 
                    id="type" 
                    placeholder="Ej. INE, Cédula Profesional" 
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="value">Valor</Label>
                <Input 
                    id="value" 
                    placeholder="Ej. 1234567890123" 
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="details">Descripción</Label>
                <Input 
                    id="details" 
                    placeholder="Ej. Número de identificación oficial" 
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                />
            </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleSave}>Guardar Dato</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
