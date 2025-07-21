
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FileText, ShieldCheck, Clock, Upload, Trash2, BrainCircuit, ScanLine, LogOut, Share2, MoreHorizontal, Calendar, Tag, FileType } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { QuantumFingerprint } from './quantum-fingerprint';
import { DocumentAnalysisDialog } from './document-analysis-dialog';
import { DocumentShareDialog } from './document-share-dialog';
import type { Document } from '@/types/document';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DocSaferLogo } from './doc-safer-logo';
import { DocumentAnalysisResultDialog } from './document-analysis-result-dialog';

const initialDocuments: Document[] = [
  { id: 'doc-001', name: 'Pasaporte.pdf', type: 'Identificación', date: '2023-10-15', status: 'Verificado', analysis: { isAuthentic: true, confidenceScore: 0.98, reasoning: "La estructura del documento, tipografía y sellos coinciden con los patrones esperados para un pasaporte válido. No se detectaron anomalías topológicas significativas.", extractedData: { "Nombre": "Juan Pérez", "Número de Pasaporte": "A123B456C" }, topologicalAnomalies: [] } },
  { id: 'doc-002', name: 'Acta_de_Nacimiento.png', type: 'Legal', date: '2023-09-20', status: 'Verificado', analysis: { isAuthentic: true, confidenceScore: 0.95, reasoning: "El formato y los datos del acta son consistentes. El sello gubernamental presenta la microimpresión correcta.", extractedData: { "Nombre": "Maria Garcia", "Fecha de Nacimiento": "1990-05-20" }, topologicalAnomalies: [] } },
  { id: 'doc-003', name: 'Diploma_Universitario.pdf', type: 'Académico', date: '2023-11-01', status: 'Pendiente', analysis: null },
  { id: 'doc-004', name: 'Comprobante_de_Domicilio.jpg', type: 'Servicios', date: '2023-10-28', status: 'Verificado', analysis: { isAuthentic: true, confidenceScore: 0.92, reasoning: "Dirección y datos del proveedor de servicios validados. Sin alteraciones visibles en la imagen.", extractedData: { "Dirección": "Calle Falsa 123", "Proveedor": "CFE" }, topologicalAnomalies: [] } },
  { id: 'doc-005', name: 'Contrato_Laboral.pdf', type: 'Laboral', date: '2023-11-10', status: 'Verificado', analysis: { isAuthentic: true, confidenceScore: 0.99, reasoning: "Todas las cláusulas y firmas son legibles y el formato del contrato es estándar.", extractedData: { "Empresa": "Tech Solutions Inc.", "Puesto": "Desarrollador" }, topologicalAnomalies: [] } },
  { id: 'doc-006', name: 'Factura_Fiscal_alterada.xml', type: 'Fiscal', date: '2023-11-12', status: 'Rechazado', analysis: { isAuthentic: false, confidenceScore: 0.15, reasoning: "Se detectaron múltiples anomalías graves que sugieren una falsificación. El logo de la empresa está pixelado y el espaciado del texto es irregular, lo que indica posible edición digital. Además, la suma de los montos no coincide con el total.", extractedData: { "RFC Emisor": "XYZ123456ABC", "Monto Total": "1500.00" }, topologicalAnomalies: ["Logo de la empresa de baja resolución y con artefactos de compresión.", "Espaciado de línea inconsistente en la sección de descripción de artículos.", "La firma digital parece superpuesta y no integrada en el documento."] } },
  { id: 'doc-007', name: 'Certificado_Medico.jpg', type: 'Salud', date: '2023-11-14', status: 'Pendiente', analysis: null },
];

const initialAccessLogs = [
  { id: 'log-001', entity: 'Servicio de Autenticación Gubernamental', doc: 'Pasaporte.pdf', date: '2023-11-05 10:30', status: 'Aprobado' },
  { id: 'log-002', entity: 'Universidad Nacional', doc: 'Diploma_Universitario.pdf', date: '2023-11-04 15:00', status: 'Aprobado' },
  { id: 'log-003', entity: 'Entidad no reconocida', doc: 'Acta_de_Nacimiento.png', date: '2023-11-03 09:15', status: 'Denegado' },
];

interface AccessLog {
    id: string;
    entity: string;
    doc: string;
    date: string;
    status: 'Aprobado' | 'Denegado';
}


