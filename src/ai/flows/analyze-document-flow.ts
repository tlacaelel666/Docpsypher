'use server';
/**
 * @fileOverview Flujo de IA robusto para el análisis forense de documentos.
 *
 * Este flujo utiliza un modelo de IA para analizar la imagen de un documento,
 * evaluando su autenticidad basándose en un conjunto de instrucciones inspiradas
 * en el análisis topológico de datos, la lógica bayesiana y la detección de anomalías.
 *
 * Mejoras implementadas:
 * - Validación exhaustiva de entrada
 * - Manejo de errores más granular
 * - Retry logic con backoff exponencial
 * - Sanitización de datos
 * - Logging mejorado
 * - Timeouts configurables
 * - Validación de salida
 * - Métricas de rendimiento
 */

import {ai} from '@/ai/genkit';
import {
  type AnalyzeDocumentInput,
  type AnalyzeDocumentOutput,
  AnalyzeDocumentInputSchema,
  AnalyzeDocumentOutputSchema,
} from '@/types/document-analysis';
import errorHandler from '@/lib/error-handler';
import { ErrorType, ErrorSeverity } from '@/types/error-handling';

// Configuración del sistema
const CONFIG = {
  MAX_RETRIES: 3,
  INITIAL_RETRY_DELAY: 1000, // 1 segundo
  MAX_RETRY_DELAY: 10000, // 10 segundos
  TIMEOUT: 30000, // 30 segundos
  MAX_IMAGE_SIZE: 10 * 1024 * 1024, // 10MB
  SUPPORTED_FORMATS: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
  MIN_CONFIDENCE_THRESHOLD: 0.1,
  MAX_CONFIDENCE_THRESHOLD: 1.0,
} as const;

// Tipos para métricas y logs
interface AnalysisMetrics {
  startTime: number;
  endTime?: number;
  duration?: number;
  retryCount: number;
  errors: string[];
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Valida exhaustivamente la entrada del análisis
 */
function validateInput(input: AnalyzeDocumentInput): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    // Validación del esquema base
    const schemaValidation = AnalyzeDocumentInputSchema.safeParse(input);
    if (!schemaValidation.success) {
      errors.push(`Esquema inválido: ${schemaValidation.error.message}`);
      return { isValid: false, errors, warnings };
    }

    // Validación del tipo de documento
    if (!input.documentType || input.documentType.trim().length === 0) {
      errors.push('El tipo de documento no puede estar vacío');
    }

    if (input.documentType && input.documentType.length > 100) {
      warnings.push('El tipo de documento es excesivamente largo');
    }

