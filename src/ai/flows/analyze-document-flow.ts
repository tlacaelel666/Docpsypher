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
import {
  AnalyzeDocumentInputSchema,
  type AnalyzeDocumentInput,
  AnalyzeDocumentOutputSchema,
  type AnalyzeDocumentOutput,
} from '@/types/document-analysis';

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
