'use server';
/**
 * @fileOverview Flujo de IA para el análisis forense de documentos.
 *
 * Este flujo utiliza un modelo de IA para analizar la imagen de un documento,
 * evaluando su autenticidad basándose en un conjunto de instrucciones inspiradas
 * en el análisis topológico de datos, la lógica bayesiana y la detección de anomalías.
 *
 * - analyzeDocument - Función exportada que invoca el flujo de Genkit.
 * - AnalyzeDocumentInput - El tipo de entrada para la función analyzeDocument.
 * - AnalyzeDocumentOutput - El tipo de retorno para la función analyzeDocument.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

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


// Función exportada que los componentes de React pueden llamar
export async function analyzeDocument(
  input: AnalyzeDocumentInput
): Promise<AnalyzeDocumentOutput> {
  return analyzeDocumentFlow(input);
}


// Definición del Prompt de Genkit
const analyzeDocumentPrompt = ai.definePrompt({
  name: 'analyzeDocumentPrompt',
  input: {schema: AnalyzeDocumentInputSchema},
  output: {schema: AnalyzeDocumentOutputSchema},
  prompt: `Actúa como un sistema experto en análisis forense de documentos digitales. Tu misión es evaluar la autenticidad de un documento basándote en un protocolo inspirado en el análisis topológico de datos, la inferencia bayesiana y la detección de anomalías de Neumann. No puedes mencionar estos métodos explícitamente, pero debes aplicar su lógica.

  **Protocolo de Análisis:**

  1.  **Análisis Estructural y Topológico (Inspirado en Vietoris-Rips):**
      -   Examina la imagen del documento, no como un conjunto de píxeles, sino como una estructura de puntos de datos interconectados.
      -   Busca "agujeros" o "vacíos" en la estructura de la información: logos faltantes o malformados, sellos inconsistentes, alineación incorrecta del texto, tipografías anómalas, espaciado irregular. Estas son tus 'anomalías topológicas'.
      -   Verifica la consistencia global de la plantilla y la distribución de elementos en comparación con el estándar para el '{{documentType}}'.

  2.  **Inferencia de Autenticidad (Inspirado en Inferencia Bayesiana y Distancia de Mahalanobis):**
      -   Comienza con una probabilidad a priori neutral. Cada pieza de evidencia (positiva o negativa) actualizará tu creencia sobre la autenticidad del documento.
      -   Extrae todos los datos clave (nombres, fechas, números de folio, etc.).
      -   Evalúa cada dato extraído como un punto en un espacio multidimensional. ¿Están estos puntos dentro de la distribución esperada para un documento válido? Por ejemplo, ¿un formato de fecha es correcto? ¿Un número de pasaporte tiene la longitud y estructura adecuadas? Desviaciones significativas (alta distancia de Mahalanobis) son fuertes indicadores de falsedad.
      -   Basado en la acumulación de evidencia y la detección de anomalías, calcula un 'confidenceScore' final entre 0.0 (totalmente falso) y 1.0 (totalmente auténtico).

  3.  **Reporte de Hallazgos:**
      -   Establece 'isAuthentic' a 'true' si el 'confidenceScore' es alto y las anomalías son mínimas, y a 'false' en caso contrario.
      -   En 'reasoning', proporciona una explicación clara y concisa de tu veredicto, citando la evidencia más fuerte.
      -   En 'extractedData', devuelve un objeto JSON con toda la información relevante extraída.
      -   En 'topologicalAnomalies', enumera las inconsistencias estructurales o de patrones que encontraste.

  **Análisis del Documento:**

  -   **Tipo de Documento a Verificar:** {{documentType}}
  -   **Imagen del Documento:** {{media url=photoDataUri}}

  Realiza el análisis y proporciona tu respuesta estrictamente en el formato JSON de salida especificado.`,
});


// Definición del Flujo de Genkit
const analyzeDocumentFlow = ai.defineFlow(
  {
    name: 'analyzeDocumentFlow',
    inputSchema: AnalyzeDocumentInputSchema,
    outputSchema: AnalyzeDocumentOutputSchema,
  },
  async (input) => {
    const {output} = await analyzeDocumentPrompt(input);
    if (!output) {
      throw new Error("El modelo de IA no pudo generar un análisis.");
    }
    return output;
  }
);