    // Validación de la imagen
    if (!input.photoDataUri) {
      errors.push('La imagen del documento es requerida');
    } else {
      // Validar formato de Data URI
      const dataUriRegex = /^data:([a-zA-Z0-9][a-zA-Z0-9\/+]*);base64,(.+)$/;
      const match = input.photoDataUri.match(dataUriRegex);
      
      if (!match) {
        errors.push('Formato de imagen inválido. Se requiere un Data URI válido');
      } else {
        const [, mimeType, base64Data] = match;
        
        // Validar tipo MIME
        if (!CONFIG.SUPPORTED_FORMATS.includes(mimeType)) {
          errors.push(`Formato de imagen no soportado: ${mimeType}. Formatos soportados: ${CONFIG.SUPPORTED_FORMATS.join(', ')}`);
        }

        // Validar tamaño de imagen
        try {
          const imageSize = (base64Data.length * 3) / 4; // Aproximación del tamaño decodificado
          if (imageSize > CONFIG.MAX_IMAGE_SIZE) {
            errors.push(`La imagen es demasiado grande (${Math.round(imageSize / 1024 / 1024)}MB). Máximo permitido: ${CONFIG.MAX_IMAGE_SIZE / 1024 / 1024}MB`);
          }
          
          if (imageSize < 1024) { // Menos de 1KB
            warnings.push('La imagen parece ser muy pequeña, esto podría afectar la calidad del análisis');
          }
        } catch (e) {
          warnings.push('No se pudo validar el tamaño de la imagen');
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };

  } catch (error) {
    errors.push(`Error durante la validación: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    return { isValid: false, errors, warnings };
  }
}

/**
 * Sanitiza la entrada para prevenir inyecciones y problemas de seguridad
 */
function sanitizeInput(input: AnalyzeDocumentInput): AnalyzeDocumentInput {
  return {
    documentType: input.documentType?.trim().replace(/[<>\"'&]/g, '').substring(0, 100) || '',
    photoDataUri: input.photoDataUri // Las Data URIs ya están codificadas en base64
  };
}

/**
 * Valida la salida del modelo de IA
 */
function validateOutput(output: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    // Validación del esquema
    const schemaValidation = AnalyzeDocumentOutputSchema.safeParse(output);
    if (!schemaValidation.success) {
      errors.push(`Salida inválida del modelo: ${schemaValidation.error.message}`);
      return { isValid: false, errors, warnings };
    }

    const typedOutput = output as AnalyzeDocumentOutput;

    // Validar rango de confianza
    if (typedOutput.confidenceScore < CONFIG.MIN_CONFIDENCE_THRESHOLD || 
        typedOutput.confidenceScore > CONFIG.MAX_CONFIDENCE_THRESHOLD) {
      errors.push(`Score de confianza fuera de rango: ${typedOutput.confidenceScore}`);
    }

    // Validar coherencia entre isAuthentic y confidenceScore
    if (typedOutput.isAuthentic && typedOutput.confidenceScore < 0.6) {
      warnings.push('Documento marcado como auténtico pero con baja confianza');
    }

    if (!typedOutput.isAuthentic && typedOutput.confidenceScore > 0.7) {
      warnings.push('Documento marcado como falso pero con alta confianza');
    }

    // Validar que reasoning no esté vacío
    if (!typedOutput.reasoning || typedOutput.reasoning.trim().length === 0) {
      errors.push('El razonamiento del análisis no puede estar vacío');
    }

    return { isValid: errors.length === 0, errors, warnings };

  } catch (error) {
    errors.push(`Error durante la validación de salida: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    return { isValid: false, errors, warnings };
  }
}

/**
 * Implementa retry logic con backoff exponencial
 */
async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = CONFIG.MAX_RETRIES,
  initialDelay: number = CONFIG.INITIAL_RETRY_DELAY
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt === maxRetries) {
        throw lastError;
      }

      // Backoff exponencial con jitter
      const delay = Math.min(
        initialDelay * Math.pow(2, attempt) + Math.random() * 1000,
        CONFIG.MAX_RETRY_DELAY
      );

      errorHandler.logError(
        ErrorType.API_CALL,
        `Intento ${attempt + 1} falló, reintentando en ${delay}ms`,
        ErrorSeverity.WARNING,
        { 
          error: lastError.message,
          attempt: attempt + 1,
          maxRetries,
          delay
        }
      );

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

/**
 * Wrapper con timeout para operaciones
 */
async function withTimeout<T>(
  operation: Promise<T>,
  timeoutMs: number = CONFIG.TIMEOUT
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(`Operación excedió el timeout de ${timeoutMs}ms`)), timeoutMs);
  });

  return Promise.race([operation, timeoutPromise]);
}

