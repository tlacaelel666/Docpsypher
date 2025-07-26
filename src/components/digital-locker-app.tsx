
'use client';

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  FileText, ShieldCheck, Clock, Upload, Trash2, BrainCircuit, 
  ScanLine, LogOut, Share2, MoreHorizontal, Calendar, Tag, 
  FileType, RefreshCw, Search, Filter, Download, Eye,
  AlertTriangle, CheckCircle, XCircle, Loader2, Archive,
  Activity, Users, Lock, Unlock, HardDrive, Wifi, WifiOff,
  Bell, Settings, HelpCircle, ChevronDown, ChevronUp, Grid3X3,
  List, SortAsc, SortDesc, Copy, ExternalLink, Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel, DropdownMenuCheckboxItem, DropdownMenuRadioGroup, DropdownMenuRadioItem } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { QuantumFingerprint } from './quantum-fingerprint';
import { DocumentAnalysisDialog } from './document-analysis-dialog';
import { DocumentShareDialog } from './document-share-dialog';
import { DocumentAnalysisResultDialog } from './document-analysis-result-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DocSaferLogo } from './doc-safer-logo';
import { Badge } from './ui/badge';
import type { Document } from '@/types/document';

// Tipos mejorados y extendidos
interface AccessLog {
  id: string;
  entity: string;
  doc: string;
  date: string;
  status: 'Aprobado' | 'Denegado' | 'Pendiente';
  ipAddress?: string;
  location?: string;
  deviceInfo?: string;
  riskLevel?: 'Bajo' | 'Medio' | 'Alto';
}

interface SystemMetrics {
  documentsTotal: number;
  documentsVerified: number;
  documentsPending: number;
  documentsRejected: number;
  storageUsed: number;
  storageTotal: number;
  lastBackup: string;
  securityScore: number;
  activeConnections: number;
}

interface ViewPreferences {
  layout: 'grid' | 'list';
  sortBy: 'name' | 'date' | 'status' | 'type';
  sortOrder: 'asc' | 'desc';
  showPreviews: boolean;
  groupByType: boolean;
}

interface SecuritySettings {
  autoLogout: boolean;
  logoutTime: number;
  requireBiometric: boolean;
  enableNotifications: boolean;
  auditLevel: 'basic' | 'detailed' | 'forensic';
}

