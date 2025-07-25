import type { AnalyzeDocumentOutput } from "@/types/document-analysis";

type Analysis = AnalyzeDocumentOutput['analysis'];

export interface Document {
    size: number;
    hash: ReactNode;
    id: string;
    name: string;
    type: string;
    description?: string; // Nuevo campo opcional para la descripción
    date: string;
    status: 'Verificado' | 'Pendiente' | 'Rechazado';
    analysis: Analysis | null;
}