// Definición del Prompt de Genkit mejorado
const analyzeDocumentPrompt = ai.definePrompt({
  name: 'analyzeDocumentPrompt',
  input: {schema: AnalyzeDocumentInputSchema},
  output: {schema: AnalyzeDocumentOutputSchema},
  prompt: `Actúa como un sistema experto en análisis forense de documentos digitales con más de 20 años de experiencia. Tu misión es evaluar la autenticidad de un documento basándote en un protocolo riguroso inspirado en el análisis topológico de datos, la inferencia bayesiana y la detección de anomalías avanzadas.

**Protocolo de Análisis Forense:**

1. **Análisis Estructural y Topológico Avanzado:**
   - Examina la imagen como una estructura de datos multidimensional con patrones interconectados
   - Identifica anomalías topológicas: logos malformados, sellos inconsistentes, alineación textual incorrecta, tipografías no estándar, espaciado irregular, resolución inconsistente
   - Evalúa la integridad de la plantilla comparándola con estándares conocidos para '{{documentType}}'
   - Analiza patrones de compresión, artefactos JPEG, y evidencia de manipulación digital
   - Verifica consistencia en iluminación, sombras y perspectiva

2. **Inferencia Bayesiana de Autenticidad:**
   - Inicia con probabilidad neutral (0.5) y actualiza basándote en evidencia acumulativa
   - Extrae y valida todos los datos críticos (nombres, fechas, números de serie, códigos, firmas)
   - Evalúa cada elemento como un punto en espacio multidimensional de autenticidad
   - Calcula distancias de Mahalanobis para detectar outliers significativos
   - Considera correlaciones entre elementos (ej: fecha de emisión vs. formato de documento)
   - Pondera evidencia según criticidad: elementos de seguridad > datos personales > formato

3. **Análisis de Consistencia Temporal y Geográfica:**
   - Verifica que fechas sean coherentes con períodos de emisión del documento
   - Valida formatos regionales (fechas, códigos postales, números telefónicos)
   - Analiza consistencia en idioma y terminología oficial

4. **Evaluación de Elementos de Seguridad:**
   - Identifica y evalúa características de seguridad esperadas
   - Analiza calidad de impresión, microimpresión, patrones de seguridad
   - Detecta inconsistencias en elementos holográficos o marcas de agua (si visibles)

**Criterios de Decisión:**
- confidenceScore ≥ 0.85: Altamente probable auténtico
- confidenceScore 0.60-0.84: Probablemente auténtico con reservas
- confidenceScore 0.40-0.59: Incierto, requiere verificación adicional
- confidenceScore 0.20-0.39: Probablemente falso
- confidenceScore < 0.20: Altamente probable falso

**Entrada del Análisis:**
- **Tipo de Documento:** {{documentType}}
- **Imagen:** {{media url=photoDataUri}}

**IMPORTANTE:** 
- Sé extremadamente riguroso en tu análisis
- Si detectas manipulación digital evidente, marca como falso independientemente de otros factores
- Considera el contexto del tipo de documento y sus estándares específicos
- En caso de duda razonable, favorece la precaución

Proporciona tu respuesta ÚNICAMENTE en formato JSON válido según el esquema especificado.`,
});