// Datos iniciales extendidos
const initialDocuments: Document[] = [
  { 
    id: 'doc-001', 
    name: 'Pasaporte.pdf', 
    type: 'Identificación', 
    date: '2023-10-15', 
    status: 'Verificado', 
    size: 2.4,
    hash: 'a1b2c3d4e5f6',
    analysis: { 
      isAuthentic: true, 
      confidenceScore: 0.98, 
      reasoning: "La estructura del documento, tipografía y sellos coinciden con los patrones esperados para un pasaporte válido. No se detectaron anomalías topológicas significativas.", 
      extractedData: { "Nombre": "Juan Pérez", "Número de Pasaporte": "A123B456C" }, 
      topologicalAnomalies: [],
      processingTime: 1.2,
      aiModel: 'DocSafer AI v2.1'
    } 
  },
  { 
    id: 'doc-002', 
    name: 'Acta_de_Nacimiento.png', 
    type: 'Legal', 
    date: '2023-09-20', 
    status: 'Verificado', 
    size: 1.8,
    hash: 'b2c3d4e5f6g7',
    analysis: { 
      isAuthentic: true, 
      confidenceScore: 0.95, 
      reasoning: "El formato y los datos del acta son consistentes. El sello gubernamental presenta la microimpresión correcta.", 
      extractedData: { "Nombre": "Maria Garcia", "Fecha de Nacimiento": "1990-05-20" }, 
      topologicalAnomalies: [],
      processingTime: 0.8,
      aiModel: 'DocSafer AI v2.1'
    } 
  },
  { 
    id: 'doc-003', 
    name: 'Diploma_Universitario.pdf', 
    type: 'Académico', 
    date: '2023-11-01', 
    status: 'Pendiente', 
    size: 3.2,
    hash: 'c3d4e5f6g7h8',
    analysis: null 
  },
  { 
    id: 'doc-004', 
    name: 'Comprobante_de_Domicilio.jpg', 
    type: 'Servicios', 
    date: '2023-10-28', 
    status: 'Verificado', 
    size: 0.9,
    hash: 'd4e5f6g7h8i9',
    analysis: { 
      isAuthentic: true, 
      confidenceScore: 0.92, 
      reasoning: "Dirección y datos del proveedor de servicios validados. Sin alteraciones visibles en la imagen.", 
      extractedData: { "Dirección": "Calle Falsa 123", "Proveedor": "CFE" }, 
      topologicalAnomalies: [],
      processingTime: 0.6,
      aiModel: 'DocSafer AI v2.1'
    } 
  },
  { 
    id: 'doc-005', 
    name: 'Contrato_Laboral.pdf', 
    type: 'Laboral', 
    date: '2023-11-10', 
    status: 'Verificado', 
    size: 4.1,
    hash: 'e5f6g7h8i9j0',
    analysis: { 
      isAuthentic: true, 
      confidenceScore: 0.99, 
      reasoning: "Todas las cláusulas y firmas son legibles y el formato del contrato es estándar.", 
      extractedData: { "Empresa": "Tech Solutions Inc.", "Puesto": "Desarrollador" }, 
      topologicalAnomalies: [],
      processingTime: 1.5,
      aiModel: 'DocSafer AI v2.1'
    } 
  },
  { 
    id: 'doc-006', 
    name: 'Factura_Fiscal_alterada.xml', 
    type: 'Fiscal', 
    date: '2023-11-12', 
    status: 'Rechazado', 
    size: 0.3,
    hash: 'f6g7h8i9j0k1',
    analysis: { 
      isAuthentic: false, 
      confidenceScore: 0.15, 
      reasoning: "Se detectaron múltiples anomalías graves que sugieren una falsificación. El logo de la empresa está pixelado y el espaciado del texto es irregular, lo que indica posible edición digital. Además, la suma de los montos no coincide con el total.", 
      extractedData: { "RFC Emisor": "XYZ123456ABC", "Monto Total": "1500.00" }, 
      topologicalAnomalies: [
        "Logo de la empresa de baja resolución y con artefactos de compresión.", 
        "Espaciado de línea inconsistente en la sección de descripción de artículos.", 
        "La firma digital parece superpuesta y no integrada en el documento."
      ],
      processingTime: 2.1,
      aiModel: 'DocSafer AI v2.1'
    } 
  },
  { 
    id: 'doc-007', 
    name: 'Certificado_Medico.jpg', 
    type: 'Salud', 
    date: '2023-11-14', 
    status: 'Pendiente', 
    size: 1.5,
    hash: 'g7h8i9j0k1l2',
    analysis: null 
  },
];

const initialAccessLogs: AccessLog[] = [
  { 
    id: 'log-001', 
    entity: 'Servicio de Autenticación Gubernamental', 
    doc: 'Pasaporte.pdf', 
    date: '2023-11-05 10:30', 
    status: 'Aprobado',
    ipAddress: '192.168.1.100',
    location: 'México, CDMX',
    deviceInfo: 'Chrome 118.0',
    riskLevel: 'Bajo'
  },
  { 
    id: 'log-002', 
    entity: 'Universidad Nacional', 
    doc: 'Diploma_Universitario.pdf', 
    date: '2023-11-04 15:00', 
    status: 'Aprobado',
    ipAddress: '10.0.0.50',
    location: 'México, Puebla',
    deviceInfo: 'Firefox 119.0',
    riskLevel: 'Bajo'
  },
  { 
    id: 'log-003', 
    entity: 'Entidad no reconocida', 
    doc: 'Acta_de_Nacimiento.png', 
    date: '2023-11-03 09:15', 
    status: 'Denegado',
    ipAddress: '203.0.113.10',
    location: 'Desconocida',
    deviceInfo: 'Bot/Spider',
    riskLevel: 'Alto'
  },
  {
    id: 'log-004',
    entity: 'Banco Nacional',
    doc: 'Comprobante_de_Domicilio.jpg',
    date: '2023-11-02 14:22',
    status: 'Pendiente',
    ipAddress: '172.16.0.10',
    location: 'México, Guadalajara',
    deviceInfo: 'Safari 17.0',
    riskLevel: 'Medio'
  }
];

