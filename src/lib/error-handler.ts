/**
 * @fileOverview Manejador de errores centralizado para la aplicación.
 * Inspirado en el apéndice de manejo de errores del sistema cuántico.
 */
import { ErrorRecord, ErrorType, ErrorSeverity, type ErrorContext } from '@/types/error-handling';

const MAX_HISTORY = 200;

class AppErrorHandler {
  private errorHistory: ErrorRecord[] = [];

  public logError(
    type: ErrorType,
    message: string,
    severity: ErrorSeverity = ErrorSeverity.ERROR,
    context?: ErrorContext
  ): ErrorRecord {
    const errorRecord = new ErrorRecord(type, message, severity, context);
    
    // Añadir al historial, manteniendo el tamaño máximo
    this.errorHistory.push(errorRecord);
    if (this.errorHistory.length > MAX_HISTORY) {
      this.errorHistory.shift();
    }

    // Usar console para logging. En una app real, esto podría enviar a un servicio de monitoreo.
    const logMessage = `[${errorRecord.severity.toUpperCase()}] ${errorRecord.type}: ${errorRecord.message}`;
    
    switch(severity) {
        case ErrorSeverity.INFO:
            console.info(logMessage, errorRecord.toObject());
            break;
        case ErrorSeverity.WARNING:
            console.warn(logMessage, errorRecord.toObject());
            break;
        case ErrorSeverity.ERROR:
        case ErrorSeverity.CRITICAL:
            console.error(logMessage, errorRecord.toObject());
            break;
    }
    
    // Aquí se podrían añadir notificaciones o estrategias de recuperación en el futuro.

    return errorRecord;
  }

  public getStatistics() {
    const totalErrors = this.errorHistory.length;
    const errorsByType = this.errorHistory.reduce((acc, err) => {
        acc[err.type] = (acc[err.type] || 0) + 1;
        return acc;
    }, {} as Record<ErrorType, number>);
     const errorsBySeverity = this.errorHistory.reduce((acc, err) => {
        acc[err.severity] = (acc[err.severity] || 0) + 1;
        return acc;
    }, {} as Record<ErrorSeverity, number>);

    return {
        totalErrors,
        errorsByType,
        errorsBySeverity,
        recentErrors: this.errorHistory.slice(-10).map(e => e.toObject()),
    };
  }

  public clearHistory() {
      this.errorHistory = [];
      console.log("Historial de errores limpiado.");
  }
}

// Singleton para el manejador de errores
const errorHandler = new AppErrorHandler();

export default errorHandler;
