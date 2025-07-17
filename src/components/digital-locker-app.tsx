'use client';

import { useState } from 'react';
import { FileText, FolderLock, ShieldCheck, Clock, Upload, Trash2, BrainCircuit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { QuantumFingerprint } from './quantum-fingerprint';

const documentsData = [
  { id: 'doc-001', name: 'Pasaporte.pdf', type: 'Identificación', date: '2023-10-15', status: 'Verificado' },
  { id: 'doc-002', name: 'Acta_de_Nacimiento.png', type: 'Legal', date: '2023-09-20', status: 'Verificado' },
  { id: 'doc-003', name: 'Diploma_Universitario.pdf', type: 'Académico', date: '2023-11-01', status: 'Pendiente' },
  { id: 'doc-004', name: 'Comprobante_de_Domicilio.jpg', type: 'Servicios', date: '2023-10-28', status: 'Verificado' },
];

const accessLogData = [
  { id: 'log-001', entity: 'Servicio de Autenticación Gubernamental', doc: 'Pasaporte.pdf', date: '2023-11-05 10:30', status: 'Aprobado' },
  { id: 'log-002', entity: 'Universidad Nacional', doc: 'Diploma_Universitario.pdf', date: '2023-11-04 15:00', status: 'Aprobado' },
  { id: 'log-003', entity: 'Entidad no reconocida', doc: 'Acta_de_Nacimiento.png', date: '2023-11-03 09:15', status: 'Denegado' },
];


export function DigitalLockerApp() {
  const [documents, setDocuments] = useState(documentsData);
  const [isQuantumVerified, setIsQuantumVerified] = useState(true);

  const handleDelete = (docId: string) => {
    setDocuments(documents.filter(doc => doc.id !== docId));
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background text-foreground">
        <main className="container mx-auto p-4 md:p-8">
          <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <FolderLock className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold font-headline tracking-tighter">
                Portafolio de Seguridad Digital
              </h1>
            </div>
            <Button>
              <Upload className="mr-2 h-4 w-4" />
              Subir Nuevo Documento
            </Button>
          </header>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <Card className="shadow-lg animate-fadeIn">
                <CardHeader>
                  <CardTitle className="font-headline text-2xl flex items-center gap-2"><FileText /> Mis Documentos</CardTitle>
                  <CardDescription>Tu colección segura de documentos digitales. Todos los archivos están encriptados y almacenados de forma segura.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre del Documento</TableHead>
                        <TableHead>Categoría</TableHead>
                        <TableHead>Fecha de Carga</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {documents.map((doc) => (
                        <TableRow key={doc.id}>
                          <TableCell className="font-medium">{doc.name}</TableCell>
                          <TableCell>{doc.type}</TableCell>
                          <TableCell>{doc.date}</TableCell>
                          <TableCell>
                            <Badge variant={doc.status === 'Verificado' ? 'default' : 'secondary'} className={cn(doc.status === 'Verificado' ? 'bg-green-500/80 text-white' : 'bg-yellow-500/80 text-black')}>
                              {doc.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                             <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={() => handleDelete(doc.id)}>
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Eliminar Documento</p>
                              </TooltipContent>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-1 space-y-8">
              <Card className="shadow-lg animate-fadeIn">
                <CardHeader>
                  <CardTitle className="font-headline text-2xl flex items-center gap-2"><ShieldCheck /> Estado de Seguridad</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg">
                      <div className="flex items-center gap-3">
                          <ShieldCheck className="h-5 w-5 text-green-400" />
                          <p>Estado del Sistema</p>
                      </div>
                      <p className="font-semibold text-green-400">Operacional</p>
                  </div>
                   <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <BrainCircuit className="h-5 w-5 text-primary" />
                            <p>Huella Cuántica</p>
                        </div>
                        <p className={cn("font-semibold", isQuantumVerified ? "text-primary" : "text-destructive")}>
                          {isQuantumVerified ? "Verificada" : "Inconsistente"}
                        </p>
                    </div>
                    <QuantumFingerprint active={isQuantumVerified} />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg animate-fadeIn">
                <CardHeader>
                  <CardTitle className="font-headline text-2xl flex items-center gap-2"><Clock /> Auditoría de Accesos</CardTitle>
                  <CardDescription>Accesos recientes auditados a tus documentos.</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    {accessLogData.map(log => (
                      <li key={log.id} className="flex items-start gap-3 text-sm">
                        <div>
                          <Badge variant={log.status === 'Aprobado' ? 'default' : 'destructive'} className={cn(log.status === 'Aprobado' ? 'bg-blue-500/80' : '')}>
                              {log.status}
                          </Badge>
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold">{log.entity}</p>
                          <p className="text-muted-foreground">Accedió a: {log.doc}</p>
                          <p className="text-xs text-muted-foreground">{log.date}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                    <Button variant="outline" className="w-full">Ver Auditoría Completa</Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </TooltipProvider>
  );
}