export function DigitalLockerApp() {
  // Estados principales
  const [documents, setDocuments] = useState<Document[]>(initialDocuments);
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>(initialAccessLogs);
  const [isQuantumVerified, setIsQuantumVerified] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  
  // Estados de diálogos
  const [isAnalysisDialogOpen, setIsAnalysisDialogOpen] = useState(false);
  const [isResultDialogOpen, setIsResultDialogOpen] = useState(false);
  const [sharingDoc, setSharingDoc] = useState<Document | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  
  // Estados de filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  
  // Estados de preferencias
  const [viewPreferences, setViewPreferences] = useState<ViewPreferences>({
    layout: 'list',
    sortBy: 'date',
    sortOrder: 'desc',
    showPreviews: true,
    groupByType: false
  });
  
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    autoLogout: true,
    logoutTime: 30,
    requireBiometric: false,
    enableNotifications: true,
    auditLevel: 'detailed'
  });
  
  // Estados de UI
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(new Set());
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  
  // Ref para auto-logout
  const logoutTimerRef = useRef<NodeJS.Timeout>();

  // Métricas del sistema
  const systemMetrics = useMemo<SystemMetrics>(() => {
    const total = documents.length;
    const verified = documents.filter(d => d.status === 'Verificado').length;
    const pending = documents.filter(d => d.status === 'Pendiente').length;
    const rejected = documents.filter(d => d.status === 'Rechazado').length;
    const storageUsed = documents.reduce((acc, doc) => acc + (doc.size || 0), 0);
    
    return {
      documentsTotal: total,
      documentsVerified: verified,
      documentsPending: pending,
      documentsRejected: rejected,
      storageUsed,
      storageTotal: 100, // 100 MB
      lastBackup: '2023-11-15 02:00',
      securityScore: Math.round((verified / total) * 100),
      activeConnections: Math.floor(Math.random() * 5) + 1
    };
  }, [documents]);

  // Documentos filtrados y ordenados
  const filteredAndSortedDocuments = useMemo(() => {
    let filtered = documents.filter(doc => {
      const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (doc.type && doc.type.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
      const matchesType = typeFilter === 'all' || doc.type === typeFilter;
      
      return matchesSearch && matchesStatus && matchesType;
    });

    // Ordenamiento
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (viewPreferences.sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'date':
          comparison = new Date(b.date).getTime() - new Date(a.date).getTime();
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
      }
      
      return viewPreferences.sortOrder === 'desc' ? comparison : -comparison;
    });

    return filtered;
  }, [documents, searchTerm, statusFilter, typeFilter, viewPreferences]);

  // Grupos de documentos por tipo
  const documentGroups = useMemo(() => {
    if (!viewPreferences.groupByType) return { 'Todos': filteredAndSortedDocuments };
    
    return filteredAndSortedDocuments.reduce((groups, doc) => {
      const type = doc.type;
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push(doc);
      return groups;
    }, {} as Record<string, Document[]>);
  }, [filteredAndSortedDocuments, viewPreferences.groupByType]);

  // Efectos
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Auto-logout timer
  useEffect(() => {
    if (securitySettings.autoLogout) {
      const resetTimer = () => {
        if (logoutTimerRef.current) {
          clearTimeout(logoutTimerRef.current);
        }
        
        logoutTimerRef.current = setTimeout(() => {
          // Aquí implementarías el logout automático
          console.log('Auto-logout triggered');
        }, securitySettings.logoutTime * 60 * 1000);
      };

      const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
      
      events.forEach(event => {
        document.addEventListener(event, resetTimer, true);
      });

      resetTimer();

      return () => {
        events.forEach(event => {
          document.removeEventListener(event, resetTimer, true);
        });
        if (logoutTimerRef.current) {
          clearTimeout(logoutTimerRef.current);
        }
      };
    }
  }, [securitySettings.autoLogout, securitySettings.logoutTime]);

  // Handlers mejorados
  const handleDelete = useCallback(async (docId: string) => {
    setIsLoading(true);
    try {
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setDocuments(prev => prev.filter(doc => doc.id !== docId));
      setSelectedDocuments(prev => {
        const newSet = new Set(prev);
        newSet.delete(docId);
        return newSet;
      });
      
      // Agregar log de auditoría
      const newLog: AccessLog = {
        id: `log-${Date.now()}`,
        entity: 'Usuario (Eliminación)',
        doc: documents.find(d => d.id === docId)?.name || 'Documento desconocido',
        date: new Date().toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' }),
        status: 'Aprobado',
        riskLevel: 'Bajo'
      };
      setAccessLogs(prev => [newLog, ...prev]);
    } catch (error) {
      console.error('Error deleting document:', error);
    } finally {
      setIsLoading(false);
    }
  }, [documents]);

  const handleBulkDelete = useCallback(async () => {
    if (selectedDocuments.size === 0) return;
    
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setDocuments(prev => prev.filter(doc => !selectedDocuments.has(doc.id)));
      setSelectedDocuments(new Set());
      
      const newLog: AccessLog = {
        id: `log-${Date.now()}`,
        entity: 'Usuario (Eliminación múltiple)',
        doc: `${selectedDocuments.size} documentos`,
        date: new Date().toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' }),
        status: 'Aprobado',
        riskLevel: 'Medio'
      };
      setAccessLogs(prev => [newLog, ...prev]);
    } catch (error) {
      console.error('Error in bulk delete:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedDocuments]);

  const handleDocumentVerified = useCallback((newDocument: Document) => {
    setDocuments(prev => [newDocument, ...prev.filter(d => d.id !== newDocument.id)]);
    
    const newLog: AccessLog = {
      id: `log-${Date.now()}`,
      entity: 'Sistema de Verificación',
      doc: newDocument.name,
      date: new Date().toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' }),
      status: 'Aprobado',
      riskLevel: 'Bajo'
    };
    setAccessLogs(prev => [newLog, ...prev]);
  }, []);

  const handleShareDocument = useCallback((doc: Document) => {
    setSharingDoc(doc);
    const newLog: AccessLog = {
      id: `log-${Date.now()}`,
      entity: 'Usuario (Generación de SKU)',
      doc: doc.name,
      date: new Date().toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' }),
      status: 'Aprobado',
      riskLevel: 'Bajo'
    };
    setAccessLogs(prev => [newLog, ...prev]);
  }, []);

  const handleShowAnalysis = useCallback((doc: Document) => {
    setSelectedDoc(doc);
    setIsResultDialogOpen(true);
  }, []);

  const handleRefreshAudit = useCallback(async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const pendingDoc = documents.find(d => d.status === 'Pendiente');
      const newLog: AccessLog = {
        id: `log-${Date.now()}`,
        entity: 'Servicio de Verificación Automática',
        doc: pendingDoc?.name || "Certificado_Medico.jpg",
        date: new Date().toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' }),
        status: 'Aprobado',
        riskLevel: 'Bajo'
      };
      setAccessLogs(prev => [newLog, ...prev]);

      if (pendingDoc) {
        setDocuments(docs => docs.map(d => 
          d.id === pendingDoc.id ? { ...d, status: 'Verificado' as const } : d
        ));
      }
    } catch (error) {
      console.error('Error refreshing audit:', error);
    } finally {
      setIsLoading(false);
    }
  }, [documents]);

  const handleToggleDocumentSelection = useCallback((docId: string) => {
    setSelectedDocuments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(docId)) {
        newSet.delete(docId);
      } else {
        newSet.add(docId);
      }
      return newSet;
    });
  }, []);

  const handleSelectAllDocuments = useCallback(() => {
    if (selectedDocuments.size === filteredAndSortedDocuments.length) {
      setSelectedDocuments(new Set());
    } else {
      setSelectedDocuments(new Set(filteredAndSortedDocuments.map(d => d.id)));
    }
  }, [selectedDocuments.size, filteredAndSortedDocuments]);

  // Funciones auxiliares
  const getStatusClass = useCallback((status: Document['status']) => {
    switch (status) {
      case 'Verificado': return 'bg-green-500';
      case 'Pendiente': return 'bg-yellow-500';
      case 'Rechazado': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  }, []);

  const getStatusIcon = useCallback((status: Document['status']) => {
    switch (status) {
      case 'Verificado': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'Pendiente': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'Rechazado': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  }, []);

  const getRiskLevelColor = useCallback((level?: string) => {
    switch (level) {
      case 'Bajo': return 'text-green-600';
      case 'Medio': return 'text-yellow-600';
      case 'Alto': return 'text-red-600';
      default: return 'text-gray-600';
    }
  }, []);

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background text-foreground">
        {/* Header mejorado */}
        <header className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <DocSaferLogo className="h-8 w-8" />
                <div>
                  <h1 className="text-xl font-semibold">DocSafer Locker</h1>
                  <p className="text-sm text-muted-foreground">
                    Almacenamiento seguro de documentos
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Indicador de conexión */}
                <div className="flex items-center gap-2">
                  {isOnline ? (
                    <Wifi className="h-4 w-4 text-green-500" />
                  ) : (
                    <WifiOff className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-sm">
                    {isOnline ? 'En línea' : 'Sin conexión'}
                  </span>
                </div>
                
                {/* Verificación cuántica */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-primary/10">
                      <QuantumFingerprint 
                        active={isQuantumVerified}
                        showTrails={isQuantumVerified}
                        showConnections={isQuantumVerified}
                        pulseEffect={isQuantumVerified}
                        className="h-6 w-6"
                      />
                      <span className="text-xs font-medium">
                        {isQuantumVerified ? 'Verificado' : 'No verificado'}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Estado de verificación cuántica del sistema</p>
                  </TooltipContent>
                </Tooltip>
                
                {/* Configuración */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Configuración</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Bell className="mr-2 h-4 w-4" />
                      Notificaciones
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Lock className="mr-2 h-4 w-4" />
                      Seguridad
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <HelpCircle className="mr-2 h-4 w-4" />
                      Ayuda
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      Cerrar sesión
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-6">
          <Tabs defaultValue="documents" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="documents" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Mis Documentos
              </TabsTrigger>
              <TabsTrigger value="audit" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Auditoría de Accesos
              </TabsTrigger>
              <TabsTrigger value="metrics" className="flex items-center gap-2">
                <Archive className="h-4 w-4" />
                Métricas del Sistema
              </TabsTrigger>
            </TabsList>

            {/* Pestaña de Documentos */}
            <TabsContent value="documents" className="space-y-6">
               <Card>
                <CardHeader>
                  <CardTitle>Mis Documentos</CardTitle>
                  <CardDescription>
                    Gestiona y verifica tus documentos importantes.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-4">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Buscar documentos..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <Button
                      onClick={() => setIsAnalysisDialogOpen(true)}
                      className="bg-primary hover:bg-primary/90"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Subir y Analizar Documento
                    </Button>
                  </div>

                  <div className="overflow-auto">
                    <table className="min-w-full divide-y divide-border">
                        <thead className="bg-muted/50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Documento
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Categoría
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Fecha
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Estado
                                </th>
                                <th scope="col" className="relative px-6 py-3">
                                    <span className="sr-only">Acciones</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-background divide-y divide-border">
                            {filteredAndSortedDocuments.map((doc) => (
                                <tr key={doc.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="text-sm font-medium text-foreground">{doc.name}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-muted-foreground">{doc.type}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-muted-foreground">{doc.date}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <Tooltip>
                                        <TooltipTrigger>
                                          <div className={cn("h-2.5 w-2.5 rounded-full", getStatusClass(doc.status))} />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>{doc.status}</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <MoreHorizontal className="h-4 w-4" />
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="start">
                                          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                           <DropdownMenuItem 
                                            onClick={() => handleShareDocument(doc)}
                                            disabled={doc.status !== 'Verificado'}
                                          >
                                            <Share2 className="mr-2 h-4 w-4" />
                                            Compartir (SKU)
                                          </DropdownMenuItem>
                                          <DropdownMenuItem 
                                            onClick={() => handleShowAnalysis(doc)}
                                            disabled={!doc.analysis}
                                          >
                                            <ScanLine className="mr-2 h-4 w-4" />
                                            Ver Análisis Forense
                                          </DropdownMenuItem>
                                          <DropdownMenuSeparator />
                                          <DropdownMenuItem 
                                            onClick={() => handleDelete(doc.id)}
                                            className="text-destructive focus:text-destructive"
                                          >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Eliminar
                                          </DropdownMenuItem>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                  </div>
                  {filteredAndSortedDocuments.length === 0 && (
                      <div className="text-center py-10">
                          <p className="text-muted-foreground">No se encontraron documentos.</p>
                      </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Pestaña de Auditoría */}
            <TabsContent value="audit" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Auditoría de Accesos</CardTitle>
                      <CardDescription>
                        Historial de verificaciones y accesos a tus documentos.
                      </CardDescription>
                    </div>
                    <Button onClick={handleRefreshAudit} disabled={isLoading}>
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <RefreshCw className="h-4 w-4 mr-2" />
                      )}
                      Actualizar Auditoría
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-3">
                      {accessLogs.map((log) => (
                        <Card key={log.id} className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <div className={cn(
                                  "h-2 w-2 rounded-full",
                                  log.status === 'Aprobado' ? 'bg-green-500' :
                                  log.status === 'Denegado' ? 'bg-red-500' : 'bg-yellow-500'
                                )} />
                                <span className="font-medium">{log.entity}</span>
                                <Badge variant="outline" className={getRiskLevelColor(log.riskLevel)}>
                                  Riesgo {log.riskLevel}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-1">
                                Solicitud de acceso a: <span className="font-medium text-foreground">{log.doc}</span>
                              </p>
                              <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                                <span><Calendar className="inline h-3 w-3 mr-1" />{log.date}</span>
                                {log.ipAddress && <span><HardDrive className="inline h-3 w-3 mr-1" />{log.ipAddress}</span>}
                                {log.location && <span><Info className="inline h-3 w-3 mr-1" />{log.location}</span>}
                                {log.deviceInfo && <span><ExternalLink className="inline h-3 w-3 mr-1" />{log.deviceInfo}</span>}
                              </div>
                            </div>
                            <Badge variant={
                              log.status === 'Aprobado' ? 'default' :
                              log.status === 'Denegado' ? 'destructive' : 'secondary'
                            } className={cn(log.status === 'Aprobado' && 'bg-green-600')}>
                              {log.status}
                            </Badge>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Pestaña de Métricas */}
            <TabsContent value="metrics" className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold">Métricas del Sistema</h2>
                <p className="text-muted-foreground">
                  Estadísticas y rendimiento del almacenamiento seguro
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total de Documentos
                    </CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{systemMetrics.documentsTotal}</div>
                    <p className="text-xs text-muted-foreground">
                      +2 desde el mes pasado
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Documentos Verificados
                    </CardTitle>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {systemMetrics.documentsVerified}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {systemMetrics.documentsTotal > 0 ? Math.round((systemMetrics.documentsVerified / systemMetrics.documentsTotal) * 100) : 0}% del total
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Pendientes
                    </CardTitle>
                    <Clock className="h-4 w-4 text-yellow-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-yellow-600">
                      {systemMetrics.documentsPending}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      En proceso de verificación
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Puntuación de Seguridad
                    </CardTitle>
                    <ShieldCheck className="h-4 w-4 text-blue-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">
                      {systemMetrics.securityScore}%
                    </div>
                    <Progress value={systemMetrics.securityScore} className="mt-2" />
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <HardDrive className="h-5 w-5" />
                      Almacenamiento
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span>Usado: {systemMetrics.storageUsed.toFixed(1)} MB</span>
                      <span>Total: {systemMetrics.storageTotal} MB</span>
                    </div>
                    <Progress 
                      value={(systemMetrics.storageUsed / systemMetrics.storageTotal) * 100} 
                      className="h-2"
                    />
                    <div className="text-xs text-muted-foreground">
                      Última copia de seguridad: {systemMetrics.lastBackup}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Actividad del Sistema
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Conexiones activas</span>
                      <span className="font-bold">{systemMetrics.activeConnections}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Accesos hoy</span>
                      <span className="font-bold">{accessLogs.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Estado del sistema</span>
                      <Badge variant="default" className="bg-green-500">
                        Operativo
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {systemMetrics.documentsRejected > 0 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Hay {systemMetrics.documentsRejected} documento{systemMetrics.documentsRejected !== 1 ? 's' : ''} 
                    {' '}rechazado{systemMetrics.documentsRejected !== 1 ? 's' : ''} que requiere{systemMetrics.documentsRejected !== 1 ? 'n' : ''} atención.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Diálogos */}
        <DocumentAnalysisDialog
          open={isAnalysisDialogOpen}
          onOpenChange={setIsAnalysisDialogOpen}
          onDocumentVerified={handleDocumentVerified}
        />

        <DocumentShareDialog
          document={sharingDoc}
          onOpenChange={setSharingDoc}
        />

        <DocumentAnalysisResultDialog
          document={selectedDoc}
          open={isResultDialogOpen}
          onOpenChange={() => {
            setIsResultDialogOpen(false);
            setSelectedDoc(null);
          }}
        />
      </div>
    </TooltipProvider>
  );
}
