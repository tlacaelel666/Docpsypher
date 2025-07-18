/**
 * @fileOverview Tipos y enumeraciones para el sistema de manejo de errores.
 * Inspirado en el apéndice de manejo de errores del sistema cuántico.
 */

export enum ErrorType {
    API_CALL = "api_call",
    VALIDATION = "validation",
    FILE_PROCESSING = "file_processing",
    RENDERING = "rendering",
    AUTHENTICATION = "authentication",
    UNKNOWN_SYSTEM = "unknown_system",
}

export enum ErrorSeverity {
    INFO = "info",
    WARNING = "warning",
    ERROR = "error",
    CRITICAL = "critical",
}

export interface ErrorContext {
  [key: string]: any;
}

export class ErrorRecord {
  public readonly id: string;
  public readonly timestamp: Date;

  constructor(
    public type: ErrorType,
    public message: string,
    public severity: ErrorSeverity,
    public context?: ErrorContext,
  ) {
    this.id = `${type}_${Date.now()}`;
    this.timestamp = new Date();
  }

  toObject() {
    return {
      id: this.id,
      type: this.type,
      message: this.message,
      severity: this.severity,
      context: this.context,
      timestamp: this.timestamp.toISOString(),
    };
  }
}
