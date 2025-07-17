import type { AnalyzeDocumentOutput } from "@/types/document-analysis";

type Analysis = AnalyzeDocumentOutput['analysis'];

export interface Document {
    id: string;
    name: string;
    type: string;
    date: string;
    status: 'Verificado' | 'Pendiente' | 'Rechazado';
    analysis: Analysis | null;
}
