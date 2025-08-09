
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FileText, ShieldCheck, Clock, Upload, Trash2, BrainCircuit, 
  ScanLine, LogOut, Share2, MoreHorizontal, Calendar, Tag, 
  FileType, RefreshCw, Search, Filter, Download, Eye,
  AlertTriangle, CheckCircle, XCircle, Loader2, Archive,
  Activity, Users, Lock, Unlock, HardDrive, Wifi, WifiOff,
  Bell, Settings, HelpCircle, ChevronDown, ChevronUp, Grid3X3,
  List, SortAsc, SortDesc, Copy, ExternalLink, Info, Vault, QrCode, KeyRound, UserCheck, PlusCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DocSaferLogo } from './doc-safer-logo';
import { Badge } from './ui/badge';
import { DataItem } from '@/types/document';
import { CreateAccessDialog } from './create-access-dialog';
import { AddDataDialog } from './add-data-dialog';
import { cn } from '@/lib/utils';

interface AccessLog {
  id: string;
  entity: string;
  dataRequested: string[];
  date: string;
  status: 'Concedido' | 'Expirado' | 'Revocado';
  ipAddress?: string;
}

const initialDataItems: DataItem[] = [];

const initialAccessLogs: AccessLog[] = [];

export function DataVaultApp() {
  const router = useRouter();
  const [dataItems, setDataItems] = useState<DataItem[]>(initialDataItems);
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>(initialAccessLogs);
  const [isAccessDialogOpen, setIsAccessDialogOpen] = useState(false);
  const [isAddDataDialogOpen, setIsAddDataDialogOpen] = useState(false);

  const handleCreateAccess = () => {
    setIsAccessDialogOpen(true);
  };
  
  const handleAccessCreated = (entity: string, requestedData: string[]) => {
    const newLog: AccessLog = {
      id: `log-${Date.now()}`,
      entity: entity,
      dataRequested: requestedData,
      date: new Date().toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' }),
      status: 'Concedido',
    };
    setAccessLogs(prev => [newLog, ...prev]);
  };

  const handleDataAdded = (newData: Omit<DataItem, 'id'>) => {
    const newId = `data-${Date.now()}`;
    setDataItems(prev => [...prev, { ...newData, id: newId }]);
  };

  const handleLogout = () => {
    router.push('/login');
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background text-foreground">
        <header className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <DocSaferLogo className="h-8 w-8" />
                <div>
                  <h1 className="text-xl font-semibold">DocSafer Vault</h1>
                  <p className="text-sm text-muted-foreground">
                    Tu bóveda de datos personales
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Configuración</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
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
          <Tabs defaultValue="vault" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="vault" className="flex items-center gap-2">
                <Vault className="h-4 w-4" />
                Mi Bóveda
              </TabsTrigger>
              <TabsTrigger value="audit" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Auditoría de Accesos
              </TabsTrigger>
            </TabsList>

            <TabsContent value="vault" className="space-y-6">
               <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Mis Datos Personales</CardTitle>
                      <CardDescription>
                        Gestiona tu información y crea accesos temporales seguros.
                      </CardDescription>
                    </div>
                    <Button onClick={handleCreateAccess} className="bg-primary hover:bg-primary/90">
                      <KeyRound className="h-4 w-4 mr-2" />
                      Crear Acceso Temporal
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-auto">
                    <table className="min-w-full divide-y divide-border">
                        <thead className="bg-muted/50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Tipo de Dato
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Valor
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Descripción
                                </th>
                                <th scope="col" className="relative px-6 py-3">
                                    <span className="sr-only">Acciones</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-background divide-y divide-border">
                            {dataItems.length > 0 ? dataItems.map((item) => (
                                <tr key={item.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="text-sm font-medium text-foreground">{item.type}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-muted-foreground font-mono">{'*'.repeat(item.value.length - 4) + item.value.slice(-4)}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-muted-foreground">{item.details}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                      <Button variant="ghost" size="sm">Editar</Button>
                                    </td>
                                </tr>
                            )) : (
                              <tr>
                                <td colSpan={4} className="px-6 py-10 text-center text-muted-foreground">
                                  Tu bóveda está vacía. ¡Añade tu primer dato!
                                </td>
                              </tr>
                            )}
                        </tbody>
                    </table>
                  </div>
                </CardContent>
                 <CardFooter>
                    <Button variant="outline" onClick={() => setIsAddDataDialogOpen(true)}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Añadir nuevo dato
                    </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="audit" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Auditoría de Accesos</CardTitle>
                  <CardDescription>
                    Historial de cuándo y quién ha accedido a tus datos.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-3">
                      {accessLogs.length > 0 ? accessLogs.map((log) => (
                        <Card key={log.id} className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-medium">{log.entity}</span>
                              </div>
                              <p className="text-sm text-muted-foreground mb-1">
                                Datos solicitados: <span className="font-medium text-foreground">{log.dataRequested.join(', ')}</span>
                              </p>
                              <div className="text-xs text-muted-foreground">
                                <Calendar className="inline h-3 w-3 mr-1" />{log.date}
                              </div>
                            </div>
                            <Badge variant={
                              log.status === 'Concedido' ? 'default' : 'destructive'
                            } className={cn(log.status === 'Concedido' && 'bg-green-600')}>
                              {log.status}
                            </Badge>
                          </div>
                        </Card>
                      )) : (
                        <div className="px-6 py-10 text-center text-muted-foreground">
                          No hay registros de auditoría todavía.
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <CreateAccessDialog
            open={isAccessDialogOpen}
            onOpenChange={setIsAccessDialogOpen}
            availableData={dataItems}
            onAccessCreated={handleAccessCreated}
        />
        <AddDataDialog
          open={isAddDataDialogOpen}
          onOpenChange={setIsAddDataDialogOpen}
          onDataAdded={handleDataAdded}
        />
      </div>
    </TooltipProvider>
  );
}
