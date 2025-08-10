
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { DataItem } from '@/types/document';
import { FilePenLine, Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';

interface EditDataDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemToEdit: DataItem | null;
  onDataUpdated: (data: DataItem) => void;
  onDataDeleted: (id: string) => void;
}

export function EditDataDialog({ open, onOpenChange, itemToEdit, onDataUpdated, onDataDeleted }: EditDataDialogProps) {
  const [type, setType] = useState('');
  const [value, setValue] = useState('');
  const [details, setDetails] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (itemToEdit) {
      setType(itemToEdit.type);
      setValue(itemToEdit.value);
      setDetails(itemToEdit.details);
    }
  }, [itemToEdit]);

  const handleSave = () => {
    if (!itemToEdit) return;

    if (!type || !value || !details) {
      toast({
        title: "Campos incompletos",
        description: "Por favor, completa todos los campos para guardar los cambios.",
        variant: "destructive",
      });
      return;
    }

    onDataUpdated({ ...itemToEdit, type, value, details });
    toast({
      title: "Dato actualizado",
      description: `El dato "${type}" se ha actualizado correctamente.`,
    });
    handleClose();
  };

  const handleDelete = () => {
    if (!itemToEdit) return;
    onDataDeleted(itemToEdit.id);
    toast({
        title: "Dato eliminado",
        description: `El dato "${itemToEdit.type}" ha sido eliminado de tu bóveda.`,
        variant: "destructive"
    })
    handleClose();
  }
  
  const handleClose = () => {
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FilePenLine /> Editar Dato de la Bóveda
          </DialogTitle>
          <DialogDescription>
            Modifica la información del dato seleccionado o elimínalo.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
            <div className="space-y-2">
                <Label htmlFor="edit-type">Tipo de Dato</Label>
                <Input 
                    id="edit-type"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="edit-value">Valor</Label>
                <Input 
                    id="edit-value" 
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="edit-details">Descripción</Label>
                <Input 
                    id="edit-details"
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                />
            </div>
        </div>
        <DialogFooter className="justify-between">
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta acción no se puede deshacer. Esto eliminará permanentemente
                        el dato de tu bóveda.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>Continuar</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <div className='flex gap-2'>
              <Button variant="ghost" onClick={handleClose}>Cancelar</Button>
              <Button onClick={handleSave}>Guardar Cambios</Button>
            </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