// Definición del Flujo de Genkit mejorado
const analyzeDocumentFlow = ai.defineFlow(
  {
    name: 'analyzeDocumentFlow',
    inputSchema: AnalyzeDocumentInputSchema,
    outputSchema: AnalyzeDocumentOutputSchema,
  },
  async (input) => {
    const metrics: AnalysisMetrics = {
      startTime: Date.now(),
      retryCount: 0,
      errors: []
    };

    try {
      // Log inicio del análisis
      errorHandler.logError(
        ErrorType.INFO,
        'Iniciando análisis forense de documento',
        ErrorSeverity.LOW,
        { 
          documentType: input.documentType,
          imageSize: input.photoDataUri?.length || 0,
          timestamp: new Date().toISOString()
        }
      );

      // 1. Validación exhaustiva de entrada
      const inputValidation = validateInput(input);
      if (!inputValidation.isValid) {
        throw new Error(`Validación de entrada falló: ${inputValidation.errors.join(', ')}`);
      }

      // Log warnings si existen
      if (inputValidation.warnings.length > 0) {
        errorHandler.logError(
          ErrorType.VALIDATION,
          'Advertencias durante validación de entrada',
          ErrorSeverity.LOW,
          { warnings: inputValidation.warnings }
        );
      }

      // 2. Sanitización de entrada
      const sanitizedInput = sanitizeInput(input);

      // 3. Ejecutar análisis con retry y timeout
      const analysisResult = await withRetry(async () => {
        metrics.retryCount++;
        
        const operation = analyzeDocumentPrompt(sanitizedInput);
        const result = await withTimeout(operation, CONFIG.TIMEOUT);
        
        if (!result.output) {
          throw new Error("El modelo de IA no pudo generar un análisis (output nulo).");
        }

        return result.output;
      });

      // 4. Validación de salida
      const outputValidation = validateOutput(analysisResult);
      if (!outputValidation.isValid) {
        errorHandler.logError(
          ErrorType.VALIDATION,
          'Validación de salida falló',
          ErrorSeverity.HIGH,
          { 
            errors: outputValidation.errors,
            rawOutput: analysisResult
          }
        );
        
        // Intentar corregir o proporcionar resultado por defecto
        throw new Error(`Salida del modelo inválida: ${outputValidation.errors.join(', ')}`);
      }

      // Log warnings de salida
      if (outputValidation.warnings.length > 0) {
        errorHandler.logError(
          ErrorType.VALIDATION,
          'Advertencias en resultado del análisis',
          ErrorSeverity.LOW,
          { 
            warnings: outputValidation.warnings,
            confidenceScore: analysisResult.confidenceScore,
            isAuthentic: analysisResult.isAuthentic
          }
        );
      }

      // 5. Métricas finales
      metrics.endTime = Date.now();
      metrics.duration = metrics.endTime - metrics.startTime;

      // Log éxito
      errorHandler.logError(
        ErrorType.INFO,
        'Análisis forense completado exitosamente',
        ErrorSeverity.LOW,
        { 
          metrics,
          result: {
            isAuthentic: analysisResult.isAuthentic,
            confidenceScore: analysisResult.confidenceScore,
            anomaliesCount: analysisResult.topologicalAnomalies?.length || 0
          }
        }
      );

      return analysisResult;

    } catch (error: any) {
      metrics.endTime = Date.now();
      metrics.duration = metrics.endTime - metrics.startTime;
      metrics.errors.push(error.message);

      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      
      errorHandler.logError(
        ErrorType.API_CALL,
        'Falló el análisis forense de documento',
        ErrorSeverity.CRITICAL,
        { 
          error: errorMessage,
          metrics,
          flowInput: {
            documentType: input.documentType,
            hasImage: !!input.photoDataUri
          },
          stack: error.stack
        }
      );

      // Determinar tipo de error y mensaje para el usuario
      let userMessage = "El análisis del documento falló. Por favor, intenta nuevamente.";
      
      if (errorMessage.includes('timeout') || errorMessage.includes('Timeout')) {
        userMessage = "El análisis tardó demasiado tiempo. Por favor, intenta con una imagen más pequeña.";
      } else if (errorMessage.includes('Validación') || errorMessage.includes('inválido')) {
        userMessage = "Los datos proporcionados no son válidos. Verifica la imagen y el tipo de documento.";
      } else if (errorMessage.includes('imagen') || errorMessage.includes('formato')) {
        userMessage = "Hay un problema con la imagen. Asegúrate de que sea un formato soportado y no esté corrupta.";
      }

      throw new Error(userMessage);
    }
  }
);

// Función exportada mejorada
export async function analyzeDocument(
  input: AnalyzeDocumentInput
): Promise<AnalyzeDocumentOutput> {
  try {
    return await analyzeDocumentFlow(input);
  } catch (error) {
    // Re-lanzar el error para que el componente cliente pueda manejarlo
    throw error;
  }
}

// Funciones auxiliares exportadas para testing y debugging
export const utils = {
  validateInput,
  validateOutput,
  sanitizeInput,
  CONFIG
};