export function DigitalLockerApp() {
  const [documents, setDocuments] = useState<Document[]>(initialDocuments);
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>(initialAccessLogs);
  const [isQuantumVerified, setIsQuantumVerified] = useState(true);
  const [isAnalysisDialogOpen, setIsAnalysisDialogOpen] = useState(false);
  const [isResultDialogOpen, setIsResultDialogOpen] = useState(false);
  const [sharingDoc, setSharingDoc] = useState<Document | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);

  const handleDelete = (docId: string) => {
    setDocuments(documents.filter(doc => doc.id !== docId));
  }
  
  const handleDocumentVerified = (newDocument: Document) => {
    setDocuments(prev => [newDocument, ...prev.filter(d => d.id !== newDocument.id)]);
  };

  const handleShareDocument = (doc: Document) => {
    setSharingDoc(doc);
    const newLog: AccessLog = {
        id: `log-${Date.now()}`,
        entity: 'Tú (generación de SKU)',
        doc: doc.name,
        date: new Date().toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' }),
        status: 'Aprobado'
    };
    setAccessLogs(prevLogs => [newLog, ...prevLogs]);
  };

  const handleShowAnalysis = (doc: Document) => {
    setSelectedDoc(doc);
    setIsResultDialogOpen(true);
  };

  const getStatusClass = (status: Document['status']) => {
    switch (status) {
        case 'Verificado': return 'bg-green-500';
        case 'Pendiente': return 'bg-yellow-500';
        case 'Rechazado': return 'bg-red-500';
        default: return 'bg-gray-500';
    }
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background text-foreground">
        <main className="container mx-auto p-4 md:p-8">
          <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <DocSaferLogo className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold font-headline tracking-tighter">
                DocSafer
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={() => setIsAnalysisDialogOpen(true)}>
                <Upload className="mr-2 h-4 w-4" />
                Subir y Analizar Documento
              </Button>
               <Tooltip>
                <TooltipTrigger asChild>
                   <Button variant="outline" size="icon" asChild>
                      <Link href="/">
                        <LogOut className="h-4 w-4" />
                      </Link>
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Cerrar Sesión</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </header>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <Card className="shadow-lg animate-fadeIn border-primary/20">
                <CardHeader>
                  <CardTitle className="font-headline text-2xl flex items-center gap-2"><FileText /> Mis Documentos</CardTitle>
                  <CardDescription>Tu colección segura de documentos. Todos los archivos están encriptados y verificados.</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px] w-full">
                    <div className="overflow-x-auto">
                      <div className="space-y-2 p-1 min-w-[400px]">
                        {documents.map((doc) => (
                          <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                            <p className="font-medium truncate pr-4">{doc.name}</p>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Más acciones para {doc.name}</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="start">
                                <DropdownMenuLabel>Información</DropdownMenuLabel>
                                 <DropdownMenuItem disabled className="opacity-100">
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="flex items-center">
                                        <div className={cn("h-3 w-3 rounded-full mr-2", getStatusClass(doc.status))} />
                                        <span>Estado: {doc.status}</span>
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>{doc.status}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                 </DropdownMenuItem>
                                 <DropdownMenuItem disabled className="opacity-100">
                                      <Tag className="mr-2 h-4 w-4" />
                                      <span>Categoría: {doc.type}</span>
                                 </DropdownMenuItem>
                                  {doc.description && (
                                     <DropdownMenuItem disabled className="opacity-100">
                                          <FileType className="mr-2 h-4 w-4" />
                                          <span>Desc: {doc.description}</span>
                                     </DropdownMenuItem>
                                  )}
                                 <DropdownMenuItem disabled className="opacity-100">
                                      <Calendar className="mr-2 h-4 w-4" />
                                      <span>Subido: {doc.date}</span>
                                 </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  disabled={doc.status !== 'Verificado'} 
                                  onClick={() => handleShareDocument(doc)}
                                >
                                  <Share2 className="mr-2 h-4 w-4" />
                                  <span>Compartir (SKU/QR)</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  disabled={!doc.analysis}
                                  onClick={() => doc.analysis && handleShowAnalysis(doc)}
                                >
                                  <ScanLine className="mr-2 h-4 w-4" />
                                  <span>Ver Análisis Forense</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  className="text-destructive focus:text-destructive"
                                  onClick={() => handleDelete(doc.id)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  <span>Eliminar</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        ))}
                      </div>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-1 space-y-8">
              <Card className="shadow-lg animate-fadeIn border-primary/20">
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

              <Card className="shadow-lg animate-fadeIn border-primary/20">
                <CardHeader>
                  <CardTitle className="font-headline text-2xl flex items-center gap-2"><Clock /> Auditoría de Accesos</CardTitle>
                  <CardDescription>Accesos recientes auditados a tus documentos.</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    {accessLogs.map(log => (
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
        <DocumentAnalysisDialog 
          open={isAnalysisDialogOpen}
          onOpenChange={setIsAnalysisDialogOpen}
          onDocumentVerified={handleDocumentVerified}
        />
        <DocumentShareDialog 
          document={sharingDoc}
          open={!!sharingDoc}
          onOpenChange={(isOpen) => !isOpen && setSharingDoc(null)}
        />
        <DocumentAnalysisResultDialog
            document={selectedDoc}
            open={isResultDialogOpen}
            onOpenChange={setIsResultDialogOpen}
        />
      </div>
    </TooltipProvider>
  );
}
