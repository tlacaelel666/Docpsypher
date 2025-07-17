import { z } from 'zod';

// Esquema de entrada para el flujo de análisis de documentos
export const AnalyzeDocumentInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "La imagen del documento a analizar, como un data URI que debe incluir un tipo MIME y usar codificación Base64. Formato esperado: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  documentType: z
    .string()
    .describe('El tipo de documento que se espera que sea (ej. "Pasaporte", "Acta de Nacimiento").'),
});
export type AnalyzeDocumentInput = z.infer<typeof AnalyzeDocumentInputSchema>;


// Esquema de salida para el flujo de análisis de documentos
export const AnalyzeDocumentOutputSchema = z.object({
  analysis: z.object({
    isAuthentic: z
      .boolean()
      .describe('Determina si el documento es considerado auténtico (true) o no (false).'),
    confidenceScore: z
      .number()
      .min(0)
      .max(1)
      .describe(
        'La confianza en la determinación de autenticidad, de 0.0 a 1.0, simulando una probabilidad bayesiana.'
      ),
    reasoning: z
      .string()
      .describe('Una explicación detallada del porqué se llegó a la conclusión de autenticidad.'),
    extractedData: z
      .record(z.string(), z.any())
      .describe('Datos clave extraídos del documento en formato de pares clave-valor.'),
    topologicalAnomalies: z
      .array(z.string())
      .describe(
        'Lista de anomalías estructurales o de patrones detectadas, inspiradas en un análisis topológico.'
      ),
  }),
});
export type AnalyzeDocumentOutput = z.infer<typeof AnalyzeDocumentOutputSchema>;
